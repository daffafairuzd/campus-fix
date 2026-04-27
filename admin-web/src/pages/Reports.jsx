import React, { useState, useEffect } from 'react';
import api from '../api';
import ReportList from './reports/ReportList';
import ReportDetail from './reports/ReportDetail';
import ReportForm from './reports/ReportForm';

// viewMode: 'list' | 'add' | 'detail' | 'edit'
export default function Reports() {
  const [viewMode, setViewMode]       = useState('list');
  const [reportsData, setReportsData] = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [selected, setSelected]       = useState(null);

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/reports');
      setReportsData(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const openDetail = (report) => { setSelected(report); setViewMode('detail'); };
  const openAdd    = ()       => { setSelected(null);   setViewMode('add');    };
  const openEdit   = (report) => { setSelected(report); setViewMode('edit');   };
  const goList     = ()       => { setViewMode('list'); fetchReports();        };

  const handleSaved = async (reportId) => {
    await fetchReports();
    if (viewMode === 'edit') {
      // Reload report yang diedit lalu tampilkan detailnya
      try {
        const res = await api.get(`/reports/${reportId}`);
        setSelected(res.data);
        setViewMode('detail');
      } catch { setViewMode('list'); }
    } else {
      setViewMode('list');
    }
  };

  const handleDeleted = () => { setSelected(null); goList(); };

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
      {viewMode === 'detail' && selected && (
        <ReportDetail
          report={selected}
          onBack={goList}
          onEdit={openEdit}
          onDeleted={handleDeleted}
          onStatusUpdated={handleStatusUpdated}
        />
      )}
      {(viewMode === 'add' || viewMode === 'edit') && (
        <ReportForm
          mode={viewMode}
          initialData={viewMode === 'edit' ? selected : null}
          onBack={viewMode === 'edit' ? () => setViewMode('detail') : goList}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
