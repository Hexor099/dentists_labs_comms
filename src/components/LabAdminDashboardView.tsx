/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from "react";
import { 
 Building2, Users, FileText, Activity, Layers, ArrowUpRight, 
 Sparkles, CheckCircle2, Clock, Eye, AlertCircle, Heart,
 Tv, Cpu, ShieldCheck, Dumbbell, Play, Pause, ChevronRight, Inbox,
 Briefcase, Download, Calendar, DollarSign, Send, HelpCircle, UserCheck, 
 Workflow, Sliders, Settings, AlertTriangle, ShieldAlert, Check, ArrowRight, ArrowLeft
} from "lucide-react";

interface CaseItem {
 id: string;
 patientInitials: string;
 caseType: string;
 dueDate: string;
 dentistName: string;
 status: string;
 instructions: string;
 technicianId: string | null;
 technicianName: string | null;
 assignedStage?: string;
 internalNotes?: string;
 workloadWeight?: number;
}

interface LabAdminDashboardProps {
 cases: CaseItem[];
 onAssignTechnician: (
 caseId: string, 
 techId: string, 
 techName: string, 
 stage: string, 
 notes: string, 
 weight: number
 ) => void;
 onReassignTechnician: (
 caseId: string, 
 oldTechId: string, 
 oldTechName: string, 
 newTechId: string, 
 newTechName: string, 
 stage: string, 
 notes: string, 
 weight: number
 ) => void;
 onTransitionStatus: (caseId: string, status: string) => void;
 onNavigateToTab: (tab: any) => void;
 triggerGlobalToast: (msg: string) => void;
}

export const techniciansList = [
 { id: "tech-marcus", name: "Marcus Aurelius", specialty: "Digital CAD/CAM Ceramist", maxCapacity: 12 },
 { id: "tech-irina", name: "Irina Petrova", specialty: "Zirconia Sintering specialist", maxCapacity: 10 },
 { id: "tech-jonathan", name: "Jonathan Hargreaves", specialty: "Porcelain Feldspathic Sculptor", maxCapacity: 10 }
];

