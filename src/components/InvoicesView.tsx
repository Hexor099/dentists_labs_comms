import React, { useState, useEffect } from "react";
import { 
 FileText, Receipt, DollarSign, Calendar, Landmark, CreditCard, Plus, Trash2, 
 Check, Play, Printer, AlertCircle, ChevronRight, BarChart3, TrendingUp, X, 
 ArrowUpRight, Download, Calculator, CheckCircle2, AlertTriangle, ShieldCheck
} from "lucide-react";
import { 
 BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
 PieChart, Pie, Cell, Legend
} from "recharts";
import { Invoice, InvoiceItem, UserRole } from "../types";

const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444"];

interface InvoicesViewProps {
 activeRole: UserRole;
 triggerGlobalToast: (msg: string) => void;
}

export default function InvoicesView({ activeRole, triggerGlobalToast }: InvoicesViewProps) {
 const [invoices, setInvoices] = useState<Invoice[]>([]);
 const [activeFilter, setActiveFilter] = useState<"all" | "paid" | "partially_paid" | "unpaid">("all");
 const [searchQuery, setSearchQuery] = useState("");
 
 // Modal or sub-view states
 const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
 const [showGenerator, setShowGenerator] = useState(false);
 const [showPaymentModal, setShowPaymentModal] = useState<Invoice | null>(null);
 const [showPdfView, setShowPdfView] = useState<Invoice | null>(null);

 // New Invoice form states
 const [clinicName, setClinicName] = useState("Apex Cosmetic Dentistry Inc.");
 const [dentistName, setDentistName] = useState("Dr. Catherine Vance");
 const [associatedCaseId, setAssociatedCaseId] = useState("case-001");
 const [dueDate, setDueDate] = useState(() => {
 const d = new Date();
 d.setDate(d.getDate() + 14);
 return d.toISOString().split("T")[0];
 });
 const [gstRate, setGstRate] = useState(0.15); // Default 15% GST
 const [invoiceItems, setInvoiceItems] = useState<Omit<InvoiceItem, "id" | "amount">[]>([
 { description: "Translucent Multi-layer Zirconia Crown Milling (#14)", quantity: 1, unitPrice: 385 }
 ]);

 // Payment form states
 const [payAmount, setPayAmount] = useState<number>(0);
 const [payMethod, setPayMethod] = useState<"credit_card" | "bank_transfer" | "check" | "stripe">("credit_card");
 const [paymentTxId, setPaymentTxId] = useState("");

 const fetchInvoices = () => {
 fetch("/api/invoices")
 .then(res => res.json())
 .then(data => {
 if (data.invoices) {
 setInvoices(data.invoices);
 }
 })
 .catch((err) => {
 console.error("Failed to load clinical invoices:", err);
 triggerGlobalToast("Error connecting to accounts registry.");
 });
 };

 useEffect(() => {
 fetchInvoices();
 }, []);

 // Filter & Search computation
 const filteredInvoices = invoices.filter(inv => {
 const roleMatches = activeRole === UserRole.DENTIST 
 ? inv.dentistName.includes("Vance") || inv.clinicName.includes("Apex") // Dentist Catherine Vance views only her own clinic billing
 : true; // Lab admins and technicians can see general ledger

 const statusMatches = activeFilter === "all" || inv.status === activeFilter;
 const queryMatches = inv.clinicName.toLowerCase().includes(searchQuery.toLowerCase()) || 
 inv.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
 inv.dentistName.toLowerCase().includes(searchQuery.toLowerCase());

 return roleMatches && statusMatches && queryMatches;
 });

 // Financial aggregates
 const totalInvoiced = filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
 const totalReceived = filteredInvoices.reduce((sum, inv) => sum + inv.totalPaid, 0);
 const totalOutstanding = filteredInvoices.reduce((sum, inv) => sum + inv.outstandingBalance, 0);

 // Recharts Data preparation
 const getBillingChartData = () => {
 // Group invoices by date or mock trends
 const groups: { [key: string]: { billed: number; collected: number } } = {
 "June 12": { billed: 517.5, collected: 517.5 },
 "June 15": { billed: 2070, collected: 500 },
 "June 18": { billed: 971.75, collected: 0 }
 };

 // Incorporate future dynamic ones if their day matches
 invoices.forEach(inv => {
 const dateStr = inv.issuedDate.substring(5, 10).replace("-", "/"); // e.g., "06/18"
 if (!groups[dateStr]) {
 groups[dateStr] = { billed: 0, collected: 0 };
 }
 groups[dateStr].billed += inv.totalAmount;
 groups[dateStr].collected += inv.totalPaid;
 });

 return Object.entries(groups).map(([name, vals]) => ({
 name,
 Billed: parseFloat(vals.billed.toFixed(2)),
 Collected: parseFloat(vals.collected.toFixed(2))
 }));
 };

 const getStatusChartData = () => {
 const paidCount = invoices.filter(i => i.status === "paid").length;
 const partialCount = invoices.filter(i => i.status === "partially_paid").length;
 const unpaidCount = invoices.filter(i => i.status === "unpaid").length;

 return [
 { name: "Fully Paid", value: paidCount || 1 },
 { name: "Partially Paid", value: partialCount || 0 },
 { name: "Unpaid / Outstanding", value: unpaidCount || 1 }
 ].filter(v => v.value > 0);
 };

 // Mutator - Add Row in form
 const handleAddFormItem = () => {
 setInvoiceItems([...invoiceItems, { description: "", quantity: 1, unitPrice: 100 }]);
 };

 // Mutator - Remove Row in form
 const handleRemoveFormItem = (index: number) => {
 if (invoiceItems.length === 1) return;
 setInvoiceItems(invoiceItems.filter((_, idx) => idx !== index));
 };

 // Form field modifier
 const handleFormItemChange = (index: number, field: string, value: any) => {
 const updated = invoiceItems.map((item, idx) => {
 if (idx === index) {
 return {
 ...item,
 [field]: field === "description" ? value : Number(value) || 0
 };
 }
 return item;
 });
 setInvoiceItems(updated);
 };

 // Submit Invoice Generation
 const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 
 // Validation
 const invalidItem = invoiceItems.some(i => !i.description.trim() || i.unitPrice < 0);
 if (invalidItem) {
 triggerGlobalToast("Please specify validation details for all custom dental line fields.");
 return;
 }

 const payload = {
 caseId: associatedCaseId.trim() || undefined,
 dentistName: dentistName.trim(),
 clinicName: clinicName.trim(),
 dueDate,
 gstRate,
 items: invoiceItems
 };

 fetch("/api/invoices", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify(payload)
 })
 .then(res => res.json())
 .then(data => {
 if (data.success) {
 triggerGlobalToast(`Generated ledger invoice ref: ${data.invoice.id}`);
 setInvoices(prev => [data.invoice, ...prev]);
 setShowGenerator(false);
 // Reset form
 setInvoiceItems([{ description: "Translucent Multi-layer Zirconia Crown Milling (#14)", quantity: 1, unitPrice: 385 }]);
 }
 })
 .catch(err => {
 console.error(err);
 triggerGlobalToast("Failed to compile financial invoice.");
 });
 };

 // Record Payment Submit
 const handlePaymentSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (!showPaymentModal) return;

 if (payAmount <= 0) {
 triggerGlobalToast("Payment voucher requires matching positive dollars.");
 return;
 }

 fetch(`/api/invoices/${showPaymentModal.id}/payments`, {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({
 amount: payAmount,
 paymentMethod: payMethod,
 transactionId: paymentTxId.trim() || undefined
 })
 })
 .then(res => {
 if (!res.ok) throw new Error("Payment server rejected processing.");
 return res.json();
 })
 .then(data => {
 if (data.success) {
 triggerGlobalToast(`Successful payment ledger: Secured $${payAmount} on Invoice ${showPaymentModal.id}`);
 setInvoices(prev => prev.map(inv => inv.id === data.invoice.id ? data.invoice : inv));
 setShowPaymentModal(null);
 setPayAmount(0);
 setPaymentTxId("");
 }
 })
 .catch((err) => {
 console.error(err);
 triggerGlobalToast("Unable to securely authorize card processing or bank records.");
 });
 };

 const getStatusBadge = (status: string) => {
 switch (status) {
 case "paid":
 return <span className="p-1 px-3 rounded-full text-sm font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 ">FULLY PAID</span>;
 case "partially_paid":
 return <span className="p-1 px-3 rounded-full text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-205 ">PARTIAL PAY</span>;
 default:
 return <span className="p-1 px-3 rounded-full text-sm font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">UNPAID</span>;
 }
 };

 const triggerPrintPdf = () => {
 window.print();
 };

 return (
 <div id="financial-ledger-suite" className="space-y-6 animate-fadeIn">
 
 {/* Title Header */}
 <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700 ">
 <div>
 <h2 className="text-sm font-bold font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5 animate-fadeIn">
 <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400 " />
 Invoice & Commercial Ledgers
 </h2>
 <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-0.5">Track lab dental restoration billables, outstanding balances, and GST clearances</p>
 </div>

 {/* Action triggers depending on role */}
 <div className="flex gap-2">
 {activeRole === UserRole.LAB_ADMIN && (
 <button
 onClick={() => setShowGenerator(true)}
 className="bg-blue-600 dark:bg-blue-500 hover:bg-indigo-550 text-white font-bold p-2 px-4 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm select-none transition-all"
 >
 <Plus className="w-4 h-4" /> Create Dental Invoice
 </button>
 )}

 {activeRole === UserRole.DENTIST && (
 <div className="text-sm bg-indigo-50 dark:bg-indigo-900/20/50 text-indigo-700 border border-indigo-200 p-1 py-1.5 px-3.5 rounded-full font-sans flex items-center gap-1.5 ">
 <ShieldCheck className="w-4 h-4" />
 <span>Restricted Client Credentials Authed</span>
 </div>
 )}
 </div>
 </div>

 {/* Financial Stats Grid (Bento style) */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 
 {/* Metric 1 */}
 <div className="bg-white dark:bg-slate-900 #0a0f1d] border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex justify-between items-start">
 <div className="space-y-1">
 <span className="text-sm font-medium text-slate-600 dark:text-slate-300 ">Total Billed Amt</span>
 <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 font-sans">${totalInvoiced.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
 <span className="text-sm text-slate-450 block">Includes local state & GST (15%)</span>
 </div>
 <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 p-2 rounded-lg text-indigo-550 ">
 <DollarSign className="w-4 h-4" />
 </div>
 </div>

 {/* Metric 2 */}
 <div className="bg-white dark:bg-slate-900 #0a0f1d] border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex justify-between items-start">
 <div className="space-y-1">
 <span className="text-sm font-medium text-slate-600 dark:text-slate-300 ">Collected Income</span>
 <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 font-sans">${totalReceived.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
 <span className="text-sm text-slate-450 block">Settled bank & card vouchers</span>
 </div>
 <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/20 p-2 rounded-lg text-blue-500 ">
 <CheckCircle2 className="w-4 h-4" />
 </div>
 </div>

 {/* Metric 3 */}
 <div className="bg-white dark:bg-slate-900 #0a0f1d] border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex justify-between items-start">
 <div className="space-y-1">
 <span className="text-sm font-medium text-slate-600 dark:text-slate-300 ">Outstanding Overdues</span>
 <h3 className="text-xl font-bold text-rose-550 font-sans">${totalOutstanding.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
 <span className="text-sm text-slate-450 block">Average client terms: Net-14</span>
 </div>
 <div className="bg-rose-50 border border-rose-100 p-2 rounded-lg text-rose-550 ">
 <AlertTriangle className="w-4 h-4" />
 </div>
 </div>
 </div>

 {/* Reports & Charts Dashboard Section */}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 select-none">
 
 {/* Billing Trend (Bar Chart 8 columns) */}
 <div className="lg:col-span-8 bg-white dark:bg-slate-900 #0a0f1d] border border-slate-200 dark:border-slate-700 p-5 rounded-2xl shadow-xs">
 <div className="flex justify-between items-center pb-4 border-b border-slate-150 ">
 <div className="flex items-center gap-1.5 font-sans">
 <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
 <h4 className="text-xs font-bold uppercase text-slate-800 dark:text-slate-200 ">Billing & Settlement Timeline</h4>
 </div>
 <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
 <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
 <span>Dynamic synchronization</span>
 </div>
 </div>

 <div className="h-[220px] pt-4 w-full">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={getBillingChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="" />
 <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontStyle="bold" tickLine={false} />
 <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
 <Tooltip 
 contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "8px", color: "#f8fafc" }}
 labelStyle={{ fontWeight: "bold", fontSize: "11px", color: "#38bdf8" }}
 />
 <Legend iconType="circle" wrapperStyle={{ fontSize: "10.5px", paddingTop: "5px" }} />
 <Bar dataKey="Billed" fill="url(#billedGrad)" radius={[4, 4, 0, 0]} />
 <Bar dataKey="Collected" fill="url(#collectedGrad)" radius={[4, 4, 0, 0]} />
 <defs>
 <linearGradient id="billedGrad" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
 <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.2}/>
 </linearGradient>
 <linearGradient id="collectedGrad" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
 <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
 </linearGradient>
 </defs>
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>

 {/* Invoice Category Status (Pie Chart 4 columns) */}
 <div className="lg:col-span-4 bg-white dark:bg-slate-900 #0a0f1d] border border-slate-200 dark:border-slate-700 p-5 rounded-2xl shadow-xs">
 <div className="flex justify-between items-center pb-4 border-b border-slate-150 ">
 <h4 className="text-xs font-bold uppercase font-sans text-slate-800 dark:text-slate-200 ">
 Voucher Ratio
 </h4>
 <span className="text-sm font-sans text-slate-450 uppercase">By count</span>
 </div>

 <div className="h-[220px] pt-4 relative flex flex-col justify-between">
 <div className="h-[140px] w-full">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={getStatusChartData()}
 cx="50%"
 cy="50%"
 innerRadius={35}
 outerRadius={55}
 paddingAngle={4}
 dataKey="value"
 >
 {getStatusChartData().map((entry, index) => (
 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
 ))}
 </Pie>
 <Tooltip contentStyle={{ fontSize: "11px" }} />
 </PieChart>
 </ResponsiveContainer>
 </div>

 {/* Custom Pie Legend */}
 <div className="grid grid-cols-2 gap-1.5 text-sm border-t border-slate-200 dark:border-slate-700 pt-3">
 {getStatusChartData().map((val, idx) => (
 <div key={val.name} className="flex items-center gap-1">
 <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
 <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500 font-semibold truncate">{val.name} ({val.value})</span>
 </div>
 ))}
 </div>
 </div>
 </div>

 </div>

 {/* Ledger Feed Table Card */}
 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-xs p-5 md:p-6 space-y-4">
 
 {/* Controls, Filter Tabs, Inputs */}
 <div className="flex justify-between items-center flex-wrap gap-4 select-none">
 
 <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-250 gap-1.5 shadow-xs">
 {[
 { key: "all", label: "All Ledgers" },
 { key: "paid", label: "Paid" },
 { key: "partially_paid", label: "Partials" },
 { key: "unpaid", label: "Unpaid" }
 ].map(tab => (
 <button
 key={tab.key}
 type="button"
 onClick={() => setActiveFilter(tab.key as any)}
 className={`px-3.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
 activeFilter === tab.key
 ? "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-bold"
 : "text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:text-slate-200 "
 }`}
 >
 {tab.label}
 </button>
 ))}
 </div>

 <div className="flex-1 max-w-sm">
 <input 
 type="text" 
 value={searchQuery}
 onChange={e => setSearchQuery(e.target.value)}
 placeholder="Search by Invoice #, Dentist, or Clinic..."
 className="w-full bg-slate-50 dark:bg-slate-800 #0f172a] border border-slate-250 p-2 px-3 text-xs rounded-xl focus:outline-none focus:border-blue-200 dark:border-blue-800 text-slate-800 dark:text-slate-200 font-sans shadow-xs"
 />
 </div>
 </div>

 {/* Grid Ledger Table */}
 <div className="border border-slate-150 rounded-2xl overflow-hidden overflow-x-auto">
 <table className="w-full text-left border-collapse min-w-[700px]">
 <thead>
 <tr className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-sans text-sm font-medium text-sm border-b border-slate-150 ">
 <th className="p-3 px-4">Invoice ID / Case Ref</th>
 <th className="p-3">Dentist & Clinic</th>
 <th className="p-3 font-semibold">Issued → Due</th>
 <th className="p-3 text-right">Items & Subtotal</th>
 <th className="p-3 text-right">GST (15%)</th>
 <th className="p-3 text-right">Total Net</th>
 <th className="p-3 text-center">Status</th>
 <th className="p-3 text-center">Receipt Desk</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-150 text-xs text-slate-700 dark:text-slate-300 ">
 {filteredInvoices.map(invoice => (
 <tr key={invoice.id} className="hover:bg-slate-50 dark:bg-slate-800/50 transition-colors">
 
 {/* ID / Case */}
 <td className="p-3.5 px-4 font-sans">
 <div className="flex flex-col">
 <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
 <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
 {invoice.id}
 </span>
 {invoice.caseId ? (
 <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold">Case: #{invoice.caseId}</span>
 ) : (
 <span className="text-sm text-slate-600 dark:text-slate-300 italic">Standalone rest.</span>
 )}
 </div>
 </td>

 {/* Dentist */}
 <td className="p-3.5">
 <div className="flex flex-col">
 <span className="font-bold text-slate-800 dark:text-slate-200 ">{invoice.dentistName}</span>
 <span className="text-sm text-slate-450 ">{invoice.clinicName}</span>
 </div>
 </td>

 {/* Calendar Days */}
 <td className="p-3.5 font-sans text-sm font-semibold text-slate-600 dark:text-slate-300 ">
 <div className="flex items-center gap-1.5">
 <span>{invoice.issuedDate}</span>
 <ChevronRight className="w-3 h-3 text-slate-600 dark:text-slate-300" />
 <span className={invoice.outstandingBalance > 0 && new Date(invoice.dueDate) < new Date() ? 'text-red-500 font-bold' : ''}>
 {invoice.dueDate}
 </span>
 </div>
 </td>

 {/* Items Subtotal */}
 <td className="p-3.5 text-right font-sans text-sm text-slate-800 dark:text-slate-200 ">
 <div className="flex flex-col">
 <span className="font-bold">${invoice.subtotal.toFixed(2)}</span>
 <span className="text-sm text-slate-600 dark:text-slate-300">{invoice.items.length} line(s)</span>
 </div>
 </td>

 {/* GST */}
 <td className="p-3.5 text-right font-sans text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
 ${invoice.gstAmount.toFixed(2)}
 </td>

 {/* Total Amount & Balance */}
 <td className="p-3.5 text-right font-sans text-sm font-bold">
 <div className="flex flex-col">
 <span className="text-slate-800 dark:text-slate-200 ">${invoice.totalAmount.toFixed(2)}</span>
 {invoice.outstandingBalance > 0 ? (
 <span className="text-sm text-rose-500 font-medium">Bal: ${invoice.outstandingBalance.toFixed(2)}</span>
 ) : (
 <span className="text-sm text-blue-600 dark:text-blue-400 font-medium font-semibold">Cleared</span>
 )}
 </div>
 </td>

 {/* Status Badge */}
 <td className="p-3.5 text-center">
 {getStatusBadge(invoice.status)}
 </td>

 {/* Actions / Receipt Desk */}
 <td className="p-3 text-center">
 <div className="inline-flex gap-1.5">
 <button
 onClick={() => setShowPdfView(invoice)}
 className="bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 p-1 px-2 rounded font-sans text-sm cursor-pointer flex items-center gap-1 shadow-xs"
 >
 <Printer className="w-3 h-3 text-blue-600 dark:text-blue-400" /> PDF Template
 </button>

 {invoice.outstandingBalance > 0 && (
 <button
 onClick={() => {
 setShowPaymentModal(invoice);
 setPayAmount(invoice.outstandingBalance);
 }}
 className="bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 p-1 px-2 rounded font-sans text-sm font-bold cursor-pointer flex items-center gap-1 shadow-xs"
 >
 <CreditCard className="w-3 h-3 text-orange-500" /> Pay / Settle
 </button>
 )}
 </div>
 </td>

 </tr>
 ))}
 
 {filteredInvoices.length === 0 && (
 <tr>
 <td colSpan={8} className="p-10 text-center italic text-slate-450 text-xs">
 No matching clinical billing ledgers recorded in this perspective.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>

 {/* --- MODAL DIALOGS --- */}

 {/* 1. NEW INVOICE GENERATOR FORM DIALOG */}
 {showGenerator && (
 <div id="invoice-generator-panel" className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full rounded-2xl p-5.5 space-y-4 mb-6 shadow-sm animate-fadeIn">
 
 <div className="flex justify-between items-center pb-2.5 border-b border-slate-200 dark:border-slate-700 select-none">
 <div className="flex items-center gap-1.5">
 <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
 <h3 className="font-sans text-sm font-bold uppercase text-slate-800 dark:text-slate-200 ">
 Generate Dental Restoration Ledger & Invoice
 </h3>
 </div>
 <button 
 onClick={() => setShowGenerator(false)}
 className="p-1 rounded-lg hover:bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 cursor-pointer"
 >
 <X className="w-4.5 h-4.5" />
 </button>
 </div>

 <form onSubmit={handleCreateInvoiceSubmit} className="space-y-4 text-xs">
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-sans text-slate-600 dark:text-slate-300 font-medium text-sm mb-1">Clinic Name</label>
 <input 
 type="text"
 required
 value={clinicName}
 onChange={e => setClinicName(e.target.value)}
 className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 rounded-lg p-2 focus:outline-none"
 />
 </div>
 <div>
 <label className="block text-sm font-sans text-slate-600 dark:text-slate-300 font-medium text-sm mb-1">Dentist Name</label>
 <input 
 type="text"
 required
 value={dentistName}
 onChange={e => setDentistName(e.target.value)}
 className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 rounded-lg p-2 focus:outline-none"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div>
 <label className="block text-sm font-sans text-slate-600 dark:text-slate-300 font-medium text-sm mb-1">Dental Case Reference</label>
 <input 
 type="text"
 placeholder="e.g. case-001 (optional)"
 value={associatedCaseId}
 onChange={e => setAssociatedCaseId(e.target.value)}
 className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 rounded-lg p-2 focus:outline-none"
 />
 </div>
 <div>
 <label className="block text-sm font-sans text-slate-600 dark:text-slate-300 font-medium text-sm mb-1">Due Date</label>
 <input 
 type="date"
 required
 value={dueDate}
 onChange={e => setDueDate(e.target.value)}
 className="font-sans w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 rounded-lg p-1.5 focus:outline-none"
 />
 </div>
 <div>
 <label className="block text-sm font-sans text-slate-600 dark:text-slate-300 font-medium text-sm mb-1">GST Surcharge</label>
 <select
 value={gstRate}
 onChange={e => setGstRate(Number(e.target.value))}
 className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 p-2 rounded-lg font-sans focus:outline-none"
 >
 <option value={0.15}>Standard GST (15%)</option>
 <option value={0.10}>Special GST (10%)</option>
 <option value={0.05}>Reduced GST (5%)</option>
 <option value={0.00}>Exempt/Zero GST (0%)</option>
 </select>
 </div>
 </div>

 {/* Items Section */}
 <div className="space-y-3.5 pt-2 border-t border-slate-150 ">
 <div className="flex justify-between items-center select-none">
 <span className="font-sans font-bold text-blue-600 dark:text-blue-400 uppercase">Itemized Restoration Items</span>
 <button
 type="button"
 onClick={handleAddFormItem}
 className="text-sm font-sans bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded px-2.5 py-1 flex items-center gap-1 cursor-pointer"
 >
 <Plus className="w-3.5 h-3.5" /> Add Row
 </button>
 </div>

 <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
 {invoiceItems.map((item, idx) => (
 <div key={idx} className="flex gap-2.5 items-center">
 <div className="flex-1">
 <input 
 type="text"
 required
 placeholder="Line item description (e.g., Zirconia single crown)"
 value={item.description}
 onChange={e => handleFormItemChange(idx, "description", e.target.value)}
 className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 rounded-lg p-2 focus:outline-none"
 />
 </div>
 
 <div className="w-16">
 <input 
 type="number"
 min="1"
 required
 value={item.quantity}
 onChange={e => handleFormItemChange(idx, "quantity", e.target.value)}
 className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 rounded-lg p-2 text-center font-sans focus:outline-none"
 />
 </div>

 <div className="w-24">
 <input 
 type="number"
 min="0"
 required
 placeholder="Price ($)"
 value={item.unitPrice}
 onChange={e => handleFormItemChange(idx, "unitPrice", e.target.value)}
 className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 rounded-lg p-2 font-sans text-right focus:outline-none"
 />
 </div>

 <button
 type="button"
 disabled={invoiceItems.length === 1}
 onClick={() => handleRemoveFormItem(idx)}
 className="p-1 px-1.5 text-slate-600 dark:text-slate-300 hover:text-rose-550 border border-slate-200 dark:border-slate-700 hover:border-rose-100 rounded-lg disabled:opacity-30 cursor-pointer"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 ))}
 </div>
 </div>

 {/* Action row footer */}
 <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 select-none">
 <button
 type="button"
 onClick={() => setShowGenerator(false)}
 className="bg-white dark:bg-slate-900 hover:bg-slate-100 dark:bg-slate-800/80 border border-slate-250 text-slate-600 dark:text-slate-300 font-bold p-2 px-4 rounded-xl cursor-pointer"
 >
 Cancel
 </button>
 <button
 type="submit"
 className="bg-blue-600 dark:bg-blue-500 hover:bg-indigo-550 text-white font-bold p-2 px-5 rounded-xl cursor-pointer shadow-sm"
 >
 Confirm & Dispatch Ledger
 </button>
 </div>

 </form>

 </div>
 )}

 {/* 2. RECORD / PAY INVOICE BILL INLINE PANEL */}
 {showPaymentModal && (
 <div id="invoice-settlement-panel" className="bg-amber-50/20 border border-orange-200 w-full rounded-2xl p-5.5 space-y-4 mb-6 animate-fadeIn">
 
 <div className="flex justify-between items-center pb-2 border-b border-slate-250 select-none">
 <div className="flex items-center gap-1.5">
 <CreditCard className="w-4.5 h-4.5 text-orange-500" />
 <h3 className="font-sans text-xs font-bold uppercase text-slate-800 dark:text-slate-200 ">
 Record Commercial Settlement
 </h3>
 </div>
 <button 
 onClick={() => setShowPaymentModal(null)}
 className="p-1 rounded-lg hover:bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 cursor-pointer"
 >
 <X className="w-4.5 h-4.5" />
 </button>
 </div>

 <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-normal">
 Authorize bank transaction details or credit card logs for Invoice <strong className="text-slate-700 dark:text-slate-300 font-sans">{showPaymentModal.id}</strong> (Total Outstanding: ${showPaymentModal.outstandingBalance.toFixed(2)}):
 </p>

 <form onSubmit={handlePaymentSubmit} className="space-y-4 text-xs">
 
 <div>
 <label className="block text-sm font-sans text-slate-600 dark:text-slate-300 font-medium mb-1">Settlement Amount ($)</label>
 <input 
 type="number"
 required
 min="1"
 max={showPaymentModal.outstandingBalance}
 step="0.01"
 value={payAmount}
 onChange={e => setPayAmount(Number(e.target.value))}
 className="font-sans text-xl text-center font-bold text-orange-600 bg-slate-50 dark:bg-slate-800 border border-slate-250 rounded-xl p-3 w-full focus:outline-none"
 />
 </div>

 <div>
 <label className="block text-sm font-sans text-slate-600 dark:text-slate-300 font-medium mb-1.5">Payment Gateway / Channel</label>
 <div className="grid grid-cols-2 gap-2 select-none">
 {[
 { key: "credit_card", label: "Credit Card" },
 { key: "bank_transfer", label: "Bank Transfer" },
 { key: "check", label: "Corporate Check" },
 { key: "stripe", label: "Stripe Endpoint" }
 ].map(method => (
 <button
 key={method.key}
 type="button"
 onClick={() => setPayMethod(method.key as any)}
 className={`py-2 rounded-lg text-sm font-sans border transition-all cursor-pointer ${
 payMethod === method.key 
 ? 'border-blue-200 dark:border-blue-800 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 font-bold' 
 : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:bg-slate-800 '
 }`}
 >
 {method.label}
 </button>
 ))}
 </div>
 </div>

 <div>
 <label className="block text-sm font-sans text-slate-600 dark:text-slate-300 font-medium mb-1">Transaction Ref Code</label>
 <input 
 type="text"
 placeholder="e.g. txn_cardSecure85a0"
 value={paymentTxId}
 onChange={e => setPaymentTxId(e.target.value)}
 className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 rounded-lg p-2 font-sans focus:outline-none"
 />
 </div>

 <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 select-none">
 <button
 type="button"
 onClick={() => setShowPaymentModal(null)}
 className="bg-white dark:bg-slate-900 hover:bg-slate-150 border border-slate-250 text-slate-600 dark:text-slate-300 font-bold p-2 px-4 rounded-xl cursor-pointer"
 >
 Discard
 </button>
 <button
 type="submit"
 className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-500 text-white font-bold p-2 px-5 rounded-xl cursor-pointer shadow-sm"
 >
 Approve Settlement Receipt
 </button>
 </div>

 </form>

 </div>
 )}

 {/* 3. PRINT-READY MEDICAL PDF INVOICE TEMPLATE INLINE PANEL */}
 {showPdfView && (
 <div id="invoice-pdf-panel" className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full rounded-2xl p-5.5 space-y-4 mb-6 shadow-sm animate-fadeIn">
 
 {/* Header Dialog Controls - Hidden @media print */}
 <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700 print:hidden select-none">
 <div className="flex items-center gap-2">
 <Printer className="w-5 h-5 text-blue-600 dark:text-blue-400" />
 <h3 className="font-sans text-xs font-bold uppercase text-slate-800 dark:text-slate-200 ">
 Printers Clinic Slip Preview ({showPdfView.id})
 </h3>
 </div>
 <div className="flex gap-2">
 <button
 onClick={triggerPrintPdf}
 className="bg-blue-600 dark:bg-blue-500 hover:bg-indigo-550 text-slate-600 dark:text-slate-300 font-sans text-sm font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer shadow-xs"
 >
 <Printer className="w-3.5 h-3.5" /> Print Invoice
 </button>
 <button 
 onClick={() => setShowPdfView(null)}
 className="p-1 px-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 dark:text-slate-500 cursor-pointer"
 >
 <X className="w-4 h-4" />
 </button>
 </div>
 </div>

 {/* --- CLINICAL INVOICE TEMPLATE BODY (Optimized for Printer output) --- */}
 <div id="print-invoice-sheet" className="bg-white dark:bg-slate-900 text-slate-850 p-6 md:p-10 rounded-2xl border border-slate-150 relative space-y-6 text-xs max-h-[80vh] overflow-y-auto print:max-h-none print:w-full print:p-0 print:border-none select-all select-none print:select-text">
 
 {/* Slate Letterhead */}
 <div className="flex justify-between items-start gap-4">
 <div className="space-y-1">
 <div className="flex items-center gap-1.5">
 <span className="p-1.5 bg-gradient-to-tr from-blue-600 to-orange-500 rounded-lg text-white font-sans font-bold text-xs select-none">DS</span>
 <h1 className="text-base font-bold uppercase text-slate-900 dark:text-slate-50 tracking-tight">DENSYNC FABRICATION CO.</h1>
 </div>
 <p className="text-sm text-slate-450 font-medium font-sans">Precision CAD/CAM Sintering Dental Metallurgy</p>
 <div className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 font-sans">
 <div>100 Core Science Boulevard, Suite 500</div>
 <div>Boston, MA 02108, United States</div>
 <div>MTA Registry No: GST-8302X</div>
 </div>
 </div>

 <div className="text-right space-y-1 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-150">
 <h2 className="text-md font-extrabold text-slate-900 dark:text-slate-50 font-sans font-medium text-sm">TAX INVOICE</h2>
 <div className="font-sans text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 space-y-0.5">
 <div>Invoice No: <strong className="text-slate-850 font-bold">{showPdfView.id}</strong></div>
 {showPdfView.caseId && <div>Case Match ID: <strong className="text-slate-800 dark:text-slate-200">{showPdfView.caseId}</strong></div>}
 <div>Date Issued: {showPdfView.issuedDate}</div>
 <div>Due Date: <span className="font-bold text-slate-800 dark:text-slate-200">{showPdfView.dueDate}</span></div>
 </div>
 </div>
 </div>

 {/* Bill To Address Panel */}
 <div className="grid grid-cols-2 gap-6 pt-2">
 <div className="space-y-1">
 <h3 className="text-sm font-sans uppercase text-slate-450 tracking-wider">Bill To Client Accounts:</h3>
 <div className="text-sm font-bold text-slate-900 dark:text-slate-50">{showPdfView.clinicName}</div>
 <div className="text-sm text-slate-600 dark:text-slate-300 font-sans">
 <div>Attn: {showPdfView.dentistName}</div>
 <div>Apex Executive Dental Park</div>
 <div>Email: accounts@apex-dental.com</div>
 </div>
 </div>
 <div className="space-y-1">
 <h3 className="text-sm font-sans uppercase text-slate-450 tracking-wider">Remittance Route Details:</h3>
 <div className="text-sm font-sans text-slate-600 dark:text-slate-300 leading-normal.">
 <div>MTA Bank: Silicon Valley Health Group</div>
 <div>ACH Transit Code: <span className="font-semibold text-slate-800 dark:text-slate-200">48301AC</span></div>
 <div>Direct Account: <span className="font-semibold text-slate-800 dark:text-slate-200">10294-8501-83</span></div>
 <div>Reference: <span className="font-bold text-indigo-700">{showPdfView.id}</span></div>
 </div>
 </div>
 </div>

 {/* Itemized Table */}
 <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mt-4">
 <table className="w-full text-left border-collapse text-sm">
 <thead>
 <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 dark:text-slate-500 font-sans text-sm font-medium text-sm border-b border-slate-200 dark:border-slate-700">
 <th className="p-2.5 px-3">Item Index / Dental Restoration Service</th>
 <th className="p-2.5 text-center">Qty</th>
 <th className="p-2.5 text-right w-24">Unit Cost</th>
 <th className="p-2.5 text-right w-24">Total Amount</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-150 text-slate-700 dark:text-slate-300">
 {showPdfView.items.map((it, idx) => (
 <tr key={it.id}>
 <td className="p-2.5 px-3">
 <div className="font-semibold text-slate-850">{it.description}</div>
 <div className="text-sm text-slate-600 dark:text-slate-300 font-sans">Ref ID: {it.id}</div>
 </td>
 <td className="p-2.5 text-center font-sans">{it.quantity}</td>
 <td className="p-2.5 text-right font-sans">${it.unitPrice.toFixed(2)}</td>
 <td className="p-2.5 text-right font-sans font-bold text-slate-850">${it.amount.toFixed(2)}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 {/* Financial calculations */}
 <div className="flex justify-end pt-2 select-none">
 <div className="w-64 space-y-1.5 font-sans text-sm border-t border-slate-200 dark:border-slate-700 pt-3">
 <div className="flex justify-between">
 <span className="text-slate-450">SUBTOTAL (Gross):</span>
 <span className="text-slate-800 dark:text-slate-200">${showPdfView.subtotal.toFixed(2)}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-slate-450">GST (Surcharge {showPdfView.gstRate * 100}%):</span>
 <span className="text-slate-800 dark:text-slate-200">${showPdfView.gstAmount.toFixed(2)}</span>
 </div>
 <div className="flex justify-between border-t border-dashed border-slate-200 dark:border-slate-700 pt-1.5 text-sm font-bold text-slate-900 dark:text-slate-50 leading-normal">
 <span>TOTAL LIABILITIES (Net):</span>
 <span>${showPdfView.totalAmount.toFixed(2)}</span>
 </div>
 <div className="flex justify-between text-blue-600 dark:text-blue-400 font-semibold">
 <span>TOTAL SETTLED:</span>
 <span>-${showPdfView.totalPaid.toFixed(2)}</span>
 </div>
 <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 border-double pt-1.5 text-xs font-bold text-slate-900 dark:text-slate-50">
 <span>OUTSTANDING BALANCE:</span>
 <span className={showPdfView.outstandingBalance > 0 ? "text-rose-600" : "text-blue-600 dark:text-blue-400"}>
 ${showPdfView.outstandingBalance.toFixed(2)}
 </span>
 </div>
 </div>
 </div>

 {/* Remittance Compliance / Scan footer slip */}
 <div className="border-t border-slate-200 dark:border-slate-700 pt-6 flex justify-between items-center gap-6 select-none leading-normal">
 <div className="space-y-1 max-w-md">
 <div className="text-sm font-bold uppercase text-slate-600 dark:text-slate-300 tracking-wider">Certifications & HIPAA Legal Compliance:</div>
 <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-relaxed text-justified">
 This electronic transaction is authenticated under CMS billing directives. Restorations conform strictly to ADA-specified shrinkage matrices. Customer retains full liability for intraoral scan calibration deviations under standard indemnity bounds.
 </p>
 </div>

 {/* Simulated payment gateway QR seal */}
 <div className="flex flex-col items-center flex-shrink-0 text-center space-y-1">
 <div className="p-1 px-1.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg">
 <div className="w-16 h-16 bg-white dark:bg-slate-900 text-[6px] font-sans text-white flex flex-col items-center justify-center p-1 font-bold leading-normal">
 <div className="border border-white p-0.5 mb-1 bg-white dark:bg-slate-900 select-none">
 <div className="w-12 h-12 bg-white dark:bg-slate-900 flex items-center justify-center text-[5px] text-zinc-300 font-bold overflow-hidden">
 [DENSYNC SECURE QR]
 </div>
 </div>
 PAY ON WEB
 </div>
 </div>
 <span className="text-[8px] font-sans text-slate-600 dark:text-slate-300">Scan to settle ACH</span>
 </div>
 </div>

 </div>

 {/* Help guidelines at sheet bottom - Hidden @media print */}
 <div className="bg-slate-50 dark:bg-slate-800 #0a0f1d]/60 p-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-start gap-2.5 print:hidden select-none">
 <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
 <div className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-normal">
 <strong className="text-slate-800 dark:text-slate-200 block font-semibold mb-0.5">Print Optimization Notice</strong>
 We have generated a HIPAA compliance ledger. If you invoke the print action, the system will apply clean media queries to omit sidebar navigation, persona buttons, and outer wrappers for pristine physical medical invoices.
 </div>
 </div>

 </div>
 )}

 </div>
 );
}
