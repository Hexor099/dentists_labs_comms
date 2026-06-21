/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from "react";
import { 
 Building2, Users, FileText, Activity, Layers, ArrowUpRight, 
 Sparkles, CheckCircle2, Clock, Eye, AlertCircle, Heart,
 Tv, Cpu, ShieldCheck, Dumbbell, Play, Pause, ChevronRight, Inbox,
 Briefcase, Download, Calendar, DollarSign, Send, HelpCircle, Flame, 
 Thermometer, RotateCcw, FolderUp, Check, RefreshCcw, FileUp, Zap, Sliders
} from "lucide-react";
import { techniciansList } from "./LabAdminDashboardView";

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
 filesUploaded?: { name: string; size: string; uploadedAt: string }[];
}

interface TechnicianDashboardProps {
 cases: CaseItem[];
 onTransitionStatus: (caseId: string, status: any) => void;
 onUpdateProgress: (caseId: string, progress: number, techNotes: string) => void;
 onUploadCompletedWork: (caseId: string, file: { name: string; size: string }) => void;
 triggerGlobalToast: (msg: string) => void;
}

export default function TechnicianDashboardView({
 cases,
 onTransitionStatus,
 onUpdateProgress,
 onUploadCompletedWork,
 triggerGlobalToast
}: TechnicianDashboardProps) {
 
 // Simulated logged-in technician selector
 const [activeTechId, setActiveTechId] = useState("tech-marcus");
 
 // Sintering run states
 const [runningFurnace, setRunningFurnace] = useState(false);
 const [currentTemp, setCurrentTemp] = useState(24); // Degrees Celsius
 const [sinteringProgress, setSinteringProgress] = useState(0);
 const [activePreset, setActivePreset] = useState("translucent"); // translucent vs ultra-durability

 // Local editing states for notes and uploads
 const [editingNotesByCase, setEditingNotesByCase] = useState<Record<string, string>>({});
 const [dragActiveByCase, setDragActiveByCase] = useState<Record<string, boolean>>({});

 const activeTechInfo = techniciansList.find(t => t.id === activeTechId) || techniciansList[0];

 // Filter cases assigned to active simulated technician
 const myBenchCases = cases.filter(c => c.technicianId === activeTechId);

 const getTechCapacityPoints = (techId: string) => {
 return cases
 .filter(c => c.technicianId === techId && c.status !== "Completed" && c.status !== "Ready for Dispatch")
 .reduce((sum, c) => sum + (c.workloadWeight || 2), 0);
 };

 const currentCapsPoints = getTechCapacityPoints(activeTechId);

 const techStats = [
 { label: "My Active Bench", val: `${myBenchCases.length} Active`, change: `${currentCapsPoints} Capacity points used`, icon: <Briefcase className="w-4 h-4 text-amber-500" /> },
 { label: "Design Capacity", val: `${activeTechInfo.maxCapacity} Units`, change: "Configured limit guides", icon: <Sliders className="w-4 h-4 text-blue-550" /> },
 { label: "Active Sinter Runs", val: "19 Programs", change: "100% calibration rate", icon: <Flame className="w-4 h-4 text-rose-500" /> },
 { label: "Milled OBJ files", val: "34 Designs", change: "Digital scans validated", icon: <FileText className="w-4 h-4 text-blue-500" /> }
 ];

 // Simulator sintering furnace thermal increments loop
 useEffect(() => {
 let interval: any;
 if (runningFurnace) {
 interval = setInterval(() => {
 setSinteringProgress(prev => {
 const next = prev + 5;
 if (next >= 100) {
 setRunningFurnace(false);
 setCurrentTemp(1450);
 triggerGlobalToast("Successfully completed target Zirconia sintering program! Crown structural strength calibrated.");
 return 100;
 }
 const targetTemp = activePreset === "translucent" ? 1450 : 1550;
 setCurrentTemp(Math.round(24 + (targetTemp - 24) * (next / 100)));
 return next;
 });
 }, 250);
 } else {
 clearInterval(interval);
 }
 return () => clearInterval(interval);
 }, [runningFurnace, activePreset]);

 const handleStartSintering = () => {
 if (sinteringProgress === 100) {
 setSinteringProgress(0);
 setCurrentTemp(24);
 }
 setRunningFurnace(true);
 triggerGlobalToast(`Starting thermal sintering run: ${activePreset.toUpperCase()} profile!`);
 };

 const handleStopSintering = () => {
 setRunningFurnace(false);
 triggerGlobalToast("Sintering program paused.");
 };

 const handleResetFurnace = () => {
 setRunningFurnace(false);
 setSinteringProgress(0);
 setCurrentTemp(24);
 triggerGlobalToast("Sintering oven reset to cool baseline.");
 };

 // Drag and Drop simulation for completed work files
 const handleDragOver = (e: React.DragEvent, caseId: string) => {
 e.preventDefault();
 setDragActiveByCase(prev => ({ ...prev, [caseId]: true }));
 };

 const handleDragLeave = (e: React.DragEvent, caseId: string) => {
 e.preventDefault();
 setDragActiveByCase(prev => ({ ...prev, [caseId]: false }));
 };

 const handleDrop = (e: React.DragEvent, caseId: string) => {
 e.preventDefault();
 setDragActiveByCase(prev => ({ ...prev, [caseId]: false }));

 if (e.dataTransfer.files && e.dataTransfer.files[0]) {
 const file = e.dataTransfer.files[0];
 const fileSizeStr = `${(file.size / 1024 / 1024).toFixed(1)} MB`;
 onUploadCompletedWork(caseId, { name: file.name, size: fileSizeStr });
 triggerGlobalToast(`Attached completed work file: ${file.name} to Case ${caseId}!`);
 }
 };

 const handleTriggerMockUpload = (caseId: string, name: string) => {
 onUploadCompletedWork(caseId, { name, size: "18.4 MB" });
 triggerGlobalToast(`Uploaded completed CAD structure: ${name}`);
 };

 const saveBenchNotes = (caseId: string) => {
 const notes = editingNotesByCase[caseId] || "";
 // Defaulting progress update percentage to 100 for completed files save
 onUpdateProgress(caseId, 100, notes);
 triggerGlobalToast(`Updated bench comments for Case ${caseId}.`);
 };

 return (
 <div id="technician-dashboard-view" className="space-y-6 animate-fadeIn pb-16">
 
 {/* Technician Switch Banner */}
 <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div className="flex items-center gap-4 font-sans">
 <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
 {activeTechInfo.name.substring(0, 2).toUpperCase()}
 </div>
 <div>
 <div className="flex items-center gap-2">
 <h2 className="text-sm font-bold text-slate-900 dark:text-slate-50">{activeTechInfo.name}</h2>
 <span className="text-sm font-sans px-2 py-0.5 rounded-full uppercase border bg-amber-55/10 border-amber-200 text-amber-700 font-bold">
 Specialist Technician
 </span>
 </div>
 <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">{activeTechInfo.specialty} • Bench Slot Operational</p>
 </div>
 </div>

 {/* Technician Selector Dropdown */}
 <div className="flex items-center gap-3 select-none text-xs">
 <span className="text-sm font-sans text-slate-600 dark:text-slate-300 font-bold uppercase whitespace-nowrap">Active Bench Profile:</span>
 <select
 value={activeTechId}
 onChange={e => {
 setActiveTechId(e.target.value);
 triggerGlobalToast(`Transferred active desktop view to ${techniciansList.find(t=>t.id===e.target.value)?.name}`);
 }}
 className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-805 py-1.5 px-3 rounded-xl focus:outline-none cursor-pointer font-bold shadow-xs"
 >
 {techniciansList.map(t => (
 <option key={t.id} value={t.id}>
 {t.name} ({getTechCapacityPoints(t.id)} Units)
 </option>
 ))}
 </select>
 </div>
 </div>

 {/* Stats row */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {techStats.map((stat, idx) => (
 <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4.5 rounded-xl flex flex-col justify-between shadow-xs">
 <div className="flex justify-between items-center">
 <span className="text-sm font-sans text-slate-600 dark:text-slate-300 font-semibold">
 {stat.label}
 </span>
 <div className="bg-slate-50 dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-bold">
 {stat.icon}
 </div>
 </div>
 <div className="mt-2.5 text-xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">{stat.val}</div>
 <div className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 font-medium">{stat.change}</div>
 </div>
 ))}
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
 
 {/* Cases Allocated on My Bench (7 columns) */}
 <div className="lg:col-span-7 space-y-6">
 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-4 shadow-xs">
 <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
 <div>
 <h3 className="font-bold text-xs text-slate-900 dark:text-slate-50 font-medium font-sans flex items-center gap-1.5">
 <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
 My Allocated Bench Cases
 </h3>
 <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">Dental orders strictly verified and routed to active credentials register</p>
 </div>
 <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-sans text-sm px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 font-bold">
 {myBenchCases.length} Assigned Cards
 </span>
 </div>

 <div className="space-y-5 pt-1 animate-fadeIn text-xs">
 {myBenchCases.map(c => {
 const isDragOver = dragActiveByCase[c.id] || false;
 const notesVal = editingNotesByCase[c.id] !== undefined ? editingNotesByCase[c.id] : (c.internalNotes || "");

 return (
 <div key={c.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4.5 rounded-2xl space-y-4 shadow-xs hover:border-slate-300 dark:border-slate-600 transition-all">
 
 <div className="flex justify-between items-start flex-wrap gap-2">
 <div>
 <div className="flex items-center gap-1.5 font-semibold">
 <span>Patient Initials: <span className="text-blue-600 dark:text-blue-400 font-sans bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-1.5 py-0.5 rounded font-extrabold">{c.patientInitials}</span></span>
 <span className="text-sm text-slate-600 dark:text-slate-300 font-sans">#{c.id}</span>
 </div>
 <p className="text-sm text-slate-550 mt-1">Dentist: <strong className="text-slate-700 dark:text-slate-300">{c.dentistName}</strong></p>
 </div>

 <div className="text-right">
 <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-150 font-sans text-sm px-2 py-0.5 rounded font-bold font-medium text-sm">
 {c.assignedStage || "CAD_DESIGN"}
 </span>
 <p className="text-sm text-slate-600 dark:text-slate-300 font-sans mt-1 font-semibold">STATE: <strong className="text-slate-800 dark:text-slate-200">{c.status}</strong></p>
 </div>
 </div>

 <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl leading-relaxed text-slate-600 dark:text-slate-300 font-normal">
 <span className="text-sm font-sans text-slate-600 dark:text-slate-300 uppercase font-bold block mb-1">Clinical Instructions:</span>
 "{c.instructions}"
 </div>

 {/* Drag and Drop finished scan model upload file wrapper */}
 <div className="space-y-2">
 <label className="text-sm font-sans text-slate-600 dark:text-slate-300 uppercase font-bold block">Submit Completed 3D STL CAD (HIPAA Safe Upload)</label>
 
 <div
 onDragOver={e => handleDragOver(e, c.id)}
 onDragLeave={e => handleDragLeave(e, c.id)}
 onDrop={e => handleDrop(e, c.id)}
 className={`border-2 border-dashed rounded-xl p-5 text-center transition-colors cursor-pointer flex flex-col items-center justify-center space-y-2 ${
 isDragOver 
 ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20" 
 : "border-slate-250 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:bg-slate-800"
 }`}
 >
 <FileUp className={`w-6 h-6 ${isDragOver ? "text-blue-600 dark:text-blue-400 animate-bounce" : "text-slate-600 dark:text-slate-300"}`} />
 <div>
 <span className="text-sm text-slate-800 dark:text-slate-200 font-bold block">Drag completed STL mesh files here</span>
 <span className="text-sm text-slate-450 block italic mt-0.5">Or tap shortcut button below to mock completed CAD design transmission</span>
 </div>
 </div>

 <div className="flex flex-col sm:flex-row gap-2 pt-1 animate-fadeIn font-semibold">
 <button
 onClick={() => handleTriggerMockUpload(c.id, `${c.id}_AnatomicalCrown_SINTER_OK.obj`)}
 className="flex-1 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
 >
 <FolderUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Upload `{c.id}_Crown_SINTER.obj` (Mock)
 </button>
 </div>
 </div>

 {/* Technician private bench notes */}
 <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
 <label className="text-sm font-sans text-slate-600 dark:text-slate-300 uppercase font-bold block">My Private Bench Comments</label>
 <input
 type="text"
 value={notesVal}
 onChange={e => setEditingNotesByCase(prev => ({ ...prev, [c.id]: e.target.value }))}
 placeholder="e.g. Adjusted lithium disilicate margin profile to prevent edge tension cracks."
 className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 p-2.5 rounded-xl text-xs focus:outline-none focus:border-blue-200 dark:border-blue-800 font-medium"
 />
 <div className="pt-2 flex justify-between items-center text-sm font-semibold">
 <span className="text-slate-600 dark:text-slate-300">Notes sync client-side</span>
 <button
 onClick={() => saveBenchNotes(c.id)}
 className="px-3.5 py-1.5 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 text-white font-bold text-xs rounded-lg flex items-center gap-1 transition-all shadow-xs cursor-pointer"
 >
 <Check className="w-3.5 h-3.5" /> Save Comments
 </button>
 </div>
 </div>

 </div>
 );
 })}

 {myBenchCases.length === 0 && (
 <div className="p-10 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-center text-slate-600 dark:text-slate-300 italic">
 No restorations currently allocated on your bench. Excellent! Keep connected with the Lab Admin for new dispatches.
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Column 2: Immersive calibration sintering furnace (5 columns) */}
 <div className="lg:col-span-5 space-y-6">
 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 space-y-4 shadow-xs select-none">
 <div className="flex justify-between items-center">
 <div>
 <h3 className="font-extrabold text-xs text-slate-900 dark:text-slate-50 font-medium font-sans">
 Zirconia Sintering Oven
 </h3>
 <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">Nabertherm high temperature calibration monitor</p>
 </div>
 <Thermometer className="w-5 h-5 text-rose-500 animate-pulse" />
 </div>

 <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4.5 rounded-xl space-y-4 flex flex-col items-center justify-center text-center">
 
 {/* Dial design */}
 <div className="relative w-36 h-36 border-4 border-slate-200 dark:border-slate-700 rounded-full flex flex-col items-center justify-center bg-white dark:bg-slate-900 shadow-xs">
 
 {/* Circular ring highlights based on running furnace state */}
 {runningFurnace && (
 <div className="absolute inset-1 rounded-full border-2 border-dashed border-rose-500 animate-spin opacity-45 duration-1000" />
 )}

 <span className="text-sm font-sans text-slate-600 dark:text-slate-300 uppercase font-bold">Oven temp</span>
 <strong className={`text-2xl font-extrabold tracking-tight ${runningFurnace ? "text-rose-600" : "text-slate-800 dark:text-slate-200"}`}>
 {currentTemp}°C
 </strong>
 <span className="text-xs font-sans text-slate-600 dark:text-slate-300 font-bold block uppercase mt-0.5">
 Preset: {activePreset}
 </span>
 
 {runningFurnace && (
 <span className="text-sm text-amber-600 font-sans font-bold block uppercase mt-2 animate-pulse">
 RUNNING...
 </span>
 )}
 </div>

 {/* Progress percentage */}
 <div className="w-full space-y-1 text-xs">
 <div className="flex justify-between text-sm font-sans text-slate-600 dark:text-slate-300 font-bold">
 <span>SINTER THERMAL PROFILE:</span>
 <span>{sinteringProgress}% COMPLETE</span>
 </div>
 <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
 <div 
 className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300"
 style={{ width: `${sinteringProgress}%` }}
 />
 </div>
 </div>

 {/* Preset selection tabs */}
 <div className="grid grid-cols-2 gap-2 w-full pt-1">
 <button
 disabled={runningFurnace}
 onClick={() => setActivePreset("translucent")}
 className={`py-1.5 rounded-lg text-center font-bold text-sm cursor-pointer border font-sans uppercase transition-all ${
 activePreset === "translucent" 
 ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-white shadow-xs" 
 : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800 disabled:opacity-40"
 }`}
 >
 IPS Translucent (1450°C)
 </button>
 <button
 disabled={runningFurnace}
 onClick={() => setActivePreset("ultra")}
 className={`py-1.5 rounded-lg text-center font-bold text-sm cursor-pointer border font-sans uppercase transition-all ${
 activePreset === "ultra" 
 ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-white shadow-xs" 
 : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800 disabled:opacity-40"
 }`}
 >
 Ultra Strength (1550°C)
 </button>
 </div>

 {/* Furnace Action controls */}
 <div className="grid grid-cols-3 gap-2 w-full pt-1.5">
 {!runningFurnace ? (
 <button
 onClick={handleStartSintering}
 className="col-span-2 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer animate-fadeIn font-sans"
 >
 <Play className="w-3.5 h-3.5" /> Start run
 </button>
 ) : (
 <button
 onClick={handleStopSintering}
 className="col-span-2 py-2 bg-amber-500 hover:bg-amber-600 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer animate-fadeIn font-sans"
 >
 <Pause className="w-3.5 h-3.5 font-bold" /> Pause run
 </button>
 )}

 <button
 onClick={handleResetFurnace}
 className="py-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer font-sans"
 >
 <RefreshCcw className="w-3.5 h-3.5" /> Reset
 </button>
 </div>

 </div>
 </div>

 <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-4 shadow-xs">
 <h4 className="text-xs font-bold text-slate-900 dark:text-slate-50 flex items-center gap-1.5 font-medium text-sm font-sans">
 <ShieldCheck className="w-4 h-4 text-emerald-600" />
 Sintering compliance rules
 </h4>
 
 <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
 <p>
 To maintain structural density and safety, follow clinical laboratory standard procedures:
 </p>
 <ul className="list-disc pl-4 space-y-1.5 text-slate-550 text-sm">
 <li>
 <strong className="text-slate-800 dark:text-slate-200">Shrinkage Factor matching:</strong> Zirconia pre-sinter structures must feature a linear scale compensation ratio of precisely **1.22** to offset oven shrinkage.
 </li>
 <li>
 <strong className="text-slate-800 dark:text-slate-200">Microscopic Margin inspect:</strong> Always review margins under 10x microscopic lenses prior to thermal glaze cycles.
 </li>
 </ul>
 </div>
 </div>
 </div>

 </div>

 </div>
 );
}
