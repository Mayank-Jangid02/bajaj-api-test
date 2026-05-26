# DeskFlow | Support Ticket Triage Board

DeskFlow is a high-performance, premium-grade full-stack Support Ticket Triage Board. It is engineered with a **React + Vite** frontend and a **Node.js + Express + MongoDB** backend. The system is designed to streamline customer support operations through an interactive Kanban dashboard, detailed tabular views, dynamic SLA (Service Level Agreement) countdown engines, and secure adjacent-step transition boundaries.

---

## Key Features

- 🎭 **Double Workspace Views**: Seamlessly toggle between a visual drag-and-drop **Kanban Board** and a high-information-density **Spacious List** layout.
- ⏱️ **Live-Ticking SLA Countdown**: Tickets calculate and display exactly how much SLA time is remaining or overdue in real-time (ticking live every 30 seconds). Unresolved cards display an embedded SLA percentage progress bar.
- 🔒 **Adjacent-Step Status Transition Bounds**: Prevents state bypass. Ticket status changes are strictly restricted to **exactly one step forward or backward** along the progression line: 
  $$\text{Open} \longleftrightarrow \text{In Progress} \longleftrightarrow \text{Resolved} \longleftrightarrow \text{Closed}$$
- 🔎 **Real-time Filters & Search**: Search instantly across ticket subjects, descriptions, or customer emails, while filtering by Priority ranks and SLA Breach status in real-time.
- 🎨 **Premium Glassmorphism Aesthetic**: Styled with Google's *Plus Jakarta Sans* font, custom smooth scrollbars, pulsing warning cues, and automatic light/dark theme matching with a manual override switch.
- 📊 **Dashboard Aggregates Panel**: Visual cards summarizing total tickets in play, categorizations per status, priority counts, and a glowing critical notification block for open SLA breaches.

---

## Technology Stack

### Frontend (`/frontend`)
- **Core**: React 19, Vite
- **Styling**: Vanilla CSS variables, high-end CSS transitions, responsive grid/flex systems, glassmorphism layouts.
- **Icons**: `lucide-react` vectors

### Backend (`/backend`)
- **Core**: Node.js, Express.js
- **Database**: MongoDB & Mongoose ORM
- **Dev Tools**: Nodemon, Dotenv, Cors

---

## Service Level Agreement (SLA) & Priorities

SLA thresholds represent the strict timeline limits within which a ticket must be triaged. They are derived from the ticket's priority level:

| Priority | Target SLA Threshold | Description | Visual Tag |
| :--- | :--- | :--- | :--- |
| **Urgent** | `60 minutes` (1 Hour) | Highly critical service interruptions | Crimson Red / Glow alert |
| **High** | `240 minutes` (4 Hours) | Significant blockages on operations | Orange badge |
| **Medium** | `1440 minutes` (24 Hours) | Standard operational issues | Yellow badge |
| **Low** | `4320 minutes` (72 Hours) | Non-blocking aesthetic or minor updates | Blue badge |

---

## API Specifications

The Express backend serves the REST API on port `5000` at the `/tickets` endpoint path:

### 1. File Support Ticket (`POST /tickets`)
- **Description**: Creates a new ticket. Subject and Description are automatically trimmed. Email must match validation regex.
- **Body Payload**:
  ```json
  {
    "subject": "DB Replica is failing",
    "description": "Connection timeouts on staging nodes.",
    "customerEmail": "devops@company.com",
    "priority": "urgent"
  }
  ```
- **Responses**: `201 Created` (success object), `400 Bad Request` (validation/syntax error).

### 2. List Tickets (`GET /tickets`)
- **Description**: Fetches tickets sorted by creation date (newest first).
- **Optional Queries**:
  - `status`: Filter by `open`, `in_progress`, `resolved`, or `closed`
  - `priority`: Filter by `low`, `medium`, `high`, or `urgent`
  - `breached`: Filter by `true` or `false`
- **Response**: `200 OK` (Array of tickets).

### 3. Dashboard Metrics (`GET /tickets/stats`)
- **Description**: Retrieves aggregate counts per status, priority, and open SLA breach totals.
- **Response**: `200 OK`
  ```json
  {
    "statusCounts": { "open": 5, "in_progress": 2, "resolved": 10, "closed": 4 },
    "priorityCounts": { "low": 3, "medium": 7, "high": 6, "urgent": 5 },
    "slaBreachedOpenCount": 3
  }
  ```

### 4. Transition Status & Edit (`PATCH /tickets/:id`)
- **Description**: Updates ticket details or transitions its status.
- **Rules**: Status progressions can only step forward or backward by **exactly 1 adjacent level** (e.g. `open` to `in_progress` is valid; `open` to `resolved` is blocked).
- **Body Payload**:
  ```json
  {
    "status": "in_progress"
  }
  ```
- **Responses**: `200 OK` (updated object), `400 Bad Request` (blocked status transition or schema failure).

### 5. Purge Ticket (`DELETE /tickets/:id`)
- **Description**: Permanently purges a ticket from the triage database.
- **Responses**: `200 OK` (success confirmation), `404 Not Found` (non-existent ID).

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) (running locally on port `27017` or via an Atlas connection string)

### 1. Set Up the Backend
1. Navigate into the backend folder:
   ```bash
   cd backend
   ```
2. Install server-side dependencies:
   ```bash
   npm install
   ```
3. Set up the environment variables. Ensure a `.env` file exists with your config:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/deskflow
   ```
4. Fire up the backend dev server (uses `nodemon` for auto-restarts):
   ```bash
   npm run dev
   ```

### 2. Set Up the Frontend
1. Open a new terminal tab and navigate into the frontend folder:
   ```bash
   cd frontend
   ```
2. Install UI dependencies:
   ```bash
   npm install
   ```
3. Start the Vite hot-module-replacement dev server:
   ```bash
   npm run dev
   ```
4. Open the browser and visit the local workspace: **[http://localhost:5173/](http://localhost:5173/)**
