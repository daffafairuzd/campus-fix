import React from 'react';

export const Badge = ({ label, status, priority, role }) => {
  let colorClass = "bg-ui-muted/15 text-ui-muted border-ui-muted/30";

  // helper to title case ("dalam_proses" -> "Dalam Proses")
  const formatStr = (str) => {
    if (!str) return '';
    return str.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const fStatus = formatStr(status);
  const fPriority = formatStr(priority);
  const fRole = formatStr(role);

  // --- STATUS badge (laporan) ---
  if (status) {
    colorClass = {
      "Menunggu":    "bg-ui-warning/15  text-ui-warning  border-ui-warning/30",
      "Dalam Proses":"bg-ui-info/15     text-ui-info     border-ui-info/30",
      "Selesai":     "bg-ui-success/15  text-ui-success  border-ui-success/30",
      "Eskalasi":    "bg-ui-danger/15   text-ui-danger   border-ui-danger/30",
      // Status user
      "Aktif":       "bg-ui-success/15  text-ui-success  border-ui-success/30",
      "Nonaktif":    "bg-ui-danger/15   text-ui-danger   border-ui-danger/30",
      // Status teknisi (workload)
      "Tersedia":    "bg-ui-success/15  text-ui-success  border-ui-success/30",
      "Sibuk":       "bg-ui-warning/15  text-ui-warning  border-ui-warning/30",
      "Cuti":        "bg-ui-muted/15    text-ui-muted    border-ui-muted/30",
    }[fStatus] || colorClass;

  // --- PRIORITY badge ---
  } else if (priority) {
    colorClass = {
      "Kritis": "bg-ui-danger/15   text-ui-danger   border-ui-danger/30",
      "Tinggi": "bg-ui-warning/15  text-ui-warning  border-ui-warning/30",
      "Sedang": "bg-ui-info/15     text-ui-info     border-ui-info/30",
      "Rendah": "bg-ui-success/15  text-ui-success  border-ui-success/30",
    }[fPriority] || colorClass;

  // --- ROLE badge ---
  } else if (role) {
    colorClass = {
      "Admin":   "bg-brand-primary/15   text-brand-primary   border-brand-primary/30",
      "Teknisi": "bg-brand-secondary/15 text-brand-secondary border-brand-secondary/30",
      "Pelapor": "bg-ui-dim/15          text-ui-dim          border-ui-dim/30",
    }[fRole] || colorClass;
  }

  // dot hanya untuk status laporan (bukan role/priority)
  const showDot = !!status && ["Menunggu","Dalam Proses","Selesai","Eskalasi"].includes(fStatus);
  const dotColor = {
    "Menunggu":    "bg-ui-warning",
    "Dalam Proses":"bg-ui-info",
    "Selesai":     "bg-ui-success",
    "Eskalasi":    "bg-ui-danger",
  }[fStatus] || "bg-ui-muted";

  const displayLabel = label || fStatus || fPriority || fRole;

  return (
    <span className={`badge border ${colorClass}`}>
      {showDot && <span className={`dot ${dotColor}`}></span>}
      {displayLabel}
    </span>
  );
};

export const Avatar = ({ initials, size = 32, success = false, warning = false, danger = false, muted = false }) => {
  let colorCode = "#dc2626"; // primary red (default)
  if (success) colorCode = "#10b981";
  if (warning) colorCode = "#f59e0b";
  if (danger)  colorCode = "#ef4444";
  if (muted)   colorCode = "#6b7280";

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
