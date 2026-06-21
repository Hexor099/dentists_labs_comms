import React, { useState } from "react";
import { 
 Database, Code, Terminal, Activity, ArrowRight, ShieldCheck, Play, 
 Layers, Users, CheckCircle, RefreshCcw, Cpu, Lock, FileCode, CheckCircle2, History 
} from "lucide-react";
import { UserRole } from "../types";
import { databaseTables, databaseRelations } from "../data/schema";
import { apiEndpoints } from "../data/api";

interface ActivityLogItem {
 id: string;
 timestamp: string;
 actor: string;
 role: string;
 action: string;
 details: string;
 hash: string;
}

interface SystemsExplorerProps {
 activityLogs: ActivityLogItem[];
 onClearLogs: () => void;
 triggerGlobalToast: (msg: string) => void;
}

export default function SystemsExplorerView({ 
 activityLogs, 
 onClearLogs, 
 triggerGlobalToast 
}: SystemsExplorerProps) {
 const [activeSubTab, setActiveSubTab] = useState<"database" | "apis" | "workflow" | "activity">("workflow");
 
 // Interactive database query state
 const [selectedPresetQuery, setSelectedPresetQuery] = useState("select-workloads");
 const [sqlConsoleResult, setSqlConsoleResult] = useState<any[]>([]);
 const [isExecutingSql, setIsExecutingSql] = useState(false);

 // Dynamic API sandbox state
 const [selectedApiIndex, setSelectedApiIndex] = useState(4); // default is POST /api/cases/:id/assign
 const [apiRequestBody, setApiRequestBody] = useState("");
 const [apiResponseJson, setApiResponseJson] = useState("");
 const [isCallingApi, setIsCallingApi] = useState(false);

 const queryPresets = [
 { 
 id: "select-workloads", 
 label: "Select Technician Bench Workloads", 
 sql: `SELECT u.full_name, tp.specialty, tp.daily_capacity_units, tp.active_tickets,
 (tp.active_tickets::float / tp.daily_capacity_units::float * 100)::int || '%' as utilization
FROM public.technician_profiles tp
JOIN auth.users u ON tp.user_id = u.id
ORDER BY tp.active_tickets DESC;`,
 result: [
 { full_name: "Marcus Aurelius", specialty: "Digital CAD/CAM Ceramist", daily_capacity_units: 12, active_tickets: 1, utilization: "8%" },
 { full_name: "Irina Petrova", specialty: "Zirconia Sintering specialist", daily_capacity_units: 10, active_tickets: 1, utilization: "10%" },
 { full_name: "Jonathan Hargreaves", specialty: "Porcelain Feldspathic Sculptor", daily_capacity_units: 10, active_tickets: 0, utilization: "0%" }
 ]
 },
 { 
 id: "verify-hipaa-anonymization", 
 label: "Verify HIPAA Patient Anonymization", 
 sql: `SELECT c.id as case_id, c.order_number, p.encrypted_identity_token as anonymized_monogram, 
 c.material, c.shade, c.status
FROM public.cases c
JOIN public.patients p ON c.patient_id = p.id;
-- NOTICE: Raw HIPAA identifiers like first name / last name never reside in plain text!`,
 result: [
 { case_id: "case-001", order_number: "DL-2026-6194", anonymized_monogram: "AES256_8f4a21cd...4e9f", material: "Zirconia High Translucency", shade: "A2", status: "Quality Check" },
 { case_id: "case-002", order_number: "DL-2026-6195", anonymized_monogram: "AES256_bf01a3ce...2cd4", material: "Veneer", shade: "OM1", status: "Assigned" },
 { case_id: "case-003", order_number: "DL-2026-6196", anonymized_monogram: "AES256_9e3c45ab...8f0b", material: "Implant", shade: "A3", status: "Received" }
 ]
 },
 { 
 id: "select-assignments-timeline", 
 label: "Select Assignments Timeline (Audit-Safe)", 
 sql: `SELECT ca.id as assignment_id, c.order_number, u.full_name as technician_name, 
 ca.assigned_stage, ca.completed_at, ca.created_at
FROM public.case_assignments ca
JOIN public.cases c ON ca.case_id = c.id
JOIN public.technician_profiles tp ON ca.technician_id = tp.id
JOIN auth.users u ON tp.user_id = u.id
ORDER BY ca.created_at DESC;`,
 result: [
 { assignment_id: "as-98df-892a", order_number: "DL-2026-6194", technician_name: "Marcus Aurelius", assigned_stage: "PORCELAIN_LAYERING", completed_at: null, created_at: "2026-06-18 14:15:30" },
 { assignment_id: "as-98de-k11", order_number: "DL-2026-6194", technician_name: "Marcus Aurelius", assigned_stage: "CAD_DESIGN", completed_at: "2026-06-18 12:44:02", created_at: "2026-06-18 09:30:15" },
 { assignment_id: "as-72ef-304e", order_number: "DL-2026-6195", technician_name: "Irina Petrova", assigned_stage: "ZIRCONIA_SINTERING", completed_at: null, created_at: "2026-06-17 11:20:00" }
 ]
 }
 ];

 const handleExecuteSql = () => {
 setIsExecutingSql(true);
 const preset = queryPresets.find(q => q.id === selectedPresetQuery);
 setTimeout(() => {
 setIsExecutingSql(false);
 setSqlConsoleResult(preset ? preset.result : []);
 triggerGlobalToast("SQL execution completed on local secure schema cluster.");
 }, 600);
 };

 const handleApplyApiPreset = (idx: number) => {
 setSelectedApiIndex(idx);
 const api = apiEndpoints[idx];
 setApiRequestBody(api.requestBodySchema || "{}");
 setApiResponseJson("");
 };

 const handleInvokeApi = () => {
 setIsCallingApi(true);
 const api = apiEndpoints[selectedApiIndex];
 setTimeout(() => {
 setIsCallingApi(false);
 setApiResponseJson(api.responseSuccessSchema);
 triggerGlobalToast(`Executed API Request: ${api.method} ${api.path}`);
 }, 850);
 };

 // Generate initial state when query preset changes
 React.useEffect(() => {
 const preset = queryPresets.find(q => q.id === selectedPresetQuery);
 if (preset) {
 setSqlConsoleResult(preset.result);
 }
 }, [selectedPresetQuery]);

 // Generate initial state for APIs
 React.useEffect(() => {
 if (apiEndpoints[selectedApiIndex]) {
 setApiRequestBody(apiEndpoints[selectedApiIndex].requestBodySchema || "{}");
 }
 }, [selectedApiIndex]);

 return (
 <div id="systems-logs-workspace" className="space-y-6 animate-fadeIn text-slate-800 dark:text-slate-200 ">
 
 {/* Title block */}
 <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700 ">
 <div>
 <h2 className="text-sm font-bold font-medium flex items-center gap-1.5 text-slate-850 ">
 <Database className="w-5 h-5 text-indigo-555 " />
 Platform Architecture & HIPAA Audit Explorer
 </h2>
 <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">Interactive database models, API sandbox consoles, workflows mapping, and auditable event journals</p>
 </div>
 </div>

 {/* Sub tabs line */}
 <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 gap-1.5 select-none w-fit">
 {[
 { key: "workflow", label: "Assignment Workflow", icon: <Layers className="w-3.5 h-3.5" /> },
 { key: "activity", label: "HIPAA Activity Logs", icon: <History className="w-3.5 h-3.5" /> },
 { key: "database", label: "Database Schemas", icon: <Database className="w-3.5 h-3.5" /> },
 { key: "apis", label: "REST APIs Sandbox", icon: <Code className="w-3.5 h-3.5" /> }
 ].map(sub => (
 <button
 key={sub.key}
 onClick={() => setActiveSubTab(sub.key as any)}
 className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all border ${
 activeSubTab === sub.key
 ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-indigo-700 shadow-sm"
 : "border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:text-slate-200"
 }`}
 >
 {sub.icon}
 <span>{sub.label}</span>
 </button>
 ))}
 </div>

 {/* Workflow Diagram panel */}
 {activeSubTab === "workflow" && (
 <div className="space-y-6">
 <div className="bg-white dark:bg-slate-900 #0a0f1d] border border-slate-200 dark:border-slate-700 rounded-3xl p-6.5 space-y-6 shadow-sm">
 <div>
 <h3 className="font-bold text-sm text-slate-850 font-sans">Dental Lab Dispatch & Production Lifecycle</h3>
 <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Under strict HIPAA boundaries, the platform segregates dentist views from bench schedules. Review step-by-step processing paths:</p>
 </div>

 {/* Visual Workflow Steps diagram */}
 <div className="grid grid-cols-1 md:grid-cols-6 gap-4 relative pt-4">
 
 {[
 { step: "1. Intake", title: "Scan Received", access: "Lab Admin", color: "border-blue-450 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20/40 ", db: "cases (status: Received)", rls: "Lab Admin Full Read" },
 { step: "2. Dispatch", title: "Tech Assignment", access: "Lab Admin", color: "border-indigo-405 text-indigo-700 bg-indigo-50 dark:bg-indigo-900/20/40 ", db: "case_assignments (INSERT)", rls: "Lab Admin Full Write" },
 { step: "3. Milling", title: "In Production", access: "Technician", color: "border-orange-400 text-orange-700 bg-orange-50 dark:bg-orange-900/20/40 ", db: "cases (status: In Production)", rls: "Tech Assignment Isolated Link" },
 { step: "4. Layering", title: "Ceramic Finishing", access: "Technician", color: "border-amber-400 text-amber-700 bg-amber-50/40 ", db: "case_assignments (UPDATE notes)", rls: "Tech Assignment Isolated Link" },
 { step: "5. QC Desk", title: "Quality Check", access: "Technician / Admin", color: "border-yellow-400 text-yellow-700 bg-yellow-50/30 ", db: "cases (status: Quality Check)", rls: "Tech & Admin Dual Read" },
 { step: "6. Shipping", title: "Ready & Dispatched", access: "Lab Admin", color: "border-blue-400 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20/40 ", db: "deliveries (INSERT / cases: Complete)", rls: "Lab Admin Full access" }
 ].map((item, idx) => (
 <div key={idx} className={`p-4 rounded-xl border relative shadow-xs text-center flex flex-col justify-between ${item.color}`}>
 {idx < 5 && (
 <div className="hidden md:block absolute right-[-14px] top-[40%] text-slate-600 dark:text-slate-300 z-10">
 <ArrowRight className="w-5 h-5" />
 </div>
 )}
 
 <div>
 <span className="text-sm font-sans uppercase font-extrabold block opacity-80">{item.step}</span>
 <h4 className="font-bold text-xs tracking-tight mt-1.5">{item.title}</h4>
 <span className="text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded inline-block mt-2 font-sans font-bold font-sans">
 {item.access}
 </span>
 </div>

 <div className="mt-4 pt-2.5 border-t border-slate-200 dark:border-slate-700 text-sm leading-tight space-y-1 text-slate-600 dark:text-slate-300 ">
 <div>DB: <code className="text-sm font-sans select-all font-semibold break-all">{item.db}</code></div>
 <div className="border-t border-dashed border-slate-202 pt-1 text-xs font-semibold italic text-blue-600 dark:text-blue-400 ">
 🔒 RLS: {item.rls}
 </div>
 </div>
 </div>
 ))}
 </div>

 {/* Compliance Guard information */}
 <div className="bg-indigo-50 dark:bg-indigo-900/20/60 border border-indigo-200 p-4.5 rounded-2xl flex gap-3">
 <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
 <div className="text-xs leading-relaxed space-y-1.5 font-normal">
 <span className="font-bold text-slate-800 dark:text-slate-200 block">Strict Dentist Isolation policy (HIPAA Boundary)</span>
 <p>
 While Lab Administrators dispatch cases and Technicians execute multi-stage physical designs, Dentist accounts remain completely blind to internal workflow assignments. 
 A Dentist querying `/api/cases` only obtains high-level progress tracking milestones (<code className="font-sans bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-1 rounded">Received</code> ➔ <code className="font-sans bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-1 rounded">In Production</code> ➔ <code className="font-sans bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-1 rounded">Quality Control</code> ➔ <code className="font-sans bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-1 rounded">Delivered</code>).
 Technician profile joins are strictly blocked on the dentist tenant query pathway, ensuring HIPAA regulatory-safe sub-tenant boundaries.
 </p>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Activity Logs panel */}
 {activeSubTab === "activity" && (
 <div className="space-y-6">
 <div className="bg-white dark:bg-slate-900 #0a0f1d] border border-slate-200 dark:border-slate-700 rounded-3xl p-6.5 space-y-4 shadow-sm">
 <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700 ">
 <div>
 <h3 className="font-bold text-sm text-slate-850 font-sans">Live HIPAA-Safety Auditing Registry</h3>
 <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Real-time unmodifiable security audit trails documenting administrative dispatches and bench operations</p>
 </div>

 <div className="flex gap-2">
 <button
 onClick={() => {
 onClearLogs();
 triggerGlobalToast("Purged transient UI audit cache logs.");
 }}
 className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-550 hover:text-slate-850 text-xs font-sans rounded-lg transition-all cursor-pointer shadow-sm"
 >
 Clear Logs Panel
 </button>
 </div>
 </div>

 {/* Scrolling console table */}
 <div className="overflow-x-auto select-none">
 <table className="w-full text-left text-xs border-collapse">
 <thead>
 <tr className="bg-slate-105 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-sans text-sm">
 <th className="p-3">SYS ID</th>
 <th className="p-3">TIMESTAMP (UTC)</th>
 <th className="p-3">ACTOR</th>
 <th className="p-3">ACTION EVENT</th>
 <th className="p-3 font-semibold">SECURE DETAILS / VALUE</th>
 <th className="p-3 text-right">BLOCK HASH</th>
 </tr>
 </thead>
 <tbody className="font-sans text-sm divide-y divide-slate-150 ">
 {activityLogs.map(log => (
 <tr key={log.id} className="hover:bg-slate-50 dark:bg-slate-800 transition-colors">
 <td className="p-3 text-slate-600 dark:text-slate-300 font-bold">{log.id}</td>
 <td className="p-3 whitespace-nowrap text-slate-600 dark:text-slate-300">{log.timestamp}</td>
 <td className="p-3 whitespace-nowrap">
 <span className="font-bold text-slate-700 dark:text-slate-300 ">{log.actor}</span>
 <span className="text-sm block text-slate-600 dark:text-slate-300 uppercase tracking-tight">{log.role}</span>
 </td>
 <td className="p-3 whitespace-nowrap">
 <span className={`px-2 py-0.5 rounded text-sm font-bold ${
 log.action.includes("Assign") ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 border border-indigo-200 " :
 log.action.includes("Reassign") ? "bg-amber-50 text-amber-700 border border-amber-200 " :
 log.action.includes("Progress") ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 " :
 "bg-orange-50 dark:bg-orange-900/20 text-orange-700 border border-orange-100 "
 }`}>
 {log.action}
 </span>
 </td>
 <td className="p-3 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={log.details}>
 {log.details}
 </td>
 <td className="p-3 text-right text-blue-600 dark:text-blue-400 font-extrabold text-sm">{log.hash}</td>
 </tr>
 ))}

 {activityLogs.length === 0 && (
 <tr>
 <td colSpan={6} className="p-8 text-center text-slate-450 italic">
 No activity records inside current compliance journal buffer. Submit or assign workflow elements!
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>

 <div className="text-sm border-t border-slate-201 pt-2.5 text-slate-600 dark:text-slate-300 italic flex items-center gap-1.5 font-sans">
 <Cpu className="w-3.5 h-3.5" /> *Each journal block record is securely formatted to SHA-256 criteria. System logs synchronize securely to state cabinets.
 </div>
 </div>
 </div>
 )}

 {/* Database Schema Explorer */}
 {activeSubTab === "database" && (
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
 
 {/* Main tables list (5 columns) */}
 <div className="lg:col-span-5 space-y-4">
 <div className="bg-white dark:bg-slate-900 #0a0f1d] border border-slate-200 dark:border-slate-700 rounded-3xl p-5 space-y-4 shadow-sm max-h-[560px] overflow-y-auto">
 <div>
 <h3 className="font-bold text-xs font-medium font-sans text-slate-850 ">
 PostgreSQL Tables Matrix
 </h3>
 <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">Physical schemas configured for HIPAA sub-tenant segregation</p>
 </div>

 <div className="space-y-2 pt-1 font-sans text-xs">
 {databaseTables.map((tbl, i) => (
 <div 
 key={i} 
 className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1.5 shadow-xs"
 >
 <div className="flex justify-between items-center">
 <span className="font-bold text-slate-800 dark:text-slate-200 ">{tbl.schema}.{tbl.name}</span>
 <span className="text-sm bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-0.5 px-2 rounded opacity-80 uppercase">
 {tbl.schema}
 </span>
 </div>
 <p className="text-sm text-slate-520 font-sans leading-normal">
 {tbl.description}
 </p>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* Interactive relational SQL execution terminal (7 columns) */}
 <div className="lg:col-span-7 space-y-6">
 <div className="bg-white dark:bg-slate-900 #0a0f1d] border border-slate-200 dark:border-slate-700 rounded-3xl p-5 space-y-4 shadow-sm flex flex-col justify-between min-h-[560px]">
 <div className="space-y-4">
 <div className="flex justify-between items-center pb-2.5 border-b border-slate-200 dark:border-slate-700 ">
 <h3 className="font-bold text-xs text-slate-850 font-medium font-sans flex items-center gap-1.5">
 <Terminal className="w-4 h-4 text-blue-500" />
 SQL DDL & Query Sandbox Terminal
 </h3>
 <span className="text-sm font-sans text-slate-600 dark:text-slate-300">Postgres v16 OLTP Connection</span>
 </div>

 {/* Preconfigured query select box */}
 <div className="space-y-2 select-none">
 <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 block font-sans">Select Query Preset:</span>
 <div className="flex flex-col sm:flex-row gap-2">
 <select
 value={selectedPresetQuery}
 onChange={e => setSelectedPresetQuery(e.target.value)}
 className="flex-1 bg-white dark:bg-slate-900 border border-slate-255 text-slate-850 p-2 text-xs rounded-xl focus:border-blue-200 dark:border-blue-800 focus:outline-none font-sans font-semibold cursor-pointer shadow-xs"
 >
 {queryPresets.map(q => (
 <option key={q.id} value={q.id}>{q.label}</option>
 ))}
 </select>

 <button
 onClick={handleExecuteSql}
 disabled={isExecutingSql}
 className="px-4.5 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-750 disabled:bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl font-sans transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
 >
 {isExecutingSql ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
 Execute SQL
 </button>
 </div>
 </div>

 {/* SQL Code block */}
 <div className="bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl min-h-[140px] font-sans text-sm overflow-x-auto relative whitespace-pre shadow-inner">
 <div className="absolute top-2 right-3 text-xs text-slate-600 dark:text-slate-300 tracking-wider font-semibold select-none">READ ONLY INTERACTIVE PORT</div>
 {queryPresets.find(q => q.id === selectedPresetQuery)?.sql}
 </div>

 {/* Query Result Pane */}
 <div className="space-y-2.5">
 <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 block font-sans">Query Result output:</span>
 
 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4.5 overflow-x-auto font-sans text-sm min-h-[160px] shadow-xs">
 {isExecutingSql ? (
 <div className="p-8 text-center text-slate-600 dark:text-slate-300 italic animate-pulse">
 Scanning metadata tables indexes...
 </div>
 ) : sqlConsoleResult.length > 0 ? (
 <table className="w-full text-left">
 <thead>
 <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold">
 {Object.keys(sqlConsoleResult[0]).map((key, idx) => (
 <th key={idx} className="pb-2 pr-6">{key.toUpperCase()}</th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 ">
 {sqlConsoleResult.map((val, i) => (
 <tr key={i} className="hover:bg-slate-50 dark:bg-slate-800">
 {Object.values(val).map((v: any, index) => (
 <td key={index} className="py-2 pr-6 text-slate-600 dark:text-slate-300 ">{v}</td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 ) : (
 <div className="p-8 text-center text-slate-600 dark:text-slate-300 italic">
 Empty records. Run selected query preset!
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 </div>

 </div>
 )}

 {/* REST APIs Explorer */}
 {activeSubTab === "apis" && (
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
 
 {/* Endpoint selector list (5 columns) */}
 <div className="lg:col-span-5 space-y-4">
 <div className="bg-white dark:bg-slate-900 #0a0f1d] border border-slate-200 dark:border-slate-700 rounded-3xl p-5 space-y-4 shadow-sm max-h-[560px] overflow-y-auto">
 <div>
 <h3 className="font-bold text-xs font-medium font-sans text-slate-850 ">
 HTTP API Route Definitions
 </h3>
 <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5 font-sans">Dental workspace REST gateways and payload bounds</p>
 </div>

 <div className="space-y-3 pt-1">
 {apiEndpoints.map((api, i) => {
 const isPost = api.method === "POST";
 return (
 <div 
 key={i}
 onClick={() => handleApplyApiPreset(i)}
 className={`p-3 rounded-xl border transition-all text-xs cursor-pointer ${
 selectedApiIndex === i
 ? "bg-white dark:bg-slate-900 border-indigo-400 shadow-sm"
 : "bg-white dark:bg-slate-900 hover:bg-slate-100 dark:bg-slate-800/80 border-slate-250"
 }`}
 >
 <div className="flex items-center gap-2">
 <span className={`px-2 py-0.5 rounded font-sans text-sm font-extrabold ${
 isPost 
 ? "bg-orange-50 dark:bg-orange-900/20 text-orange-700 border border-orange-200 " 
 : "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 "
 }`}>
 {api.method}
 </span>
 <code className="text-sm font-sans text-slate-850 font-bold">{api.path}</code>
 </div>
 <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 font-medium font-sans">
 {api.description}
 </p>
 </div>
 );
 })}
 </div>
 </div>
 </div>

 {/* Interactive API Testing console (7 columns) */}
 <div className="lg:col-span-7 space-y-6">
 <div className="bg-white dark:bg-slate-900 #0a0f1d] border border-slate-200 dark:border-slate-700 rounded-3xl p-5 space-y-4.5 shadow-sm flex flex-col justify-between min-h-[560px]">
 <div className="space-y-4">
 <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700 ">
 <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 font-medium font-sans flex items-center gap-1.5">
 <Terminal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
 REST Gateway Request/Response Simulator
 </h3>
 <span className="text-sm font-sans text-slate-600 dark:text-slate-300">Node/NestJS Router</span>
 </div>

 <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1.5 text-xs text-slate-700 dark:text-slate-300 ">
 <span className="text-sm font-sans uppercase text-slate-450 block font-bold">Selected Target:</span>
 <div className="flex items-center gap-2">
 <span className="font-sans bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 px-2 py-0.5 rounded font-extrabold text-sm">
 {apiEndpoints[selectedApiIndex]?.method}
 </span>
 <span className="font-sans text-xs font-extrabold">{apiEndpoints[selectedApiIndex]?.path}</span>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <span className="text-sm font-sans text-slate-600 dark:text-slate-300 uppercase block font-bold">Mock JSON Request Body:</span>
 <textarea
 rows={8}
 value={apiRequestBody}
 onChange={e => setApiRequestBody(e.target.value)}
 className="w-full bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 p-3 rounded-2xl font-sans text-sm focus:outline-none"
 />
 </div>

 <div className="space-y-1.5">
 <span className="text-sm font-sans text-slate-600 dark:text-slate-300 uppercase block font-bold">Response JSON Payload:</span>
 <div className="bg-white dark:bg-slate-900 text-indigo-305 border border-slate-200 dark:border-slate-700 p-3 rounded-2xl min-h-[176px] font-sans text-sm overflow-x-auto whitespace-pre relative shadow-inner">
 {isCallingApi ? (
 <div className="p-8 text-center text-slate-600 dark:text-slate-300 italic animate-pulse">
 Routing token check assertions...
 </div>
 ) : apiResponseJson ? (
 apiResponseJson
 ) : (
 <div className="p-8 text-center text-slate-600 dark:text-slate-300 italic">
 Click Send API Request below to view response...
 </div>
 )}
 </div>
 </div>
 </div>
 </div>

 <div className="pt-2 select-none">
 <button
 onClick={handleInvokeApi}
 disabled={isCallingApi}
 className="w-full bg-blue-500 dark:bg-blue-600 hover:bg-blue-700 disabled:bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl transition-all shadow-sm cursor-pointer font-medium text-sm font-sans flex items-center justify-center gap-1.5"
 >
 {isCallingApi ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
 Send Simulated REST API Request
 </button>
 </div>
 </div>
 </div>
 </div>
 )}

 </div>
 );
}
