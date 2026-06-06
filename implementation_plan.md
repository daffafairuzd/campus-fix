# Redesign CampusFix Admin — Warm-Gradient Light Theme

Mengubah tampilan web admin dari **dark mode** menjadi tema **warm-gradient light** yang soft dan elegan, tanpa mengubah logika/data dinamis apapun.

## Scope & Constraints

- Hanya mengubah styling/visual — **tidak menyentuh** logika data, API calls, atau state management
- Menghapus fitur dark/light toggle karena tema baru adalah light-only warm-gradient

## Proposed Changes

### Foundation Layer

#### [MODIFY] [tailwind.config.js](file:///d:/telyu/Semester6/ABP/TubesWeb/campus-fix/admin-web/tailwind.config.js)
- Mengubah semua color tokens dari dark palette → warm light palette
- `dark-bg` → warm off-white `#fffaf7`
- `dark-card` → pure white `#ffffff`
- `dark-hover` → warm hover `#fff8f5`
- `dark-border` → soft border `rgba(0,0,0,0.06)`
- `ui-text` → dark text `#1e293b`
- `ui-muted` → muted `#64748b`
- `ui-dim` → dim `#94a3b8`
- Brand colors tetap sama (`#E53935`, `#dc2626`)

#### [MODIFY] [index.css](file:///d:/telyu/Semester6/ABP/TubesWeb/campus-fix/admin-web/src/index.css)
- Menghapus `.dark` CSS variables (tidak perlu lagi)
- Update `:root` variables ke warm light palette
- Update `.card` → white bg, shadow lembut `0 2px 12px rgba(0,0,0,0.06)`, border-radius `16px`, hilangkan border keras
- Update `.btn-primary` → tetap merah, tapi dengan shadow lebih soft
- Update `.btn-ghost` → border soft, hover warm
- Update `.input` → white bg, border soft
- Update `.sidebar-item` → teks putih, active state `rgba(255,255,255,0.18)`
- Update `.table-row` → hover `#fff8f5`
- Body background → gradient `#fff5f5 → #fff8f0`

---

### Layout Components

#### [MODIFY] [Sidebar.jsx](file:///d:/telyu/Semester6/ABP/TubesWeb/campus-fix/admin-web/src/components/layout/Sidebar.jsx)
- Background → gradient vertikal `#C62828 → #E53935 → #FF8A65`
- Hilangkan `border-r`, ganti dengan `box-shadow: 4px 0 24px rgba(0,0,0,0.08)`
- Semua teks & icon → putih `#ffffff`
- Logo text "Campus**Fix**" → putih semua
- Active menu → `rgba(255,255,255,0.18)` dengan `border-radius: 10px`
- User info section → border putih transparan
- Badge count → tetap putih di merah

#### [MODIFY] [Header.jsx](file:///d:/telyu/Semester6/ABP/TubesWeb/campus-fix/admin-web/src/components/layout/Header.jsx)
- Background → putih solid dengan `box-shadow: 0 1px 8px rgba(0,0,0,0.06)`
- Hilangkan `backdrop-blur`, `border-b`
- Hilangkan toggle dark/light mode
- Notification dropdown → white bg, warm shadows
- Teks heading → `font-semibold` (bukan `font-bold`)

#### [MODIFY] [MainLayout.jsx](file:///d:/telyu/Semester6/ABP/TubesWeb/campus-fix/admin-web/src/components/layout/MainLayout.jsx)
- Background → warm gradient `#fff5f5 → #fff8f0`

---

### UI Components

#### [MODIFY] [components/ui/index.jsx](file:///d:/telyu/Semester6/ABP/TubesWeb/campus-fix/admin-web/src/components/ui/index.jsx)
- Badge colors → adjusted untuk light theme (lebih soft, pastel)
- Avatar → adjusted gradient untuk light theme

---

### Page Components