export default function LabAdminDashboardView({ 
 cases, 
 onAssignTechnician, 
 onReassignTechnician, 
 onTransitionStatus,
 onNavigateToTab, 
 triggerGlobalToast 
}: LabAdminDashboardProps) {
 
 // Local machinery states
 const [machinery, setMachinery] = useState([
 { id: "mill-01", name: "Weiland 5-Axis Milling Machine", type: "CAD Milling", status: "Active", load: "74%" },
 { id: "furn-12", name: "Nabertherm High-Temp Zirconia Furnace", type: "Thermal Sintering", status: "Active", load: "45%" },
 { id: "print-03", name: "Formlabs Form 3B resin SLA Printer", type: "3D Print", status: "Idle", load: "0%" }
 ]);

 // Temporary local state for assign/dispatch per case
 const [selectedTechByCase, setSelectedTechByCase] = useState<Record<string, string>>({});
 const [selectedStageByCase, setSelectedStageByCase] = useState<Record<string, string>>({});
 const [selectedWeightByCase, setSelectedWeightByCase] = useState<Record<string, number>>({});
 const [internalNotesByCase, setInternalNotesByCase] = useState<Record<string, string>>({});

 // Reassignment temporary state
 const [reassignTargetCase, setReassignTargetCase] = useState<string | null>(null);
 const [reassignNewTech, setReassignNewTech] = useState<string>("");

 // Kanban Drag States
 const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);

 // Helper calculations
 const getTechActivePoints = (techId: string) => {
 return cases
 .filter(c => c.technicianId === techId && c.status !== "Completed" && c.status !== "Ready for Dispatch")
 .reduce((sum, c) => sum + (c.workloadWeight || 2), 0);
 };

 const getTechActiveCases = (techId: string) => {
 return cases.filter(c => c.technicianId === techId && c.status !== "Completed" && c.status !== "Ready for Dispatch");
 };

 // Filter cases for admin workflow logic
 const unassignedCases = cases.filter(c => !c.technicianId);
 const assignedActiveCases = cases.filter(c => c.technicianId && c.status !== "Completed" && c.status !== "Ready for Dispatch");

 // Dynamic values for requested 4 cards (Incoming, In Production, QC Cases, Ready for Dispatch)
 const incomingCount = cases.filter(c => c.status === "Created" || c.status === "Received").length;
 const inProductionCount = cases.filter(c => c.status === "In Production" || c.status === "Assigned").length;
 const qcCasesCount = cases.filter(c => c.status === "Quality Check" || c.status === "QC & Finishing").length;
 const readyForDispatchCount = cases.filter(c => c.status === "Ready for Dispatch" || c.status === "Ready For Dispatch").length;

 const totalCapacityUsed = techniciansList.reduce((sum, t) => sum + getTechActivePoints(t.id), 0);
 const totalMaxCapacity = techniciansList.reduce((sum, t) => sum + t.maxCapacity, 0);
 const aggregateUtilization = Math.round((totalCapacityUsed / totalMaxCapacity) * 100) || 0;

 const adminStats = [
 { label: "Incoming Cases", val: `${incomingCount} Pending`, change: "Requires initial design prep", icon: <Inbox className="w-4 h-4 text-blue-600 dark:text-blue-400" /> },
 { label: "In Production", val: `${inProductionCount} Active`, change: "Actively milling on benches", icon: <Workflow className="w-4 h-4 text-blue-500" /> },
 { label: "QC Cases", val: `${qcCasesCount} In Audit`, change: "Awaiting micrometer approval", icon: <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" /> },
 { label: "Ready for Dispatch", val: `${readyForDispatchCount} Packaged`, change: "Awaiting local courier transit", icon: <CheckCircle2 className="w-4 h-4 text-emerald-650" /> }
 ];

 const handleToggleMachinery = (id: string, name: string) => {
 setMachinery(prev => prev.map(m => {
 if (m.id === id) {
 const nextStatus = m.status === "Active" ? "Idle" : "Active";
 const nextLoad = nextStatus === "Active" ? "65%" : "0%";
 triggerGlobalToast(`Controlled studio node: ${name} is now ${nextStatus}`);
 return { ...m, status: nextStatus, load: nextLoad };
 }
 return m;
 }));
 };

 const executeDispatch = (caseId: string) => {
 const techId = selectedTechByCase[caseId];
 if (!techId) {
 triggerGlobalToast("Security alert: You must select a corresponding specialist first.");
 return;
 }
 const techName = techniciansList.find(t => t.id === techId)?.name || "Marcus Aurelius";
 const stage = selectedStageByCase[caseId] || "CAD_DESIGN";
 const notes = internalNotesByCase[caseId] || "Anatomical milling check requested.";
 const weight = selectedWeightByCase[caseId] || 2;

 onAssignTechnician(caseId, techId, techName, stage, notes, weight);
 triggerGlobalToast(`Assigned order Case ${caseId} to specialized clinician technician: ${techName}`);
 };

 const executeReassign = (caseId: string, currentWeight: number, currentStage: string) => {
 const caseObj = cases.find(c => c.id === caseId);
 if (!caseObj) return;

 const oldTechId = caseObj.technicianId || "";
 const oldTechName = caseObj.technicianName || "";

 if (!reassignNewTech) {
 triggerGlobalToast("Error: Please select a valid target technician specialty profile.");
 return;
 }

 const nextTechName = techniciansList.find(t => t.id === reassignNewTech)?.name || "";
 onReassignTechnician(
 caseId, 
 oldTechId, 
 oldTechName, 
 reassignNewTech, 
 nextTechName, 
 currentStage, 
 internalNotesByCase[caseId] || "Reallocation workflow requested.", 
 currentWeight
 );

 setReassignTargetCase(null);
 setReassignNewTech("");
 };

 // HTML5 Drag and Drop event handlers list
 const handleDragStart = (e: React.DragEvent, caseId: string) => {
 e.dataTransfer.setData("text/plain", caseId);
 e.dataTransfer.effectAllowed = "move";
 };

 const handleDragOver = (e: React.DragEvent, colId: string) => {
 e.preventDefault();
 setDraggedOverColumn(colId);
 };

 const handleDragLeave = () => {
 setDraggedOverColumn(null);
 };

 const handleDrop = (e: React.DragEvent, colId: string) => {
 e.preventDefault();
 setDraggedOverColumn(null);
 const caseId = e.dataTransfer.getData("text/plain");
 
 if (!caseId) return;

 // Map column ID to structural status
 let mappedStatus = colId;
 if (colId === "QC & Finishing") mappedStatus = "Quality Check";
 if (colId === "Ready For Dispatch") mappedStatus = "Ready for Dispatch";
 if (colId === "Dispatched") mappedStatus = "Completed";

 onTransitionStatus(caseId, mappedStatus);
 triggerGlobalToast(`Drag Drop Event: Moved Case ${caseId} to column ${colId}`);
 };

 // Helper lists representing columns in the Kanban Board
 const kanbanColumns = [
 { id: "Received", title: "Incoming", bg: "bg-blue-50 dark:bg-blue-900/20/40 border-blue-100", text: "text-blue-800 dark:text-blue-200" },
 { id: "In Production", title: "In Production", bg: "bg-amber-50/45 border-amber-205", text: "text-amber-800" },
 { id: "Quality Check", title: "QC & Finishing", bg: "bg-pink-50/40 border-pink-100", text: "text-pink-800" },
 { id: "Ready for Dispatch", title: "Ready For Dispatch", bg: "bg-indigo-50 dark:bg-indigo-900/20/40 border-indigo-100", text: "text-indigo-800" },
 { id: "Completed", title: "Dispatched", bg: "bg-emerald-50/40 border-emerald-100", text: "text-emerald-800" }
 ];

 const getCasesForColumn = (colId: string) => {
 return cases.filter(c => {
 const parentStatus = c.status;
 if (colId === "Received") {
 return parentStatus === "Created" || parentStatus === "Received";
 }
 if (colId === "In Production") {
 return parentStatus === "Assigned" || parentStatus === "In Production" || parentStatus === "In Progress";
 }
 if (colId === "Quality Check") {
 return parentStatus === "Quality Check" || parentStatus === "QC & Finishing";
 }
 if (colId === "Ready for Dispatch") {
 return parentStatus === "Ready for Dispatch" || parentStatus === "Ready For Dispatch";
 }
 if (colId === "Completed") {
 return parentStatus === "Completed" || parentStatus === "Delivered" || parentStatus === "Dispatched";
 }
 return false;
 });
 };

 return (
 <div id="lab-admin-dashboard-view" className="space-y-6 animate-fadeIn pb-16">
 
 {/* Admin Persona Banner */}
 <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-xl bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
 SM
 </div>
 <div>
 <div className="flex items-center gap-2 font-sans">
 <h2 className="text-sm font-bold text-slate-900 dark:text-slate-50">Sophia Miller</h2>
 <span className="text-sm font-sans px-2 py-0.5 rounded-full uppercase border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold">
 Lab Admin Persona
 </span>
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1 font-medium">Boston HQ Operations Supervisor • HIPAA Authorized</p>
 </div>
 </div>

 <button 
 id="admin-btn-manage-cases"
 onClick={() => onNavigateToTab("cases")}
 className="p-2.5 px-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-bold transition-all shadow-xs cursor-pointer"
 >
 View Full Cases Queue
 </button>
 </div>

 {/* KPI Stats Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {adminStats.map((stat, idx) => (
 <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4.5 rounded-xl flex flex-col justify-between shadow-xs">
 <div className="flex justify-between items-center">
 <span className="text-sm font-sans text-slate-500 dark:text-slate-400 dark:text-slate-500 font-semibold">
 {stat.label}
 </span>
 <div className="bg-slate-50 dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
 {stat.icon}
 </div>
 </div>
 <div className="mt-2.5 text-xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">{stat.val}</div>
 <div className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1.5 font-medium">{stat.change}</div>
 </div>
 ))}
 </div>

 {/* KANBAN BOARD SECTION WITH DRAG & DROP */}
 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-4 shadow-xs">
 <div>
 <h3 className="font-extrabold text-xs text-slate-900 dark:text-slate-50 font-medium font-sans flex items-center gap-1.5">
 <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
 Interactive Restorations Kanban Board
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-0.5 font-sans">
 Drag clinical case cards between columns to advance stages automatically. The dentist receives real-time WebSocket alerts instantly.
 </p>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-2">
 {kanbanColumns.map(col => {
 const columnCases = getCasesForColumn(col.id);
 const isOverCurrent = draggedOverColumn === col.id;

 return (
 <div 
 key={col.id}
 onDragOver={e => handleDragOver(e, col.id)}
 onDragLeave={handleDragLeave}
 onDrop={e => handleDrop(e, col.id)}
 className={`p-3.5 rounded-xl border transition-all flex flex-col space-y-3 min-h-[380px] ${col.bg} ${
 isOverCurrent 
 ? "ring-2 ring-blue-500/40 bg-blue-50 dark:bg-blue-900/20/80 scale-[1.01]" 
 : "bg-slate-50 dark:bg-slate-800"
 }`}
 >
 {/* Column header title */}
 <div className="flex justify-between items-center pb-2.5 border-b border-slate-200 dark:border-slate-700">
 <span className={`text-sm font-bold font-medium text-sm ${col.text}`}>{col.title}</span>
 <span className="text-sm bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-sans font-bold px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
 {columnCases.length}
 </span>
 </div>

 {/* Sub-cards */}
 <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[420px] scrollbar-hide">
 {columnCases.map(item => (
 <div
 key={item.id}
 draggable={true}
 onDragStart={e => handleDragStart(e, item.id)}
 className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-xs hover:shadow-sm hover:border-slate-300 dark:border-slate-600 transition-all cursor-grab active:cursor-grabbing space-y-2 relative"
 >
 <div className="flex justify-between items-start">
 <span className="font-sans bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-extrabold px-1.5 py-0.5 rounded text-sm border border-blue-200 dark:border-blue-800">
 {item.id}
 </span>
 <span className="text-sm font-sans text-slate-500 dark:text-slate-400 dark:text-slate-500 font-semibold">{item.dueDate}</span>
 </div>
 
 <div>
 <div className="font-bold text-sm text-slate-900 dark:text-slate-50">Patient Initials: {item.patientInitials}</div>
 <div className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-0.5">{item.caseType} • {item.technicianName || "Unassigned"}</div>
 </div>

 {/* Click controller translation (Fallback arrow for quick accessibility) */}
 <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-sm">
 <span className="font-semibold text-slate-600 dark:text-slate-300">Drag or shift:</span>
 <div className="flex gap-1.5">
 {col.id !== "Completed" && (
 <button
 onClick={() => {
 let nextStatusMap: Record<string, string> = {
 "Received": "In Production",
 "In Production": "Quality Check",
 "Quality Check": "Ready for Dispatch",
 "Ready for Dispatch": "Completed"
 };
 const nextSt = nextStatusMap[col.id] || "Completed";
 onTransitionStatus(item.id, nextSt);
 triggerGlobalToast(`Advanced Case ${item.id} to '${nextSt}'`);
 }}
 className="p-1 hover:bg-slate-100 dark:bg-slate-800/80 rounded text-blue-600 dark:text-blue-400 font-bold border border-slate-205 transition-all text-sm flex items-center gap-0.5 cursor-pointer"
 title="Advance to next step"
 >
 Shift <ArrowRight className="w-3 h-3" />
 </button>
 )}
 </div>
 </div>
 </div>
 ))}

 {columnCases.length === 0 && (
 <div className="p-6 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-center text-slate-600 dark:text-slate-300 text-sm italic">
 No cases.
 </div>
 )}
 </div>
 </div>
 );
 })}
 </div>
 </div>

 {/* Technicians workload gauges monitor (Full Width) */}
 <div className="bg-white dark:bg-slate-900 border border-[#e5e7eb] rounded-2xl p-5 space-y-4 shadow-xs">
 <div>
 <h3 className="font-bold text-xs text-slate-900 dark:text-slate-50 font-medium font-sans flex items-center gap-1.5 font-semibold">
 <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
 Technician workload capacity & Bench Monitor
 </h3>
 <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-0.5">Real-time load tracking mapped to daily active capacities thresholds</p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
 {techniciansList.map(tech => {
 const activePts = getTechActivePoints(tech.id);
 const activeC = getTechActiveCases(tech.id);
 const rawUtilization = Math.round((activePts / tech.maxCapacity) * 100);
 const isNearOverload = rawUtilization >= 80;

 return (
 <div 
 key={tech.id} 
 className={`p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border transition-all space-y-3.5 shadow-xs ${
 isNearOverload 
 ? "border-amber-300 ring-1 ring-amber-400/20" 
 : "border-slate-200 dark:border-slate-700"
 }`}
 >
 <div className="flex justify-between items-start">
 <div>
 <h4 className="font-bold text-xs text-slate-900 dark:text-slate-50">{tech.name}</h4>
 <span className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 font-sans italic">{tech.specialty}</span>
 </div>
 {isNearOverload ? (
 <span className="bg-amber-100 text-amber-800 text-xs font-sans px-2 py-0.5 rounded-full border border-amber-300/40 font-bold uppercase tracking-wide flex items-center gap-1">
 <AlertTriangle className="w-3 h-3 text-amber-500" /> NEAR LIMIT
 </span>
 ) : (
 <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-sans px-2 py-0.5 rounded-full border border-blue-250/20 font-bold uppercase tracking-wide">
 Balanced
 </span>
 )}
 </div>

 {/* Progress bar */}
 <div className="space-y-1">
 <div className="flex justify-between text-sm font-sans font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500">
 <span>CAPACITY UNITS:</span>
 <span>{activePts} / {tech.maxCapacity} ({rawUtilization}%)</span>
 </div>
 <div className="w-full bg-slate-150 h-2 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
 <div 
 className={`h-full transition-all duration-350 ${
 isNearOverload ? "bg-amber-500" : "bg-blue-600 dark:bg-blue-500"
 }`}
 style={{ width: `${Math.min(rawUtilization, 100)}%` }}
 />
 </div>
 </div>

 {/* Active Sub-items list */}
 <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-sm space-y-2">
 <span className="font-sans text-sm uppercase text-slate-600 dark:text-slate-300 block font-bold">Active Bench Allocations ({activeC.length}):</span>
 {activeC.map(c => (
 <div key={c.id} className="flex justify-between items-center text-sm hover:bg-white dark:bg-slate-900 p-1 px-1.5 rounded transition-all border border-transparent hover:border-slate-200 dark:border-slate-700">
 <span className="text-slate-600 dark:text-slate-300 font-sans">
 ID: <strong className="text-slate-900 dark:text-slate-50 font-sans font-bold">{c.id}</strong> ({c.patientInitials})
 </span>
 <span className="font-sans text-sm bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
 {c.workloadWeight} pts
 </span>
 </div>
 ))}
 {activeC.length === 0 && (
 <span className="italic text-sm font-sans text-slate-405 block">Bench is empty. Ready for dispatch tasks.</span>
 )}
 </div>
 </div>
 );
 })}
 </div>
 </div>

 {/* Main interactive Columns wrapper (Unassigned jobs & machines) */}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
 
 {/* Unassigned Work Dispatch Queue (7 columns) */}
 <div className="lg:col-span-7 space-y-6">
 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-4 shadow-xs">
 <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
 <div>
 <h3 className="font-bold text-xs text-slate-900 dark:text-slate-50 font-medium font-sans flex items-center gap-1.5">
 <Inbox className="w-4 h-4 text-blue-600 dark:text-blue-400" />
 Unassigned Cases Dispatch Queue
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-0.5 font-sans font-medium">Designate production stages and bind incoming clinical scans to specialist techniques</p>
 </div>
 <span className="text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-sans px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 font-bold">
 {unassignedCases.length} Pending
 </span>
 </div>

 <div className="space-y-4.5 pt-1">
 {unassignedCases.map(c => {
 const currentWeight = selectedWeightByCase[c.id] || 2;
 const currentStage = selectedStageByCase[c.id] || "CAD_DESIGN";
 const currentTechId = selectedTechByCase[c.id] || "";

 return (
 <div key={c.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4.5 rounded-2xl space-y-3.5 hover:border-slate-300 dark:border-slate-600 transition-all shadow-xs">
 <div className="flex justify-between items-start">
 <div>
 <div className="flex items-center gap-2 font-semibold">
 <span>Patient initials: <span className="text-blue-600 dark:text-blue-400 font-sans bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-1.5 py-0.5 rounded font-extrabold">{c.patientInitials}</span></span>
 <span className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 font-sans">#{c.id}</span>
 </div>
 <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5">Dentist: <strong>{c.dentistName}</strong> — Design Code: <strong className="text-blue-600 dark:text-blue-400">{c.caseType}</strong></p>
 </div>
 <div className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 font-sans font-bold flex items-center gap-1">
 <Calendar className="w-3.5 h-3.5" /> Due: <strong className="text-slate-700 dark:text-slate-300">{c.dueDate}</strong>
 </div>
 </div>

 <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 leading-relaxed font-normal">
 "{c.instructions}"
 </p>

 {/* Stage & Weight selection controls */}
 <div className="grid grid-cols-2 gap-3 pt-1 select-none">
 <div className="space-y-1">
 <label className="text-sm font-sans text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase font-bold">Manufacturing Stage</label>
 <select
 value={currentStage}
 onChange={e => setSelectedStageByCase(prev => ({...prev, [c.id]: e.target.value}))}
 className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 p-2 text-sm rounded-xl focus:outline-none cursor-pointer"
 >
 <option value="CAD_DESIGN">CAD Anatomical Design</option>
 <option value="WEILAND_MILLING">Milling Substrate Block</option>
 <option value="ZIRCONIA_SINTERING">Sintering Thermal Program</option>
 <option value="PORCELAIN_LAYERING">Porcelain Finishing Stack</option>
 <option value="GLAZE_POLISHING">Stain & Glaze Polishing</option>
 <option value="QC_DESK_SIGNOFF">QC Audit desk analysis</option>
 </select>
 </div>

 <div className="space-y-1">
 <label className="text-sm font-sans text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase font-bold">Complexity Point Weight</label>
 <select
 value={currentWeight}
 onChange={e => setSelectedWeightByCase(prev => ({...prev, [c.id]: parseInt(e.target.value)}))}
 className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 p-2 text-sm rounded-xl focus:outline-none cursor-pointer font-sans font-bold"
 >
 <option value="1">1 Unit (Retention coping - Fast)</option>
 <option value="2">2 Units (Normal Posterior Crown - Mid)</option>
 <option value="3">3 Units (Multi-Unit Bridge - High)</option>
 <option value="4">4 Units (Full-Arch Implant Bar - Ultra)</option>
 </select>
 </div>
 </div>

 <div className="space-y-1">
 <label className="text-sm font-sans text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase font-bold">Internal allocation notes</label>
 <input
 type="text"
 value={internalNotesByCase[c.id] || ""}
 onChange={e => setInternalNotesByCase(prev => ({...prev, [c.id]: e.target.value}))}
 placeholder="e.g. Please utilize e.max translucent guides. Check margin offsets."
 className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 p-2 text-sm rounded-xl focus:outline-none"
 />
 </div>

 {/* Bind specialist to target cases */}
 <div className="pt-2 border-t border-slate-200 dark:border-slate-700 select-none">
 <span className="text-sm font-sans text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase block font-bold mb-2">Bind Technician Assignment:</span>
 <div className="flex flex-col sm:flex-row gap-2">
 <select
 value={currentTechId}
 onChange={e => setSelectedTechByCase(prev => ({ ...prev, [c.id]: e.target.value }))}
 className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 p-2 text-xs rounded-xl focus:outline-none cursor-pointer"
 >
 <option value="">-- Choose Specialist from Roster --</option>
 {techniciansList.map(t => {
 const pts = getTechActivePoints(t.id);
 return (
 <option key={t.id} value={t.id}>{t.name} ({pts}/{t.maxCapacity} units busy)</option>
 );
 })}
 </select>

 <button
 onClick={() => executeDispatch(c.id)}
 className="px-4.5 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 text-white font-bold text-xs rounded-xl font-sans transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
 >
 <Send className="w-3.5 h-3.5" /> Direct Dispatch
 </button>
 </div>
 </div>
 </div>
 );
 })}

 {unassignedCases.length === 0 && (
 <div className="p-8 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-center text-slate-600 dark:text-slate-300 text-xs italic">
 No cases are currently awaiting technician assignment. Excellent dispatch efficiency!
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Machinery Status Controls (5 columns) */}
 <div className="lg:col-span-5 space-y-6">
 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 space-y-4 shadow-xs">
 <h3 className="font-bold text-xs text-slate-900 dark:text-slate-50 font-medium font-sans flex items-center gap-1.5">
 <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
 Connected Studio Machinery
 </h3>
 
 <p className="text-xs text-slate-550 leading-relaxed font-normal">
 Supervise connected digital laboratory fabrication gear and heat furnaces. Toggle active statuses if required:
 </p>

 <div className="space-y-3 pt-1">
 {machinery.map(mach => (
 <div key={mach.id} className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center shadow-xs">
 <div>
 <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{mach.name}</h4>
 <span className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 block font-sans mt-0.5">{mach.type} — Active Load: <strong>{mach.load}</strong></span>
 </div>

 <div className="flex items-center gap-3">
 <span className={`text-sm font-sans font-bold uppercase ${mach.status === "Active" ? "text-orange-600" : "text-slate-600 dark:text-slate-300"}`}>
 {mach.status}
 </span>
 <button
 onClick={() => handleToggleMachinery(mach.id, mach.name)}
 className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
 mach.status === "Active" 
 ? "bg-orange-50 dark:bg-orange-900/20 border-orange-350 text-orange-600 hover:bg-orange-100" 
 : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800"
 }`}
 >
 {mach.status === "Active" ? <Play className="w-3.5 h-3.5 font-bold animate-pulse" /> : <Pause className="w-3.5 h-3.5" />}
 </button>
 </div>
 </div>
 ))}
 </div>
 </div>

 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 space-y-4.5 shadow-xs">
 <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-medium text-sm font-sans">
 <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
 Boston HQ HIPAA Security
 </h4>
 
 <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal font-sans">
 <p>
 In alignment with administrative boundaries from HIPAA, direct dispatch workflows enforce:
 </p>
 <ul className="list-disc pl-4 space-y-1.5 text-slate-500 dark:text-slate-400 dark:text-slate-500 text-sm">
 <li>
 <strong className="text-slate-800 dark:text-slate-200 font-bold">Unjointed Dentist Queries:</strong> Dentist connections bypass tech benches profiles to ensure contractor name rules exposure safety.
 </li>
 <li>
 <strong className="text-slate-800 dark:text-slate-200 font-bold">Audited Dispatches:</strong> Every dispatch generates logged timestamp trails cleanly inside administrative audit cards.
 </li>
 </ul>
 </div>
 </div>
 </div>

 </div>

 </div>
 );
}
