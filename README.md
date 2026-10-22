# Doctor Appointment Booker (Health & Hospital Platform)

A full-stack, responsive healthcare web application designed to solve the problem of patients visiting hospitals without knowing doctor availability, waiting in long queues, facing unexpected cancellations, and struggling to manage longitudinal medical records.

The platform enables direct hospital doctor discovery, atomic slot reservation, patient consent-gated medical record vaults, signed clinical consultation notes, and hospital administrator credentials verification.

---

## 🌟 Key Features

### 1. Patient Portal
- **Direct Specialist Discovery**: Filter doctors by discipline, hospital affiliation, city, consultation fees, and available dates.
- **Atomic Slot Reservation**: Transactional booking prevents race conditions and eliminates double bookings using PostgreSQL constraints.
- **Granular Consent-Based Sharing**: Patients selectively authorize which medical records, conditions, and allergies the consulting doctor can inspect.
- **Instant Consent Revocation**: Patients can revoke doctor access anytime with database-level Row Level Security enforcement.
- **Longitudinal Medical History**: Structured health vault distinguishing patient-reported symptoms from clinician-signed diagnoses, complete with life-critical allergy flags.
- **Health Event Timeline**: Chronological visual ledger tracing appointments, diagnostic lab tests, medication adjustments, and consultation summaries.

### 2. Doctor Workspace
- **Availability Management**: Define weekly consultation windows, custom slot durations (15 to 60 mins), and lunch buffers without invalidating confirmed patient visits.
- **Consultation Request Reviews**: Accept or decline incoming bookings with mandatory audit reasons.
- **Authorized Patient Medical Overview**: View patient health profile, critical allergy alerts, active medical conditions, and consented diagnostic reports.
- **Signed Clinical Documentation**: Document chief symptoms, examination observations, formal diagnoses, treatment plans, and digital prescriptions.

### 3. Hospital Administrator Portal
- **Doctor Verification Portal**: Review State Medical Council license numbers and qualifications before granting the Verified Doctor badge.
- **Hospital Network Management**: Configure facilities, departments, contact details, and associate verified practitioners.
- **Operational Analytics & Reports**: Departmental workload distribution, booking completion rates, and cancellation analysis.
- **Privacy Partitioning**: Administrators oversee system health and reports but are strictly barred by database RLS from inspecting private clinical notes.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Router v6 |
| **Backend & Database** | Supabase Auth, PostgreSQL 15+, Row Level Security (RLS), Supabase Storage |
| **Atomic Operations** | PostgreSQL stored procedures (`book_appointment_atomic`) with row-level locks |
| **Security & Privacy** | Digital Personal Data Protection (DPDP) Act 2023 principles, consent tokens |

---

## 🗄️ Database Architecture (All 17 Normalized Tables)

1. `profiles`: Authenticated users with role attribution (`patient`, `doctor`, `admin`).
2. `hospitals`: Hospital facilities, addresses, cities, and clinical departments.
3. `doctors`: Professional credentials, license number, consultation fees, verification status.
4. `doctor_verifications`: Administrative review decisions, credentials audits, review notes.
5. `availability_slots`: Doctor time slots with uniqueness constraints `(doctor_id, start_time)`.
6. `appointments`: Atomic consultation bookings with status lifecycle.
7. `medical_records`: Secure documents (PDF, JPG, PNG) with categories and hospital metadata.
8. `patient_medical_profiles`: Baseline vitals (DOB, blood group, height, weight, emergency contact).
9. `medical_conditions`: Chronic & acute illnesses with source attribution (`patient_reported` vs `clinician_documented`).
10. `patient_allergies`: Life-critical medicine, food, and environmental allergies with severity indicators.
11. `patient_medications`: Active and historical medication regimens and prescribing doctors.
12. `medical_history_events`: Chronological health ledger linking consultations and reports.
13. `medical_record_shares`: Document-level consent records with revocation timestamps.
14. `medical_history_consents`: Section-level consent records with revocation tracking.
15. `consultation_notes`: Signed clinical observations, diagnoses, treatment plans, and prescriptions.
16. `notifications`: In-app notification center for booking updates and administrative decisions.
17. `audit_logs`: Immutable tamper-evident audit logs for all sensitive clinical operations.

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Clone and Install
```bash
git clone <repository-url>
cd "aaron dti"
npm install
```

### 3. Environment Variables Configuration
Copy `.env.example` to `.env`:
```env
# Optional: To connect a live remote Supabase PostgreSQL database
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
> **Note:** If left blank, the application automatically runs in persistent local mode with pre-seeded demo accounts and full CRUD persistence enabled.

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your web browser.

### 5. Running Automated Security & Workflow Tests
```bash
npm test
```

---

## 🔑 Pre-Configured Demonstration Accounts

Use the **Top Navbar Role Switcher** or the **Login Page Instant Demo Buttons** to effortlessly test each role:

| Role | Name | Email | Password | Pre-seeded Context |
|---|---|---|---|---|
| **Patient** | Rahul Verma | `rahul.verma@example.com` | `password123` | Active BP review appointment, B+ blood group, Penicillin allergy alert, lipid lab report |
| **Doctor** | Dr. Priya Sharma | `dr.priya@apollo.org` | `password123` | Senior Interventional Cardiologist, Apollo Health City, upcoming consultations |
| **Admin** | Dr. Sarah Jenkins | `admin@healthcare.org` | `password123` | Hospital Administrator, pending verification queue for Dr. Kavita Reddy |

---

## 📋 Database Migration & SQL Setup

The full SQL migration script is located in:
- `supabase/migrations/20250101000000_doctor_appointment_booker_schema.sql`
- `supabase/seed.sql`

To apply directly to a live Supabase project:
1. Open your Supabase Dashboard -> **SQL Editor**.
2. Paste the contents of `20250101000000_doctor_appointment_booker_schema.sql` and run.
3. Paste the contents of `seed.sql` and run.
4. Set up a private storage bucket named `medical-records` with restricted access.
