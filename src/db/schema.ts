import { pgTable, text, integer, real } from 'drizzle-orm/pg-core';

export const chatMessages = pgTable('chat_messages', {
  id: text('id').primaryKey(),
  channel: text('channel').notNull(),
  sender: text('sender').notNull(),
  role: text('role').notNull(),
  text: text('text').notNull(),
  time: text('time').notNull(),
  timestamp: text('timestamp').notNull(),
  attachmentName: text('attachment_name'),
  attachmentSize: text('attachment_size'),
  attachmentUrl: text('attachment_url'),
  readBy: text('read_by').notNull(), // JSON string array
});

export const caseComments = pgTable('case_comments', {
  id: text('id').primaryKey(),
  caseId: text('case_id').notNull(),
  sender: text('sender').notNull(),
  role: text('role').notNull(),
  text: text('text').notNull(),
  time: text('time').notNull(),
  timestamp: text('timestamp').notNull(),
});

export const notificationsHistory = pgTable('notifications_history', {
  id: text('id').primaryKey(),
  category: text('category').notNull(),
  level: text('level').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  time: text('time').notNull(),
  unread: integer('unread').notNull(),
  type: text('type').notNull(),
  recipientRole: text('recipient_role'),
  smtpPayload: text('smtp_payload'),
});

export const invoices = pgTable('invoices', {
  id: text('id').primaryKey(),
  caseId: text('case_id'),
  dentistName: text('dentist_name').notNull(),
  clinicName: text('clinic_name').notNull(),
  issuedDate: text('issued_date').notNull(),
  dueDate: text('due_date').notNull(),
  subtotal: real('subtotal').notNull(),
  gstRate: real('gst_rate').notNull(),
  gstAmount: real('gst_amount').notNull(),
  totalAmount: real('total_amount').notNull(),
  totalPaid: real('total_paid').notNull(),
  outstandingBalance: real('outstanding_balance').notNull(),
  status: text('status').notNull(),
  pdfTemplateId: text('pdf_template_id'),
});

export const invoiceItems = pgTable('invoice_items', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id').notNull(),
  description: text('description').notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
  amount: real('amount').notNull(),
});

export const paymentRecords = pgTable('payment_records', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id').notNull(),
  amount: real('amount').notNull(),
  paymentMethod: text('payment_method').notNull(),
  transactionId: text('transaction_id'),
  timestamp: text('timestamp').notNull(),
});

export const deliveries = pgTable('deliveries', {
  id: text('id').primaryKey(),
  caseId: text('case_id').notNull(),
  patientInitials: text('patient_initials').notNull(),
  dentistName: text('dentist_name').notNull(),
  clinicName: text('clinic_name').notNull(),
  carrier: text('carrier').notNull(),
  trackingNumber: text('tracking_number').notNull(),
  status: text('status').notNull(),
  shippedDate: text('shipped_date'),
  deliveredDate: text('delivered_date'),
  estimatedDeliveryDate: text('estimated_delivery_date'),
  notes: text('notes'),
  recipientSignee: text('recipient_signee'),
});

export const deliveryMilestones = pgTable('delivery_milestones', {
  id: integer('id').primaryKey(),
  deliveryId: text('delivery_id').notNull(),
  status: text('status').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  timestamp: text('timestamp').notNull(),
  location: text('location'),
});

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  fullName: text('full_name').notNull(),
  role: text('role').notNull(),
  labName: text('lab_name'),
  gstin: text('gstin'),
  clinicName: text('clinic_name'),
  createdAt: text('created_at').notNull(),
});

export const appState = pgTable('app_state', {
  id: text('id').primaryKey(),
  data: text('data').notNull(),
});
