/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from "react";
import { 
 Building2, FileText, Activity, ShieldAlert, Sparkles, AlertCircle, 
 Tv, Stethoscope, Plus, Heart, HelpCircle, CheckCircle2, ChevronRight,
 Sliders, User, ShieldCheck, Laptop, AlertTriangle, Eye, X, MessageSquare, Flame
} from "lucide-react";

interface DentistDashboardProps {
 cases: any[];
 onNavigateToTab: (tab: any) => void;
 triggerGlobalToast: (msg: string) => void;
 onAddCase: (newCase: any) => void;
}

// Convert internal status value to dentist high-level statuses
function toDentistClientStatus(status: string): string {
 switch (status) {
 case "Created":
 case "Received":
 return "Received";
 case "Assigned":
 case "In Production":
 case "In Progress":
 return "In Progress";
 case "Quality Check":
 case "QC & Finishing":
 return "Quality Check";
 case "Ready for Dispatch":
 case "Ready For Dispatch":
 return "Ready for Delivery";
 case "Completed":
 case "Dispatched":
 case "Delivered":
 return "Delivered";
 default:
 return status;
 }
}

export default function DentistDashboardView({ 
 cases, 
 onNavigateToTab, 
 triggerGlobalToast,
 onAddCase 
}: DentistDashboardProps) {
 
 const [activeTeethView, setActiveTeethView] = useState<"arch" | "prep" | "crown">("arch");
 const [zirconiaTranslucency, setZirconiaTranslucency] = useState(82);
 const [clinicalMillingMaterial, setClinicalMillingMaterial] = useState("IPS e.max CAD");

 // Detailed Modal states
 const [selectedCaseDetail, setSelectedCaseDetail] = useState<any | null>(null);
 const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);

 // New Case form state
 const [patientInitials, setPatientInitials] = useState("");
 const [caseType, setCaseType] = useState("Crown");
 const [dueDate, setDueDate] = useState("2026-06-28");
 const [instructions, setInstructions] = useState("");

 // Card Calculations (Directly derived from synchronized cases state)
 const activeCasesCount = cases.filter(c => toDentistClientStatus(c.status) !== "Delivered").length;
 const inProductionCount = cases.filter(c => toDentistClientStatus(c.status) === "In Progress" || toDentistClientStatus(c.status) === "Quality Check").length;
 const deliveredCount = cases.filter(c => toDentistClientStatus(c.status) === "Delivered").length;
 const actionRequiredCount = cases.filter(c => toDentistClientStatus(c.status) === "Received").length;

 const dentistStats = [
 { label: "Active Cases", val: `${activeCasesCount} Active`, change: "Tracked in secure queue", icon: <Stethoscope className="w-4 h-4 text-blue-600 dark:text-blue-400" /> },
 { label: "In Production", val: `${inProductionCount} Restorations`, change: "Milling substrate active", icon: <Flame className="w-4 h-4 text-blue-500" /> },
 { label: "Delivered", val: `${deliveredCount} Completed`, change: "Dispatched & completed", icon: <CheckCircle2 className="w-4 h-4 text-emerald-650" /> },
 { label: "Action Required", val: `${actionRequiredCount} Pending`, change: "Awaiting lab assignment", icon: <AlertCircle className="w-4 h-4 text-amber-500" /> }
 ];

 const handleCreateCaseLocal = (e: React.FormEvent) => {
 e.preventDefault();
 if (!patientInitials.trim()) {
 triggerGlobalToast("Error: Patient monogram initials are required.");
 return;
 }
 if (patientInitials.length > 4 || !/^[A-Z.\s]+$/i.test(patientInitials)) {
 triggerGlobalToast("HIPAA Privacy Block: Please input initials only (e.g. F. M.) to protect patient personal indicators.");
 return;
 }
 
 const newMockId = `CS-00${cases.length + 1}`;
 onAddCase({
 id: newMockId,
 patientInitials: patientInitials.toUpperCase().trim(),
 caseType,
 dueDate,
 dentistName: "Dr. Catherine Vance",
 clinicName: "Apex Cosmetic Dentistry Inc.",
 status: "Created",
 instructions: instructions || "Standard Vita A2 translucency index cap requested."
 });

 setPatientInitials("");
 setInstructions("");
 setIsNewCaseModalOpen(false);
 triggerGlobalToast(`Successfully registered new restoration Case: ${newMockId}`);
 };

 return (
 <div id="dentist-dashboard-view" className="space-y-6 animate-fadeIn pb-16">
 
 {/* Clinician Welcome Banner */}
 <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-xl bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
 CV
 </div>
 <div>
 <div className="flex items-center gap-2">
 <h2 className="text-sm font-bold text-slate-900 dark:text-slate-50">Dr. Catherine Vance</h2>
 <span className="text-sm font-sans px-2 py-0.5 rounded-full uppercase border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold">
 Dentist Persona
 </span>
 </div>
 <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">Apex Cosmetic Dentistry Inc. — Clinical Member Since 2024</p>
 </div>
 </div>

 <button 
 id="btn-dentist-new-case"
 onClick={() => setIsNewCaseModalOpen(true)}
 className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-xs cursor-pointer"
 >
 <Plus className="w-4 h-4" /> Register New Case
 </button>
 </div>

 {/* Stats Cards Row */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {dentistStats.map((stat, idx) => (
 <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4.5 rounded-xl flex flex-col justify-between shadow-xs">
 <div className="flex justify-between items-center">
 <span className="text-sm font-sans text-slate-600 dark:text-slate-300 font-semibold">
 {stat.label}
 </span>
 <div className="bg-slate-50 dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
 {stat.icon}
 </div>
 </div>
 <div className="mt-2.5 text-xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">{stat.val}</div>
 <div className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 font-medium">{stat.change}</div>
 </div>
 ))}
 </div>

 {/* Case Listing Table (Dentist View) */}
 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs space-y-4">
 <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center flex-wrap gap-2">
 <div>
 <h3 className="text-xs font-bold text-slate-900 dark:text-slate-50 font-medium font-sans">
 Patients Restorations Queue
 </h3>
 <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">HIPAA-anonymized active cases assigned to dental laboratory technicians</p>
 </div>
 <span className="text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold px-2.5 py-1 rounded-full border border-blue-150 font-sans">
 {cases.length} Restorations Total
 </span>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse text-xs">
 <thead>
 <tr className="border-b border-slate-250 text-slate-600 dark:text-slate-300 font-medium font-bold">
 <th className="py-3 px-4 text-sm">Case ID</th>
 <th className="py-3 px-4 text-sm">Patient</th>
 <th className="py-3 px-4 text-sm">Restoration</th>
 <th className="py-3 px-4 text-sm">Lab</th>
 <th className="py-3 px-4 text-sm">Due Date</th>
 <th className="py-3 px-4 text-sm">Status</th>
 <th className="py-3 px-4 text-sm text-right">View</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 font-medium">
 {cases.map((c) => {
 const dentistStatus = toDentistClientStatus(c.status);
 let badgeClass = "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700";
 
 if (dentistStatus === "Received") {
 badgeClass = "bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700";
 } else if (dentistStatus === "In Progress") {
 badgeClass = "bg-orange-50 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-700/50";
 } else if (dentistStatus === "Quality Check") {
 badgeClass = "bg-pink-50 text-pink-700 border-pink-200";
 } else if (dentistStatus === "Ready for Delivery") {
 badgeClass = "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 border-indigo-200";
 } else if (dentistStatus === "Delivered") {
 badgeClass = "bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700/50";
 }

 return (
 <tr key={c.id} className="hover:bg-slate-50 dark:bg-slate-800 transition-colors">
 <td className="py-3 px-4 font-sans font-bold text-slate-800 dark:text-slate-200">{c.id}</td>
 <td className="py-3 px-4">
 <span className="font-sans bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-extrabold text-sm">
 {c.patientInitials}
 </span>
 </td>
 <td className="py-3 px-4">{c.caseType}</td>
 <td className="py-3 px-4">
 <span className="text-slate-600 dark:text-slate-300 text-sm font-sans flex items-center gap-1.5">
 <Building2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
 Boston CAD/CAM Hub
 </span>
 </td>
 <td className="py-3 px-4 font-sans">{c.dueDate}</td>
 <td className="py-3 px-4">
 <span className={`px-2.5 py-0.5 rounded-full text-sm font-sans font-bold border uppercase shrink-0 ${badgeClass}`}>
 {dentistStatus}
 </span>
 </td>
 <td className="py-3 px-4 text-right">
 <button
 onClick={() => setSelectedCaseDetail(c)}
 className="p-1.5 px-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-slate-100 dark:bg-blue-800/30 rounded-lg transition-all text-sm font-bold cursor-pointer inline-flex items-center gap-1"
 >
 <Eye className="w-3.5 h-3.5" /> Details
 </button>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

 {/* Column 1: Clinician Workstation Prompts */}
 <div className="lg:col-span-7 space-y-6">
 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-4 shadow-xs">
 <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
 <div>
 <h3 className="font-bold text-xs text-slate-900 dark:text-slate-50 font-medium font-sans">
 Clinician Material Assistant
 </h3>
 <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">Rapid shortcuts mapped for active dental surgery and scan submissions</p>
 </div>
 <Sparkles className="text-blue-600 dark:text-blue-400 w-4 h-4" />
 </div>

 <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
 Below are active patient restoration channels mapped to your medical ID. As a clinician, your portal strictly enforces HIPAA data anonymization. Under system guidelines, you can submit and view digital cases, but full technician contractor names and bench records are masked.
 </p>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
 <div 
 id="dentist-shortcut-uploads"
 onClick={() => onNavigateToTab("uploads")}
 className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:border-blue-800 p-3.5 rounded-xl space-y-2 cursor-pointer transition-all group"
 >
 <div className="flex items-center gap-1.5">
 <Laptop className="w-4 h-4 text-blue-600 dark:text-blue-400" />
 <span className="text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-sans font-bold uppercase">
 3D Scan Upload
 </span>
 </div>
 <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:text-blue-400">S3 Secure Storage</h4>
 <p className="text-sm text-slate-600 dark:text-slate-300">Upload intraoral STL/PLY bite structures and matching profile images instantly.</p>
 </div>

 <div 
 id="dentist-shortcut-chat"
 onClick={() => onNavigateToTab("chat")}
 className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:border-blue-800 p-3.5 rounded-xl space-y-2 cursor-pointer transition-all group"
 >
 <div className="flex items-center gap-1.5">
 <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
 <span className="text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-sans font-bold uppercase">
 Clinical chat
 </span>
 </div>
 <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:text-blue-400">Direct Lab Messenger</h4>
 <p className="text-sm text-slate-600 dark:text-slate-300">Coordinate shade matches, margins alignment and shipping revisions directly.</p>
 </div>
 </div>

 <div className="bg-slate-50 dark:bg-slate-800 border border-slate-250 p-4 rounded-xl space-y-3 pt-4">
 <span className="text-sm font-sans text-slate-600 dark:text-slate-300 uppercase block font-bold">Select Clinical Milling Material:</span>
 <div className="grid grid-cols-3 gap-2">
 {["IPS e.max CAD", "Esthetic Zirconia", "Feldspathic Glass"].map(mat => (
 <button
 key={mat}
 onClick={() => { setClinicalMillingMaterial(mat); triggerGlobalToast(`Formulated composite instructions: ${mat}`); }}
 className={`py-2 rounded-lg text-center font-bold text-sm cursor-pointer border transition-all ${
 clinicalMillingMaterial === mat
 ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 shadow-xs"
 : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800"
 }`}
 >
 {mat}
 </button>
 ))}
 </div>

 <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal shadow-xs">
 {clinicalMillingMaterial === "IPS e.max CAD" && (
 <p>
 <strong className="text-blue-600 dark:text-blue-400 font-bold">Lithium Disilicate glass-ceramic:</strong> Yields a flexural strength of **500 MPa** with unmatched lifelike translucency index. Best suited for high-aesthetic anterior veneers and single posterior crowns.
 </p>
 )}
 {clinicalMillingMaterial === "Esthetic Zirconia" && (
 <p>
 <strong className="text-blue-600 dark:text-blue-400 font-bold">Multi-layer Solid Zirconium Dioxide:</strong> Delivers extreme fracture resistance (**&gt;1000 MPa**) combined with realistic shade gradation. Excellent for multi-unit posterior bridges.
 </p>
 )}
 {clinicalMillingMaterial === "Feldspathic Glass" && (
 <p>
 <strong className="text-blue-600 dark:text-blue-400 font-bold">Porcelain Veneer Laminate:</strong> Ideal for micro-invasive aesthetic veneers. Exceptional glass matrix homogeneity allows precise etching and durable restoration bounds.
 </p>
 )}
 </div>
 </div>
 </div>
 </div>

 {/* Column 2: 3D CAD/CAM Viewer Simulation */}
 <div className="lg:col-span-5 space-y-6">
 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-4 shadow-xs">
 <div className="flex justify-between items-center">
 <div>
 <h3 className="font-bold text-xs text-slate-900 dark:text-slate-50 font-medium font-sans">
 3D Scan Inspector Portal
 </h3>
 <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">Real-time STL client scan alignment & density validation</p>
 </div>
 <Tv className="w-4 h-4 text-slate-600 dark:text-slate-300" />
 </div>

 <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 flex flex-col items-center justify-center relative min-h-[300px] overflow-hidden group select-none transition-colors duration-300">
 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_75%)]" />

 <div className="relative w-full flex flex-col items-center justify-center text-center py-4 space-y-4">
 {activeTeethView === "arch" && (
 <div className="space-y-4 animate-fadeIn">
 <svg className="w-32 h-20 text-blue-600 dark:text-blue-400 mx-auto opacity-75" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
 <path d="M10,40 C15,10 85,10 90,40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
 <circle cx="20" cy="25" r="4.5" fill="#3B82F6" />
 <circle cx="35" cy="18" r="4.5" fill="#3B82F6" />
 <circle cx="50" cy="15" r="5.5" fill="#EA580C" stroke="#000" strokeWidth="1" className="animate-pulse" />
 <circle cx="65" cy="18" r="4.5" fill="#3B82F6" />
 <circle cx="80" cy="25" r="4.5" fill="#3B82F6" />
 </svg>
 <div>
 <span className="text-sm font-sans text-slate-600 dark:text-slate-300 block uppercase font-bold">CAD Model Viewport</span>
 <strong className="text-xs text-slate-800 dark:text-slate-200 block mt-1">Whole Mandibular Arch Scan #30</strong>
 <span className="text-sm text-blue-600 dark:text-blue-400 font-sans mt-1 block font-bold">Active Mesh Size: 34.2 MB PLY</span>
 </div>
 </div>
 )}

 {activeTeethView === "prep" && (
 <div className="space-y-4 animate-fadeIn">
 <svg className="w-24 h-20 text-rose-500 mx-auto" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
 <path d="M15,40 L15,25 Q15,15 25,15 Q35,15 35,25 L35,40" stroke="currentColor" strokeWidth="2.5" />
 <ellipse cx="25" cy="40" rx="11" ry="3" stroke="#F43F5E" strokeWidth="2" className="animate-pulse" />
 </svg>
 <div>
 <span className="text-sm font-sans text-rose-600 block uppercase font-bold">Prepped Margin Isolated</span>
 <strong className="text-xs text-slate-800 dark:text-slate-200 block mt-1">Isolated Molar #30 Prep Structure</strong>
 <span className="text-sm text-slate-600 dark:text-slate-300 font-sans mt-1 block">Tapered Margin Offset: <code className="text-slate-750 font-bold">0.03mm</code></span>
 </div>
 </div>
 )}

 {activeTeethView === "crown" && (
 <div className="space-y-4 animate-fadeIn">
 <svg className="w-24 h-20 text-orange-500 mx-auto" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
 <path d="M10,40 L12,21 Q25,11 38,21 L40,40 Z" fill="rgba(249,115,22,0.05)" stroke="currentColor" strokeWidth="2.5" />
 <ellipse cx="25" cy="40" rx="14" ry="4" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
 </svg>
 <div>
 <span className="text-sm font-sans text-orange-600 block uppercase font-bold">Anatomical Seating Profile</span>
 <strong className="text-xs text-slate-800 dark:text-slate-200 block mt-1">Milled prosthetic Cap Overlap</strong>
 <span className="text-sm text-blue-600 dark:text-blue-400 font-sans mt-1 block font-bold">Zirconia Translucency: <code className="text-orange-500">{zirconiaTranslucency}%</code></span>
 </div>
 </div>
 )}
 </div>

 <div className="absolute bottom-3 left-4 text-sm font-sans text-slate-600 dark:text-slate-300 flex gap-1.5 font-bold">
 <span>ROT: <code className="text-blue-600 dark:text-blue-400 font-bold">42.5°</code></span>
 <span>•</span>
 <span>ZOOM: <code className="text-blue-600 dark:text-blue-400 font-bold">1.5x</code></span>
 </div>
 <div className="absolute bottom-3 right-4 text-sm font-sans text-blue-600 dark:text-blue-400 font-bold uppercase">
 ● CALIBRATION MATCHED
 </div>
 </div>

 <div className="grid grid-cols-3 gap-2">
 <button
 onClick={() => { setActiveTeethView("arch"); triggerGlobalToast("Visualizing Whole Arch contour"); }}
 className={`py-1.5 rounded-lg text-sm font-sans text-center font-bold cursor-pointer border transition-all ${
 activeTeethView === "arch" 
 ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 shadow-xs" 
 : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800"
 }`}
 >
 1. Full Arch
 </button>
 <button
 onClick={() => { setActiveTeethView("prep"); triggerGlobalToast("Visualizing isolated tooth prep margins"); }}
 className={`py-1.5 rounded-lg text-sm font-sans text-center font-bold cursor-pointer border transition-all ${
 activeTeethView === "prep" 
 ? "bg-rose-50 border-rose-500 text-rose-700 shadow-xs" 
 : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800"
 }`}
 >
 2. Tooth Prep
 </button>
 <button
 onClick={() => { setActiveTeethView("crown"); triggerGlobalToast("Simulating crown overlay placement"); }}
 className={`py-1.5 rounded-lg text-sm font-sans text-center font-bold cursor-pointer border transition-all ${
 activeTeethView === "crown" 
 ? "bg-orange-50 dark:bg-orange-900/20 border-orange-500 text-orange-700 shadow-xs" 
 : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800"
 }`}
 >
 3. Design Cap
 </button>
 </div>

 {activeTeethView === "crown" && (
 <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2 text-xs shadow-xs">
 <div className="flex justify-between items-center text-sm font-sans text-slate-600 dark:text-slate-300 font-bold">
 <span>CAP TRANSLUCENCY PERCENTAGE:</span>
 <span className="text-orange-500 font-bold">{zirconiaTranslucency}%</span>
 </div>
 <input
 type="range"
 min="60"
 max="98"
 value={zirconiaTranslucency}
 onChange={e => setZirconiaTranslucency(parseInt(e.target.value))}
 className="w-full accent-blue-605 cursor-pointer text-xs"
 />
 </div>
 )}
 </div>

 <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-4 shadow-xs">
 <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-medium text-sm font-sans">
 <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
 Dental Regulatory Compliance
 </h4>
 
 <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
 <p>
 In alignment with administrative boundaries from HIPAA, your connection features independent encryption keys:
 </p>
 <ul className="list-disc pl-4 space-y-2 text-slate-600 dark:text-slate-300 text-sm">
 <li>
 <strong className="text-slate-800 dark:text-slate-200">Anonymized Patient Monograms:</strong> No raw names enter laboratory tables. Only secure initials are linked to prosthetic materials.
 </li>
 <li>
 <strong className="text-slate-800 dark:text-slate-200">Secure CAD Access:</strong> Custom 3D mesh files download with secure timeout tokens to guard network boundaries.
 </li>
 </ul>
 </div>
 </div>
 </div>

 </div>

 {/* FLOATING ACTION BUTTON (FAB) */}
 <div className="fixed bottom-6 right-6 z-40 select-none">
 <button
 onClick={() => setIsNewCaseModalOpen(true)}
 className="w-13 h-13 rounded-full bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 text-white shadow-sm flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 border-2 border-white ring-4 ring-blue-500/10"
 title="Register New Restoration Order"
 >
 <Plus className="w-6 h-6 stroke-[2.5]" />
 </button>
 </div>

 {/* MODAL 1: NEW CASE ORDER REGISTRATION */}
 {isNewCaseModalOpen && (
 <div className="fixed inset-0 z-50 overflow-y-auto bg-white dark:bg-slate-900 flex items-center justify-center p-4">
 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full shadow-sm overflow-hidden animate-fadeIn">
 
 <div className="bg-slate-50 dark:bg-slate-800 p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
 <div className="flex items-center gap-2">
 <div className="p-2 rounded-lg bg-blue-100 text-blue-700 dark:text-blue-300">
 <Stethoscope className="w-4 h-4" />
 </div>
 <div>
 <h3 className="font-bold text-sm text-slate-950 font-sans">New Restoration Registration</h3>
 <p className="text-sm text-slate-600 dark:text-slate-300">HIPAA Compliant Order Ingestion Portal</p>
 </div>
 </div>
 <button 
 onClick={() => setIsNewCaseModalOpen(false)}
 className="p-1 px-2.5 hover:bg-slate-200 rounded text-slate-600 dark:text-slate-300 font-bold transition-all text-xs"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 <form onSubmit={handleCreateCaseLocal} className="p-5 space-y-4 text-xs font-medium">
 
 <div className="space-y-1">
 <label className="text-sm font-sans text-slate-600 dark:text-slate-300 uppercase font-bold block">Patient Initial Monogram (Required)</label>
 <input
 type="text"
 maxLength={4}
 value={patientInitials}
 onChange={e => setPatientInitials(e.target.value)}
 placeholder="e.g. S. M."
 className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 text-slate-900 dark:text-slate-50 p-2.5 rounded-xl text-xs focus:outline-none focus:border-blue-200 dark:border-blue-800 font-sans font-bold uppercase"
 required
 />
 <span className="text-sm text-slate-450 block italic">Enter patient initials only to strictly comply with HIPAA metadata rules.</span>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div className="space-y-1">
 <label className="text-sm font-sans text-slate-600 dark:text-slate-300 uppercase font-bold block">Case Type</label>
 <select
 value={caseType}
 onChange={e => setCaseType(e.target.value)}
 className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 text-slate-900 dark:text-slate-50 p-2.5 rounded-xl text-xs focus:outline-none focus:border-blue-200 dark:border-blue-800 cursor-pointer"
 >
 <option value="Crown">Anatomical Crown</option>
 <option value="Bridge">Multi-Unit Bridge</option>
 <option value="Veneer">Cosmetic Veneer</option>
 <option value="Implant">Implant Abutment</option>
 </select>
 </div>

 <div className="space-y-1">
 <label className="text-sm font-sans text-slate-600 dark:text-slate-300 uppercase font-bold block">Requested Due Date</label>
 <input
 type="date"
 value={dueDate}
 onChange={e => setDueDate(e.target.value)}
 className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 text-slate-900 dark:text-slate-50 p-2.5 rounded-xl text-xs focus:outline-none focus:border-blue-200 dark:border-blue-800"
 required
 />
 </div>
 </div>

 <div className="space-y-1">
 <label className="text-sm font-sans text-slate-600 dark:text-slate-300 uppercase font-bold block">Clinical Design Instructions</label>
 <textarea
 value={instructions}
 onChange={e => setInstructions(e.target.value)}
 placeholder="Include specific shade codes (e.g. Vita A2), margin preparation requests and translucency requirements here."
 rows={3}
 className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-250 text-slate-900 dark:text-slate-50 p-2.5 rounded-xl text-xs focus:outline-none focus:border-blue-200 dark:border-blue-800 font-sans"
 />
 </div>

 <div className="bg-blue-50 dark:bg-blue-900/20/50 p-3 rounded-xl border border-blue-200 dark:border-blue-800/50 flex items-start gap-2 text-sm text-blue-800 dark:text-blue-200 leading-normal font-normal">
 <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
 <span>
 This registration automatically initiates secure S3 buckets endpoints. You may drag-and-drop .PLY, .STL bite meshes onto the files tab immediately following registration.
 </span>
 </div>

 <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
 <button
 type="button"
 onClick={() => setIsNewCaseModalOpen(false)}
 className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold px-4 py-2 rounded-xl transition-all"
 >
 Cancel
 </button>
 <button
 type="submit"
 className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl transition-all shadow-xs"
 >
 Submit Order
 </button>
 </div>

 </form>
 </div>
 </div>
 )}

 {/* MODAL 2: CASE DETAIL SLIDE-OVER */}
 {selectedCaseDetail && (
 <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 flex justify-end">
 <div className="bg-white dark:bg-slate-900 max-w-lg w-full h-full shadow-sm flex flex-col overflow-y-auto animate-slideLeft border-l border-slate-200 dark:border-slate-700">
 
 {/* Modal Header */}
 <div className="p-5 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 dark:text-blue-300 flex items-center justify-center font-sans font-bold text-xs shrink-0">
 {selectedCaseDetail.id}
 </div>
 <div>
 <h3 className="font-bold text-sm text-slate-950">Restoration Details</h3>
 <p className="text-sm text-slate-600 dark:text-slate-300">Order timeline and design files</p>
 </div>
 </div>
 <button 
 onClick={() => setSelectedCaseDetail(null)}
 className="p-1 px-2.5 hover:bg-slate-200 rounded text-slate-600 dark:text-slate-300 font-bold transition-all text-xs"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {/* Modal Content */}
 <div className="p-5 flex-1 space-y-6 text-xs text-slate-600 dark:text-slate-300 font-medium">
 
 {/* Patient and clinical Info */}
 <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
 <div>
 <span className="text-sm font-sans text-slate-600 dark:text-slate-300 uppercase font-bold">Patient Monogram</span>
 <div className="font-bold text-slate-900 dark:text-slate-50 text-sm mt-0.5">{selectedCaseDetail.patientInitials}</div>
 </div>
 <div>
 <span className="text-sm font-sans text-slate-600 dark:text-slate-300 uppercase font-bold">Case Type</span>
 <div className="font-bold text-slate-900 dark:text-slate-50 text-sm mt-0.5">{selectedCaseDetail.caseType}</div>
 </div>
 <div>
 <span className="text-sm font-sans text-slate-600 dark:text-slate-300 uppercase font-bold">Clinical Dentist</span>
 <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedCaseDetail.dentistName}</div>
 </div>
 <div>
 <span className="text-sm font-sans text-slate-600 dark:text-slate-300 uppercase font-bold">Due Delivery Date</span>
 <div className="font-bold text-blue-600 dark:text-blue-400 mt-0.5">{selectedCaseDetail.dueDate}</div>
 </div>
 </div>

 {/* Status & Clinical Timeline Progress */}
 <div className="space-y-3">
 <span className="text-sm font-sans text-slate-600 dark:text-slate-300 uppercase font-bold block">Production Pipeline Milestone</span>
 
 <div className="relative pl-6 space-y-5 border-l-2 border-slate-200 dark:border-slate-700">
 {[
 { label: "Received", desc: "Digital ingestion approved" },
 { label: "In Progress", desc: "Technician active on bench" },
 { label: "Quality Check", desc: "CAD/CAM microscopic check" },
 { label: "Ready for Delivery", desc: "Invoice and dispatch issued" },
 { label: "Delivered", desc: "Returned to dental clinic" }
 ].map((step, index) => {
 const currentDentistStatus = toDentistClientStatus(selectedCaseDetail.status);
 const stepIndices: Record<string, number> = {
 "Received": 0,
 "In Progress": 1,
 "Quality Check": 2,
 "Ready for Delivery": 3,
 "Delivered": 4
 };
 const targetIdx = stepIndices[currentDentistStatus] ?? 0;
 const isDone = index <= targetIdx;
 const isCurrent = index === targetIdx;

 return (
 <div key={index} className="relative">
 <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 bg-white dark:bg-slate-900 flex items-center justify-center shrink-0 ${
 isDone 
 ? "border-blue-650 bg-blue-600 dark:bg-blue-500" 
 : "border-slate-300 dark:border-slate-600"
 }`}>
 {isDone && <CheckCircle2 className="w-2.5 h-2.5 text-white stroke-[3]" />}
 </span>
 <div>
 <h4 className={`font-bold uppercase text-sm tracking-wider ${
 isCurrent ? "text-blue-600 dark:text-blue-400 font-bold" : isDone ? "text-slate-800 dark:text-slate-200" : "text-slate-600 dark:text-slate-300"
 }`}>{step.label}</h4>
 <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{step.desc}</p>
 </div>
 </div>
 );
 })}
 </div>
 </div>

 {/* Instructions */}
 <div className="space-y-1.5">
 <span className="text-sm font-sans text-slate-600 dark:text-slate-300 uppercase font-bold block">Clinical Instructions</span>
 <p className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl leading-relaxed text-slate-800 dark:text-slate-200 font-sans font-normal">
 "{selectedCaseDetail.instructions}"
 </p>
 </div>

 {/* Uploaded design files block */}
 <div className="space-y-3">
 <span className="text-sm font-sans text-slate-600 dark:text-slate-300 uppercase font-bold block">Secure Scan Documents ({selectedCaseDetail.filesUploaded?.length || 0})</span>
 <div className="space-y-2">
 {selectedCaseDetail.filesUploaded?.map((file: any, index: number) => (
 <div key={index} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl flex justify-between items-center">
 <div className="flex items-center gap-2">
 <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
 <div>
 <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{file.name}</div>
 <div className="text-sm text-slate-600 dark:text-slate-300">{file.size} • Uploaded {file.uploadedAt}</div>
 </div>
 </div>
 <span className="text-sm bg-emerald-50 text-emerald-800 border border-emerald-250 font-sans font-bold px-2 py-0.5 rounded">
 SECURED
 </span>
 </div>
 ))}
 {(!selectedCaseDetail.filesUploaded || selectedCaseDetail.filesUploaded.length === 0) && (
 <div className="text-center italic text-slate-600 dark:text-slate-300 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800">
 No files submitted. Please upload standard scan meshes.
 </div>
 )}
 </div>
 </div>

 </div>

 {/* Modal Footer */}
 <div className="p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex gap-2">
 <button
 onClick={() => { setSelectedCaseDetail(null); onNavigateToTab("chat"); }}
 className="flex-1 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
 >
 <MessageSquare className="w-4 h-4 text-slate-600 dark:text-slate-300" /> Secure Chat With Lab
 </button>
 <button
 onClick={() => setSelectedCaseDetail(null)}
 className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-xs cursor-pointer"
 >
 Close details
 </button>
 </div>

 </div>
 </div>
 )}

 </div>
 );
}
