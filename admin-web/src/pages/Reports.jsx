import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import ReportList from './reports/ReportList';
import ReportDetail from './reports/ReportDetail';
import ReportForm from './reports/ReportForm';

export default function Reports() {
  const [searchParams, setSearchParams] = useSearchParams();
  const reportIdParam = searchParams.get('report_id');
  const actionParam = searchParams.get('action'); // 'add', 'edit'

  const [reportsData, setReportsData] = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [selected, setSelected]       = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    status: 'Semua',
    priority: 'Semua',
    category: 'Semua',
    page: 1,
    per_page: 10,
  });

  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', filters.page);
      params.append('per_page', filters.per_page || 10);
      if (filters.search) params.append('search', filters.search);
      if (filters.status && filters.status !== 'Semua') params.append('status', filters.status.toLowerCase().replace(' ', '_'));
      if (filters.priority && filters.priority !== 'Semua') params.append('priority', filters.priority.toLowerCase());
      if (filters.category && filters.category !== 'Semua') params.append('category', filters.category);

      const res = await api.get(`/reports?${params.toString()}`);
      setReportsData(res.data.data || []);
      setPagination({
        current_page: res.data.current_page || 1,
        last_page: res.data.last_page || 1,
        total: res.data.total || 0
      });
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  }, [filters]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  useEffect(() => {
    const handleUrlState = async () => {
      if (reportIdParam) {
        const id = parseInt(reportIdParam);
        const found = reportsData.find(r => r.id === id);
        if (found) {
          setSelected(found);
        } else if (!isLoading) {
          try {
            const res = await api.get(`/reports/${id}`);
            setSelected(res.data);
          } catch {
            setSearchParams({});
          }
        }
      } else {
        setSelected(null);
      }
    };
    handleUrlState();
  }, [reportIdParam, reportsData, isLoading, setSearchParams]);

  const viewMode = actionParam === 'add' ? 'add' : (actionParam === 'edit' ? 'edit' : (reportIdParam ? 'detail' : 'list'));

  const openDetail = (report) => { setSearchParams({ report_id: report.id }); };
  const openAdd    = ()       => { setSearchParams({ action: 'add' }); };
  const openEdit   = (report) => { setSearchParams({ report_id: report.id, action: 'edit' }); };
  const goList     = ()       => { setSearchParams({}); fetchReports(); };

  const handleSaved = async (reportId) => {
    await fetchReports();
    if (viewMode === 'edit') {
      setSearchParams({ report_id: reportId });
    } else {
      setSearchParams({});
    }
  };

  const handleDeleted = () => { setSearchParams({}); fetchReports(); };

  const handleStatusUpdated = (updatedReport) => {
    setSelected(updatedReport);
    setReportsData(prev => prev.map(r => r.id === updatedReport.id ? updatedReport : r));
  };

  return (
    <div className="p-6 md:p-7">
      {viewMode === 'list' && (
        <ReportList
          reportsData={reportsData}
          isLoading={isLoading}
          onAdd={openAdd}
          onDetail={openDetail}
          filters={filters}
          setFilters={setFilters}
          pagination={pagination}
        />
      )}
      {viewMode === 'detail' && (
        selected ? (
          <ReportDetail
            report={selected}
            onBack={goList}
            onEdit={openEdit}
            onDeleted={handleDeleted}
            onStatusUpdated={handleStatusUpdated}
          />
        ) : (
          <div className="text-center py-10 text-ui-muted text-sm">Memuat detail laporan...</div>
        )
      )}
      {(viewMode === 'add' || viewMode === 'edit') && (
        (viewMode === 'add' || selected) ? (
          <ReportForm
            mode={viewMode}
            initialData={viewMode === 'edit' ? selected : null}
            onBack={viewMode === 'edit' ? () => setSearchParams({ report_id: reportIdParam }) : goList}
            onSaved={handleSaved}
          />
        ) : (
          <div className="text-center py-10 text-ui-muted text-sm">Memuat form...</div>
        )
      )}
    </div>
  );
}
