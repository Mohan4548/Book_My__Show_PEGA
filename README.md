# CineWave — Pega-Style Movie Ticket Booking System

**CineWave** is a full-stack movie ticket booking management application designed around **Pega PRPC Case Management Principles**. Even though it is built with modern Node.js, Express, SQLite, and React, the system architecture, business logic, data models, and staff workflows directly mirror Pega Infinity / PRPC Case Management concepts.

---

## 🏛️ Pega PRPC Concept Mapping Table

| Pega Concept | CineWave Implementation | Details & Code Location |
| :--- | :--- | :--- |
| **Case Type** | `Movie Ticket Request` | Identified by unique Case ID format (e.g. `CW-1001`). Holds customer info, show reference, ticket count, derived total cost, stage status, and queue assignment (`server/db/database.js`). |
| **Case Lifecycle & Stages** | 5-Stage State Machine | Visual stepper: `Initial Stage` → `Availability Check` → `Approval` → `Booking Execution` → `Resolved` (`client/src/components/StageStepper.jsx`, `server/routes/bookings.js`). |
| **Business Validation Rule** | Seat Availability Check | Backend re-validates `Show.seatsAvailable >= numTickets`. If insufficient, auto-rejects with readable error message (`server/routes/bookings.js`). |
| **Derived Property / Calculation** | `totalCost` Property | Server-calculated as `numTickets × pricePerSeat`. Client inputs for cost are never trusted (`server/routes/bookings.js`). |
| **Step Action (User Decision)** | Explicit Customer Confirmation | Requires customer action (`confirmed = true`) before the case can advance from `Initial Stage` to `Availability Check` & `Approval` (`client/src/components/BookingModal.jsx`). |
| **Automated Work Queue Routing** | `assignedQueue` Router | Automatically routes case based on `Show.showType`:<br>&bull; `Premium` → `PremiumShowQueue`<br>&bull; `Standard` → `StandardShowQueue` (`server/routes/bookings.js`). |
| **Service Level Agreement (SLA)** | Goal & Deadline Engine | &bull; **SLA Goal**: 1 day (1 min fast demo)<br>&bull; **SLA Deadline**: 2 days (2 mins fast demo)<br>Color-coded status badges: 🟢 `SLA On Track`, 🟠 `SLA Goal Missed`, 🔴 `SLA Deadline Missed` (`server/services/slaService.js`). |
| **Correspondence** | Nodemailer Email Service | Automatically generates and sends structured HTML ticket confirmation emails to customers upon reaching `Resolved` status (`server/services/emailService.js`). |
| **Audit Trail (Case History)** | `CaseAuditLog` History | Records every stage transition, action, actor, and timestamp in an inspectable timeline (`client/src/components/CaseAuditModal.jsx`). |
| **Case Resolution** | Successful Booking Execution | Safely deducts seats (`Show.seatsAvailable - numTickets`), records `resolvedAt` timestamp, and generates Digital Pass & QR Code (`client/src/components/DigitalTicketModal.jsx`). |
| **Data Objects** | `Movie`, `Show`, `BookingRequest` | Clean file-backed persistent database model layer (`server/db/database.js`). |

---

## 📐 Application Architecture

```text
Customer (Browser)
       │
  React Frontend (Vite + Tailwind CSS)
       │
  REST API (Axios Client)
       │
  Express Backend (Node.js Engine on Port 5000)
       │
  Business Rules & Pega Workflow Engine
       │
  Persistent JSON Database Layer (cinewave_db.json)
       │
  Nodemailer Email Service (Ethereal SMTP)
```

### Case Lifecycle Pipeline:
```text
Initial Stage  ──(Customer Confirms)──>  Availability Check  ──(Auto-Pass)──>  Approval
                                                                                 │
                                                                       (Staff Approves)
                                                                                 │
                                                                                 ▼
Resolved  <──(Email Correspondence)──  Booking Execution  <──(Deduct Seats)──────┘
```

---

## 🚀 Key Features

1. **Customer Portal (`/`)**
   - **Movie Browsing**: Filter by genre, search, and Pega Queue Classifiers (`Premium` / `Standard`).
   - **Showtime Schedules**: Live seat availability, pricing per seat, screen locations.
   - **Booking Request Modal**: Automatic total cost calculation, seat overflow protection, and explicit customer confirmation step (`confirmed = true`).
   - **My Bookings Page**: Live stage tracking (`Initial Stage` → `Resolved`), SLA badges, audit trail modal, and **Digital Ticket & Dynamic SVG QR Pass**.
   - **Ticket Verification Engine**: Scan or input booking ID to verify digital ticket validity via `GET /api/bookings/verify/:id`.

