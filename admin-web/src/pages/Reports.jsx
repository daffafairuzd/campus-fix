import React, { useState, useEffect } from 'react';
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

  useEffect(() => { fetchReports(); }, []);

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
            // Report not found or error, revert to list
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

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/reports');
      setReportsData(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

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
