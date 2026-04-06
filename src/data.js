export const REPORTS = [
  { 
    id:"RPT-001", title:"AC ruangan 301 mati total", category:"HVAC", location:"Gedung A Lt.3", status:"Dalam Proses", priority:"Kritis", reporter:"Ahmad Fauzi", date:"2026-04-03 08:15:22", technician:"Budi S.", sla:"2026-04-05", rating:null, 
    description:"AC tidak mau menyala sama sekali meskipun sudah ganti remote dan dicolok ulang. Udara sangat panas mengganggu praktikum.",
    history: [
      { title: "Laporan dibuat", date: "2026-04-03 08:15:22", user: "Ahmad Fauzi" },
      { title: "Teknisi ditugaskan: Budi S.", date: "2026-04-03 09:30:45", user: "Admin" }
    ] 
  },
  { 
    id:"RPT-002", title:"Lampu koridor B putus 3 titik", category:"Listrik", location:"Gedung B Lt.1", status:"Selesai", priority:"Minor", reporter:"Siti Rahma", date:"2026-04-01 19:40:11", technician:"Eko P.", sla:"2026-04-04", rating:4,
    description:"Ada 3 buah lampu mati berurutan di sepanjang koridor, menjadikan area temaram ketika malam hari.",
    history: [
      { title: "Laporan dibuat", date: "2026-04-01 19:40:11", user: "Siti Rahma" },
      { title: "Teknisi ditugaskan: Eko P.", date: "2026-04-01 20:15:00", user: "Admin" },
      { title: "Laporan Selesai", date: "2026-04-02 11:25:34", user: "Eko P." }
    ] 
  },
  { 
    id:"RPT-003", title:"Proyektor Lab IF-2 tidak menyala", category:"Lab", location:"Lab IF Lt.2", status:"Menunggu", priority:"Tinggi", reporter:"Reza Alif", date:"2026-04-04 07:12:05", technician:null, sla:"2026-04-06", rating:null,
    description:"Indikator power berkedip merah saat dinyalakan tapi lensa tidak mengeluarkan cahaya.",
    history: [
      { title: "Laporan dibuat", date: "2026-04-04 07:12:05", user: "Reza Alif" }
    ] 
  },
  { 
    id:"RPT-004", title:"Toilet bocor basement parkir", category:"Plumbing", location:"Basement", status:"Dalam Proses", priority:"Tinggi", reporter:"Dewi N.", date:"2026-04-02 14:55:00", technician:"Eko P.", sla:"2026-04-05", rating:null,
    description:"Pipa di atas plafon toilet rembes air cukup deras, mengenai jalur evakuasi.",
    history: [
      { title: "Laporan dibuat", date: "2026-04-02 14:55:00", user: "Dewi N." },
      { title: "Teknisi ditugaskan: Eko P.", date: "2026-04-02 15:30:17", user: "Admin" }
    ] 
  },
  { 
    id:"RPT-005", title:"WiFi area kantin drop terus", category:"Jaringan", location:"Kantin Pusat", status:"Menunggu", priority:"Minor", reporter:"Fajar W.", date:"2026-04-04 16:20:41", technician:null, sla:"2026-04-07", rating:null,
    description:"Sinyal wifi penuh tapi tidak bisa dipakai browsing, kemungkinan router hang.",
    history: [
      { title: "Laporan dibuat", date: "2026-04-04 16:20:41", user: "Fajar W." }
    ] 
  },
  { 
    id:"RPT-006", title:"Lift gedung C error kode E3", category:"Lift", location:"Gedung C", status:"Eskalasi", priority:"Kritis", reporter:"Mega P.", date:"2026-04-03 10:05:12", technician:"Hendro K.", sla:"2026-04-04", rating:null,
    description:"Pintu lift tidak mau tertutup, muncul tulisan error E3 di layar atas.",
    history: [
      { title: "Laporan dibuat", date: "2026-04-03 10:05:12", user: "Mega P." },
      { title: "Eskalasi Eksternal (Vendor)", date: "2026-04-04 09:00:00", user: "Admin" }
    ] 
  },
  { 
    id:"RPT-007", title:"Papan tulis smartboard rusak", category:"Lab", location:"Ruang 201", status:"Selesai", priority:"Minor", reporter:"Taufik M.", date:"2026-03-30 13:45:22", technician:"Budi S.", sla:"2026-04-02", rating:5,
    description:"Pointer tidak akurat dan perlu dikalibrasi tapi sistemnya dikunci PIN.",
    history: [
      { title: "Laporan dibuat", date: "2026-03-30 13:45:22", user: "Taufik M." },
      { title: "Teknisi ditugaskan: Budi S.", date: "2026-03-31 08:30:00", user: "Admin" },
      { title: "Laporan Selesai", date: "2026-04-01 15:20:10", user: "Budi S." }
    ] 
  },
  { 
    id:"RPT-008", title:"Genset cadangan tidak hidup", category:"Listrik", location:"Ruang Genset", status:"Dalam Proses", priority:"Kritis", reporter:"Admin Ops", date:"2026-04-04 22:15:05", technician:"Hendro K.", sla:"2026-04-05", rating:null,
    description:"Maintenance rutin mingguan, didapati aki genset B melemah.",
    history: [
      { title: "Laporan dibuat", date: "2026-04-04 22:15:05", user: "Admin Ops" },
      { title: "Teknisi ditugaskan: Hendro K.", date: "2026-04-04 22:45:30", user: "Admin" }
    ] 
  },
];