2. **Staff Case Management Dashboard (`/staff`)**
   - **Dashboard Metrics Grid**: Consumes `GET /api/stats` (`Total Cases`, `Pending Approval`, `Resolved Cases`, `Rejected Cases`, `Premium Queue`, `Standard Queue`, `SLA Goal Missed`, `SLA Deadline Missed`, `SLA On Track`).
   - **Work Queue Filters**: Dedicated views for `PremiumShowQueue` and `StandardShowQueue`.
   - **SLA Monitor**: Track case deadlines with Fast Demo SLA mode toggle (1m/2m testing).
   - **Staff Actions**: Approve cases (deducts seats & triggers email) or Reject cases with reason logging.

3. **Admin Catalog (`/admin`)**
   - Full CRUD operations for Movies and Showtime schedules.

---

## 🛠️ Project Structure

```
Book_My_Show/
├── server/
│   ├── db/
│   │   ├── database.js          # Persistent Database Layer & CRUD Helpers
│   │   ├── seed.js              # Database Seed Script for Demo Movies/Shows/Cases
│   │   └── cinewave_db.json     # File-backed Database File
│   ├── routes/
│   │   ├── movies.js            # Movies REST API
│   │   ├── shows.js             # Shows REST API
│   │   ├── bookings.js          # Pega Case Lifecycle & Verification REST API
│   │   └── stats.js             # Staff Dashboard Stats REST API
│   ├── services/
│   │   ├── slaService.js        # SLA Goal & Deadline Calculation Engine
│   │   └── emailService.js      # Nodemailer Correspondence Engine
│   ├── index.js                 # Express Backend Server (Port 5000)
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Header Bar Navigation with Ticket Verification
│   │   │   ├── StageStepper.jsx      # Visual 5-Stage Lifecycle Progress Bar
│   │   │   ├── SLABadge.jsx          # SLA Goal & Deadline Alert Badge
│   │   │   ├── CaseAuditModal.jsx    # Case History Audit Log Modal
│   │   │   ├── CaseDetailsModal.jsx  # Pega Case Drawer & Info Viewer
│   │   │   ├── DigitalTicketModal.jsx# Resolved Ticket Pass with SVG QR Code
│   │   │   ├── BookingModal.jsx      # Customer Booking Request & Confirmation Modal
│   │   │   └── PegaMappingModal.jsx  # Interactive Mentor Concept Reference Modal
│   │   ├── pages/
│   │   │   ├── HomePage.jsx          # Hero Banner & Now Showing Movies
│   │   │   ├── MoviesPage.jsx        # Movies Catalog with Filters
│   │   │   ├── ShowsPage.jsx         # Showtime Schedules & Booking Trigger
│   │   │   ├── MyBookingsPage.jsx    # My Bookings, Case Tracker & Notifications
│   │   │   ├── VerifyTicketPage.jsx  # Staff Ticket Verification Interface
│   │   │   ├── StaffDashboard.jsx    # Staff Work Queue Manager & Approvals
│   │   │   └── AdminCatalog.jsx      # Admin Movies & Shows Management
│   │   ├── api.js                    # Axios API Client Helper
│   │   ├── App.jsx                   # React Router Shell
│   │   └── index.css                 # Glassmorphism Styling & Tailwind Rules
│   ├── vite.config.js
│   └── package.json
└── README.md                         # Architecture & Mentor Explanation Guide
```

---

## ⚙️ Running CineWave Locally

### 1. Start Express Backend
```bash
cd server
npm install
node db/seed.js   # Seed sample movies, shows, and demo cases
npm start         # Runs Express server on http://localhost:5000
```

### 2. Start React Frontend
```bash
cd client
npm install
npm run dev       # Runs Vite dev server on http://localhost:5173
```

---

## 🧪 Short Recommended Mentor Demo Flow

1. Open **[http://localhost:5173](http://localhost:5173)** in browser.
2. Click **Movies** → Select **Inception** → Click **View Shows**.
3. Pick a showtime → Click **Book Now** → Enter Customer Name & Email → Click **Submit Request**.
4. In the confirmation screen, review the derived cost and click **Confirm Booking Request** (`confirmed = true`).
5. Click **Staff Portal** → Filter by `PremiumShowQueue` → Locate your pending case `CW-XXXX`.
6. Toggle **Fast Demo SLA** to demonstrate SLA Goal/Deadline color transitions.
7. Click **Approve** on the case → Observe remaining seats decrement and Nodemailer correspondence logged in server console.
8. Return to **My Bookings** → Click **View Ticket** → Display the **Digital Pass & Dynamic SVG QR Code**.
9. Click **Verify Ticket** → Paste Case ID (`CW-XXXX`) → Click **Verify Ticket** to confirm valid ticket status from backend!
