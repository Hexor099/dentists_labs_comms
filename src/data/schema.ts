import { TableData, RelationData } from "../types";

export const databaseRelations: RelationData[] = [
  {
    fromTable: "dental_laboratories",
    fromField: "owner_id",
    toTable: "users",
    toField: "id",
    type: "one-to-one"
  },
  {
    fromTable: "dentist_profiles",
    fromField: "user_id",
    toTable: "users",
    toField: "id",
    type: "one-to-one"
  },
  {
    fromTable: "dentist_profiles",
    fromField: "laboratory_id",
    toTable: "dental_laboratories",
    toField: "id",
    type: "one-to-many"
  },
  {
    fromTable: "technician_profiles",
    fromField: "user_id",
    toTable: "users",
    toField: "id",
    type: "one-to-one"
  },
  {
    fromTable: "technician_profiles",
    fromField: "laboratory_id",
    toTable: "dental_laboratories",
    toField: "id",
    type: "one-to-many"
  },
  {
    fromTable: "patients",
    fromField: "dentist_id",
    toTable: "dentist_profiles",
    toField: "id",
    type: "one-to-many"
  },
  {
    fromTable: "cases",
    fromField: "dentist_id",
    toTable: "dentist_profiles",
    toField: "id",
    type: "one-to-many"
  },
  {
    fromTable: "cases",
    fromField: "laboratory_id",
    toTable: "dental_laboratories",
    toField: "id",
    type: "one-to-many"
  },
  {
    fromTable: "cases",
    fromField: "patient_id",
    toTable: "patients",
    toField: "id",
    type: "one-to-one"
  },
  {
    fromTable: "case_assignments",
    fromField: "case_id",
    toTable: "cases",
    toField: "id",
    type: "one-to-many"
  },
  {
    fromTable: "case_assignments",
    fromField: "technician_id",
    toTable: "technician_profiles",
    toField: "id",
    type: "one-to-many"
  },
  {
    fromTable: "invoices",
    fromField: "case_id",
    toTable: "cases",
    toField: "id",
    type: "one-to-one"
  },
  {
    fromTable: "invoices",
    fromField: "dentist_id",
    toTable: "dentist_profiles",
    toField: "id",
    type: "one-to-many"
  },
  {
    fromTable: "deliveries",
    fromField: "case_id",
    toTable: "cases",
    toField: "id",
    type: "one-to-one"
  }
];