#### [MODIFY] [Dashboard.jsx](file:///d:/telyu/Semester6/ABP/TubesWeb/campus-fix/admin-web/src/pages/Dashboard.jsx)
- **Stat Cards**: Hilangkan border-bottom gradient, ganti background card ke gradient lembut per warna:
  - Total Laporan: `#fff0f0 → #ffe8e8`
  - Dalam Proses: `#fffbf0 → #fff3dc`
  - Selesai: `#f0fff8 → #e0faf0`
  - Eskalasi: `#fff0f0 → #ffe8e8`
  - Border: `1px solid rgba(0,0,0,0.06)`, border-radius `16px`
  - Icon → background circle gradient sesuai warna
- **SLA Alert**: gradient `#fff0f0 → #ffe8dc`, border-left `3px solid #E53935`, border-radius `12px`
- **Table**: header bg `#fff5f5`, teks merah muted `#c0392b`, row hover `#fff8f5`, border `1px solid rgba(0,0,0,0.04)`
- **Chart cards**: white bg, shadow, no hard borders
- **Technician cards**: light bg, soft borders

#### [MODIFY] [ReportList.jsx](file:///d:/telyu/Semester6/ABP/TubesWeb/campus-fix/admin-web/src/pages/reports/ReportList.jsx)
- Table header → `bg-[#fff5f5]`, teks `text-[#c0392b]`
- Row hover → `hover:bg-[#fff8f5]`
- Border rows → `border-[rgba(0,0,0,0.04)]`
- Filter dropdown → white bg, warm shadow

#### [MODIFY] [ReportDetail.jsx](file:///d:/telyu/Semester6/ABP/TubesWeb/campus-fix/admin-web/src/pages/reports/ReportDetail.jsx)
- Cards → white, soft shadow, 16px radius
- Escalation banner → warm gradient bg
- Tabs → warm active state

#### [MODIFY] [ReportForm.jsx](file:///d:/telyu/Semester6/ABP/TubesWeb/campus-fix/admin-web/src/pages/reports/ReportForm.jsx)
- Cards & inputs → warm light theme

#### [MODIFY] [Analytics.jsx](file:///d:/telyu/Semester6/ABP/TubesWeb/campus-fix/admin-web/src/pages/Analytics.jsx)
- Chart tooltips → white bg instead of dark
- Cards → white bg, soft shadow
- Period toggle → warm bg

#### [MODIFY] [Assign.jsx](file:///d:/telyu/Semester6/ABP/TubesWeb/campus-fix/admin-web/src/pages/Assign.jsx)
- Cards → white bg, soft shadow
- Modal dialogs → white bg, warm shadow (bukan dark bg/backdrop)
- Technician pills → warm light states
- Banner → warm gradient

#### [MODIFY] [SlaTracking.jsx](file:///d:/telyu/Semester6/ABP/TubesWeb/campus-fix/admin-web/src/pages/SlaTracking.jsx)
- Summary cards → warm gradients sesuai warna status
- Progress bars → tetap warna asli di atas warm bg
- SLA config cards → white, soft borders

#### [MODIFY] [Users.jsx](file:///d:/telyu/Semester6/ABP/TubesWeb/campus-fix/admin-web/src/pages/Users.jsx)
- Table → warm header, soft borders
- Modals → white bg, warm styling
- Summary cards → white bg

#### [MODIFY] [App.jsx](file:///d:/telyu/Semester6/ABP/TubesWeb/campus-fix/admin-web/src/App.jsx)
- Hapus dark mode initialization logic
- TempPage → warm light styling

---

## Verification Plan

### Browser Testing
- Buka setiap halaman (Dashboard, Reports, Assign, SLA, Analytics, Users) dan verifikasi visual
- Screenshot sebelum & sesudah untuk perbandingan

### Manual Check
- Pastikan semua data dinamis tetap tampil dengan benar
- Pastikan filter, search, dan interaksi tetap berfungsi
- Verifikasi sidebar, header, notifications, dan modals
