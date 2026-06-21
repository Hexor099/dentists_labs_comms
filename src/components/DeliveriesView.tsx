import React, { useState, useEffect } from "react";
import { 
 Truck, Package, PackageOpen, HelpCircle, MapPin, Copy, Clock,
 CheckCircle2, ArrowRight, ShieldAlert, Send, Search, Filter,
 Layers, User, Calendar, Check, Info, Clipboard, Activity, RefreshCw, AlertCircle
} from "lucide-react";
import { DeliveryRecord, UserRole } from "../types";

interface DeliveriesViewProps {
 activeRole: UserRole;
 cases: any[];
 onTransitionStatus: (caseId: string, status: string) => void;
 triggerGlobalToast: (msg: string) => void;
}

const CARRIERS = ["FedEx", "UPS", "DHL", "Local Courier"];

export default function DeliveriesView({
 activeRole,
 cases,
 onTransitionStatus,
 triggerGlobalToast
}: DeliveriesViewProps) {
 const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
 const [searchQuery, setSearchQuery] = useState("");
 const [statusFilter, setStatusFilter] = useState<"all" | "packed" | "shipped" | "out_for_delivery" | "delivered">("all");
 const [selectedDelivery, setSelectedDelivery] = useState<DeliveryRecord | null>(null);
 const [isRefreshing, setIsRefreshing] = useState(false);

 // Dispatch form state
 const [showDispatchForm, setShowDispatchForm] = useState(false);
 const [selectedCaseId, setSelectedCaseId] = useState("");
 const [carrier, setCarrier] = useState<"FedEx" | "UPS" | "DHL" | "Local Courier">("FedEx");
 const [trackingNumber, setTrackingNumber] = useState("");
 const [estDeliveryDate, setEstDeliveryDate] = useState("");
 const [notes, setNotes] = useState("");

 // Update status form state
 const [showStatusModal, setShowStatusModal] = useState<DeliveryRecord | null>(null);
 const [nextStatus, setNextStatus] = useState<"packed" | "shipped" | "out_for_delivery" | "delivered">("shipped");
 const [currentLocation, setCurrentLocation] = useState("");
 const [recipientSignee, setRecipientSignee] = useState("");
 const [updateNotes, setUpdateNotes] = useState("");

 // Simulated live API terminal output
 const [apiLogs, setApiLogs] = useState<string[]>([
 "INFO: Carrier webhooks registered successfully (FedEx Web Services v3.1).",
 "INFO: Local Courier GPS vehicle dispatcher initialized on routing Port 3000.",
 ]);

 const loadDeliveries = () => {
 setIsRefreshing(true);
 fetch("/api/deliveries")
 .then(res => res.json())
 .then(data => {
 if (data.deliveries) {
 setDeliveries(data.deliveries);
 // Auto-select first delivery if none selected
 if (data.deliveries.length > 0 && !selectedDelivery) {
 setSelectedDelivery(data.deliveries[0]);
 } else if (selectedDelivery) {
 const updated = data.deliveries.find((d: any) => d.id === selectedDelivery.id);
 if (updated) setSelectedDelivery(updated);
 }
 }
 setIsRefreshing(false);
 })
 .catch(err => {
 console.error("Failed to load deliveries:", err);
 triggerGlobalToast("Error connecting to dispatch registry.");
 setIsRefreshing(false);
 });
 };

 useEffect(() => {
 loadDeliveries();

 // Re-verify updates every 6 seconds to simulate true live transit data
 const timer = setInterval(() => {
 fetch("/api/deliveries")
 .then(res => res.json())
 .then(data => {
 if (data.deliveries) {
 setDeliveries(data.deliveries);
 // Sync selected
 if (selectedDelivery) {
 const updated = data.deliveries.find((d: any) => d.id === selectedDelivery.id);
 if (updated && JSON.stringify(updated) !== JSON.stringify(selectedDelivery)) {
 setSelectedDelivery(updated);
 }
 }
 }
 })
 .catch(err => console.log("Silent background transit sync failed:", err));
 }, 6000);

 return () => clearInterval(timer);
 }, []);

 const handleCopyTracking = (num: string) => {
 navigator.clipboard.writeText(num);
 triggerGlobalToast("Tracking number copied to clipboard!");
 setApiLogs(prev => [
 `GUEST: Client clicked tracking link copy-state: ${num}`,
 ...prev
 ]);
 };

 const handleDispatchSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (!selectedCaseId) {
 triggerGlobalToast("Error: Please select a physical case to pack.");
 return;
 }

 const linkedCase = cases.find(c => c.id === selectedCaseId);
 if (!linkedCase) return;

 const payload = {
 caseId: selectedCaseId,
 patientInitials: linkedCase.patientInitials,
 dentistName: linkedCase.dentistName,
 clinicName: linkedCase.clinicName,
 carrier,
 trackingNumber: trackingNumber || undefined,
 notes: notes || undefined,
 estimatedDeliveryDate: estDeliveryDate || undefined
 };

 fetch("/api/deliveries", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify(payload)
 })
 .then(res => res.json())
 .then(data => {
 if (data.success) {
 triggerGlobalToast(`Case ${selectedCaseId} successfully packed & registered! Code ${data.delivery.id}`);
 onTransitionStatus(selectedCaseId, "Completed");
 
 setApiLogs(prev => [
 `API OUTBOUND: POST /api/deliveries - Staged ${data.delivery.id}. SOAP client callback OK.`,
 ...prev
 ]);

 // Clear form & refresh
 setSelectedCaseId("");
 setTrackingNumber("");
 setEstDeliveryDate("");
 setNotes("");
 setShowDispatchForm(false);
 loadDeliveries();
 } else {
 triggerGlobalToast("Error: " + (data.error || "Failed to register shipment"));
 }
 })
 .catch(err => {
 console.error(err);
 triggerGlobalToast("Failed to dispatch due to server-side error.");
 });
 };

 const handleStatusUpdateSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (!showStatusModal) return;

 const payload = {
 status: nextStatus,
 location: currentLocation || undefined,
 recipientSignee: nextStatus === "delivered" ? (recipientSignee || "Clinic Staff") : undefined,
 notes: updateNotes || undefined
 };

 fetch(`/api/deliveries/${showStatusModal.id}/status`, {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify(payload)
 })
 .then(res => res.json())
 .then(data => {
 if (data.success) {
 triggerGlobalToast(`Delivery ${showStatusModal.id} status advanced to ${nextStatus.toUpperCase()}`);
 
 setApiLogs(prev => [
 `MTA INTENT: Propagated transit code [${nextStatus.toUpperCase()}] for parcel ${showStatusModal.id}. SMTP client executed.`,
 ...prev
 ]);

 // Reset case in app state if status is delivered
 if (nextStatus === "delivered") {
 onTransitionStatus(showStatusModal.caseId, "Completed");
 }

 setCurrentLocation("");
 setRecipientSignee("");
 setUpdateNotes("");
 setShowStatusModal(null);
 loadDeliveries();
 } else {
 triggerGlobalToast("Error: " + (data.error || "Failed to update status"));
 }
 })
 .catch(err => {
 console.error(err);
 triggerGlobalToast("Error connecting to logistics controller.");
 });
 };

 // Filter deliveries based on search & state filter & roles
 const getFilteredDeliveries = () => {
 return deliveries.filter(del => {
 // Dentist Catherine Vance sees only her clinic deliveries
 const matchesRole = activeRole === UserRole.DENTIST
 ? del.dentistName.includes("Vance") || del.clinicName.includes("Apex")
 : true;

 const matchesStatus = statusFilter === "all" || del.status === statusFilter;
 const query = searchQuery.toLowerCase();
 const matchesQuery = 
 del.id.toLowerCase().includes(query) ||
 del.clinicName.toLowerCase().includes(query) ||
 del.caseId.toLowerCase().includes(query) ||
 del.trackingNumber.toLowerCase().includes(query) ||
 del.dentistName.toLowerCase().includes(query);

 return matchesRole && matchesStatus && matchesQuery;
 });
 };

 // Statistics summaries
 const totalPackages = deliveries.length;
 const packedPackages = deliveries.filter(d => d.status === "packed").length;
 const inTransitPackages = deliveries.filter(d => d.status === "shipped" || d.status === "out_for_delivery").length;
 const deliveredPackages = deliveries.filter(d => d.status === "delivered").length;

 return (
 <div id="deliveries-management-portal" className="space-y-6 animate-fadeIn text-slate-800 dark:text-slate-200 ">
 
 {/* Title block */}
 <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700 ">
 <div>
 <h2 className="text-sm font-bold font-medium text-slate-850 flex items-center gap-1.5">
 <Truck className="w-5 h-5 text-blue-500 " />
 Courier Delivery & Dispatch Control
 </h2>
 <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
 Real-time mechanical pan package tracking, carrier logistics, and clinical delivery handoffs
 </p>
 </div>
 <button 
 onClick={loadDeliveries}
 className="flex items-center gap-1 px-2.5 py-1 text-sm font-sans bg-white dark:bg-slate-900 hover:bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xs cursor-pointer transition-colors"
 >
 <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-blue-500" : ""}`} />
 Refresh
 </button>
 </div>

 {/* Metrics Dashboard Row */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4.5 shadow-xs flex items-center gap-4">
 <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
 <Package className="w-5 h-5 text-indigo-550 " />
 </div>
 <div>
 <p className="text-sm text-slate-600 dark:text-slate-300 font-sans font-bold uppercase tracking-wide">Total Logged</p>
 <h4 className="text-lg font-extrabold font-sans text-slate-800 dark:text-slate-200 mt-0.5">{totalPackages} Parcels</h4>
 </div>
 </div>

 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4.5 shadow-xs flex items-center gap-4">
 <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
 <PackageOpen className="w-5 h-5 text-blue-600 dark:text-blue-400 " />
 </div>
 <div>
 <p className="text-sm text-blue-600 dark:text-blue-400 font-sans font-bold uppercase tracking-wide">Packed / Staged</p>
 <h4 className="text-lg font-extrabold font-sans text-blue-700 dark:text-blue-300 mt-0.5">{packedPackages} Loaded</h4>
 </div>
 </div>

 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4.5 shadow-xs flex items-center gap-4">
 <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
 <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400 " />
 </div>
 <div>
 <p className="text-sm text-blue-450 font-sans font-bold uppercase tracking-wide">In Transit</p>
 <h4 className="text-lg font-extrabold font-sans text-blue-700 dark:text-blue-300 mt-0.5">{inTransitPackages} Shipped</h4>
 </div>
 </div>

 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4.5 shadow-xs flex items-center gap-4">
 <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
 <CheckCircle2 className="w-5 h-5 text-orange-600 " />
 </div>
 <div>
 <p className="text-sm text-orange-600 font-sans font-bold uppercase tracking-wide">Delivered Signed</p>
 <h4 className="text-lg font-extrabold font-sans text-orange-700 mt-0.5">{deliveredPackages} Done</h4>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

 {/* SHIPMENTS LIST COLUMN (5 Cols) */}
 <div className="lg:col-span-5 space-y-4">
 
 {/* Controls: Search and Add Dispatch */}
 <div className="bg-white dark:bg-slate-900 #070c17] border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-3 shadow-xs">
 
 <div className="flex gap-2">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-600 dark:text-slate-300" />
 <input 
 type="text" 
 placeholder="ID, clinic, carrier or tracking..." 
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full text-xs font-sans bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 outline-hidden focus:border-blue-200 dark:border-blue-800"
 />
 </div>
 
 {/* Dispatch trigger trigger for Lab Admin */}
 {(activeRole === UserRole.LAB_ADMIN || activeRole === UserRole.SUPER_ADMIN) && (
 <button 
 onClick={() => setShowDispatchForm(!showDispatchForm)}
 className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer transition-all"
 >
 <Package className="w-3.5 h-3.5" />
 Pack Order
 </button>
 )}
 </div>

 {/* Filter buttons */}
 <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800 ">
 {(["all", "packed", "shipped", "out_for_delivery", "delivered"] as const).map(f => (
 <button
 key={f}
 onClick={() => setStatusFilter(f)}
 className={`px-2 py-1 text-sm font-sans rounded-md border capitalize cursor-pointer transition-colors ${
 statusFilter === f 
 ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-white "
 : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-slate-700 dark:text-slate-300"
 }`}
 >
 {f.replace(/_/g, " ")}
 </button>
 ))}
 </div>
 </div>

 {/* Active Dispatch Add Form Accordion */}
 {showDispatchForm && (
 <div className="bg-blue-50 dark:bg-blue-900/20/50 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 shadow-sm animate-fadeIn space-y-3">
 <div className="flex justify-between items-center pb-2 border-b border-blue-100 ">
 <span className="text-xs font-bold font-sans uppercase text-blue-800 dark:text-blue-200 flex items-center gap-1">
 <Package className="w-3.5 h-3.5" />
 Register Delivery Shipment
 </span>
 <button onClick={() => setShowDispatchForm(false)} className="text-slate-600 dark:text-slate-300 hover:text-slate-600 dark:text-slate-300 text-xs">✕</button>
 </div>

 <form onSubmit={handleDispatchSubmit} className="space-y-3.5">
 <div>
 <label className="block text-sm font-sans font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">Select Case</label>
 <select
 value={selectedCaseId}
 onChange={(e) => {
 setSelectedCaseId(e.target.value);
 const currentCase = cases.find(c => c.id === e.target.value);
 if (currentCase) {
 setNotes(`Dental Restoration for Initials [${currentCase.patientInitials}]. Checked and sterile.`);
 }
 }}
 required
 className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 outline-hidden focus:border-blue-200 dark:border-blue-800"
 >
 <option value="">-- Choose active restoration case --</option>
 {cases.map(c => (
 <option key={c.id} value={c.id}>
 [{c.id}] - Initials: {c.patientInitials} ({c.caseType} - {c.status})
 </option>
 ))}
 </select>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-sm font-sans font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">Carrier Provider</label>
 <select
 value={carrier}
 onChange={(e) => setCarrier(e.target.value as any)}
 className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 outline-hidden"
 >
 {CARRIERS.map(c => <option key={c} value={c}>{c}</option>)}
 </select>
 </div>
 <div>
 <label className="block text-sm font-sans font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">Estimated Date (Optional)</label>
 <input 
 type="date" 
 value={estDeliveryDate}
 onChange={(e) => setEstDeliveryDate(e.target.value)}
 className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 outline-hidden"
 />
 </div>
 </div>

 <div>
 <label className="block text-sm font-sans font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">Custom Tracking Number (Omit to draft)</label>
 <input 
 type="text" 
 placeholder="e.g. FDX-682194-US" 
 value={trackingNumber}
 onChange={(e) => setTrackingNumber(e.target.value)}
 className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 outline-hidden"
 />
 <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">If empty, our simulated multi-carrier driver auto-assigns API coordinates.</p>
 </div>

 <div>
 <label className="block text-sm font-sans font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">Courier Packaging Notes</label>
 <textarea
 rows={2}
 placeholder="Fragile Zirconia unit. Signature required."
 value={notes}
 onChange={(e) => setNotes(e.target.value)}
 className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 outline-hidden"
 />
 </div>

 <div className="flex justify-end gap-2 pt-1">
 <button 
 type="button" 
 onClick={() => setShowDispatchForm(false)}
 className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-700 dark:text-slate-300"
 >
 Cancel
 </button>
 <button 
 type="submit" 
 className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 rounded-lg cursor-pointer"
 >
 Finalize & Pack
 </button>
 </div>
 </form>
 </div>
 )}

 {/* List Feed cards */}
 <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
 {getFilteredDeliveries().length === 0 ? (
 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center">
 <Package className="w-8 h-8 text-slate-600 dark:text-slate-300 mx-auto mb-2" />
 <p className="text-xs text-slate-600 dark:text-slate-300">No active shipping records found match queries.</p>
 </div>
 ) : (
 getFilteredDeliveries().map(del => {
 const isSelected = selectedDelivery?.id === del.id;
 let badgeColor = "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 ";
 
 if (del.status === "shipped") badgeColor = "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 ";
 if (del.status === "out_for_delivery") badgeColor = "bg-amber-50 text-amber-700 ";
 if (del.status === "delivered") badgeColor = "bg-orange-50 dark:bg-orange-900/20 text-orange-700 ";

 return (
 <div 
 key={del.id}
 onClick={() => setSelectedDelivery(del)}
 className={`bg-white dark:bg-slate-900 border p-4 rounded-xl shadow-xs cursor-pointer transition-all ${
 isSelected 
 ? "border-orange-500 ring-1 ring-orange-500/20" 
 : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600"
 }`}
 >
 <div className="flex justify-between items-start gap-2">
 <div>
 <span className="text-sm font-sans font-bold text-slate-600 dark:text-slate-300">ID: {del.id}</span>
 <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">Patient Initials: <span className="font-sans text-blue-600 dark:text-blue-400 ">{del.patientInitials}</span></h4>
 <p className="text-sm text-slate-550 mt-1">{del.clinicName}</p>
 </div>

 <div className="text-right flex flex-col items-end gap-1.5">
 <span className={`px-2 py-0.5 text-sm font-sans font-bold uppercase rounded-md ${badgeColor}`}>
 {del.status.replace(/_/g, " ")}
 </span>
 <span className="text-sm font-sans text-slate-600 dark:text-slate-300 flex items-center gap-1">
 <Layers className="w-3 h-3 text-slate-600 dark:text-slate-300" />
 #{del.caseId}
 </span>
 </div>
 </div>

 <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-sm font-sans text-slate-600 dark:text-slate-300 ">
 <span>{del.carrier}</span>
 <span className="text-slate-600 dark:text-slate-300 truncate max-w-[130px]">{del.trackingNumber}</span>
 </div>
 </div>
 );
 })
 )}
 </div>
 </div>

 {/* DETAILED PATH TRACKER COLUMN (7 Cols) */}
 <div className="lg:col-span-12 xl:col-span-7 space-y-4">
 {selectedDelivery ? (
 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-6 space-y-6">
 
 {/* Detailed Header Info */}
 <div className="flex justify-between items-start flex-wrap gap-4 pb-4.5 border-b border-slate-150 ">
 <div>
 <div className="flex items-center gap-2 flex-wrap">
 <span className="text-xs px-2.5 py-0.5 font-sans font-bold bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded">
 SHIPMENT REFERENCE: {selectedDelivery.id}
 </span>
 <span className="text-xs text-slate-600 dark:text-slate-300 font-sans">Linked Case: #{selectedDelivery.caseId}</span>
 </div>
 <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-3">
 Practice Delivery: <span className="text-blue-600 dark:text-blue-400 ">{selectedDelivery.clinicName}</span>
 </h3>
 <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-1.5">
 <User className="w-3.5 h-3.5" />
 Doctor-in-Charge: {selectedDelivery.dentistName}
 </p>
 </div>

 {/* Lab admin status updater */}
 {(activeRole === UserRole.LAB_ADMIN || activeRole === UserRole.SUPER_ADMIN) && (
 <button
 onClick={() => {
 setShowStatusModal(selectedDelivery);
 // Predict next status
 const idx = ["packed", "shipped", "out_for_delivery", "delivered"].indexOf(selectedDelivery.status);
 const next = ["packed", "shipped", "out_for_delivery", "delivered"][Math.min(3, idx + 1)] as any;
 setNextStatus(next);
 }}
 className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 dark:bg-blue-500 hover:bg-indigo-700 rounded-lg shadow-sm cursor-pointer transition-colors"
 >
 <Activity className="w-3.5 h-3.5" />
 Advance Transit
 </button>
 )}
 </div>

 {/* Physical horizontal milestone tracker */}
 <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
 <h5 className="text-sm font-sans font-bold uppercase text-slate-600 dark:text-slate-300 tracking-wider mb-4">Transit Flow Roadmap</h5>
 
 <div className="flex justify-between items-center relative select-none">
 <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200 -z-0"></div>

 {(["packed", "shipped", "out_for_delivery", "delivered"] as const).map((step, idx) => {
 const statuses = ["packed", "shipped", "out_for_delivery", "delivered"];
 const currentIdx = statuses.indexOf(selectedDelivery.status);
 const isCompleted = idx <= currentIdx;
 const isActive = idx === currentIdx;

 let stepIcon = <Package className="w-3.5 h-3.5" />;
 if (step === "shipped") stepIcon = <Truck className="w-3.5 h-3.5" />;
 if (step === "out_for_delivery") stepIcon = <MapPin className="w-3.5 h-3.5" />;
 if (step === "delivered") stepIcon = <Check className="w-3.5 h-3.5" />;

 return (
 <div key={step} className="flex flex-col items-center relative z-10 text-center w-1/4">
 <div className={`p-2 rounded-full border transition-all ${
 isActive 
 ? "bg-orange-500 border-orange-500 text-white animate-pulse" 
 : isCompleted 
 ? "bg-orange-50 dark:bg-orange-900/20 border-orange-500 text-orange-600 "
 : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
 }`}>
 {stepIcon}
 </div>
 <span className={`text-sm font-sans font-semibold capitalize mt-1.5 block ${
 isActive 
 ? "text-orange-600 font-bold" 
 : isCompleted 
 ? "text-slate-700 dark:text-slate-300 "
 : "text-slate-600 dark:text-slate-300"
 }`}>
 {step.replace(/_/g, " ")}
 </span>
 </div>
 );
 })}
 </div>
 </div>

 {/* Courier Specifics Container */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="border border-slate-150 p-4 rounded-xl space-y-3">
 <h5 className="text-sm font-sans font-bold uppercase text-slate-600 dark:text-slate-300 ">Logistics Carrier Details</h5>
 <div className="space-y-2">
 <p className="text-xs">
 <span className="text-slate-600 dark:text-slate-300 mr-2">Carrier:</span>
 <strong className="text-slate-800 dark:text-slate-200 font-sans">{selectedDelivery.carrier}</strong>
 </p>
 <div className="text-xs flex items-center justify-between gap-2.5">
 <span className="text-slate-600 dark:text-slate-300">Tracking Code:</span>
 <div className="flex items-center gap-1.5 font-sans">
 <strong className="text-blue-600 dark:text-blue-400 truncate max-w-[120px]">{selectedDelivery.trackingNumber}</strong>
 <button 
 onClick={() => handleCopyTracking(selectedDelivery.trackingNumber)}
 className="p-1 hover:bg-slate-100 dark:bg-slate-800/80 rounded cursor-pointer"
 >
 <Copy className="w-3 h-3 text-slate-600 dark:text-slate-300 hover:text-slate-600 dark:text-slate-300" />
 </button>
 </div>
 </div>
 </div>
 </div>

 <div className="border border-slate-150 p-4 rounded-xl space-y-3">
 <h5 className="text-sm font-sans font-bold uppercase text-slate-600 dark:text-slate-300 font-medium">Estimated Delivery Timeline</h5>
 <div className="space-y-2">
 <p className="text-xs flex items-center gap-1">
 <Calendar className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
 <span className="text-slate-600 dark:text-slate-300">Est. Dispatch Date:</span>
 <strong className="text-slate-850 ">{selectedDelivery.estimatedDeliveryDate || "Not Provided"}</strong>
 </p>
 {selectedDelivery.shippedDate && (
 <p className="text-xs">
 <span className="text-slate-600 dark:text-slate-300 mr-2">Gate Hand-off:</span>
 <strong className="text-slate-850 ">{selectedDelivery.shippedDate}</strong>
 </p>
 )}
 {selectedDelivery.status === "delivered" && (
 <div className="text-xs p-2.5 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-100 space-y-1">
 <p className="font-extrabold text-orange-800 ">Final Hand-off Secured</p>
 <p className="text-sm text-slate-600 dark:text-slate-300 ">Signed: <strong>{selectedDelivery.recipientSignee || "Clinic Staff"}</strong></p>
 <p className="text-sm text-slate-600 dark:text-slate-300 font-sans">On: {selectedDelivery.deliveredDate}</p>
 </div>
 )}
 </div>
 </div>
 </div>

 {/* History Milestones Chronological Stack */}
 <div className="space-y-3">
 <h4 className="text-sm font-sans font-bold uppercase text-slate-600 dark:text-slate-300 tracking-wider">Chronological Tracking Milestones</h4>
 
 <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-150">
 {selectedDelivery.milestones.map((ms, idx) => (
 <div key={idx} className="relative space-y-1.5 animate-fadeIn">
 
 {/* Active orange dot or standard gray dot */}
 <div className={`absolute -left-[20px] top-1.5 w-2.5 h-2.5 rounded-full border-2 ${
 idx === selectedDelivery.milestones.length - 1
 ? "bg-orange-500 border-white ring-4 ring-orange-500/20 scale-110"
 : "bg-slate-300 border-white "
 }`}></div>

 <div className="flex justify-between items-start gap-4">
 <h5 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 ">{ms.title}</h5>
 <span className="text-sm font-sans text-slate-600 dark:text-slate-300">
 {new Date(ms.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
 </span>
 </div>

 <p className="text-sm text-slate-550 leading-relaxed">{ms.description}</p>
 
 {ms.location && (
 <div className="flex items-center gap-1 text-sm font-sans text-slate-600 dark:text-slate-300">
 <MapPin className="w-3 h-3 text-slate-600 dark:text-slate-300" />
 <span>{ms.location}</span>
 </div>
 )}
 </div>
 ))}
 </div>
 </div>

 </div>
 ) : (
 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center shadow-xs">
 <Truck className="w-12 h-12 text-slate-600 dark:text-slate-300 mx-auto mb-3" />
 <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 ">Logistics Overview</h4>
 <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto mt-1">
 Select any package on the list to inspect physical milestones, copy tracking IDs, and manage transitions.
 </p>
 </div>
 )}

 {/* COURIER INTEGRATION MOCK API DIAGNOSTIC (Simulation) */}
 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 font-sans shadow-sm text-blue-600 dark:text-blue-400 space-y-3.5">
 <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
 <span className="text-sm font-semibold text-sm flex items-center gap-1.5">
 <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-pulse" />
 Live Courier Integration Engine (Simulated)
 </span>
 <span className="text-sm bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
 ACTIVE
 </span>
 </div>

 <div className="space-y-1.5 text-sm max-h-[120px] overflow-y-auto font-sans scrollbar-thin">
 {apiLogs.map((log, idx) => (
 <div key={idx} className="leading-5">
 <span className="text-slate-600 dark:text-slate-300 mr-1 opacity-60">[{new Date().toLocaleTimeString()}]</span>
 <span>{log}</span>
 </div>
 ))}
 </div>
 </div>
 </div>

 </div>

 {/* UPDATE STATUS TRANSIT ROADMAP INLINE PANEL */}
 {showStatusModal && (
 <div id="advance-shipping-panel" className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5.5 rounded-2xl shadow-xs space-y-4 mb-4.5 animate-fadeIn">
 
 <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800 ">
 <h4 className="text-xs font-bold font-sans uppercase text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
 <Activity className="w-4 h-4" />
 Advance Shipping Transit Status: {showStatusModal.id}
 </h4>
 <button onClick={() => setShowStatusModal(null)} className="text-slate-600 dark:text-slate-300 hover:text-slate-600 dark:text-slate-300">✕</button>
 </div>

 <form onSubmit={handleStatusUpdateSubmit} className="space-y-4">
 <div>
 <label className="block text-sm font-sans font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">Target Transit Milestone</label>
 <div className="grid grid-cols-2 gap-2">
 {(["packed", "shipped", "out_for_delivery", "delivered"] as const).map(st => (
 <button
 key={st}
 type="button"
 onClick={() => setNextStatus(st)}
 className={`px-3 py-2 text-xs font-sans rounded-lg border capitalize cursor-pointer transition-colors ${
 nextStatus === st 
 ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-white "
 : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 "
 }`}
 >
 {st.replace(/_/g, " ")}
 </button>
 ))}
 </div>
 </div>

 <div>
 <label className="block text-sm font-sans font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">Current Scan Location</label>
 <input 
 type="text" 
 placeholder="e.g. FedEx Concord Sort Depot" 
 value={currentLocation}
 onChange={(e) => setCurrentLocation(e.target.value)}
 className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 outline-hidden focus:border-blue-200 dark:border-blue-800"
 />
 </div>

 {nextStatus === "delivered" && (
 <div>
 <label className="block text-sm font-sans font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">Recipient Signing Representative</label>
 <input 
 type="text" 
 placeholder="e.g. Receptionist Karen S." 
 value={recipientSignee}
 onChange={(e) => setRecipientSignee(e.target.value)}
 required
 className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 outline-hidden focus:border-blue-200 dark:border-blue-800"
 />
 </div>
 )}

 <div>
 <label className="block text-sm font-sans font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">Additional Transit Notes</label>
 <textarea
 rows={2}
 placeholder="Carrier driver scan, cargo checked in."
 value={updateNotes}
 onChange={(e) => setUpdateNotes(e.target.value)}
 className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 outline-hidden"
 />
 </div>

 <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 ">
 <button 
 type="button" 
 onClick={() => setShowStatusModal(null)}
 className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-700 dark:text-slate-300"
 >
 Cancel
 </button>
 <button 
 type="submit" 
 className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 rounded-lg cursor-pointer"
 >
 Confirm Transit Update
 </button>
 </div>
 </form>
 </div>
 )}

 </div>
 );
}
