# Greenleaf Family Clinic — Clinic Management Frontend

A responsive, single-doctor clinic management Single Page Application (SPA) built with React 18, Vite, and React Router v6.

---

## 1. Quick Start

### Installation & Development
```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## 2. Mock Authentication Credentials

All authentication is simulated on the client side. Active sessions are stored in `sessionStorage` and protected routes redirect unauthenticated users to `/login`.

| Credential | Value |
|---|---|
| **Doctor Email** | `doctor@clinic.test` |
| **Password** | `demo1234` |
| **Doctor Name** | Dr. A. Sharma |

> **Tip:** On the Login page, click **"Auto-fill"** to automatically populate these credentials.

---

## 3. Seeded Demo Data

On first run, the app seeds `localStorage` with realistic medical records:
- **6 Patients**: Pre-configured with varied age, genders, phone numbers, and addresses.
- **8 Visits**: Spread over the past 3 weeks, including visits dated *today* so the Dashboard stats and today's visits table are immediately active.
- **6 Prescriptions**: Complete medication schedules with strengths, dosages (e.g. `1-0-1`), frequencies, durations, and clinical instructions.
- **8 Invoices**: Sequential invoice numbers (`INV-2025-0001` through `INV-2025-0008`) with a mix of `Paid`/`Unpaid` statuses and `Cash`/`Online` payment modes.

All IDs (`PT-0001`, `V-0001`, `RX-0001`, `INV-YYYY-XXXX`) are sequential and persisted in `localStorage`—they are never duplicated or regenerated on reload.

---

## 4. Architecture & Service-Layer Swap Point

Components **never** interact directly with `localStorage`. Every data read and write passes through an asynchronous service layer located in `src/services/`:

- [`src/services/patients.js`](file:///d:/Demo%20hospital/src/services/patients.js): Patient queries, search, registration, and profile updates.
- [`src/services/visits.js`](file:///d:/Demo%20hospital/src/services/visits.js): Consultation visits and clinical observations.
- [`src/services/prescriptions.js`](file:///d:/Demo%20hospital/src/services/prescriptions.js): Prescription records and medicine rows.
- [`src/services/bills.js`](file:///d:/Demo%20hospital/src/services/bills.js): Invoices, line items, status toggling, and payment modes.
- [`src/services/auth.js`](file:///d:/Demo%20hospital/src/services/auth.js): Session management and login validation.
- [`src/services/storage.js`](file:///d:/Demo%20hospital/src/services/storage.js): Local persistence, JSON backup export, and import.

### Swapping for a Real Backend API
To connect this frontend to a real REST or GraphQL backend:
1. Replace the `getFromStorage` and `saveToStorage` calls inside `src/services/*.js` with standard `fetch()` or `axios` HTTP calls to your endpoints (e.g., `fetch('/api/patients')`).
2. Update `src/services/auth.js` to exchange credentials for a JWT/session token and store the bearer token in `sessionStorage` or an HTTP-only cookie.
3. Because all components already consume Promises from `src/services/*`, **zero component code changes** are required.

---

## 5. Customizing Clinic Identity

All clinic details are defined in one configuration file:
- **File:** [`src/config/clinic.js`](file:///d:/Demo%20hospital/src/config/clinic.js)

```javascript
export const DEFAULT_CLINIC_CONFIG = {
  name: "Greenleaf Family Clinic",
  doctor: "Dr. A. Sharma",
  quals: "MBBS, MD (General Medicine)",
  regNo: "Reg. No. 12345",
  address: "12 Park Road, Sector 4, Springfield – 560001",
  phone: "+91 98765 43210",
  email: "care@greenleafclinic.test",
  timings: "Mon–Sat, 9:00 AM – 1:00 PM, 5:00 PM – 8:00 PM",
  consultFee: 500,
  logoText: "GF",
};
```
Alternatively, log in as the doctor and navigate to the **Settings** (`/settings`) screen to update these details directly in the UI. Changes are persisted and immediately update all headers, print templates, and consultation fee defaults.

---

## 6. Design System & Brand Palette

The application strictly enforces the clinic brand tokens defined in [`src/styles/tokens.css`](file:///d:/Demo%20hospital/src/styles/tokens.css):

- `--color-primary: #2C5745` (Deep forest green — sidebar, headers, primary buttons, focus rings)
- `--color-primary-dark: #24473A` (Hover / pressed / sidebar bottom)
- `--color-primary-mid: #3D6E58` (Secondary accents)
- `--color-primary-tint: #E7EFEA` (Hover rows, selected state, mode chips)
- `--color-accent: #EBE3A7` (Warm pale gold — accent only, $\le$ 10% visible surface: active nav pill background, today chip, empty-state illustrations)
- `--color-accent-tint: #F5F0C9` (Unpaid badge background)
- `--color-bg: #FAF9F2` (Warm off-white page background)
- `--color-surface: #FFFFFF` (Pure white cards and tables)

### Status Chips
- **Paid**: `#2C5745` background with white text
- **Unpaid**: `#F5F0C9` background with `#8A6A17` text
- **Payment Mode (Cash/Online)**: `#E7EFEA` background with `#2C5745` text

---

## 7. Print Templates (A4)

Both print views render without the navigation shell and use a dedicated `@media print` stylesheet:
- **Prescription** (`/print/prescription/:id`): Solid `#2C5745` header band with `print-color-adjust: exact`, patient banner, Rx symbol, medication table, clinical notes, vital observations, doctor qualifications, and signature line.
- **Receipt / Invoice** (`/print/receipt/:id`): Matching header band, invoice number, itemized charges, total amount in bold, amount in words, and payment status box.
