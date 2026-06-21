import React, { useState, useEffect } from "react";
import { 
 ClipboardList, Clock, Plus, Check, AlertCircle, Eye, EyeOff,
 FileText, Image as ImageIcon, FileUp, CheckCircle2, User, 
 ShieldAlert, Workflow, History, Send, Database, Code, Trash2, 
 Users, FileCheck, ArrowRight, Save, Calendar, Info, X, MessageCircle
} from "lucide-react";
import { UserRole } from "../types";

export enum CaseType {
 CROWN = "Crown",
 BRIDGE = "Bridge",
 VENEER = "Veneer",
 IMPLANT = "Implant"
}

export enum CaseStatus {
 CREATED = "Created",
 RECEIVED = "Received",
 ASSIGNED = "Assigned",
 IN_PRODUCTION = "In Production",
 QUALITY_CHECK = "Quality Check",
 READY_FOR_DISPATCH = "Ready for Dispatch",
 COMPLETED = "Completed"
}

interface CaseViewItem {
 id: string;
 patientInitials: string;
 caseType: string;
 status: string;
 dueDate: string;
 dentistName: string;
 clinicName: string;
 instructions: string;
}

interface CasesViewProps {
 cases: CaseViewItem[];
 activeRole: UserRole;
 onAddCase: (newCase: any) => void;
 onTransitionStatus: (caseId: string, status: any) => void;
 triggerGlobalToast: (msg: string) => void;
}