export const databaseTables: TableData[] = [
  {
    name: "users",
    schema: "auth",
    description: "Multi-tenant master user accounts table managing system roles, MFA settings, and active session tags.",
    columns: [
      { name: "id", type: "UUID", constraints: ["PRIMARY KEY", "DEFAULT gen_random_uuid()"], description: "Global unique indentifier for auth" },
      { name: "email", type: "VARCHAR(255)", constraints: ["UNIQUE", "NOT NULL"], description: "Unique email used for sign-in" },
      { name: "password_hash", type: "VARCHAR(255)", constraints: ["NOT NULL"], description: "Argon2/Bcrypt hash of user password" },
      { name: "role", type: "ENUM('SUPER_ADMIN','LAB_ADMIN','DENTIST','TECHNICIAN')", constraints: ["NOT NULL"], description: "Core role to enforce static guards" },
      { name: "mfa_secret", type: "VARCHAR(128)", constraints: ["NULL"], description: "TOTP seed for multi-factor authentication" },
      { name: "is_active", type: "BOOLEAN", constraints: ["DEFAULT true"], description: "Soft exclusion/access suspension flag" },
      { name: "created_at", type: "TIMESTAMPTZ", constraints: ["DEFAULT NOW()"], description: "Audit trail timestamp" },
      { name: "updated_at", type: "TIMESTAMPTZ", constraints: ["DEFAULT NOW()"], description: "Audit trail update indicator" }
    ],
    sql: `-- 1. User Auth & Session Management Table
CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'LAB_ADMIN', 'DENTIST', 'TECHNICIAN');

CREATE TABLE auth.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  mfa_secret VARCHAR(128) NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for authentication lookup speed
CREATE INDEX idx_users_email ON auth.users(email);`
  },
  {
    name: "dental_laboratories",
    schema: "public",
    description: "Stores dental lab tenants, workspace domains, currency models, and references the head lab admin.",
    columns: [
      { name: "id", type: "UUID", constraints: ["PRIMARY KEY", "DEFAULT gen_random_uuid()"], description: "Laboratory identifier" },
      { name: "name", type: "VARCHAR(150)", constraints: ["NOT NULL"], description: "Commercial name of the lab" },
      { name: "subdomain", type: "VARCHAR(63)", constraints: ["UNIQUE", "NOT NULL"], description: "Dedicated sub-domain for portal routing" },
      { name: "owner_id", type: "UUID", constraints: ["REFERENCES auth.users(id)", "NOT NULL"], description: "Owner/Admin user reference" },
      { name: "currency", type: "VARCHAR(3)", constraints: ["DEFAULT 'USD'"], description: "Base transactional currency" },
      { name: "address", type: "TEXT", constraints: ["NOT NULL"], description: "Physical operations workshop location" },
      { name: "created_at", type: "TIMESTAMPTZ", constraints: ["DEFAULT NOW()"], description: "Creation record" }
    ],
    sql: `-- 2. Multi-tenant Laboratory Workspaces
CREATE TABLE public.dental_laboratories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  subdomain VARCHAR(63) UNIQUE NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  address TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_labs_owner ON public.dental_laboratories(owner_id);`
  },
  {
    name: "dentist_profiles",
    schema: "public",
    description: "Detailed client profiles for dentists, mapping clinical associations and clinic shipping terms.",
    columns: [
      { name: "id", type: "UUID", constraints: ["PRIMARY KEY", "DEFAULT gen_random_uuid()"], description: "Dentist identifier" },
      { name: "user_id", type: "UUID", constraints: ["REFERENCES auth.users(id)", "UNIQUE"], description: "Auth account link" },
      { name: "clinic_name", type: "VARCHAR(150)", constraints: ["NOT NULL"], description: "Practice/Clinic commercial brand" },
      { name: "license_number", type: "VARCHAR(50)", constraints: ["UNIQUE", "NOT NULL"], description: "State dentist board license" },
      { name: "laboratory_id", type: "UUID", constraints: ["REFERENCES dental_laboratories(id)"], description: "Tenant laboratory association" },
      { name: "preferred_shipping", type: "VARCHAR(50)", constraints: ["DEFAULT 'Courier'"], description: "Ground, local courier, or postal preferences" },
      { name: "phone", type: "VARCHAR(24)", constraints: ["NOT NULL"], description: "Office direct triage contact" }
    ],
    sql: `-- 3. External Dentist Profiles
CREATE TABLE public.dentist_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_name VARCHAR(150) NOT NULL,
  license_number VARCHAR(50) UNIQUE NOT NULL,
  laboratory_id UUID NOT NULL REFERENCES public.dental_laboratories(id) ON DELETE RESTRICT,
  preferred_shipping VARCHAR(50) NOT NULL DEFAULT 'Courier',
  phone VARCHAR(24) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dentist_lab ON public.dentist_profiles(laboratory_id);`
  },
  {
    name: "technician_profiles",
    schema: "public",
    description: "Internal technician workspace tracking, skill specialist enums, active queue metrics, and shift limits.",
    columns: [
      { name: "id", type: "UUID", constraints: ["PRIMARY KEY", "DEFAULT gen_random_uuid()"], description: "Technician identifier" },
      { name: "user_id", type: "UUID", constraints: ["REFERENCES auth.users(id)", "UNIQUE"], description: "Auth account link" },
      { name: "laboratory_id", type: "UUID", constraints: ["REFERENCES dental_laboratories(id)"], description: "Assigned lab employer" },
      { name: "specialty", type: "VARCHAR(100)", constraints: ["NOT NULL"], description: "Crown, bridge, implant, prosthetics, ortho specialist" },
      { name: "daily_capacity_units", type: "INTEGER", constraints: ["DEFAULT 10"], description: "Daily labor unit limitations (for auto scheduling)" },
      { name: "active_tickets", type: "INTEGER", constraints: ["DEFAULT 0"], description: "Current count of active WIP assignments" },
      { name: "is_occupied", type: "BOOLEAN", constraints: ["DEFAULT false"], description: "Capacity lock flag" }
    ],
    sql: `-- 4. Internal Technicians Profiles 
CREATE TABLE public.technician_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  laboratory_id UUID NOT NULL REFERENCES public.dental_laboratories(id) ON DELETE CASCADE,
  specialty VARCHAR(100) NOT NULL, -- e.g., 'CAD_DESIGNER', 'CERAMIST', 'ORTHODONTICS'
  daily_capacity_units INTEGER NOT NULL DEFAULT 10,
  active_tickets INTEGER NOT NULL DEFAULT 0,
  is_occupied BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_techs_lab ON public.technician_profiles(laboratory_id);`
  },
  {
    name: "patients",
    schema: "public",
    description: "HIPAA-Protected minimal patient directory storing strictly anonymized lookup tokens and medical indicators.",
    columns: [
      { name: "id", type: "UUID", constraints: ["PRIMARY KEY", "DEFAULT gen_random_uuid()"], description: "Patient system identifier" },
      { name: "dentist_id", type: "UUID", constraints: ["REFERENCES dentist_profiles(id)"], description: "Owner Dentist record" },
      { name: "encrypted_identity_token", type: "VARCHAR(255)", constraints: ["NOT NULL"], description: "Aes-256 encrypted patient first/last name" },
      { name: "birth_year", type: "INTEGER", constraints: ["NOT NULL"], description: "Un-encrypted year of birth for lab reference" },
      { name: "gender", type: "VARCHAR(10)", constraints: ["NOT NULL"], description: "Anatomically matched selection" }
    ],
    sql: `-- 5. Anonymized / HIPAA-Compliant patients table
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dentist_id UUID NOT NULL REFERENCES public.dentist_profiles(id) ON DELETE CASCADE,
  encrypted_identity_token VARCHAR(255) NOT NULL, -- AES-256 string containing 'John Doe'
  birth_year INTEGER NOT NULL,
  gender VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_patients_dentist ON public.patients(dentist_id);`
  },
  {
    name: "cases",
    schema: "public",
    description: "Master Case entity capturing diagnostic parameters, status controls, shade logs, custom models, and due schedules.",
    columns: [
      { name: "id", type: "UUID", constraints: ["PRIMARY KEY", "DEFAULT gen_random_uuid()"], description: "Global Case Identifier" },
      { name: "order_number", type: "VARCHAR(30)", constraints: ["UNIQUE", "NOT NULL"], description: "Searchable incremental custom receipt format" },
      { name: "dentist_id", type: "UUID", constraints: ["REFERENCES dentist_profiles(id)", "NOT NULL"], description: "Ordering dentist" },
      { name: "patient_id", type: "UUID", constraints: ["REFERENCES patients(id)", "NOT NULL"], description: "Patient identifier" },
      { name: "laboratory_id", type: "UUID", constraints: ["REFERENCES dental_laboratories(id)"], description: "Fulfilling laboratory" },
      { name: "tooth_numbers", type: "INTEGER[]", constraints: ["NOT NULL"], description: "Array of standard universal dental chart notation numbers" },
      { name: "material", type: "VARCHAR(100)", constraints: ["NOT NULL"], description: "Zirconia, Ceramic, Metal, Acrylic, etc." },
      { name: "shade", type: "VARCHAR(20)", constraints: ["NOT NULL"], description: "Vita scale match code (e.g. A3.5, BLEACH-B)" },
      { name: "status", type: "CASE_STATUS_ENUM", constraints: ["NOT NULL", "DEFAULT 'SUBMITTED'"], description: "Milestone status exposed to Dentist" },
      { name: "s3_scan_urls", type: "TEXT[]", constraints: ["NULL"], description: "Array of S3 secure bucket paths for 3D model STL files" },
      { name: "notes", type: "TEXT", constraints: ["NULL"], description: "Clinical dentist prescription notes" },
      { name: "due_date", type: "TIMESTAMPTZ", constraints: ["NOT NULL"], description: "Contractual delivery date lock" },
      { name: "created_at", type: "TIMESTAMPTZ", constraints: ["DEFAULT NOW()"], description: "Work starting timestamp" }
    ],
    sql: `-- 6. Dental Work Cases Table
CREATE TYPE case_status AS ENUM (
  'SUBMITTED',       -- Dentist placed order
  'RECEIVED',        -- Lab admin accepted & scanned physical models
  'MODERATE',        -- Design phase
  'PRODUCTION',      -- Milling, printing, or casting
  'QC_ASSESSMENT',   -- Ceramics finishing and visual QC check
  'DELIVERY_PENDING',-- Packaged for courier
  'DELIVERED'        -- Signed by dentist office
);

CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(30) UNIQUE NOT NULL,
  dentist_id UUID NOT NULL REFERENCES public.dentist_profiles(id) ON DELETE RESTRICT,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
  laboratory_id UUID NOT NULL REFERENCES public.dental_laboratories(id) ON DELETE CASCADE,
  tooth_numbers INTEGER[] NOT NULL,
  material VARCHAR(100) NOT NULL,
  shade VARCHAR(20) NOT NULL,
  status case_status NOT NULL DEFAULT 'SUBMITTED',
  s3_scan_urls TEXT[] NULL, -- References high-precision 3D scan STL files in S3
  notes TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cases_dentist ON public.cases(dentist_id);
CREATE INDEX idx_cases_lab ON public.cases(laboratory_id);
CREATE INDEX idx_cases_status ON public.cases(status);`
  },
  {
    name: "case_assignments",
    schema: "public",
    description: "Detailed assignment logs allocating specific workflow jobs to technicians (Strictly confidential! Dentists can never read this table).",
    columns: [
      { name: "id", type: "UUID", constraints: ["PRIMARY KEY", "DEFAULT gen_random_uuid()"], description: "Assignment ID" },
      { name: "case_id", type: "UUID", constraints: ["REFERENCES cases(id)", "NOT NULL"], description: "Target CAD/CAM case" },
      { name: "technician_id", type: "UUID", constraints: ["REFERENCES technician_profiles(id)", "NOT NULL"], description: "Assigned bench labor" },
      { name: "assigned_stage", type: "VARCHAR(50)", constraints: ["NOT NULL"], description: "CAD_design, PorcelainFinished, CadCamMill, Casting" },
      { name: "internal_notes", type: "TEXT", constraints: ["NULL"], description: "Technical lab instructions/complications (Confidential)" },
      { name: "completed_at", type: "TIMESTAMPTZ", constraints: ["NULL"], description: "Timestamp of stage completion" },
      { name: "created_at", type: "TIMESTAMPTZ", constraints: ["DEFAULT NOW()"], description: "Allocation assignment time" }
    ],
    sql: `-- 7. Case Assignments & Workflow Steps (Technicians ONLY, strictly hidden from Dentist accounts)
CREATE TABLE public.case_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  technician_id UUID NOT NULL REFERENCES public.technician_profiles(id) ON DELETE RESTRICT,
  assigned_stage VARCHAR(50) NOT NULL, -- e.g., 'CAD_DESIGN', '3D_PRINTING', 'CERAMIC_LAYERING'
  internal_notes TEXT, -- Technician communication (e.g. 'Margin looks thin around tooth #14, added zirconia band')
  completed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assignments_tech ON public.case_assignments(technician_id);
CREATE INDEX idx_assignments_case ON public.case_assignments(case_id);`
  },
  {
    name: "invoices",
    schema: "public",
    description: "Invoices generated for tooth configurations and material charges, mapping lab earnings and dentist debts.",
    columns: [
      { name: "id", type: "UUID", constraints: ["PRIMARY KEY", "DEFAULT gen_random_uuid()"], description: "Invoice unique code" },
      { name: "invoice_number", type: "VARCHAR(40)", constraints: ["UNIQUE", "NOT NULL"], description: "Financial fiscal invoice number" },
      { name: "case_id", type: "UUID", constraints: ["REFERENCES cases(id)"], description: "Associated delivery case" },
      { name: "dentist_id", type: "UUID", constraints: ["REFERENCES dentist_profiles(id)"], description: "Client dentist" },
      { name: "laboratory_id", type: "UUID", constraints: ["REFERENCES dental_laboratories(id)"], description: "Service Provider lab" },
      { name: "total_amount", type: "NUMERIC(10,2)", constraints: ["NOT NULL"], description: "Aggregated gross total before tax" },
      { name: "payment_status", type: "ENUM('UNPAID','PARTIAL','PAID','CANCELED')", constraints: ["NOT NULL", "DEFAULT 'UNPAID'"], description: "Financial tracking flags" },
      { name: "due_date", type: "TIMESTAMPTZ", constraints: ["NOT NULL"], description: "Payment limits date lock" }
    ],
    sql: `-- 8. Invoices and Accounting Table
CREATE TYPE payment_status AS ENUM ('UNPAID', 'PARTIAL', 'PAID', 'CANCELED');

CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(40) UNIQUE NOT NULL,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE RESTRICT,
  dentist_id UUID NOT NULL REFERENCES public.dentist_profiles(id) ON DELETE RESTRICT,
  laboratory_id UUID NOT NULL REFERENCES public.dental_laboratories(id) ON DELETE CASCADE,
  total_amount NUMERIC(10,2) NOT NULL,
  payment_status payment_status NOT NULL DEFAULT 'UNPAID',
  due_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX idx_invoices_dentist ON public.invoices(dentist_id);
CREATE INDEX idx_invoices_lab ON public.invoices(laboratory_id);`
  },
  {
    name: "deliveries",
    schema: "public",
    description: "Courier logs tracking physical lab pan boxes and packages during ground/shipping cycles.",
    columns: [
      { name: "id", type: "UUID", constraints: ["PRIMARY KEY", "DEFAULT gen_random_uuid()"], description: "Delivery package ID" },
      { name: "case_id", type: "UUID", constraints: ["REFERENCES cases(id)"], description: "Linked lab material case" },
      { name: "carrier", type: "VARCHAR(60)", constraints: ["NOT NULL"], description: "Local Courier, FedEx, DHL, or UPS" },
      { name: "tracking_number", type: "VARCHAR(100)", constraints: ["NULL"], description: "Tracking digits from the carrier code" },
      { name: "delivery_status", type: "VARCHAR(40)", constraints: ["DEFAULT 'LABEL_CREATED'"], description: "Transit path indicators" },
      { name: "shipped_at", type: "TIMESTAMPTZ", constraints: ["NULL"], description: "Timestamp of cargo handoff" }
    ],
    sql: `-- 9. Courier and Delivery Logistics
CREATE TABLE public.deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  carrier VARCHAR(60) NOT NULL,
  tracking_number VARCHAR(100),
  delivery_status VARCHAR(40) NOT NULL DEFAULT 'LABEL_CREATED', -- 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED'
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_deliveries_case ON public.deliveries(case_id);`
  }
];