export const TECHNICIANS = [
  { id:"TEC-01", name:"Budi Santoso", specialty:"Listrik & Lab", active:3, completed:24, rating:4.8, status:"Tersedia", avatar:"BS" },
  { id:"TEC-02", name:"Eko Prasetyo", specialty:"Plumbing & HVAC", active:2, completed:31, rating:4.6, status:"Sibuk", avatar:"EP" },
  { id:"TEC-03", name:"Hendro Kurniawan", specialty:"Lift & Mekanikal", active:2, completed:19, rating:4.9, status:"Sibuk", avatar:"HK" },
  { id:"TEC-04", name:"Slamet Riyadi", specialty:"Jaringan & IT", active:0, completed:15, rating:4.5, status:"Tersedia", avatar:"SR" },
  { id:"TEC-05", name:"Wahyu Pramono", specialty:"Umum", active:1, completed:28, rating:4.7, status:"Cuti", avatar:"WP" },
];

export const USERS = [
  { id:"USR-01", name:"Muhammad Ragil", email:"ragil@telkomuniversity.ac.id", role:"Admin", nim:"103012300015", status:"Aktif" },
  { id:"USR-02", name:"Daffa Fairuz", email:"daffa@telkomuniversity.ac.id", role:"Admin", nim:"103012300309", status:"Aktif" },
  { id:"USR-03", name:"Ahmad Fauzi", email:"afauzi@student.telkomuniversity.ac.id", role:"Pelapor", nim:"10301230090", status:"Aktif" },
  { id:"USR-04", name:"Siti Rahma", email:"srahma@student.telkomuniversity.ac.id", role:"Pelapor", nim:"10301230091", status:"Aktif" },
  { id:"USR-05", name:"Budi Santoso", email:"bsantoso@telkomuniversity.ac.id", role:"Teknisi", nim:"-", status:"Aktif" },
  { id:"USR-06", name:"Eko Prasetyo", email:"eprasetyo@telkomuniversity.ac.id", role:"Teknisi", nim:"-", status:"Aktif" },
  { id:"USR-07", name:"Reza Alif", email:"ralif@student.telkomuniversity.ac.id", role:"Pelapor", nim:"10301230095", status:"Nonaktif" },
];

export const WEEKLY = [
  { day:"Sen", laporan:8, selesai:5 },
  { day:"Sel", laporan:12, selesai:9 },
  { day:"Rab", laporan:6, selesai:6 },
  { day:"Kam", laporan:15, selesai:10 },
  { day:"Jum", laporan:9, selesai:7 },
  { day:"Sab", laporan:4, selesai:4 },
  { day:"Min", laporan:2, selesai:2 },
];

export const MONTHLY = [
  { month:"Nov", laporan:42, selesai:38 },
  { month:"Des", laporan:55, selesai:48 },
  { month:"Jan", laporan:61, selesai:54 },
  { month:"Feb", transform:48, selesai:45 },
  { month:"Mar", laporan:73, selesai:61 },
  { month:"Apr", laporan:29, selesai:20 },
];
