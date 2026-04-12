import { useState, useEffect, useRef } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  bg:        "#0a0f14",
  bgCard:    "#111827",
  bgHover:   "#1a2535",
  border:    "#1e2d3d",
  cyan:      "#00d4d4",
  cyanDim:   "#00a8a8",
  cyanGlow:  "rgba(0,212,212,0.15)",
  teal:      "#0d9488",
  text:      "#e2e8f0",
  textMuted: "#64748b",
  textDim:   "#94a3b8",
  success:   "#10b981",
  warning:   "#f59e0b",
  danger:    "#ef4444",
  info:      "#3b82f6",
};

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { background:${C.bg}; color:${C.text}; font-family:'Space Grotesk',sans-serif; }
    ::-webkit-scrollbar { width:4px; }
    ::-webkit-scrollbar-track { background:${C.bg}; }
    ::-webkit-scrollbar-thumb { background:${C.border}; border-radius:2px; }
    ::-webkit-scrollbar-thumb:hover { background:${C.cyan}; }

    @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
    @keyframes spin { to{transform:rotate(360deg)} }
    @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
    @keyframes glow { 0%,100%{box-shadow:0 0 8px ${C.cyanGlow}} 50%{box-shadow:0 0 20px rgba(0,212,212,0.35)} }

    .page { animation: fadeIn .3s ease both; }
    .card {
      background:${C.bgCard};
      border:1px solid ${C.border};
      border-radius:12px;
      transition: border-color .2s, box-shadow .2s;
    }
    .card:hover { border-color:rgba(0,212,212,0.3); box-shadow:0 0 20px rgba(0,212,212,0.06); }
    .badge {
      display:inline-flex; align-items:center; gap:4px;
      padding:2px 10px; border-radius:999px; font-size:11px; font-weight:600; letter-spacing:.4px;
    }
    .btn {
      display:inline-flex; align-items:center; gap:6px;
      padding:8px 16px; border-radius:8px; border:none; cursor:pointer;
      font-family:'Space Grotesk',sans-serif; font-size:13px; font-weight:600;
      transition: all .2s;
    }
    .btn-primary { background:${C.cyan}; color:#0a0f14; }
    .btn-primary:hover { background:${C.cyanDim}; box-shadow:0 0 16px ${C.cyanGlow}; }
    .btn-ghost { background:transparent; color:${C.textDim}; border:1px solid ${C.border}; }
    .btn-ghost:hover { border-color:${C.cyan}; color:${C.cyan}; }
    .btn-danger { background:rgba(239,68,68,.15); color:${C.danger}; border:1px solid rgba(239,68,68,.3); }
    .btn-danger:hover { background:rgba(239,68,68,.25); }
    .input {
      background:${C.bg}; border:1px solid ${C.border}; border-radius:8px;
      color:${C.text}; font-family:'Space Grotesk',sans-serif; font-size:13px;
      padding:8px 12px; outline:none; transition:border-color .2s;
      width:100%;
    }
    .input:focus { border-color:${C.cyan}; box-shadow:0 0 0 3px ${C.cyanGlow}; }
    .input::placeholder { color:${C.textMuted}; }
    select.input option { background:${C.bgCard}; }
    .table-row { transition:background .15s; }
    .table-row:hover { background:${C.bgHover}; }
    .dot { width:7px;height:7px;border-radius:50%;display:inline-block; }
    .stat-card { position:relative; overflow:hidden; }
    .stat-card::before {
      content:''; position:absolute; inset:0;
      background:linear-gradient(135deg, transparent 60%, rgba(0,212,212,0.04));
      pointer-events:none;
    }
    .sidebar-item {
      display:flex; align-items:center; gap:10px;
      padding:10px 14px; border-radius:8px; cursor:pointer;
      color:${C.textDim}; font-size:13px; font-weight:500;
      transition:all .2s; border:1px solid transparent;
    }
    .sidebar-item:hover { background:${C.bgHover}; color:${C.text}; }
    .sidebar-item.active { background:${C.cyanGlow}; color:${C.cyan}; border-color:rgba(0,212,212,0.2); }
    .modal-overlay {
      position:fixed; inset:0; background:rgba(0,0,0,.7); backdrop-filter:blur(4px);
      display:flex; align-items:center; justify-content:center; z-index:1000;
      animation:fadeIn .2s ease;
    }
    .modal { background:${C.bgCard}; border:1px solid ${C.border}; border-radius:16px; padding:28px; min-width:480px; max-width:600px; width:90%; }
    .tag { display:inline-flex; align-items:center; padding:3px 10px; border-radius:6px; font-size:11px; font-weight:600; }
  `}</style>
);

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────
const REPORTS = [
  { id:"RPT-001", title:"AC ruangan 301 mati total", category:"HVAC", location:"Gedung A Lt.3", status:"Dalam Proses", priority:"Kritis", reporter:"Ahmad Fauzi", date:"2026-04-03", technician:"Budi S.", sla:"2026-04-05", rating:null },
  { id:"RPT-002", title:"Lampu koridor B putus 3 titik", category:"Listrik", location:"Gedung B Lt.1", status:"Selesai", priority:"Minor", reporter:"Siti Rahma", date:"2026-04-01", technician:"Eko P.", sla:"2026-04-04", rating:4 },
  { id:"RPT-003", title:"Proyektor Lab IF-2 tidak menyala", category:"Lab", location:"Lab IF Lt.2", status:"Menunggu", priority:"Tinggi", reporter:"Reza Alif", date:"2026-04-04", technician:null, sla:"2026-04-06", rating:null },
  { id:"RPT-004", title:"Toilet bocor basement parkir", category:"Plumbing", location:"Basement", status:"Dalam Proses", priority:"Tinggi", reporter:"Dewi N.", date:"2026-04-02", technician:"Eko P.", sla:"2026-04-05", rating:null },
  { id:"RPT-005", title:"WiFi area kantin drop terus", category:"Jaringan", location:"Kantin Pusat", status:"Menunggu", priority:"Minor", reporter:"Fajar W.", date:"2026-04-04", technician:null, sla:"2026-04-07", rating:null },
  { id:"RPT-006", title:"Lift gedung C error kode E3", category:"Lift", location:"Gedung C", status:"Eskalasi", priority:"Kritis", reporter:"Mega P.", date:"2026-04-03", technician:"Hendro K.", sla:"2026-04-04", rating:null },
  { id:"RPT-007", title:"Papan tulis smartboard rusak", category:"Lab", location:"Ruang 201", status:"Selesai", priority:"Minor", reporter:"Taufik M.", date:"2026-03-30", technician:"Budi S.", sla:"2026-04-02", rating:5 },
  { id:"RPT-008", title:"Genset cadangan tidak hidup", category:"Listrik", location:"Ruang Genset", status:"Dalam Proses", priority:"Kritis", reporter:"Admin Ops", date:"2026-04-04", technician:"Hendro K.", sla:"2026-04-05", rating:null },
];

const TECHNICIANS = [
  { id:"TEC-01", name:"Budi Santoso", specialty:"Listrik & Lab", active:3, completed:24, rating:4.8, status:"Tersedia", avatar:"BS" },
  { id:"TEC-02", name:"Eko Prasetyo", specialty:"Plumbing & HVAC", active:2, completed:31, rating:4.6, status:"Sibuk", avatar:"EP" },
  { id:"TEC-03", name:"Hendro Kurniawan", specialty:"Lift & Mekanikal", active:2, completed:19, rating:4.9, status:"Sibuk", avatar:"HK" },
  { id:"TEC-04", name:"Slamet Riyadi", specialty:"Jaringan & IT", active:0, completed:15, rating:4.5, status:"Tersedia", avatar:"SR" },
  { id:"TEC-05", name:"Wahyu Pramono", specialty:"Umum", active:1, completed:28, rating:4.7, status:"Tersedia", avatar:"WP" },
];

const USERS = [
  { id:"USR-01", name:"Muhammad Ragil", email:"ragil@telkomuniversity.ac.id", role:"Admin", nim:"103012300015", status:"Aktif" },
  { id:"USR-02", name:"Daffa Fairuz", email:"daffa@telkomuniversity.ac.id", role:"Admin", nim:"103012300309", status:"Aktif" },
  { id:"USR-03", name:"Ahmad Fauzi", email:"afauzi@student.telkomuniversity.ac.id", role:"Pelapor", nim:"10301230090", status:"Aktif" },
  { id:"USR-04", name:"Siti Rahma", email:"srahma@student.telkomuniversity.ac.id", role:"Pelapor", nim:"10301230091", status:"Aktif" },
  { id:"USR-05", name:"Budi Santoso", email:"bsantoso@telkomuniversity.ac.id", role:"Teknisi", nim:"-", status:"Aktif" },
  { id:"USR-06", name:"Eko Prasetyo", email:"eprasetyo@telkomuniversity.ac.id", role:"Teknisi", nim:"-", status:"Aktif" },
  { id:"USR-07", name:"Reza Alif", email:"ralif@student.telkomuniversity.ac.id", role:"Pelapor", nim:"10301230095", status:"Nonaktif" },
];

const WEEKLY = [
  { day:"Sen", laporan:8, selesai:5 },
  { day:"Sel", laporan:12, selesai:9 },
  { day:"Rab", laporan:6, selesai:6 },
  { day:"Kam", laporan:15, selesai:10 },
  { day:"Jum", laporan:9, selesai:7 },
  { day:"Sab", laporan:4, selesai:4 },
  { day:"Min", laporan:2, selesai:2 },
];

const MONTHLY = [
  { month:"Nov", laporan:42, selesai:38 },
  { month:"Des", laporan:55, selesai:48 },
  { month:"Jan", laporan:61, selesai:54 },
  { month:"Feb", laporan:48, selesai:45 },
  { month:"Mar", laporan:73, selesai:61 },
  { month:"Apr", laporan:29, selesai:20 },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const statusColor = (s) => ({
  "Menunggu":     { bg:"rgba(245,158,11,.15)", text:"#f59e0b", dot:"#f59e0b" },
  "Dalam Proses": { bg:"rgba(59,130,246,.15)", text:"#3b82f6", dot:"#3b82f6" },
  "Selesai":      { bg:"rgba(16,185,129,.15)", text:"#10b981", dot:"#10b981" },
  "Eskalasi":     { bg:"rgba(239,68,68,.15)",  text:"#ef4444", dot:"#ef4444" },
}[s] || { bg:"rgba(100,116,139,.15)", text:C.textMuted, dot:C.textMuted });

const priorityColor = (p) => ({
  "Kritis": { bg:"rgba(239,68,68,.15)",  text:"#ef4444" },
  "Tinggi": { bg:"rgba(245,158,11,.15)", text:"#f59e0b" },
  "Minor":  { bg:"rgba(16,185,129,.15)", text:"#10b981" },
}[p] || { bg:"rgba(100,116,139,.15)", text:C.textMuted });

const Badge = ({ label, color }) => (
  <span className="badge" style={{ background: color.bg, color: color.text }}>
    <span className="dot" style={{ background: color.text }} />
    {label}
  </span>
);

const Avatar = ({ initials, size=32, color=C.cyan }) => (
  <div style={{
    width:size, height:size, borderRadius:"50%",
    background:`linear-gradient(135deg, ${color}22, ${color}44)`,
    border:`1.5px solid ${color}44`,
    display:"flex", alignItems:"center", justifyContent:"center",
    fontSize:size*.32, fontWeight:700, color,
    flexShrink:0, letterSpacing:.5
  }}>{initials}</div>
);

const Icon = ({ name, size=16 }) => {
  const icons = {
    dashboard: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
    reports:   "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM9 17H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2zm4 0V8.5L13.5 3H6v14h12V8z",
    assign:    "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
    analytics: "M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99l1.5 1.5z",
    users:     "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
    bell:      "M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z",
    search:    "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
    filter:    "M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z",
    plus:      "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
    edit:      "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
    trash:     "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
    x:         "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
    check:     "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z",
    logout:    "M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z",
    star:      "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
    clock:     "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z",
    alert:     "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
    download:  "M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z",
    campus:    "M12 3L1 9l4 2.18V17h2v-4.82L12 15l11-6-11-6zm6.18 6L12 12.72 5.82 9 12 5.28 18.18 9zM17 16l-5 3-5-3v2l5 3 5-3v-2z",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{flexShrink:0}}>
      <path d={icons[name] || icons.dashboard} />
    </svg>
  );
};

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const NAV = [
  { id:"dashboard", label:"Dashboard", icon:"dashboard" },
  { id:"reports",   label:"Manajemen Laporan", icon:"reports" },
  { id:"assign",    label:"Assignment Teknisi", icon:"assign" },
  { id:"analytics", label:"Analytics", icon:"analytics" },
  { id:"users",     label:"Manajemen User", icon:"users" },
];

const Sidebar = ({ page, setPage }) => (
  <aside style={{
    width:240, background:C.bgCard, borderRight:`1px solid ${C.border}`,
    display:"flex", flexDirection:"column", height:"100vh",
    position:"fixed", left:0, top:0, zIndex:100,
  }}>
    {/* Logo */}
    <div style={{ padding:"20px 18px 16px", borderBottom:`1px solid ${C.border}` }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{
          width:36, height:36, borderRadius:10,
          background:`linear-gradient(135deg, ${C.cyan}, ${C.teal})`,
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:`0 0 16px ${C.cyanGlow}`
        }}>
          <Icon name="campus" size={20} />
        </div>
        <div>
          <div style={{ fontWeight:700, fontSize:15, color:C.text, lineHeight:1.2 }}>
            Campus<span style={{ color:C.cyan }}>Fix</span>
          </div>
          <div style={{ fontSize:10, color:C.textMuted, letterSpacing:.5 }}>ADMIN PANEL</div>
        </div>
      </div>
    </div>

    {/* Nav */}
    <nav style={{ padding:"12px 10px", flex:1, display:"flex", flexDirection:"column", gap:2 }}>
      {NAV.map(n => (
        <div key={n.id} className={`sidebar-item${page===n.id?" active":""}`} onClick={() => setPage(n.id)}>
          <Icon name={n.icon} size={16} />
          {n.label}
          {n.id==="reports" && (
            <span style={{
              marginLeft:"auto", background:C.danger, color:"#fff",
              borderRadius:999, fontSize:10, fontWeight:700, padding:"1px 7px"
            }}>3</span>
          )}
        </div>
      ))}
    </nav>

    {/* User */}
    <div style={{ padding:"14px 12px", borderTop:`1px solid ${C.border}` }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <Avatar initials="MR" size={34} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:12, fontWeight:600, color:C.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>Muhammad Ragil</div>
          <div style={{ fontSize:10, color:C.textMuted }}>Administrator</div>
        </div>
        <button className="btn btn-ghost" style={{ padding:"6px", border:"none" }} title="Logout">
          <Icon name="logout" size={15} />
        </button>
      </div>
    </div>
  </aside>
);

// ─── TOPBAR ───────────────────────────────────────────────────────────────────
const Topbar = ({ title, subtitle }) => (
  <header style={{
    background:`${C.bgCard}cc`, backdropFilter:"blur(12px)",
    borderBottom:`1px solid ${C.border}`,
    padding:"14px 28px", display:"flex", alignItems:"center", justifyContent:"space-between",
    position:"sticky", top:0, zIndex:50,
  }}>
    <div>
      <h1 style={{ fontSize:18, fontWeight:700, color:C.text }}>{title}</h1>
      {subtitle && <p style={{ fontSize:12, color:C.textMuted, marginTop:1 }}>{subtitle}</p>}
    </div>
    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
      <div style={{ position:"relative" }}>
        <button className="btn btn-ghost" style={{ padding:"8px" }}>
          <Icon name="bell" size={16} />
        </button>
        <span style={{
          position:"absolute", top:4, right:4, width:8, height:8,
          background:C.danger, borderRadius:"50%", border:`2px solid ${C.bgCard}`,
          animation:"pulse 2s infinite"
        }} />
      </div>
      <div style={{ fontSize:12, color:C.textMuted, fontFamily:"'JetBrains Mono',monospace" }}>
        {new Date().toLocaleDateString("id-ID",{weekday:"short",day:"numeric",month:"short",year:"numeric"})}
      </div>
    </div>
  </header>
);

// ─── STAT CARD ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon, accent=C.cyan, trend }) => (
  <div className="card stat-card" style={{ padding:"20px 22px" }}>
    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
      <div>
        <div style={{ fontSize:12, color:C.textMuted, letterSpacing:.5, marginBottom:8 }}>{label.toUpperCase()}</div>
        <div style={{ fontSize:28, fontWeight:700, color:C.text, lineHeight:1 }}>{value}</div>
        {sub && <div style={{ fontSize:11, color:C.textMuted, marginTop:6 }}>{sub}</div>}
        {trend && (
          <div style={{ fontSize:11, marginTop:6, color: trend>0 ? C.success : C.danger }}>
            {trend>0?"↑":"↓"} {Math.abs(trend)}% dari minggu lalu
          </div>
        )}
      </div>
      <div style={{
        width:42, height:42, borderRadius:10,
        background:`${accent}18`, border:`1px solid ${accent}30`,
        display:"flex", alignItems:"center", justifyContent:"center", color:accent
      }}>
        <Icon name={icon} size={20} />
      </div>
    </div>
    <div style={{
      position:"absolute", bottom:0, left:0, right:0, height:2,
      background:`linear-gradient(90deg, ${accent}, transparent)`, borderRadius:"0 0 12px 12px"
    }} />
  </div>
);

// ─── MINI BAR CHART ───────────────────────────────────────────────────────────
const MiniBarChart = ({ data, dataKey, maxKey, color=C.cyan }) => {
  const max = Math.max(...data.map(d => d[maxKey||dataKey]));
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:80 }}>
      {data.map((d,i) => (
        <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
          <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:2, height:60, justifyContent:"flex-end" }}>
            {maxKey && (
              <div style={{
                height:`${(d[maxKey]/max)*100}%`, background:`${C.textMuted}22`,
                borderRadius:"3px 3px 0 0", minHeight:2
              }} />
            )}
            <div style={{
              height:`${(d[dataKey]/max)*100}%`, background:`linear-gradient(180deg, ${color}, ${color}88)`,
              borderRadius:"3px 3px 0 0", minHeight:3, position:"relative",
              boxShadow:`0 0 8px ${color}44`
            }} />
          </div>
          <div style={{ fontSize:9, color:C.textMuted, letterSpacing:.3 }}>{d.day||d.month}</div>
        </div>
      ))}
    </div>
  );
};

// ─── PAGE: DASHBOARD ──────────────────────────────────────────────────────────
const DashboardPage = () => {
  const recentReports = REPORTS.slice(0,5);
  const slaAlert = REPORTS.filter(r => r.status !== "Selesai" && new Date(r.sla) <= new Date("2026-04-05"));

  return (
    <div className="page" style={{ padding:"24px 28px", display:"flex", flexDirection:"column", gap:24 }}>
      {/* SLA Alert */}
      {slaAlert.length > 0 && (
        <div style={{
          background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.25)",
          borderRadius:10, padding:"12px 16px", display:"flex", alignItems:"center", gap:10
        }}>
          <span style={{ color:C.danger }}><Icon name="alert" size={16} /></span>
          <span style={{ fontSize:13, color:"#fca5a5" }}>
            <strong>{slaAlert.length} laporan</strong> mendekati atau melewati batas SLA — segera tindak lanjuti!
          </span>
        </div>
      )}

      {/* Stat Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
        <StatCard label="Total Laporan" value="56" sub="Bulan April 2026" icon="reports" accent={C.cyan} trend={12} />
        <StatCard label="Dalam Proses" value="12" sub="4 mendekati deadline" icon="clock" accent={C.warning} trend={-5} />
        <StatCard label="Selesai" value="38" sub="SLA compliance 84%" icon="check" accent={C.success} trend={8} />
        <StatCard label="Eskalasi" value="2" sub="Butuh perhatian segera" icon="alert" accent={C.danger} />
      </div>

      {/* Charts row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {/* Weekly trend */}
        <div className="card" style={{ padding:"20px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:C.text }}>Tren Laporan Mingguan</div>
              <div style={{ fontSize:11, color:C.textMuted }}>Laporan masuk vs diselesaikan</div>
            </div>
            <div style={{ display:"flex", gap:12, fontSize:10, color:C.textMuted, alignItems:"center" }}>
              <span><span className="dot" style={{background:C.cyan, marginRight:4}} />Masuk</span>
              <span><span className="dot" style={{background:C.textMuted, marginRight:4}} />Selesai</span>
            </div>
          </div>
          <MiniBarChart data={WEEKLY} dataKey="laporan" maxKey="selesai" color={C.cyan} />
        </div>

        {/* Category breakdown */}
        <div className="card" style={{ padding:"20px" }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:16 }}>Laporan per Kategori</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[
              { cat:"HVAC", val:18, pct:32 },
              { cat:"Listrik", val:14, pct:25 },
              { cat:"Lab", val:10, pct:18 },
              { cat:"Jaringan", val:8, pct:14 },
              { cat:"Lainnya", val:6, pct:11 },
            ].map(c => (
              <div key={c.cat}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:12, color:C.textDim }}>{c.cat}</span>
                  <span style={{ fontSize:12, color:C.textMuted, fontFamily:"'JetBrains Mono',monospace" }}>{c.val}</span>
                </div>
                <div style={{ height:5, background:`${C.border}`, borderRadius:999 }}>
                  <div style={{
                    height:"100%", width:`${c.pct}%`,
                    background:`linear-gradient(90deg, ${C.cyan}, ${C.teal})`,
                    borderRadius:999, boxShadow:`0 0 8px ${C.cyanGlow}`
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent reports */}
      <div className="card" style={{ padding:"20px" }}>
        <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:16 }}>Laporan Terbaru</div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ borderBottom:`1px solid ${C.border}` }}>
              {["ID","Judul","Kategori","Prioritas","Status","Teknisi"].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"8px 12px", fontSize:11, color:C.textMuted, fontWeight:600, letterSpacing:.5 }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentReports.map(r => (
              <tr key={r.id} className="table-row" style={{ borderBottom:`1px solid ${C.border}22` }}>
                <td style={{ padding:"12px", fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:C.cyan }}>{r.id}</td>
                <td style={{ padding:"12px", fontSize:13, color:C.text }}>{r.title}</td>
                <td style={{ padding:"12px" }}><span className="tag" style={{background:`${C.border}`,color:C.textDim,fontSize:11}}>{r.category}</span></td>
                <td style={{ padding:"12px" }}><Badge label={r.priority} color={priorityColor(r.priority)} /></td>
                <td style={{ padding:"12px" }}><Badge label={r.status} color={statusColor(r.status)} /></td>
                <td style={{ padding:"12px", fontSize:12, color:r.technician?C.textDim:C.textMuted }}>{r.technician||"—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Technician load */}
      <div className="card" style={{ padding:"20px" }}>
        <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:16 }}>Beban Teknisi</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12 }}>
          {TECHNICIANS.map(t => (
            <div key={t.id} style={{ textAlign:"center", padding:"14px 10px", background:C.bg, borderRadius:10, border:`1px solid ${C.border}` }}>
              <Avatar initials={t.avatar} size={40} color={t.status==="Tersedia"?C.success:C.warning} />
              <div style={{ fontSize:12, fontWeight:600, color:C.text, marginTop:8 }}>{t.name.split(" ")[0]}</div>
              <div style={{ fontSize:10, color:C.textMuted, marginTop:2 }}>{t.active} aktif</div>
              <Badge label={t.status} color={t.status==="Tersedia"?{bg:"rgba(16,185,129,.15)",text:C.success}:{bg:"rgba(245,158,11,.15)",text:C.warning}} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── PAGE: REPORTS ────────────────────────────────────────────────────────────
const ReportsPage = () => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterPriority, setFilterPriority] = useState("Semua");
  const [selected, setSelected] = useState(null);

  const filtered = REPORTS.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = r.title.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.location.toLowerCase().includes(q);
    const matchStatus = filterStatus==="Semua" || r.status===filterStatus;
    const matchPriority = filterPriority==="Semua" || r.priority===filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  return (
    <div className="page" style={{ padding:"24px 28px", display:"flex", flexDirection:"column", gap:20 }}>
      {/* Toolbar */}
      <div style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
        <div style={{ position:"relative", flex:1, minWidth:240 }}>
          <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:C.textMuted }}>
            <Icon name="search" size={14} />
          </span>
          <input className="input" style={{ paddingLeft:34 }} placeholder="Cari laporan, ID, atau lokasi..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <select className="input" style={{ width:160 }} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
          {["Semua","Menunggu","Dalam Proses","Selesai","Eskalasi"].map(s=><option key={s}>{s}</option>)}
        </select>
        <select className="input" style={{ width:140 }} value={filterPriority} onChange={e=>setFilterPriority(e.target.value)}>
          {["Semua","Kritis","Tinggi","Minor"].map(p=><option key={p}>{p}</option>)}
        </select>
        <button className="btn btn-primary">
          <Icon name="plus" size={14} /> Tambah Laporan
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:C.bg, borderBottom:`1px solid ${C.border}` }}>
              {["ID","Judul & Lokasi","Kategori","Prioritas","Status","Pelapor","SLA","Teknisi","Aksi"].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"12px 14px", fontSize:10, color:C.textMuted, fontWeight:700, letterSpacing:.6 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => {
              const slaDate = new Date(r.sla);
              const now = new Date("2026-04-05");
              const slaExpired = slaDate < now && r.status !== "Selesai";
              const slaNear = !slaExpired && (slaDate - now) < 86400000*2 && r.status !== "Selesai";
              return (
                <tr key={r.id} className="table-row" style={{ borderBottom:`1px solid ${C.border}22` }}>
                  <td style={{ padding:"14px", fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:C.cyan }}>{r.id}</td>
                  <td style={{ padding:"14px" }}>
                    <div style={{ fontSize:13, color:C.text, fontWeight:500 }}>{r.title}</div>
                    <div style={{ fontSize:11, color:C.textMuted, marginTop:2 }}>📍 {r.location}</div>
                  </td>
                  <td style={{ padding:"14px" }}><span className="tag" style={{background:`${C.border}`,color:C.textDim,fontSize:11}}>{r.category}</span></td>
                  <td style={{ padding:"14px" }}><Badge label={r.priority} color={priorityColor(r.priority)} /></td>
                  <td style={{ padding:"14px" }}><Badge label={r.status} color={statusColor(r.status)} /></td>
                  <td style={{ padding:"14px", fontSize:12, color:C.textDim }}>{r.reporter}</td>
                  <td style={{ padding:"14px" }}>
                    <div style={{ fontSize:11, color: slaExpired?C.danger:slaNear?C.warning:C.textMuted, fontFamily:"'JetBrains Mono',monospace" }}>
                      {slaExpired?"⚠ ":slaNear?"⏰ ":""}{r.sla}
                    </div>
                  </td>
                  <td style={{ padding:"14px", fontSize:12, color:r.technician?C.textDim:C.textMuted }}>{r.technician||<span style={{color:C.warning}}>Belum assign</span>}</td>
                  <td style={{ padding:"14px" }}>
                    <div style={{ display:"flex", gap:6 }}>
                      <button className="btn btn-ghost" style={{ padding:"5px 8px", fontSize:11 }} onClick={()=>setSelected(r)}>
                        <Icon name="edit" size={12} /> Detail
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length===0 && (
          <div style={{ padding:40, textAlign:"center", color:C.textMuted, fontSize:13 }}>Tidak ada laporan ditemukan.</div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={()=>setSelected(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
              <div>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:C.cyan }}>{selected.id}</div>
                <div style={{ fontSize:16, fontWeight:700, color:C.text, marginTop:4 }}>{selected.title}</div>
              </div>
              <button className="btn btn-ghost" style={{padding:"6px"}} onClick={()=>setSelected(null)}><Icon name="x" size={16}/></button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              {[
                ["Kategori", selected.category],
                ["Lokasi", selected.location],
                ["Pelapor", selected.reporter],
                ["Tanggal", selected.date],
                ["Prioritas", selected.priority],
                ["Status", selected.status],
                ["Teknisi", selected.technician||"Belum ditugaskan"],
                ["Deadline SLA", selected.sla],
              ].map(([k,v]) => (
                <div key={k} style={{ background:C.bg, borderRadius:8, padding:"12px 14px", border:`1px solid ${C.border}` }}>
                  <div style={{ fontSize:10, color:C.textMuted, marginBottom:4, letterSpacing:.5 }}>{k.toUpperCase()}</div>
                  <div style={{ fontSize:13, color:C.text, fontWeight:500 }}>{v}</div>
                </div>
              ))}
            </div>
            {selected.rating && (
              <div style={{ marginTop:14, padding:"12px 14px", background:C.bg, borderRadius:8, border:`1px solid ${C.border}` }}>
                <div style={{ fontSize:10, color:C.textMuted, marginBottom:4 }}>RATING</div>
                <div style={{ color:C.warning }}>{"★".repeat(selected.rating)}{"☆".repeat(5-selected.rating)}</div>
              </div>
            )}
            <div style={{ display:"flex", gap:10, marginTop:20 }}>
              <button className="btn btn-primary" style={{ flex:1 }}>Update Status</button>
              <button className="btn btn-ghost">Assign Teknisi</button>
              <button className="btn btn-danger"><Icon name="trash" size={14}/></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── PAGE: ASSIGNMENT ─────────────────────────────────────────────────────────
const AssignPage = () => {
  const [dragOver, setDragOver] = useState(null);
  const unassigned = REPORTS.filter(r => !r.technician && r.status!=="Selesai");
  const assigned = REPORTS.filter(r => r.technician);

  return (
    <div className="page" style={{ padding:"24px 28px", display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1.5fr", gap:20 }}>
        {/* Left: Technicians */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.text }}>Daftar Teknisi</div>
          {TECHNICIANS.map(t => (
            <div key={t.id} className="card" style={{ padding:"16px" }}>
              <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                <Avatar initials={t.avatar} size={42} color={t.status==="Tersedia"?C.success:C.warning} />
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{t.name}</div>
                    <Badge label={t.status} color={t.status==="Tersedia"?{bg:"rgba(16,185,129,.15)",text:C.success}:{bg:"rgba(245,158,11,.15)",text:C.warning}} />
                  </div>
                  <div style={{ fontSize:11, color:C.textMuted, marginTop:2 }}>{t.specialty}</div>
                  <div style={{ display:"flex", gap:16, marginTop:10 }}>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:16, fontWeight:700, color:C.cyan }}>{t.active}</div>
                      <div style={{ fontSize:9, color:C.textMuted }}>AKTIF</div>
                    </div>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:16, fontWeight:700, color:C.success }}>{t.completed}</div>
                      <div style={{ fontSize:9, color:C.textMuted }}>SELESAI</div>
                    </div>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:16, fontWeight:700, color:C.warning }}>{t.rating}</div>
                      <div style={{ fontSize:9, color:C.textMuted }}>RATING</div>
                    </div>
                  </div>
                  {/* Load bar */}
                  <div style={{ marginTop:10 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                      <span style={{ fontSize:10, color:C.textMuted }}>Beban kerja</span>
                      <span style={{ fontSize:10, color:C.textMuted, fontFamily:"'JetBrains Mono',monospace" }}>{t.active}/5</span>
                    </div>
                    <div style={{ height:4, background:C.border, borderRadius:999 }}>
                      <div style={{
                        height:"100%", width:`${(t.active/5)*100}%`,
                        background: t.active>=4 ? C.danger : t.active>=2 ? C.warning : C.success,
                        borderRadius:999
                      }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Assignment Board */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {/* Unassigned */}
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:10, display:"flex", alignItems:"center", gap:8 }}>
              Belum Ditugaskan
              <span style={{background:"rgba(245,158,11,.15)",color:C.warning,borderRadius:999,fontSize:11,fontWeight:700,padding:"1px 8px"}}>{unassigned.length}</span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {unassigned.map(r => (
                <div key={r.id} className="card" style={{ padding:"14px 16px", borderLeft:`3px solid ${priorityColor(r.priority).text}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div>
                      <div style={{ fontSize:12, fontFamily:"'JetBrains Mono',monospace", color:C.cyan }}>{r.id}</div>
                      <div style={{ fontSize:13, color:C.text, marginTop:2, fontWeight:500 }}>{r.title}</div>
                      <div style={{ fontSize:11, color:C.textMuted, marginTop:2 }}>📍 {r.location} · {r.category}</div>
                    </div>
                    <Badge label={r.priority} color={priorityColor(r.priority)} />
                  </div>
                  <div style={{ display:"flex", gap:8, marginTop:12 }}>
                    {TECHNICIANS.filter(t=>t.status==="Tersedia").map(t => (
                      <button key={t.id} className="btn btn-ghost" style={{ fontSize:11, padding:"5px 10px" }}>
                        <Avatar initials={t.avatar} size={16} color={C.success} />
                        {t.name.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assigned */}
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:10, display:"flex", alignItems:"center", gap:8 }}>
              Sedang Dikerjakan
              <span style={{background:"rgba(59,130,246,.15)",color:C.info,borderRadius:999,fontSize:11,fontWeight:700,padding:"1px 8px"}}>{assigned.filter(r=>r.status!=="Selesai").length}</span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {assigned.filter(r=>r.status!=="Selesai").map(r => (
                <div key={r.id} className="card" style={{ padding:"14px 16px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ fontSize:13, color:C.text, fontWeight:500 }}>{r.title}</div>
                      <div style={{ fontSize:11, color:C.textMuted, marginTop:2 }}>📍 {r.location}</div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <Badge label={r.status} color={statusColor(r.status)} />
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <Avatar initials={r.technician?.split(" ").map(w=>w[0]).join("")||"?"} size={26} color={C.teal} />
                        <span style={{ fontSize:12, color:C.textDim }}>{r.technician}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── PAGE: ANALYTICS ──────────────────────────────────────────────────────────
const AnalyticsPage = () => {
  const [period, setPeriod] = useState("mingguan");

  const chartData = period==="mingguan" ? WEEKLY : MONTHLY;
  const maxVal = Math.max(...chartData.map(d=>d.laporan));

  return (
    <div className="page" style={{ padding:"24px 28px", display:"flex", flexDirection:"column", gap:20 }}>
      {/* KPI Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
        {[
          { label:"MTTR", value:"18.4 jam", sub:"Mean Time To Repair", icon:"clock", accent:C.cyan },
          { label:"SLA Compliance", value:"84%", sub:"Target ≥ 90%", icon:"check", accent:C.success },
          { label:"Avg. Rating", value:"4.7 ★", sub:"Dari 38 laporan selesai", icon:"star", accent:C.warning },
          { label:"Response Time", value:"2.3 jam", sub:"Rata-rata pertama respons", icon:"bell", accent:C.info },
        ].map(k => <StatCard key={k.label} {...k} />)}
      </div>

      {/* Main chart */}
      <div className="card" style={{ padding:"22px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:C.text }}>Laporan Masuk & Diselesaikan</div>
            <div style={{ fontSize:11, color:C.textMuted }}>Tren {period}</div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {["mingguan","bulanan"].map(p => (
              <button key={p} className={`btn ${period===p?"btn-primary":"btn-ghost"}`}
                style={{ fontSize:11, padding:"6px 14px", textTransform:"capitalize" }}
                onClick={()=>setPeriod(p)}>{p}</button>
            ))}
            <button className="btn btn-ghost" style={{ fontSize:11, padding:"6px 12px" }}>
              <Icon name="download" size={13} /> Export
            </button>
          </div>
        </div>

        {/* Tall bar chart */}
        <div style={{ display:"flex", alignItems:"flex-end", gap:12, height:160, paddingBottom:8 }}>
          {chartData.map((d,i) => (
            <div key={i} style={{ flex:1, display:"flex", gap:4, alignItems:"flex-end", height:"100%" }}>
              <div style={{ flex:1, display:"flex", flexDirection:"column", gap:2, height:"100%", justifyContent:"flex-end" }}>
                <div style={{
                  height:`${(d.selesai/maxVal)*100}%`,
                  background:`${C.textMuted}33`, borderRadius:"4px 4px 0 0", minHeight:4
                }} />
              </div>
              <div style={{ flex:1, display:"flex", flexDirection:"column", gap:2, height:"100%", justifyContent:"flex-end", position:"relative" }}>
                <div style={{ position:"absolute", top:-18, width:"100%", textAlign:"center", fontSize:10, color:C.textMuted, fontFamily:"'JetBrains Mono',monospace" }}>
                  {d.laporan}
                </div>
                <div style={{
                  height:`${(d.laporan/maxVal)*100}%`,
                  background:`linear-gradient(180deg, ${C.cyan}, ${C.teal})`,
                  borderRadius:"4px 4px 0 0", minHeight:4,
                  boxShadow:`0 0 12px ${C.cyanGlow}`
                }} />
              </div>
              <div style={{ position:"absolute", fontSize:9, marginTop:4 }} />
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:12, justifyContent:"center", marginTop:8 }}>
          {chartData.map((d,i) => (
            <div key={i} style={{ flex:1, textAlign:"center", fontSize:9, color:C.textMuted }}>{d.day||d.month}</div>
          ))}
        </div>
        <div style={{ display:"flex", gap:16, justifyContent:"center", marginTop:12, fontSize:11, color:C.textMuted }}>
          <span><span className="dot" style={{background:C.cyan,marginRight:4}} />Laporan Masuk</span>
          <span><span className="dot" style={{background:`${C.textMuted}44`,marginRight:4}} />Selesai</span>
        </div>
      </div>

      {/* Bottom analytics */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
        {/* Top reporters */}
        <div className="card" style={{ padding:"18px" }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:14 }}>Top Pelapor</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[
              {name:"Ahmad Fauzi",count:8,img:"AF"},
              {name:"Siti Rahma",count:6,img:"SR"},
              {name:"Reza Alif",count:5,img:"RA"},
              {name:"Admin Ops",count:4,img:"AO"},
            ].map((u,i) => (
              <div key={u.name} style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:11, color:C.textMuted, width:14, textAlign:"right" }}>{i+1}</span>
                <Avatar initials={u.img} size={28} />
                <span style={{ flex:1, fontSize:12, color:C.textDim }}>{u.name}</span>
                <span style={{ fontSize:12, fontWeight:700, color:C.cyan, fontFamily:"'JetBrains Mono',monospace" }}>{u.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Teknisi performance */}
        <div className="card" style={{ padding:"18px" }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:14 }}>Performa Teknisi</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {TECHNICIANS.map(t => (
              <div key={t.id} style={{ display:"flex", alignItems:"center", gap:10 }}>
                <Avatar initials={t.avatar} size={28} color={C.teal} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, color:C.textDim }}>{t.name.split(" ")[0]}</div>
                  <div style={{ height:3, background:C.border, borderRadius:999, marginTop:4 }}>
                    <div style={{ height:"100%", width:`${(t.completed/35)*100}%`, background:`linear-gradient(90deg,${C.teal},${C.cyan})`, borderRadius:999 }} />
                  </div>
                </div>
                <span style={{ fontSize:11, color:C.textMuted, fontFamily:"'JetBrains Mono',monospace" }}>{t.completed}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status breakdown */}
        <div className="card" style={{ padding:"18px" }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:14 }}>Status Breakdown</div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[
              {label:"Selesai", val:38, color:C.success},
              {label:"Dalam Proses", val:12, color:C.info},
              {label:"Menunggu", val:4, color:C.warning},
              {label:"Eskalasi", val:2, color:C.danger},
            ].map(s => (
              <div key={s.label}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:12, color:C.textDim }}>{s.label}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:s.color, fontFamily:"'JetBrains Mono',monospace" }}>{s.val}</span>
                </div>
                <div style={{ height:5, background:C.border, borderRadius:999 }}>
                  <div style={{ height:"100%", width:`${(s.val/56)*100}%`, background:s.color, borderRadius:999 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── PAGE: USERS ──────────────────────────────────────────────────────────────
const UsersPage = () => {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("Semua");
  const [showModal, setShowModal] = useState(false);

  const filtered = USERS.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = filterRole==="Semua" || u.role===filterRole;
    return matchSearch && matchRole;
  });

  const roleColor = (r) => ({
    "Admin":   {bg:"rgba(0,212,212,.15)", text:C.cyan},
    "Teknisi": {bg:"rgba(13,148,136,.15)", text:C.teal},
    "Pelapor": {bg:"rgba(100,116,139,.15)", text:C.textDim},
  }[r] || {bg:C.border, text:C.textMuted});

  const summary = ["Admin","Teknisi","Pelapor"].map(r => ({
    role:r, count: USERS.filter(u=>u.role===r).length
  }));

  return (
    <div className="page" style={{ padding:"24px 28px", display:"flex", flexDirection:"column", gap:20 }}>
      {/* Summary */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
        {summary.map(s => (
          <div key={s.role} className="card stat-card" style={{ padding:"18px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:11, color:C.textMuted, letterSpacing:.5 }}>{s.role.toUpperCase()}</div>
              <div style={{ fontSize:26, fontWeight:700, color:C.text, marginTop:4 }}>{s.count}</div>
            </div>
            <Badge label={s.role} color={roleColor(s.role)} />
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display:"flex", gap:12 }}>
        <div style={{ position:"relative", flex:1 }}>
          <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:C.textMuted }}>
            <Icon name="search" size={14} />
          </span>
          <input className="input" style={{ paddingLeft:34 }} placeholder="Cari nama atau email..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <select className="input" style={{ width:150 }} value={filterRole} onChange={e=>setFilterRole(e.target.value)}>
          {["Semua","Admin","Teknisi","Pelapor"].map(r=><option key={r}>{r}</option>)}
        </select>
        <button className="btn btn-primary" onClick={()=>setShowModal(true)}>
          <Icon name="plus" size={14} /> Tambah User
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:C.bg, borderBottom:`1px solid ${C.border}` }}>
              {["User","Email","NIM/NIP","Role","Status","Aksi"].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"12px 16px", fontSize:10, color:C.textMuted, fontWeight:700, letterSpacing:.6 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="table-row" style={{ borderBottom:`1px solid ${C.border}22` }}>
                <td style={{ padding:"14px 16px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <Avatar initials={u.name.split(" ").map(w=>w[0]).join("").slice(0,2)} size={34} color={roleColor(u.role).text} />
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{u.name}</div>
                      <div style={{ fontSize:10, color:C.textMuted, fontFamily:"'JetBrains Mono',monospace" }}>{u.id}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding:"14px 16px", fontSize:12, color:C.textDim }}>{u.email}</td>
                <td style={{ padding:"14px 16px", fontSize:12, color:C.textMuted, fontFamily:"'JetBrains Mono',monospace" }}>{u.nim}</td>
                <td style={{ padding:"14px 16px" }}><Badge label={u.role} color={roleColor(u.role)} /></td>
                <td style={{ padding:"14px 16px" }}>
                  <Badge label={u.status} color={u.status==="Aktif"?{bg:"rgba(16,185,129,.15)",text:C.success}:{bg:"rgba(100,116,139,.15)",text:C.textMuted}} />
                </td>
                <td style={{ padding:"14px 16px" }}>
                  <div style={{ display:"flex", gap:6 }}>
                    <button className="btn btn-ghost" style={{ padding:"5px 10px", fontSize:11 }}><Icon name="edit" size={12} /> Edit</button>
                    <button className="btn btn-danger" style={{ padding:"5px 10px", fontSize:11 }}><Icon name="trash" size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div style={{ fontSize:16, fontWeight:700, color:C.text }}>Tambah User Baru</div>
              <button className="btn btn-ghost" style={{padding:"6px"}} onClick={()=>setShowModal(false)}><Icon name="x" size={16}/></button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {[
                {label:"Nama Lengkap", placeholder:"Masukkan nama lengkap", type:"text"},
                {label:"Email", placeholder:"email@telkomuniversity.ac.id", type:"email"},
                {label:"NIM / NIP", placeholder:"10301230xxxx", type:"text"},
                {label:"Password", placeholder:"••••••••", type:"password"},
              ].map(f => (
                <div key={f.label}>
                  <label style={{ fontSize:11, color:C.textMuted, letterSpacing:.5, display:"block", marginBottom:6 }}>{f.label.toUpperCase()}</label>
                  <input className="input" type={f.type} placeholder={f.placeholder} />
                </div>
              ))}
              <div>
                <label style={{ fontSize:11, color:C.textMuted, letterSpacing:.5, display:"block", marginBottom:6 }}>ROLE</label>
                <select className="input">
                  {["Admin","Teknisi","Pelapor"].map(r=><option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:22 }}>
              <button className="btn btn-primary" style={{ flex:1 }}><Icon name="check" size={14} /> Simpan User</button>
              <button className="btn btn-ghost" onClick={()=>setShowModal(false)}>Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
const PAGE_META = {
  dashboard: { title:"Dashboard", subtitle:"Selamat datang kembali, Ragil 👋" },
  reports:   { title:"Manajemen Laporan", subtitle:"Kelola dan pantau semua laporan kerusakan fasilitas" },
  assign:    { title:"Assignment Teknisi", subtitle:"Tugaskan teknisi ke laporan yang membutuhkan penanganan" },
  analytics: { title:"Analytics & Laporan", subtitle:"Statistik, tren, dan kinerja sistem" },
  users:     { title:"Manajemen User", subtitle:"Kelola akun admin, teknisi, dan pelapor" },
};

export default function App() {
  const [page, setPage] = useState("dashboard");
  const meta = PAGE_META[page];

  const Pages = { dashboard: DashboardPage, reports: ReportsPage, assign: AssignPage, analytics: AnalyticsPage, users: UsersPage };
  const CurrentPage = Pages[page];

  return (
    <>
      <GlobalStyle />
      <div style={{ display:"flex", minHeight:"100vh" }}>
        <Sidebar page={page} setPage={setPage} />
        <main style={{ flex:1, marginLeft:240, minHeight:"100vh", background:C.bg }}>
          <Topbar title={meta.title} subtitle={meta.subtitle} />
          <CurrentPage />
        </main>
      </div>
    </>
  );
}