export const rowLevelSecurityRules = `-- Row-Level Security Policies for Secure Dentist & Technician Seggregation

ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Dentist Policy: Can read / write cases created ONLY under their dentist profile.
CREATE POLICY dentist_cases_policy ON public.cases
  FOR ALL
  USING (
    dentist_id = (SELECT id FROM public.dentist_profiles WHERE user_id = auth.uid())
  )
  WITH CHECK (
    dentist_id = (SELECT id FROM public.dentist_profiles WHERE user_id = auth.uid())
  );

-- Dentist Invoice Policy: Can read invoices billed ONLY to them.
CREATE POLICY dentist_invoices_policy ON public.invoices
  FOR SELECT
  USING (
    dentist_id = (SELECT id FROM public.dentist_profiles WHERE user_id = auth.uid())
  );

-- Technician Assignment Policy: Can SELECT and UPDATE progress only for jobs actively assigned to them.
CREATE POLICY tech_assignments_policy ON public.case_assignments
  FOR ALL
  USING (
    technician_id = (SELECT id FROM public.technician_profiles WHERE user_id = auth.uid())
  );

-- Technician Case Policy: Can view only cases currently allocated to them in case_assignments.
CREATE POLICY tech_cases_policy ON public.cases
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.case_assignments ca
      WHERE ca.case_id = public.cases.id
      AND ca.technician_id = (SELECT id FROM public.technician_profiles WHERE user_id = auth.uid())
    )
  );

-- Lab Admin Case Policy: Full permission to manage anything inside their registered lab tenant.
CREATE POLICY lab_admin_cases_policy ON public.cases
  FOR ALL
  USING (
    laboratory_id = (SELECT id FROM public.dental_laboratories WHERE owner_id = auth.uid())
  );
`;
