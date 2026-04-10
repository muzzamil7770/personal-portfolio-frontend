# 🩺 FirstCall Telehealth Portal — MVP

> **Real-time occupational telehealth platform for skilled nursing facilities.**
> Instant injury reporting → triage → provider video visit → return-to-work tracking — all from one dashboard.

![Angular](https://img.shields.io/badge/Angular-21.2-DD0031?logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![json-server](https://img.shields.io/badge/API-json--server-green)
![SweetAlert2](https://img.shields.io/badge/SweetAlert2-themed-FF6154)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Authentication & Roles](#authentication--roles)
- [Data Architecture](#data-architecture)
- [SweetAlert Confirmations](#sweetalert-confirmations)
- [Charts & Visualizations](#charts--visualizations)
- [Real-Time Functionality](#real-time-functionality)
- [Component Library](#component-library)
- [API Endpoints](#api-endpoints)
- [Routing & Navigation](#routing--navigation)
- [Contributing](#contributing)

---

## Overview

FirstCall Telehealth Portal is an Angular-based MVP for managing workplace injuries in skilled nursing and assisted living facilities. The platform connects injured employees with occupational medicine providers via telehealth within minutes — replacing costly ER visits with $85 telehealth consultations.

### The Problem

| Traditional Flow | FirstCall Flow |
|---|---|
| Employee injured → waits for shift end | Employee injured → reports immediately |
| Drives to ER → 2-4 hour wait | Opens portal → 3 min avg wait |
| $1,350 average ER cost | $85 telehealth visit |
| 5-7 day RTW delay | 78% return-to-work within 3 days |

---

## Features

### 🏢 Employer (Administrator) Portal

| Feature | Description | Status |
|---|---|---|
| **Dashboard** | Real-time KPI stats, bar charts, sparkline trends, cost comparison | ✅ Dynamic |
| **Incident Management** | Full CRUD — log, view, edit, delete, filter, search incidents | ✅ Functional |
| **OSHA Compliance** | 300A log, recordable rates, checklist management | ✅ Functional |
| **Reports** | Generate/export PDF & CSV reports, add custom report templates | ✅ Functional |
| **Settings** | Facility info, workers' comp, notification toggles, integrations | ✅ Functional |
| **CSV Export** | One-click export of filtered incident data to CSV | ✅ Downloads file |

### 👤 Employee Portal

| Feature | Description | Status |
|---|---|---|
| **Dashboard** | Active treatment card, action tiles, RTW status, recent activity | ✅ Dynamic |
| **Report Injury** | Multi-step wizard: injury type → triage → provider connection | ✅ Functional |
| **Video Visit** | Simulated telehealth visit with live provider notes | ✅ Demo |
| **Visit History** | Complete history with date parsing and status badges | ✅ Functional |
| **Medications** | CRUD management for prescriptions and OTC meds | ✅ Functional |

### 🎨 UX Enhancements

- **SweetAlert2** — All confirmations, delete prompts, success toasts, and multi-field inputs use branded SweetAlert modals themed to match the teal/navy/coral palette
- **Animated Charts** — Bar charts with spring grow animation and sparklines with cubic bezier curves and animated data dots
- **Loading States** — Skeleton-style loading with smooth fade-in transitions
- **Toast Notifications** — Material snackbar with custom color themes
- **Responsive Design** — Mobile-first grid layouts that collapse gracefully

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Angular 21.2 (standalone components, signals, new control flow) |
| **Language** | TypeScript 5.x (strict mode) |
| **Styling** | SCSS with CSS custom properties (design tokens) |
| **State** | Angular Signals (`signal()`, `computed()`) |
| **HTTP** | Angular `HttpClient` + `firstValueFrom` for async API calls |
| **Routing** | Angular Router with guards (`canActivate`, `canMatch`) |
| **UI Dialogs** | Angular Material Dialogs + SweetAlert2 |
| **Charts** | Custom SVG components (no external charting library) |
| **Backend** | json-server (mock REST API from `db.json`) |
| **Fonts** | Outfit (headings) + JetBrains Mono (data) via Google Fonts |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Installation

```bash
# Clone the repository
git clone https://github.com/Anchorstech/firstcall-telehealth-portal-mvp.git
cd firstcall-telehealth-portal-mvp

# Install dependencies
npm install
```

### Running the Application

You need **two terminals** — one for the API server, one for the Angular dev server:

```bash
# Terminal 1: Start the mock API server
npx json-server --watch db.json --port 3000

# Terminal 2: Start Angular dev server
ng serve
```

Then open **http://localhost:4200** in your browser.

### Demo Credentials

| Email | Password | Available Roles |
|---|---|---|
| `jennifer@sunrise.com` | `demo123` | `employer`, `employee` |
| `maria@sunrise.com` | `demo123` | `employee` |

---

## Project Structure

```
src/
├── app/
│   ├── core/                       # Singleton services & layout
│   │   ├── guards/                 # Auth & role guards
│   │   ├── layout/                 # Sidebar + topbar shell
│   │   └── services/
│   │       ├── auth.service.ts     # Auth state management
│   │       ├── data.service.ts     # API + DTO-to-model mapping
│   │       └── swal.service.ts     # SweetAlert2 themed wrapper
│   ├── features/
│   │   ├── auth/                   # Login, role selection
│   │   ├── employer/               # Admin portal modules
│   │   │   ├── dashboard/          # KPI cards, charts, trends
│   │   │   ├── incidents/          # Incident list + form dialog
│   │   │   ├── osha/               # OSHA 300A compliance
│   │   │   ├── reports/            # Report generation
│   │   │   └── settings/           # Facility & notification config
│   │   └── employee/               # Employee portal modules
│   │       ├── dashboard/          # Welcome, treatment, activity
│   │       ├── report/             # Injury reporting wizard
│   │       ├── history/            # Visit history
│   │       └── meds/               # Medication management
│   ├── models/
│   │   ├── portal.models.ts        # Domain interfaces (UI layer)
│   │   └── dtos.ts                 # Data Transfer Objects (API layer)
│   └── shared/
│       └── components/             # Reusable UI components
│           ├── bar-chart/          # Animated SVG bar chart
│           ├── sparkline/          # Animated SVG sparkline
│           ├── card/               # Card with glow variant
│           ├── stat/               # KPI stat card
│           ├── badge/              # Status badge with dot
│           ├── pill/               # Filter pills
│           ├── button/             # Multi-variant button
│           ├── progress-ring/      # SVG circular progress
│           └── forms/              # Shared form components
├── styles.scss                     # Global styles + SweetAlert theme
└── db.json                         # Mock database (json-server)
```

---

## Authentication & Roles

The app uses a role-based access control system with three roles:

| Role | Route Prefix | Description |
|---|---|---|
| `employer` | `/employer/*` | Facility administrator — full dashboard, incidents, OSHA, reports |
| `employee` | `/employee/*` | Team member — injury reporting, visit history, medications |
| `provider` | `/provider/*` | Medical provider (reserved for future use) |

### Auth Flow

```
Login → Verify against db.json → Store in localStorage → Role Selection → Portal
```

- **Guards**: `AuthGuard` checks authentication, `RoleGuard` checks role authorization
- **Session**: JWT-like mock token stored in `localStorage`
- **Role Switching**: Users with multiple roles can switch via the role selector

---

## Data Architecture

### DTO ↔ Domain Model Mapping

The application uses a two-layer data model to decouple the API shape from the UI:

```
db.json (API) → DTOs → DataService.mapXxxFromDto() → Domain Models → Components
```

| API Field (DTO) | Domain Model Field | Example |
|---|---|---|
| `employeeName` | `emp` | "Maria Santos" |
| `injuryDescription` | `injury` | "Back / Lifting Injury" |
| `currentStatus` | `status` | "active" |
| `severityLevel` | `severity` | "moderate" |
| `returnToWorkStatus` | `rtw` | "modified" |
| `incidentDate` | `date` | "2026-02-24" |
| `medicalProvider` | `provider` | "Dr. Chen" |
| `facilityName` | `name` | "Sunrise Senior Living" |
| `departmentList` | `departments` | ["Memory Care", ...] |

### Signals-Based State

All data is managed through Angular Signals for automatic reactivity:

```typescript
// DataService
facility = signal<Facility>({} as Facility);
incidents = signal<Incident[]>([]);
notifications = signal<Notification[]>([]);
medications = signal<Medication[]>([]);

// Computed in components
totalRecordables = computed(() => this.dataService.incidents().length);
```

---

## SweetAlert Confirmations

All user-facing confirmations use **SweetAlert2** with a custom theme matching the FirstCall brand:

### Theme Colors

| Action | Icon Color | Button Color |
|---|---|---|
| Delete/Destructive | Coral `#FF6154` | Coral |
| Success | Emerald `#0CCE6B` | Primary Teal |
| Information | Primary `#003333` | Primary Teal |
| Prompt/Input | Primary `#003333` | Primary Teal |

### Usage Examples

```typescript
// Delete confirmation
const result = await this.swal.confirmDelete('Delete Incident?', 'This cannot be undone.');
if (result.isConfirmed) { /* delete */ }

// Success toast (auto-dismiss 2.5s)
await this.swal.success('Saved!', 'Settings updated.');

// Single input prompt
const result = await this.swal.prompt('New Item', 'Enter description...');

// Multi-field prompt
const values = await this.swal.promptMulti('Add Report', [
  { id: 'title', label: 'Title', placeholder: 'Report name' },
  { id: 'desc', label: 'Description', value: 'Default text' }
]);

// Export simulation
await this.swal.exportSuccess('Monthly Report', 'PDF');
```

### Components Using SweetAlert

| Component | Actions |
|---|---|
| Incidents List | Delete incident, Export CSV |
| OSHA Compliance | Delete/Add checklist item, Export reports |
| Reports | Add/Delete/Generate reports |
| Medications | Add/Delete medications |
| Settings | Save facility settings |

---

## Charts & Visualizations

### Bar Chart (`app-bar-chart`)

- **SVG-free** pure CSS/HTML chart with animated bars
- Spring growth animation (`cubic-bezier(0.34, 1.56, 0.64, 1)`)
- Staggered entry with `animation-delay` per bar
- Value labels above each bar
- Hover: accent color glow with `box-shadow`
- Minimum 5% height for zero-value visibility

```html
<app-bar-chart [data]="[3, 2, 1, 1, 1, 1]" [labels]="['Back','Patient','Slips','Sharps','Chemical','Violence']">
</app-bar-chart>
```

### Sparkline (`app-sparkline`)

- SVG-based smooth cubic bezier curves
- Animated line draw (stroke-dashoffset transition)
- Gradient area fill with fade-in
- Animated data dots with pop-in effect
- CSS variable color resolution for SVG compatibility
- 300×100 viewBox with proper padding

```html
<app-sparkline [data]="[3, 2, 4, 1, 3, 2, 5]" color="var(--primary-color)">
</app-sparkline>
```

### Progress Ring (`app-progress-ring`)

- SVG circle with animated `stroke-dashoffset`
- Customizable size, stroke width, and color
- Content projection for center text

---

## Real-Time Functionality

Although this MVP uses `json-server`, all data operations are fully functional and persist to `db.json`:

### CRUD Operations

| Operation | Endpoint | Components |
|---|---|---|
| **Create** | `POST /incidents` | Log Incident form, Report Injury wizard |
| **Read** | `GET /incidents`, `/facility`, etc. | All dashboards |
| **Update** | `PATCH /incidents/:id`, `PATCH /facility` | Edit incident, Save settings |
| **Delete** | `DELETE /incidents/:id` | Incident list, Medications, OSHA checklist |

### Data Flow

1. User triggers action (e.g., delete button) →
2. SweetAlert confirmation prompt →
3. `DataService` makes HTTP request to json-server →
4. Signal updates automatically →
5. All subscribed `computed()` values recalculate →
6. UI re-renders reactively →
7. SweetAlert success toast

### CSV Export

The incidents list includes a fully functional CSV export:
- Generates CSV content from filtered incident data
- Creates a downloadable Blob
- Triggers browser download with timestamped filename
- Shows SweetAlert export confirmation

---

## Component Library

### Shared Components

| Component | Selector | Key Inputs |
|---|---|---|
| Card | `app-card` | `clickable`, `glow` |
| Stat | `app-stat` | `icon`, `val`, `label`, `sub`, `color` |
| Badge | `app-badge` | `bg`, `fg`, `dot` |
| Pill | `app-pill` | `active`, `count` |
| Button | `app-button` | `variant`, `size`, `fullWidth`, `disabled` |
| Progress Ring | `app-progress-ring` | `pct`, `size`, `stroke`, `color` |
| Bar Chart | `app-bar-chart` | `data: number[]`, `labels: string[]` |
| Sparkline | `app-sparkline` | `data: number[]`, `color` |

### Button Variants

| Variant | Usage |
|---|---|
| `primary` | Main CTA — teal background |
| `outline` | Secondary — bordered |
| `ghost` | Tertiary — text only |
| `danger` | Destructive — coral/red |

---

## API Endpoints

All served by `json-server` from `db.json` on port 3000:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/facility` | Facility metadata |
| `PATCH` | `/facility` | Update facility settings |
| `GET` | `/incidents` | All incidents |
| `POST` | `/incidents` | Create new incident |
| `PATCH` | `/incidents/:id` | Update incident |
| `DELETE` | `/incidents/:id` | Remove incident |
| `GET` | `/injuryTypes` | Injury type catalog |
| `GET` | `/notifications` | Alert notifications |
| `GET` | `/medications` | Employee medications |
| `POST` | `/medications` | Add medication |
| `DELETE` | `/medications/:id` | Remove medication |
| `GET` | `/oshaChecklist` | OSHA compliance items |
| `POST` | `/oshaChecklist` | Add checklist item |
| `PATCH` | `/oshaChecklist/:id` | Toggle/update item |
| `DELETE` | `/oshaChecklist/:id` | Remove item |
| `GET` | `/reports` | Report definitions |
| `POST` | `/reports` | Add report template |
| `DELETE` | `/reports/:id` | Remove report |
| `GET` | `/users` | User accounts (auth) |

---

## Routing & Navigation

### Employer Routes

| Route | Component | Guard |
|---|---|---|
| `/employer` | Redirect → `/employer/dashboard` | Auth + Role |
| `/employer/dashboard` | `EmployerDashboardComponent` | Auth + Role |
| `/employer/incidents` | `IncidentsListComponent` | Auth + Role |
| `/employer/osha` | `OshaComplianceComponent` | Auth + Role |
| `/employer/reports` | `EmployerReportsComponent` | Auth + Role |
| `/employer/settings` | `EmployerSettingsComponent` | Auth + Role |

### Employee Routes

| Route | Component | Guard |
|---|---|---|
| `/employee` | Redirect → `/employee/dashboard` | Auth + Role |
| `/employee/dashboard` | `EmployeeDashboardComponent` | Auth + Role |
| `/employee/report` | `InjuryReportComponent` | Auth + Role |
| `/employee/waiting` | `InjuryReportComponent` (waiting mode) | Auth + Role |
| `/employee/history` | `EmployeeHistoryComponent` | Auth + Role |
| `/employee/meds` | `EmployeeMedsComponent` | Auth + Role |

---

## Design System

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--primary-color` | `#003333` | Brand teal, primary actions |
| `--accent-color` | `#db5a36` | Accent coral, hover states |
| `--navy` | `#0A1628` | Headings, dark text |
| `--emerald` | `#0CCE6B` | Success, cleared status |
| `--amber` | `#FFB020` | Warning, active status |
| `--coral` | `#FF6154` | Danger, pending/high severity |
| `--g50` to `--g700` | Grays | Backgrounds, borders, subtle text |

### Typography

| Font | Usage |
|---|---|
| **Outfit** | All headings and body text |
| **JetBrains Mono** | Data values, timers, mono-spaced content |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is proprietary to **Anchors Technologies**. All rights reserved.

---

<p align="center">
  <strong>Built with ❤️ by Anchors Technologies</strong><br/>
  <em>FirstCall Telehealth — Getting injured workers treated in minutes, not hours.</em>
</p>
