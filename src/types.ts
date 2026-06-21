/**
 * Shared Type Declarations for Dental Laboratory Management Architecture Explorer
 */

export enum UserRole {
 SUPER_ADMIN = "SUPER_ADMIN",
 LAB_ADMIN = "LAB_ADMIN",
 DENTIST = "DENTIST",
 TECHNICIAN = "TECHNICIAN"
}

export interface ArchitectureNode {
 id: string;
 title: string;
 subtitle: string;
 description: string;
 technology: string;
 icon: string; // lucide icon name
 highlights: string[];
 codeSnippet?: string;
 codeTitle?: string;
}

export interface ColumnData {
 name: string;
 type: string;
 constraints?: string[];
 description: string;
}

export interface RelationData {
 fromTable: string;
 fromField: string;
 toTable: string;
 toField: string;
 type: "one-to-many" | "one-to-one" | "many-to-many";
}

export interface TableData {
 name: string;
 schema: string; // 'auth', 'public', etc.
 description: string;
 columns: ColumnData[];
 sql: string;
}

export interface ApiEndpoint {
 path: string;
 method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
 description: string;
 rolesAllowed: UserRole[];
 requestBodySchema?: string;
 responseSuccessSchema: string;
 responseBlockedMessage?: string;
}

export interface FolderNode {
 name: string;
 type: "file" | "directory";
 children?: FolderNode[];
 description?: string;
 fileContent?: string;
}

export interface RoleUseCase {
 id: string;
 title: string;
 triggeringRole: UserRole;
 action: string;
 endpoint: string;
 mechanism: string; // e.g. "Row-Level Security (RLS) on case_assignments", "NestJS RoleGuard on controller"
 steps: {
 title: string;
 description: string;
 status: "success" | "warning" | "error";
 }[];
}

// Invoicing & Payment Management Types
export interface InvoiceItem {
 id: string;
 description: string;
 quantity: number;
 unitPrice: number;
 amount: number;
}

export interface PaymentRecord {
 id: string;
 amount: number;
 paymentMethod: "credit_card" | "bank_transfer" | "check" | "stripe";
 transactionId?: string;
 timestamp: string;
}

export interface Invoice {
 id: string;
 caseId?: string;
 dentistName: string;
 clinicName: string;
 issuedDate: string;
 dueDate: string;
 items: InvoiceItem[];
 subtotal: number;
 gstRate: number; // e.g., 0.15 for 15% GST
 gstAmount: number;
 totalAmount: number;
 totalPaid: number;
 outstandingBalance: number;
 status: "unpaid" | "partially_paid" | "paid" | "void";
 payments: PaymentRecord[];
 pdfTemplateId?: string;
}

// Delivery & Dispatch Trackers Types
export interface DeliveryMilestone {
 status: "packed" | "shipped" | "out_for_delivery" | "delivered";
 title: string;
 description: string;
 timestamp: string;
 location?: string;
}

export interface DeliveryRecord {
 id: string;
 caseId: string;
 patientInitials: string;
 dentistName: string;
 clinicName: string;
 carrier: "FedEx" | "UPS" | "DHL" | "Local Courier";
 trackingNumber: string;
 status: "packed" | "shipped" | "out_for_delivery" | "delivered";
 shippedDate?: string;
 deliveredDate?: string;
 estimatedDeliveryDate?: string;
 notes?: string;
 recipientSignee?: string;
 milestones: DeliveryMilestone[];
}

