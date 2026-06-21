/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Building2, ClipboardList, HardDrive, Compass, Bell, 
  MessageSquare, Stethoscope, UserCheck, Briefcase, HelpCircle, AlertCircle,
  Receipt, BookOpen, Info, ChevronRight, Plus, Sun, Moon
} from "lucide-react";
import { UserRole } from "./types";
import DentistDashboardView from "./components/DentistDashboardView";
import LabAdminDashboardView from "./components/LabAdminDashboardView";
import TechnicianDashboardView from "./components/TechnicianDashboardView";
import CasesView from "./components/CasesView";
import UploadsView from "./components/UploadsView";
import NotificationsView from "./components/NotificationsView";
import ChatView from "./components/ChatView";
import InvoicesView from "./components/InvoicesView";
import DeliveriesView from "./components/DeliveriesView";
import { Truck } from "lucide-react";

type TabKey = 
 | "dentist_dash" 
 | "lab_admin_dash" 
 | "tech_dash" 
 | "cases" 
 | "uploads" 
 | "notifications" 
 | "chat"
 | "invoices"
 | "deliveries";

interface ToastNotification {
 id: string;
 msg: string;
}

export default function App() {
 // Global simulated active actor identity (swappable for seamless preview experience)
 const [activeRole, setActiveRole] = useState<UserRole>(UserRole.DENTIST);
 const [activeTab, setActiveTab] = useState<TabKey>("dentist_dash");

 // Single-theme configuration: Clinical Light Medical SaaS (#FFFFFF, #F8FAFC, #E5E7EB, #2563EB)
 const [showGuidedHelper, setShowGuidedHelper] = useState<boolean>(true);
 const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

 useEffect(() => {
   if (isDarkMode) {
     document.documentElement.classList.add('dark');
   } else {
     document.documentElement.classList.remove('dark');
   }
 }, [isDarkMode]);

 // Dynamic toast overlay state
 const [toasts, setToasts] = useState<ToastNotification[]>([]);

 // Real-time globally synchronized dental cases database state
 const [cases, setCases] = useState<any[]>([
 {
 id: "CS-001",
 patientInitials: "R. M.",
 caseType: "Crown",
 status: "Quality Check",
 dueDate: "2026-06-25",
 dentistName: "Dr. Catherine Vance",
 clinicName: "Apex Cosmetic Dentistry Inc.",
 instructions: "Shade A2, minimal occlusion contact. Please use high-strength multilayer zirconia block.",
 technicianId: "tech-marcus",
 technicianName: "Marcus Aurelius",
 assignedStage: "PORCELAIN_LAYERING",
 workloadWeight: 3,
 internalNotes: "Verified shade translucency map. Edge profile adjusted to prevent stress concentrations.",
 filesUploaded: [
 { name: "case-001_AnatomicalCrown_V3.obj", size: "18.4 MB", uploadedAt: "2026-06-18" }
 ]
 },
 {
 id: "CS-002",
 patientInitials: "E. S.",
 caseType: "Veneer",
 status: "In Production",
 dueDate: "2026-06-30",
 dentistName: "Dr. Catherine Vance",
 clinicName: "Apex Cosmetic Dentistry Inc.",
 instructions: "Veneers #7, #8, #9, #10. Premium feldspathic finish, high bleach shade OM1.",
 technicianId: "tech-irina",
 technicianName: "Irina Petrova",
 assignedStage: "ZIRCONIA_SINTERING",
 workloadWeight: 2,
 internalNotes: "Assigned to senior feldspathic craftsman. Please verify prep margin cleanliness under microscope."
 },
 {
 id: "CS-003",
 patientInitials: "T. J.",
 caseType: "Implant",
 status: "Received",
 dueDate: "2026-07-05",
 dentistName: "Dr. Arthur Pendelton",
 clinicName: "Metropolitan Family Orthodontics",
 instructions: "Custom titanium abutment with layered zirconia crown on tooth #30. Provide screwdriver.",
 technicianId: null,
 technicianName: null,
 internalNotes: "Requires review of implant analog interface catalog compatibility prior to milling."
 }
 ]);

 // Activity logs trail repository
 const [activityLogs, setActivityLogs] = useState<any[]>([
 {
 id: "LOG-01",
 timestamp: "2026-06-18 14:15:30",
 actor: "Sophia Miller",
 role: "Lab Admin",
 action: "System Initialization",
 details: "Dental restoration workflow node bound to Clinic Group active endpoints.",
 hash: "8c7ef21a"
 }
 ]);

 const triggerToast = (msg: string) => {
 // Muted per user request to disable all toast alert popups on actions/clicks
 console.log(`[Clinical Event]: ${msg}`);
 };

 // Assign technician in Lab Admin Panel
 const handleAssignTechnician = (
 caseId: string, 
 techId: string, 
 techName: string, 
 stage: string, 
 notes: string, 
 weight: number
 ) => {
 setCases(prev => prev.map(c => {
 if (c.id === caseId) {
 return {
 ...c,
 technicianId: techId,
 technicianName: techName,
 assignedStage: stage,
 internalNotes: notes,
 workloadWeight: weight,
 status: "In Production" // Automatically mark active column
 };
 }
 return c;
 }));

 const newLog = {
 id: `LOG-0${activityLogs.length + 1}`,
 timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
 actor: "Sophia Miller",
 role: "Lab Admin",
 action: "Assign Technician",
 details: "Dispatched Restorative order " + caseId + " to CAD modeler " + techName,
 hash: Math.random().toString(16).substring(2, 10).padEnd(8, "0")
 };
 setActivityLogs(prev => [newLog, ...prev]);
 triggerToast(`Order ${caseId} assigned and moved to In Production.`);
 };

 // Reassign technician as Admin
 const handleReassignTechnician = (
 caseId: string, 
 oldTechId: string, 
 oldTechName: string, 
 newTechId: string, 
 newTechName: string, 
 stage: string, 
 notes: string, 
 weight: number
 ) => {
 setCases(prev => prev.map(c => {
 if (c.id === caseId) {
 return {
 ...c,
 technicianId: newTechId,
 technicianName: newTechName,
 assignedStage: stage,
 internalNotes: notes,
 workloadWeight: weight
 };
 }
 return c;
 }));

 const newLog = {
 id: `LOG-0${activityLogs.length + 1}`,
 timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
 actor: "Sophia Miller",
 role: "Lab Admin",
 action: "Reassign Technician",
 details: "Returned Restorative order " + caseId + " from " + oldTechName + " to " + newTechName,
 hash: Math.random().toString(16).substring(2, 10).padEnd(8, "0")
 };
 setActivityLogs(prev => [newLog, ...prev]);
 triggerToast(`Order reallocated to ${newTechName}.`);
 };

 // Update notes/percent progress as Technician
 const handleUpdateProgress = (caseId: string, progress: number, techNotes: string) => {
 setCases(prev => prev.map(c => {
 if (c.id === caseId) {
 return { ...c, internalNotes: techNotes, progressPercentage: progress };
 }
 return c;
 }));

 const currentCase = cases.find(c => c.id === caseId);
 const techName = currentCase?.technicianName || "Marcus Aurelius";

 const newLog = {
 id: `LOG-0${activityLogs.length + 1}`,
 timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
 actor: techName,
 role: "Technician",
 action: "Progress Update",
 details: `Restoration task #${caseId} notes saved (${progress}% completed)`,
 hash: Math.random().toString(16).substring(2, 10).padEnd(8, "0")
 };
 setActivityLogs(prev => [newLog, ...prev]);
 triggerToast(`Progress reported by tech specialist ${techName}.`);
 };

 // Technician uploads completed STL file
 const handleUploadCompletedWork = (caseId: string, file: any) => {
 setCases(prev => prev.map(c => {
 if (c.id === caseId) {
 const currentFiles = c.filesUploaded || [];
 return {
 ...c,
 filesUploaded: [...currentFiles, { name: file.name, size: file.size, uploadedAt: "Today" }],
 status: "Quality Check" // Advance to QC automatically
 };
 }
 return c;
 }));

 const currentCase = cases.find(c => c.id === caseId);
 const techName = currentCase?.technicianName || "Marcus Aurelius";

 const newLog = {
 id: `LOG-0${activityLogs.length + 1}`,
 timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
 actor: techName,
 role: "Technician",
 action: "File Upload",
 details: `Uploaded completed STL design file '${file.name}' (${file.size}) for Case #${caseId}`,
 hash: Math.random().toString(16).substring(2, 10).padEnd(8, "0")
 };
 setActivityLogs(prev => [newLog, ...prev]);
 triggerToast(`File uploaded. Case #${caseId} sent to Quality Check.`);
 };

 // Mutator to advance manufacturing milestones
 const handleTransitionStatus = (caseId: string, newStatus: string) => {
 setCases(prev => prev.map(c => {
 if (c.id === caseId) {
 return { ...c, status: newStatus };
 }
 return c;
 }));

 const currentCase = cases.find(c => c.id === caseId);
 const techName = currentCase?.technicianName || "Marcus Aurelius";

 const newLog = {
 id: `LOG-0${activityLogs.length + 1}`,
 timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
 actor: activeRole === UserRole.LAB_ADMIN ? "Sophia Miller" : techName,
 role: activeRole === UserRole.LAB_ADMIN ? "Lab Admin" : "Technician",
 action: "Status transitioned",
 details: `Shifted Case #${caseId} status to: '${newStatus}'`,
 hash: Math.random().toString(16).substring(2, 10).padEnd(8, "0")
 };
 setActivityLogs(prev => [newLog, ...prev]);

 // WebSocket refresh simulation triggers global browser update
 triggerToast(`WebSocket Event: Case ${caseId} is now ${newStatus}. Dentist portal refreshed.`);
 };

 const handleAddCase = (newCase: any) => {
 setCases(prev => [newCase, ...prev]);
 triggerToast(`Registered clinical order for patient initials: ${newCase.patientInitials}`);
 };

 const portalTabs = [
 { key: "dentist_dash", label: "Dentist Dashboard", icon: <Stethoscope className="w-4 h-4" /> },
 { key: "lab_admin_dash", label: "Lab Admin Dashboard", icon: <UserCheck className="w-4 h-4" /> },
 { key: "tech_dash", label: "Technician Dashboard", icon: <Briefcase className="w-4 h-4" /> },
 { key: "cases", label: "Cases & Orders", icon: <ClipboardList className="w-4 h-4" /> },
 { key: "invoices", label: "Invoices & Payments", icon: <Receipt className="w-4 h-4" /> },
 { key: "deliveries", label: "Shipping & Dispatch", icon: <Truck className="w-4 h-4" /> },
 { key: "uploads", label: "Files & Scans", icon: <HardDrive className="w-4 h-4" /> },
 { key: "notifications", label: "Sync Notifications", icon: <Bell className="w-4 h-4" /> },
 { key: "chat", label: "Secure Lab Chat", icon: <MessageSquare className="w-4 h-4" /> }
 ];

 return (
 <div id="densync-app-container" className="min-h-screen font-sans bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 selection:bg-blue-100 selection:text-blue-800 dark:text-blue-200 flex flex-col relative transition-all duration-300">
 
 {/* Real-time sync notifications ribbon */}
 <div className="bg-blue-600 dark:bg-blue-500 text-white text-xs py-2 px-6 flex justify-between items-center select-none font-medium">
 <div className="flex items-center gap-2">
 <span className="w-2 h-2 rounded-full bg-emerald-450 inline-block animate-pulse"></span>
 <span>DENTALRESTORE SECURE CLOUD CONNECTION: ONLINE & HIPAA CERTIFIED</span>
 </div>
 <div className="hidden sm:flex items-center gap-3 font-semibold text-sm">
 <span>SIMULATED DIRECT WEBSOCKET ENCRYPTED</span>
 </div>
 </div>

 {/* Toast Alert stack */}
 <div className="fixed top-28 right-6 z-50 pointer-events-none space-y-2 select-none">
 {toasts.map(t => (
 <div key={t.id} className="bg-white dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-800 text-slate-900 dark:text-slate-50 p-3.5 px-5 rounded-xl shadow-sm text-xs flex items-center gap-3 animate-fadeIn pointer-events-auto max-w-md">
 <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
 <span className="font-semibold">{t.msg}</span>
 </div>
 ))}
 </div>

 {/* Global Header */}
 <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 px-6 py-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
 <div className="flex items-center gap-3 select-none">
 <div className="p-2.5 rounded-xl bg-blue-600 dark:bg-blue-500 text-white shadow-xs flex-shrink-0">
 <Compass className="w-5 h-5" />
 </div>
 <div>
 <div className="flex items-center gap-2 flex-wrap">
 <h1 className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-50 uppercase">DENTAL RESTORE SaaS</h1>
 <span className="text-sm bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded">
 Practice System
 </span>
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
 Enterprise Dental Practice-to-Lab Connected Platform
 </p>
 </div>
 </div>

 {/* Global Persona Controller */}
 <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
 
 <div className="flex items-center gap-2">
 <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium text-sm">Active User Profile:</span>
 <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 gap-1 select-none">
 {[
 { role: UserRole.DENTIST, label: "Dentist" },
 { role: UserRole.LAB_ADMIN, label: "Lab Admin" },
 { role: UserRole.TECHNICIAN, label: "Technician" }
 ].map(item => (
 <button
 key={item.role}
 id={`btn-persona-${item.role.toLowerCase()}`}
 onClick={() => {
 setActiveRole(item.role);
 // Match tab automatically
 if (item.role === UserRole.DENTIST) {
 setActiveTab("dentist_dash");
 } else if (item.role === UserRole.LAB_ADMIN) {
 setActiveTab("lab_admin_dash");
 } else {
 setActiveTab("tech_dash");
 }
 triggerToast(`Switched login profile: ${item.label}`);
 }}
 className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
 activeRole === item.role
 ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-bold border border-slate-200 dark:border-slate-700 shadow-sm"
 : "text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:text-slate-200"
 }`}
 >
 {item.label}
 </button>
 ))}
 </div>
 </div>

 <div className="flex items-center gap-2">
 <button
 onClick={() => setIsDarkMode(!isDarkMode)}
 className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs mr-1"
 title="Toggle dark mode"
 >
 {isDarkMode ? <Sun className="w-4 h-4 text-orange-400" /> : <Moon className="w-4 h-4" />}
 </button>

 <button
 onClick={() => {
 setShowGuidedHelper(!showGuidedHelper);
 triggerToast(`${!showGuidedHelper ? "Opened" : "Hidden"} Assistant Companion.`);
 }}
 className={`p-2 px-3 rounded-xl border transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs ${
 showGuidedHelper
 ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
 : "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
 }`}
 title="Toggle assistance guide"
 >
 <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
 <span>Companion Help</span>
 </button>
 </div>
 </div>
 </header>

 {/* Main Container */}
 <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-6 py-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
 
 {/* Left Side Tab Navigation Column */}
 <div className="xl:col-span-8 flex flex-col space-y-6">

 {/* Simple Dentist Companion Help Banner */}
 {showGuidedHelper && (
 <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs animate-fadeIn space-y-3 relative overflow-hidden">
 <div className="flex justify-between items-start flex-wrap gap-2">
 <div className="flex items-center gap-3">
 <div className="p-2 rounded-xl bg-blue-100 text-blue-700 dark:text-blue-300 flex-shrink-0">
 <Info className="w-5 h-5" />
 </div>
 <div>
 <h3 className="text-xs font-bold text-slate-950 font-medium text-sm flex items-center gap-2">
 Clinical Companion Assistant
 </h3>
 <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
 Integrated workspace helper. Change roles to view case files and status logs under each profile permission level.
 </p>
 </div>
 </div>
 <button 
 onClick={() => setShowGuidedHelper(false)}
 className="text-slate-600 dark:text-slate-300 hover:text-slate-700 dark:text-slate-300 text-xs font-bold bg-white dark:bg-slate-900 px-2.5 py-1 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer shadow-xs"
 >
 Dismiss Guide
 </button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs">
 <div>
 <h4 className="font-bold text-slate-900 dark:text-slate-50 flex items-center gap-1.5 mb-1">
 <span className="w-4 h-4 rounded-full bg-blue-600 dark:bg-blue-500 text-white text-sm flex items-center justify-center font-bold">1</span>
 Dentist Profile
 </h4>
 <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-normal font-normal">
 Submit digital cases, upload files (.STL, .DICOM), interact over secure chat, and review invoices. Specific technicians and internal lab benches are hidden.
 </p>
 </div>
 <div>
 <h4 className="font-bold text-slate-900 dark:text-slate-50 flex items-center gap-1.5 mb-1">
 <span className="w-4 h-4 rounded-full bg-blue-600 dark:bg-blue-500 text-white text-sm flex items-center justify-center font-bold">2</span>
 Lab Admin Profile
 </h4>
 <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-normal font-normal">
 Supervise full orders. Easily drag-and-drop cases on the interactive lab board. Change of columns triggers instant updates across active views.
 </p>
 </div>
 <div>
 <h4 className="font-bold text-slate-900 dark:text-slate-50 flex items-center gap-1.5 mb-1">
 <span className="w-4 h-4 rounded-full bg-blue-600 dark:bg-blue-500 text-white text-sm flex items-center justify-center font-bold">3</span>
 Technician Profile
 </h4>
 <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-normal font-normal">
 Check assigned materials designs. Upload finished 3D structures and update progress. Tasks auto-advance to Quality Check.
 </p>
 </div>
 </div>
 </div>
 )}

 {/* Main Visual Tabs Selector */}
 <div className="bg-slate-50 dark:bg-slate-800 p-1.5 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-wrap gap-1 select-none">
 {portalTabs.map(tab => {
 const isActive = activeTab === tab.key;
 return (
 <button
 id={`btn-main-tab-${tab.key}`}
 key={tab.key}
 onClick={() => {
 setActiveTab(tab.key as TabKey);
 triggerToast(`Opened Section: ${tab.label}`);
 }}
 className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer text-xs font-semibold ${
 isActive
 ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 shadow-xs font-bold"
 : "bg-transparent border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-slate-50 hover:bg-white dark:bg-slate-900"
 }`}
 >
 <div className={isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-300"}>
 {tab.icon}
 </div>
 <span>{tab.label}</span>
 </button>
 );
 })}
 </div>

 {/* Active Workspace Viewport Frame */}
 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 md:p-6 shadow-xs relative min-h-[580px]">
 {activeTab === "dentist_dash" && (
 <DentistDashboardView 
 cases={cases}
 onNavigateToTab={(t) => setActiveTab(t)} 
 triggerGlobalToast={triggerToast} 
 onAddCase={handleAddCase}
 />
 )}
 {activeTab === "lab_admin_dash" && (
 <LabAdminDashboardView 
 cases={cases} 
 onAssignTechnician={handleAssignTechnician} 
 onReassignTechnician={handleReassignTechnician}
 onTransitionStatus={handleTransitionStatus}
 onNavigateToTab={(t) => setActiveTab(t)} 
 triggerGlobalToast={triggerToast} 
 />
 )}
 {activeTab === "tech_dash" && (
 <TechnicianDashboardView 
 cases={cases} 
 onTransitionStatus={handleTransitionStatus} 
 onUpdateProgress={handleUpdateProgress}
 onUploadCompletedWork={handleUploadCompletedWork}
 triggerGlobalToast={triggerToast} 
 />
 )}
 {activeTab === "cases" && (
 <CasesView 
 cases={cases} 
 activeRole={activeRole} 
 onAddCase={handleAddCase} 
 onTransitionStatus={handleTransitionStatus} 
 triggerGlobalToast={triggerToast} 
 />
 )}
 {activeTab === "uploads" && (
 <UploadsView 
 triggerGlobalToast={triggerToast} 
 />
 )}
 {activeTab === "notifications" && (
 <NotificationsView 
 triggerGlobalToast={triggerToast} 
 />
 )}
 {activeTab === "chat" && (
 <ChatView 
 activeRole={activeRole} 
 triggerGlobalToast={triggerToast} 
 />
 )}
 {activeTab === "invoices" && (
 <InvoicesView 
 activeRole={activeRole} 
 triggerGlobalToast={triggerToast} 
 />
 )}
 {activeTab === "deliveries" && (
 <DeliveriesView 
 activeRole={activeRole}
 cases={cases}
 onTransitionStatus={handleTransitionStatus}
 triggerGlobalToast={triggerToast}
 />
 )}
 </div>

 </div>

 {/* Right Sidebar */}
 <div className="xl:col-span-4 flex flex-col space-y-6">
 
 {/* Clinical workspace information block */}
 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl shadow-xs space-y-3.5 select-none">
 <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-medium text-sm">
 <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
 Practice-to-Lab Network
 </h4>

 <div className="space-y-3 pt-1 text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
 <p>
 Connected directly to the leading CAD/CAM dental milling system hub. This workspace syncs live patient restoratives:
 </p>
 <ul className="list-disc pl-4 space-y-2 text-slate-600 dark:text-slate-300">
 <li>
 <strong className="text-slate-900 dark:text-slate-50 font-bold">Clinical Standards:</strong> Supports premium multi-layer zirconia cubes, lithium disilicate (IPS e.max), and biological glass restoration models.
 </li>
 <li>
 <strong className="text-slate-900 dark:text-slate-50 font-bold">Workflow Privacy:</strong> Ensures dentist-facing boards mask technician profile details, while enabling seamless communication.
 </li>
 <li>
 <strong className="text-slate-900 dark:text-slate-50 font-bold">Interactive Kanban Board:</strong> Drag-and-drop state machines for lab admins fully streamline daily sintering scheduling on-the-fly.
 </li>
 </ul>
 <p className="text-sm border-t border-slate-100 dark:border-slate-800 pt-3 text-slate-600 dark:text-slate-300 italic">
 All mock database events and status transitions in parent rosters trigger live cloud alerts automatically.
 </p>
 </div>
 </div>

 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl shadow-xs space-y-3 select-none">
 <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-medium text-sm">
 <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
 HIPAA Safety Isolation
 </h4>
 <p className="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
 Internal workbench metrics, raw material orders, and personnel capacity targets are strictly stored server-side. Dentists track milestones cleanly as "Received", "In Progress", "Quality Check", "Ready for Delivery", or "Delivered".
 </p>
 </div>

 </div>

 </main>

 {/* Global Footer */}
 <footer className="bg-slate-50 dark:bg-slate-800 px-6 py-4 border-t border-slate-200 dark:border-slate-700 mt-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium select-none">
 <div>
 © 2026 Dental Restore SaaS Systems Inc. Secure health records compliant.
 </div>
 <div className="flex items-center gap-3 font-semibold">
 <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-500 inline-block animate-pulse"></span> PORTAL ACTIVE</span>
 <span>•</span>
 <span>CLINICAL DENTRIX SAAS ENGINE</span>
 </div>
 </footer>

 </div>
 );
}
