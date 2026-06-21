import { ApiEndpoint, UserRole } from "../types";

export const apiEndpoints: ApiEndpoint[] = [
  {
    path: "/api/auth/login",
    method: "POST",
    description: "Authenticates users (Dentist, Tech, Admin, Super) and generates JWT claims containing tenant scope.",
    rolesAllowed: [UserRole.SUPER_ADMIN, UserRole.LAB_ADMIN, UserRole.DENTIST, UserRole.TECHNICIAN],
    requestBodySchema: `{
  "email": "doctor.smith@dentalcorp.com",
  "password": "••••••••••••",
  "role": "DENTIST"
}`,
    responseSuccessSchema: `{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "u494-b293-11ef",
    "email": "doctor.smith@dentalcorp.com",
    "role": "DENTIST",
    "dentistProfileId": "dp-f9a8-9210"
  },
  "mfaRequired": false
}`
  },
  {
    path: "/api/cases",
    method: "GET",
    description: "Fetches cases. Under the hood, row-level filtering ensures Dentists see their cases, Technicians see assigned cases, and Admins see all cases.",
    rolesAllowed: [UserRole.SUPER_ADMIN, UserRole.LAB_ADMIN, UserRole.DENTIST, UserRole.TECHNICIAN],
    responseSuccessSchema: `// [Logged in as Dentist]
[
  {
    "id": "case-903-f8a1",
    "orderNumber": "DL-2026-6194",
    "patientBirthYear": 1984,
    "material": "Zirconia High Translucency",
    "shade": "A2",
    "status": "PRODUCTION", // General abstract stage
    "dueDate": "2026-06-25T17:00:00Z"
  }
]`
  },
  {
    path: "/api/cases",
    method: "POST",
    description: "Submit a physical tooth CAD/CAM restoration case with digital STL mesh attachments.",
    rolesAllowed: [UserRole.DENTIST, UserRole.LAB_ADMIN, UserRole.SUPER_ADMIN],
    requestBodySchema: `{
  "patientBirthYear": 1982,
  "patientGender": "MALE",
  "toothNumbers": [14, 15],
  "material": "Full Contoured Zirconia",
  "shade": "A3",
  "notes": "Please verify margin on disto-lingual cusp.",
  "dueDate": "2026-06-28T12:00:00Z",
  "scanS3Urls": ["s3://clinical-scans-bucket/scans/2026/mesh-upper.stl"]
}`,
    responseSuccessSchema: `{
  "id": "case-904-e389",
  "orderNumber": "DL-2026-0082",
  "status": "SUBMITTED",
  "dueDate": "2026-06-28T12:00:00Z",
  "createdAt": "2026-06-18T21:13:00Z"
}`
  },
  {
    path: "/api/cases/:id/assignments",
    method: "GET",
    description: "Reads technician step-by-step tasks assigned internally for diagnostic milling or ceramics stacking. Closed for Dentists.",
    rolesAllowed: [UserRole.SUPER_ADMIN, UserRole.LAB_ADMIN],
    responseSuccessSchema: `[
  {
    "assignmentId": "as-98de-k11",
    "technician": {
      "id": "tech-73-b21a",
      "name": "Alex Mercer",
      "specialization": "CAD/CAM Design Specialist"
    },
    "assignedStage": "CAD_DESIGN",
    "internalNotes": "Margin adjusted, ready for sintering.",
    "completedAt": "2026-06-18T12:44:02Z"
  }
]`,
    responseBlockedMessage: "Access Denied: Dentists are strictly forbidden from viewing internal workflow design details or technician schedules."
  },
  {
    path: "/api/cases/:id/assign",
    method: "POST",
    description: "Allocates a diagnostic step (e.g. milling, staining, ceramics) to specialized laboratory technicians.",
    rolesAllowed: [UserRole.LAB_ADMIN, UserRole.SUPER_ADMIN],
    requestBodySchema: `{
  "technicianId": "tech-73-b21a",
  "assignedStage": "PORCELAIN_LAYERING",
  "internalNotes": "Doctor is highly demanding on incisal translucency."
}`,
    responseSuccessSchema: `{
  "assignmentId": "as-98df-892a",
  "caseId": "case-903-f8a1",
  "technicianId": "tech-73-b21a",
  "assignedStage": "PORCELAIN_LAYERING",
  "status": "ALLOCATED"
}`,
    responseBlockedMessage: "Access Denied: Restrictive policy. Only Laboratory Administrators can delegate workload assignments to dental technicians."
  },
  {
    path: "/api/dashboard/technician",
    method: "GET",
    description: "Dedicated queue dashboard tracking technical specs, shade guidelines, and 3D STL scanners for active technician workflow.",
    rolesAllowed: [UserRole.TECHNICIAN, UserRole.SUPER_ADMIN],
    responseSuccessSchema: `{
  "assignedWorkTasks": [
    {
      "caseId": "case-903-f8a1",
      "orderNumber": "DL-2026-6194",
      "material": "Zirconia HT",
      "shade": "A2",
      "toothNumbers": [14],
      "internalTaskNotes": "Check adjacent contact tightness.",
      "digitalScanFiles": ["https://s3.aws.com/dental-bucket/stl_124.gcode"]
    }
  ],
  "workloadMetrics": {
    "completedToday": 4,
    "backlogUnits": 2,
    "allocatedStage": "CERAMICS_FINISHING"
  }
}`,
    responseBlockedMessage: "Access Denied: Dentists and outside contractors are prohibited from reviewing internal technician queue boards."
  },
  {
    path: "/api/invoices",
    method: "GET",
    description: "Financial invoices endpoint. Dentists only read bills mapped to their clinic, Lab Admins get full workspace billing registers.",
    rolesAllowed: [UserRole.SUPER_ADMIN, UserRole.LAB_ADMIN, UserRole.DENTIST],
    responseSuccessSchema: `[
  {
    "id": "inv-00234",
    "invoiceNo": "INV-2026-00431",
    "caseNo": "DL-2026-6194",
    "clinicName": "Elite Cosmetic Dental",
    "totalAmount": 285.00,
    "paymentStatus": "UNPAID",
    "dueDate": "2026-07-15T00:00:00Z"
  }
]`,
    responseBlockedMessage: "Access Denied: Technicians do not have access authorization to dental clinic invoices or accounting records."
  },
  {
    path: "/api/invoices/generate",
    method: "POST",
    description: "Calculates cost allocations for finished porcelain/acrylic crowns and generates invoice statements.",
    rolesAllowed: [UserRole.LAB_ADMIN, UserRole.SUPER_ADMIN],
    requestBodySchema: `{
  "caseId": "case-903-f8a1",
  "materialsCharged": [
    { "name": "Zirconia Multi-Layer Crown Unit", "quantity": 1, "rate": 250.00 },
    { "name": "Titanium Custom Implant Abutment", "quantity": 1, "rate": 35.00 }
  ],
  "taxRate": 0.08,
  "discountPrice": 0.00
}`,
    responseSuccessSchema: `{
  "invoiceId": "inv-00235",
  "invoiceNo": "INV-2026-0591",
  "subtotal": 285.00,
  "tax": 22.80,
  "totalAmount": 307.80,
  "paymentStatus": "DRAFT"
}`
  },
  {
    path: "/api/deliveries",
    method: "GET",
    description: "Fetches active and completed dental box pan deliveries with carrier assignments, tracking logs, and chronological milestones.",
    rolesAllowed: [UserRole.SUPER_ADMIN, UserRole.LAB_ADMIN, UserRole.DENTIST],
    responseSuccessSchema: `[
  {
    "id": "DEL-2026-8032",
    "caseId": "case-001",
    "patientInitials": "R. M.",
    "carrier": "Local Courier",
    "trackingNumber": "LC-852496-BOS",
    "status": "packed",
    "estimatedDeliveryDate": "2026-06-19",
    "milestones": [
      {
        "status": "packed",
        "title": "Order Sintered & Packed",
        "description": "Crown polished and secured in lab pan protective box.",
        "timestamp": "2026-06-18T23:51:00Z"
      }
    ]
  }
]`
  },
  {
    path: "/api/deliveries",
    method: "POST",
    description: "Accepts finished cases, generates random courier routing references, registers packaging logs, and stages packages for shipping.",
    rolesAllowed: [UserRole.LAB_ADMIN, UserRole.SUPER_ADMIN],
    requestBodySchema: `{
  "caseId": "case-001",
  "patientInitials": "R. M.",
  "dentistName": "Dr. Catherine Vance",
  "clinicName": "Apex Cosmetic Dentistry Inc.",
  "carrier": "Local Courier",
  "notes": "sterile, fragile multilayer zirconia crown."
}`,
    responseSuccessSchema: `{
  "success": true,
  "delivery": {
    "id": "DEL-2026-8032",
    "caseId": "case-001",
    "status": "packed",
    "trackingNumber": "LC-852496-BOS",
    "carrier": "Local Courier"
  }
}`
  },
  {
    path: "/api/deliveries/:id/status",
    method: "POST",
    description: "Enables multi-step transit route advancement (Packed -> Shipped -> Out for Delivery -> Delivered). Broadcasts events & dispatches clinical notifications.",
    rolesAllowed: [UserRole.LAB_ADMIN, UserRole.SUPER_ADMIN],
    requestBodySchema: `{
  "status": "shipped",
  "location": "FedEx Concord Sort Depot",
  "notes": "Route departed."
}`,
    responseSuccessSchema: `{
  "success": true,
  "delivery": {
    "id": "DEL-2026-8032",
    "status": "shipped",
    "trackingNumber": "LC-852496-BOS",
    "milestones": [
      {
        "status": "shipped",
        "title": "Dispatched via Local Courier",
        "location": "FedEx Concord Sort Depot"
      }
    ]
  }
}`
  }
];
