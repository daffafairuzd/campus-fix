import React from 'react';
import { 
  BarChart2, 
  Settings, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  LayoutDashboard, 
  FileText, 
  Users, 
  Bell, 
  Search, 
  Menu, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  X,
  ClipboardList
} from 'lucide-react';

export const Badge = ({ label, status, priority, role }) => {
  let colorClass = "bg-ui-muted/15 text-ui-muted border-ui-muted/30";
  let dotColor = "bg-ui-muted";

  if (status) {
    colorClass = {
      "Menunggu": "bg-ui-warning/15 text-ui-warning border-ui-warning/30",
      "Dalam Proses": "bg-ui-info/15 text-ui-info border-ui-info/30",
      "Selesai": "bg-ui-success/15 text-ui-success border-ui-success/30",
      "Eskalasi": "bg-ui-danger/15 text-ui-danger border-ui-danger/30",
    }[status] || colorClass;
    
    dotColor = {
      "Menunggu": "bg-ui-warning",
      "Dalam Proses": "bg-ui-info",
      "Selesai": "bg-ui-success",
      "Eskalasi": "bg-ui-danger",
    }[status] || dotColor;
  } else if (priority) {
    colorClass = {
      "Kritis": "bg-ui-danger/15 text-ui-danger border-ui-danger/30",
      "Tinggi": "bg-ui-warning/15 text-ui-warning border-ui-warning/30",
      "Minor": "bg-ui-success/15 text-ui-success border-ui-success/30",
    }[priority] || colorClass;
  } else if (role) {
    colorClass = {
      "Admin": "bg-brand-primary/15 text-brand-primary border-brand-primary/30",
      "Teknisi": "bg-brand-secondary/15 text-brand-secondary border-brand-secondary/30",
      "Pelapor": "bg-ui-dim/15 text-ui-dim border-ui-dim/30",
    }[role] || colorClass;
  }

  return (
    <span className={`badge border ${colorClass}`}>
      {status && <span className={`dot ${dotColor}`}></span>}
      {label}
    </span>
  );
};

export const Avatar = ({ initials, size = 32, success = false, warning = false }) => {
  let colorCode = "#dc2626"; // primary red
  if (success) colorCode = "#10b981";
  if (warning) colorCode = "#f59e0b";

  return (
    <div 
      className="flex-shrink-0 flex items-center justify-center font-bold tracking-wide rounded-full border-2"
      style={{
        width: size, 
        height: size, 
        fontSize: size * 0.35,
        color: colorCode,
        background: `linear-gradient(135deg, ${colorCode}22, ${colorCode}44)`,
        borderColor: `${colorCode}44`,
      }}
    >
      {initials}
    </div>
  );
};