export default function CasesView({
 cases,
 activeRole,
 onAddCase,
 onTransitionStatus,
 triggerGlobalToast
}: CasesViewProps) {
 
 // Dentist Form state
 const [initials, setInitials] = useState("");
 const [caseType, setCaseType] = useState(CaseType.CROWN);
 const [dueDate, setDueDate] = useState("");
 const [instructions, setInstructions] = useState("");

 const [scanFiles, setScanFiles] = useState<any[]>([]);

 const handleDragOver = (e: React.DragEvent) => {
 e.preventDefault();
 };

 const handleDrop = (e: React.DragEvent) => {
 e.preventDefault();
 if (e.dataTransfer.files) {
 const filesArray = Array.from(e.dataTransfer.files).map((f: any) => ({ name: f.name, size: `${(f.size / 1024 / 1024).toFixed(1)} MB` }));
 setScanFiles(prev => [...prev, ...filesArray]);
 triggerGlobalToast(`Loaded scan files for alignment verification.`);
 }
 };

 const handleFormSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (!initials.trim()) {
 triggerGlobalToast("Error: Patient monogram initials are required.");
 return;
 }
 // HIPAA sanity validation (no spaces/numbers beyond initials)
 if (initials.length > 4 || !/^[A-Z.\s]+$/i.test(initials)) {
 triggerGlobalToast("HIPAA Privacy Block: Please input initials only (e.g. R. M.) to protect patient personal indicators.");
 return;
 }
 if (!dueDate) {
 triggerGlobalToast("Error: Target delivery due date must represent a future workspace calendar threshold.");
 return;
 }

 const newMockId = `CS-00${cases.length + 1}`;
 onAddCase({
 id: newMockId,
 patientInitials: initials.toUpperCase().trim(),
 caseType,
 dueDate,
 dentistName: "Dr. Catherine Vance",
 clinicName: "Apex Cosmetic Dentistry Inc.",
 status: CaseStatus.CREATED,
 instructions: instructions || "Standard Vita A2 translucency index cap requested."
 });

 setInitials("");
 setDueDate("");
 setInstructions("");
 setScanFiles([]);
 triggerGlobalToast(`Successfully registered new restoration Case: ${newMockId}!`);
 };

 // Filter cases visible to the active simulated user role
 const getSimulatedFilteredCases = () => {
 if (activeRole === UserRole.TECHNICIAN) {
 // Tech-marcus sees cases assigned to Marcus Aurelius (we can show case-001 or any assigned case)
 return cases.filter(c => c.id === "case-001" || c.status === "In Production" || c.status === "Quality Check");
 }
 return cases;
 };

 return (
 <div id="cases-workspace-module" className="space-y-6 animate-fadeIn">
 
 {/* Title block */}
 <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700 ">
 <div>
 <h2 className="text-sm font-bold font-medium text-slate-850 flex items-center gap-1.5">
 <ClipboardList className="w-5 h-5 text-indigo-550 " />
 Restoration Workspace & Timeline
 </h2>
 <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-0.5">Clinical crown & bridge milling queues connected via secure endpoints</p>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
 
 {/* Cases timeline feed column (7 columns) */}
 <div className="lg:col-span-7 space-y-4">
 <div className="space-y-4">
 {getSimulatedFilteredCases().map(c => (
 <div key={c.id} className="bg-white dark:bg-slate-900 #0a0f1d] border border-slate-200 dark:border-slate-700 p-5 rounded-2xl shadow-sm hover:border-slate-350 transition-all space-y-4.5">
 <div className="flex justify-between items-start flex-wrap gap-2">
 <div>
 <div className="flex items-center gap-2">
 <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
 Patient Initial: <span className="text-blue-600 dark:text-blue-400 font-sans bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded ml-1 font-extrabold shadow-xs">{c.patientInitials}</span>
 </h4>
 <span className="text-sm bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 dark:text-slate-500 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-sans font-bold shadow-xs">
 ID: {c.id}
 </span>
 </div>
 <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Practice: <strong className="text-slate-750 ">{c.dentistName}</strong> ({c.clinicName})</p>
 </div>

 <div className="text-right">
 <span className={`inline-block px-2 py-0.5 rounded text-sm font-sans font-bold uppercase border ${
 c.status === "Created" ? "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 " :
 c.status === "Received" ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 " :
 c.status === "Assigned" ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 text-indigo-700 " :
 c.status === "In Production" ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 text-orange-700 " :
 c.status === "Quality Check" ? "bg-yellow-50 border-yellow-200 text-yellow-700 " :
 "bg-orange-50 dark:bg-orange-900/20 border-orange-100 text-orange-700 "
 }`}>
 {c.status}
 </span>
 <span className="text-sm text-slate-450 block font-sans font-semibold mt-1 flex items-center justify-end gap-1">
 <Calendar className="w-3 h-3" /> Due: <strong className="text-slate-750 ">{c.dueDate}</strong>
 </span>
 </div>
 </div>

 {/* Technical specifics block */}
 <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
 <div>
 <span className="text-sm font-sans uppercase text-slate-450 block font-bold">Restoration Element:</span>
 <span className="text-indigo-755 font-semibold block mt-0.5">{c.caseType}</span>
 </div>
 <div>
 <span className="text-sm font-sans uppercase text-slate-450 block font-bold">Clinical Instructions & shade:</span>
 <p className="text-slate-600 dark:text-slate-300 italic text-sm mt-0.5">"{c.instructions}"</p>
 </div>
 </div>

 {/* Workflow advancing controls */}
 <div className="flex justify-between items-center pt-2.5 border-t border-slate-200 dark:border-slate-700 flex-wrap gap-2 select-none">
 <div className="flex gap-1.5 flex-wrap">
 <span className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-sans px-2 py-1 rounded text-slate-550 shadow-xs">
 <FileText className="w-3 h-3 text-blue-600 dark:text-blue-400 " /> scan_voxel_molar_#30.ply
 </span>
 </div>

 <div className="flex gap-2">
 {activeRole === UserRole.LAB_ADMIN && c.status === "Created" && (
 <button
 onClick={() => {
 onTransitionStatus(c.id, "Received");
 triggerGlobalToast("Case transitioned to RECEIVED state!");
 }}
 className="p-1 px-3 bg-blue-600 dark:bg-blue-500 hover:bg-blue-500 text-slate-600 dark:text-slate-300 font-bold text-sm rounded-lg cursor-pointer font-sans shadow-sm"
 >
 Receive Order
 </button>
 )}

 {activeRole === UserRole.LAB_ADMIN && c.status === "Received" && (
 <button
 onClick={() => {
 onTransitionStatus(c.id, "Assigned");
 triggerGlobalToast("Restoration assigned to specialist technician.");
 }}
 className="p-1 px-3 bg-blue-600 dark:bg-blue-500 hover:bg-blue-600 dark:bg-blue-500 text-slate-600 dark:text-slate-300 font-bold text-sm rounded-lg cursor-pointer font-sans shadow-sm"
 >
 Assign tech
 </button>
 )}

 {activeRole === UserRole.TECHNICIAN && c.status === "Assigned" && (
 <button
 onClick={() => {
 onTransitionStatus(c.id, "In Production");
 triggerGlobalToast("Milling / Heat sintering initiated.");
 }}
 className="p-1.5 px-3 bg-orange-600 hover:bg-orange-500 text-slate-600 dark:text-slate-300 font-bold text-sm rounded-lg cursor-pointer font-sans shadow-sm"
 >
 Begin Fabrication
 </button>
 )}
 </div>
 </div>
 <CaseCommentsBox caseId={c.id} activeRole={activeRole} triggerGlobalToast={triggerGlobalToast} />
 </div>
 ))}
 </div>
 </div>

 {/* Form panel for new clinical submissions (5 columns) */}
 <div className="lg:col-span-5 space-y-6">
 <div className="bg-white dark:bg-slate-900 #0a0f1d] border border-slate-205 rounded-2xl p-5 space-y-4.5 shadow-sm ">
 <div className="pb-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
 <div>
 <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 font-medium font-sans flex items-center gap-1.5 font-semibold">
 <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400 " />
 Ortho scan Onboarding
 </h3>
 <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-0.5">Prepare orthodontic variables and upload STL meshes</p>
 </div>
 </div>

 <form onSubmit={handleFormSubmit} className="space-y-4">
 <div className="grid grid-cols-2 gap-3">
 <div className="space-y-1">
 <label className="text-sm font-sans text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase font-bold">Patient Initials</label>
 <input
 type="text"
 required
 value={initials}
 onChange={e => setInitials(e.target.value)}
 placeholder="e.g. R. M."
 className="w-full bg-white dark:bg-slate-900 border border-slate-255 text-slate-850 p-2 text-xs rounded-xl focus:border-blue-200 dark:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans shadow-xs"
 />
 <span className="text-xs text-slate-455 italic block">HIPAA (Initials only)</span>
 </div>

 <div className="space-y-1">
 <label className="text-sm font-sans text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase font-bold">Restoration Class</label>
 <select
 value={caseType}
 onChange={e => setCaseType(e.target.value as CaseType)}
 className="w-full bg-white dark:bg-slate-900 border border-slate-255 text-slate-850 p-2 text-xs rounded-xl focus:border-blue-200 dark:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs cursor-pointer"
 >
 {Object.values(CaseType).map(v => (
 <option key={v} value={v}>{v}</option>
 ))}
 </select>
 </div>
 </div>

 <div className="space-y-1 select-none">
 <label className="text-sm font-sans text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase font-bold">Requested Delivery Due Date</label>
 <input
 type="date"
 required
 value={dueDate}
 onChange={e => setDueDate(e.target.value)}
 className="w-full bg-white dark:bg-slate-900 border border-slate-255 text-slate-850 p-2 text-xs rounded-xl focus:border-blue-200 dark:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans shadow-xs cursor-pointer"
 />
 </div>

 <div className="space-y-1">
 <label className="text-sm font-sans text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase font-bold font-semibold">Special shade instructions</label>
 <textarea
 rows={3}
 value={instructions}
 onChange={e => setInstructions(e.target.value)}
 placeholder="State Vita shade, margin prep specifics, or layered zirconia request..."
 className="w-full bg-white dark:bg-slate-900 border border-slate-255 text-slate-850 p-3 text-xs rounded-xl focus:border-blue-200 dark:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
 />
 </div>

 {/* Drag and Drop */}
 <div 
 onDragOver={handleDragOver}
 onDrop={handleDrop}
 className="border border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-200 dark:border-blue-800 p-5 rounded-xl text-center transition-all bg-white dark:bg-slate-900 cursor-pointer shadow-xs"
 >
 <FileUp className="w-6 h-6 text-slate-405 mx-auto mb-1 animate-bounce" />
 <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500 block font-sans">BITE REGISTER SCANS</span>
 <span className="text-sm text-slate-450 block italic mt-0.5">Drag-and-drop .PLY or .STL models</span>

 {scanFiles.length > 0 && (
 <div className="mt-2.5 space-y-1.5">
 {scanFiles.map((f, i) => (
 <span key={i} className="text-sm bg-blue-500/10 border border-blue-550/20 text-blue-700 dark:text-blue-300 py-0.5 px-2 rounded inline-block font-sans">
 ✓ {f.name} ({f.size})
 </span>
 ))}
 </div>
 )}
 </div>

 <button
 type="submit"
 className="w-full bg-blue-600 dark:bg-blue-500 hover:bg-blue-500 text-slate-600 dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl transition-all shadow-sm cursor-pointer font-medium text-sm font-sans animate-pulse"
 >
 Onboard Ortho Case File
 </button>
 </form>
 </div>
 </div>

 </div>

 </div>
 );
}

// Interactive Real-Time Case Comments & Clinical Annotations Subcomponent
interface CommentItem {
 id: string;
 caseId: string;
 sender: string;
 role: string;
 text: string;
 time: string;
 timestamp: string;
}

function CaseCommentsBox({ caseId, activeRole, triggerGlobalToast }: { caseId: string; activeRole: UserRole; triggerGlobalToast: (msg: string) => void }) {
 const [comments, setComments] = useState<CommentItem[]>([]);
 const [commentText, setCommentText] = useState("");
 const [isExpanded, setIsExpanded] = useState(false);

 const getSenderForRole = (r: UserRole) => {
 if (r === UserRole.DENTIST) return "Dr. Catherine Vance";
 if (r === UserRole.LAB_ADMIN) return "Sophia Miller";
 if (r === UserRole.TECHNICIAN) return "Marcus Aurelius";
 return "Clinical Assistant";
 };

 const fetchComments = () => {
 fetch(`/api/cases/${caseId}/comments`)
 .then(res => res.json())
 .then(data => {
 if (data.comments) {
 setComments(data.comments);
 }
 })
 .catch(err => {
 console.error("Comments fetch failed:", err);
 });
 };

 useEffect(() => {
 if (isExpanded) {
 fetchComments();
 }
 }, [isExpanded, caseId]);

 const handlePostComment = (e: React.FormEvent) => {
 e.preventDefault();
 if (!commentText.trim()) return;

 fetch(`/api/cases/${caseId}/comments`, {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({
 sender: getSenderForRole(activeRole),
 role: activeRole,
 text: commentText.trim()
 })
 })
 .then(res => res.json())
 .then(data => {
 if (data.success) {
 setComments(prev => [...prev, data.comment]);
 setCommentText("");
 triggerGlobalToast(`Published clinician note on Case #${caseId}`);
 }
 })
 .catch(err => {
 console.error(err);
 triggerGlobalToast("Failed to compile case comment.");
 });
 };

 return (
 <div className="border-t border-slate-150 mt-3 pt-3 space-y-2 select-none">
 <button
 type="button"
 onClick={() => setIsExpanded(!isExpanded)}
 className="text-sm font-sans font-bold text-blue-600 dark:text-blue-400 hover:text-blue-600 dark:text-blue-400 flex items-center gap-1 cursor-pointer transition-all font-medium text-sm"
 >
 <MessageCircle className="w-3.5 h-3.5" />
 Clinical Comments ({isExpanded ? "Hide" : comments.length || "View"})
 </button>

 {isExpanded && (
 <div className="space-y-3 pt-2 animate-fadeIn">
 <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
 {comments.map(c => (
 <div key={c.id} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-205 rounded-xl text-sm text-slate-700 dark:text-slate-300 space-y-1 animate-fadeIn">
 <div className="flex justify-between items-center text-sm font-sans text-slate-600 dark:text-slate-300 ">
 <span className="font-bold">{c.sender} ({c.role.replace("_", " ")})</span>
 <span>{c.time}</span>
 </div>
 <p className="leading-normal">{c.text}</p>
 </div>
 ))}

 {comments.length === 0 && (
 <p className="text-sm text-slate-450 italic font-sans pt-1">No annotations recorded for this crown batch.</p>
 )}
 </div>

 <form onSubmit={handlePostComment} className="flex gap-2">
 <input 
 type="text" 
 value={commentText}
 onChange={e => setCommentText(e.target.value)}
 placeholder="Write digital annotation details..."
 className="flex-1 bg-white dark:bg-slate-900 border border-slate-250 rounded-lg px-2.5 py-1.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
 />
 <button 
 type="submit"
 className="bg-blue-600 dark:bg-blue-500 hover:bg-indigo-550 text-slate-600 dark:text-slate-300 font-bold p-1 px-3.5 rounded-lg text-xs font-sans select-none flex items-center justify-center gap-1 cursor-pointer shadow-sm"
 >
 <Send className="w-3 h-3" /> Post
 </button>
 </form>
 </div>
 )}
 </div>
 );
}
