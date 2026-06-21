import React, { useState, useEffect, useRef } from "react";
import { 
 Bell, Info, AlertTriangle, CheckCircle, Trash2, ShieldAlert,
 Check, Volume2, Activity, Mail, Radio, Database, Server, Wifi, WifiOff,
 ChevronDown, ChevronUp
} from "lucide-react";

interface NotificationItem {
 id: string;
 category: "clinical" | "system" | "delivery" | "chat";
 level: "info" | "warning" | "success" | "error";
 title: string;
 message: string;
 time: string;
 unread: boolean;
 type: "push" | "email" | "both";
 recipientRole?: string;
 smtpPayload?: string;
}

interface NotificationsViewProps {
 triggerGlobalToast: (msg: string) => void;
}

export default function NotificationsView({ triggerGlobalToast }: NotificationsViewProps) {
 const [notifications, setNotifications] = useState<NotificationItem[]>([]);
 const [activeCategoryFilter, setActiveCategoryFilter] = useState<"all" | "clinical" | "system" | "delivery" | "chat">("all");
 const [socketConnected, setSocketConnected] = useState(false);
 const [expandedSmtpMsgId, setExpandedSmtpMsgId] = useState<string | null>(null);

 // Simulation form inputs
 const [simTitle, setSimTitle] = useState("Weiland Milling Station alpha calibration drift");
 const [simMessage, setSimMessage] = useState("Tool sensor index offset deviated by +0.038mm under high speed sintering bypass. Automatic correction routine requested.");
 const [simCategory, setSimCategory] = useState<"clinical" | "system" | "delivery" | "chat">("clinical");
 const [simLevel, setSimLevel] = useState<"info" | "warning" | "success" | "error">("warning");
 const [simType, setSimType] = useState<"push" | "email" | "both">("both");
 const [isSimulating, setIsSimulating] = useState(false);

 const socketRef = useRef<WebSocket | null>(null);

 // Load notifications from server on mount
 const fetchNotifications = () => {
 fetch("/api/notifications")
 .then(res => res.json())
 .then(data => {
 if (data.notifications) {
 setNotifications(data.notifications);
 }
 })
 .catch(err => {
 console.error("Failed to load notifications:", err);
 triggerGlobalToast("Failed to sync alerts list from clinical backend.");
 });
 };

 useEffect(() => {
 fetchNotifications();

 const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
 const socketUrl = `${wsProtocol}//${window.location.host}`;
 const ws = new WebSocket(socketUrl);
 socketRef.current = ws;

 ws.onopen = () => {
 setSocketConnected(true);
 // Join general notifications channel
 ws.send(JSON.stringify({
 type: "join",
 data: { role: "DENTIST_LAB_COORDINATOR", name: "Auditor Console", channel: "general" }
 }));
 };

 ws.onmessage = (event) => {
 try {
 const payload = JSON.parse(event.data);
 const { type, data } = payload;

 if (type === "notification_dispatched") {
 const newNotif = data.notification;
 setNotifications(prev => {
 if (prev.some(n => n.id === newNotif.id)) return prev;
 return [newNotif, ...prev];
 });
 triggerGlobalToast(`🔔 Real-Time Notification: "${newNotif.title}"`);
 }
 } catch (err) {
 console.error("WS notification parse err:", err);
 }
 };

 ws.onclose = () => {
 setSocketConnected(false);
 };

 ws.onerror = () => {
 setSocketConnected(false);
 };

 return () => {
 ws.close();
 };
 }, []);

 const handleMarkAsRead = (id: string, title: string) => {
 fetch("/api/notifications/acknowledge", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ id })
 })
 .then(res => res.json())
 .then(data => {
 if (data.success) {
 setNotifications(prev => prev.map(n => {
 if (n.id === id) {
 return { ...n, unread: false };
 }
 return n;
 }));
 triggerGlobalToast(`Acknowledged alert: ${title}`);
 }
 })
 .catch(err => {
 console.error(err);
 triggerGlobalToast("Could not contact server to acknowledge notification.");
 });
 };

 const handleClearAll = () => {
 setNotifications([]);
 triggerGlobalToast("Cleared local list display buffer (server logs remain safe for audit trails).");
 };

 const handlePlaySoundSim = () => {
 triggerGlobalToast("🔔 Sound Trigger: Dispatched 800Hz localized alert chime.");
 };

 // Submit Simulated Alert
 const handleTriggerSimulation = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!simTitle.trim() || !simMessage.trim()) return;

 setIsSimulating(true);
 try {
 const res = await fetch("/api/notifications/trigger-simulation", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({
 category: simCategory,
 level: simLevel,
 title: simTitle.trim(),
 message: simMessage.trim(),
 type: simType
 })
 });
 const data = await res.json();
 if (data.success) {
 triggerGlobalToast(`Simulated alert dispatched via backend.`);
 // Note: the socket listener will automatically prepend it, but safety backup:
 setNotifications(prev => {
 if (prev.some(n => n.id === data.notification.id)) return prev;
 return [data.notification, ...prev];
 });
 }
 } catch (err) {
 console.error(err);
 triggerGlobalToast("Simulation dispatch failure.");
 } finally {
 setIsSimulating(false);
 }
 };

 const filteredNotifications = notifications.filter(n => {
 if (activeCategoryFilter === "all") return true;
 return n.category === activeCategoryFilter;
 });

 const getLevelStyles = (level: string) => {
 switch (level) {
 case "warning":
 return { border: "border-amber-305 bg-amber-50/50 shadow-xs", text: "text-amber-800 ", icon: <AlertTriangle className="w-4 h-4 text-amber-600 " /> };
 case "success":
 return { border: "border-blue-300 bg-blue-50 dark:bg-blue-900/20/40 shadow-xs", text: "text-blue-805 ", icon: <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 " /> };
 case "error":
 return { border: "border-red-305 bg-red-50 dark:bg-red-900/20/40 shadow-xs", text: "text-red-800 ", icon: <ShieldAlert className="w-4 h-4 text-red-650 " /> };
 default:
 return { border: "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs", text: "text-slate-700 dark:text-slate-300 ", icon: <Info className="w-4 h-4 text-indigo-550 " /> };
 }
 };

 const toggleSmtpDropdown = (id: string) => {
 if (expandedSmtpMsgId === id) {
 setExpandedSmtpMsgId(null);
 } else {
 setExpandedSmtpMsgId(id);
 }
 };

 return (
 <div id="notifications-system-workspace" className="space-y-6 animate-fadeIn">
 
 {/* Title Header */}
 <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700 ">
 <div>
 <h2 className="text-sm font-bold font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5 animate-fadeIn">
 <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400 " />
 Clinical Alerts & Mail Desk
 </h2>
 <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-0.5">Live telemetry updates, furnace limits, and dentist order approvals</p>
 </div>

 {/* Live WS stream marker */}
 <div className={`p-1 px-3 rounded-full text-sm font-sans flex items-center gap-1.5 ${socketConnected ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 ' : 'bg-amber-50 text-amber-700'}`}>
 <Radio className={`w-3.5 h-3.5 ${socketConnected ? 'animate-pulse text-blue-500' : 'text-amber-500'}`} />
 <span>{socketConnected ? "Alerts Socket Connected" : "Polling Active"}</span>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
 
 {/* Main Feed Column (8 columns) */}
 <div className="lg:col-span-8 space-y-4">
 
 <div className="bg-white dark:bg-slate-900 #0a0f1d] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm space-y-4 p-5">
 
 {/* Header controls filters */}
 <div className="flex justify-between items-center flex-wrap gap-4 select-none">
 
 {/* Category filters */}
 <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-250 gap-1.5 shadow-xs">
 {[
 { key: "all", label: "All Logs" },
 { key: "clinical", label: "Clinical" },
 { key: "system", label: "Machinery" },
 { key: "delivery", label: "Shipments" },
 { key: "chat", label: "Messenger" }
 ].map(cat => (
 <button
 key={cat.key}
 type="button"
 onClick={() => setActiveCategoryFilter(cat.key as any)}
 className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
 activeCategoryFilter === cat.key
 ? "bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 text-indigo-700 font-bold"
 : "text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:text-slate-200 "
 }`}
 >
 {cat.label}
 </button>
 ))}
 </div>

 {/* Action buttons */}
 <div className="flex gap-2">
 <button
 onClick={handlePlaySoundSim}
 className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:bg-slate-800 border border-slate-250 text-slate-600 dark:text-slate-300 p-1.5 px-3 rounded-xl text-xs flex items-center gap-1.5 font-sans cursor-pointer shadow-xs"
 >
 <Volume2 className="w-3.5 h-3.5 text-indigo-550" /> Test Warning Chime
 </button>

 {notifications.length > 0 && (
 <button
 onClick={handleClearAll}
 className="bg-white dark:bg-slate-900 hover:bg-red-50 dark:bg-red-900/20 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-rose-650 border border-slate-205 hover:border-red-200 p-1.5 px-3 rounded-xl text-xs flex items-center gap-1.5 font-sans cursor-pointer shadow-xs"
 >
 <Trash2 className="w-3.5 h-3.5" /> Wipe Display
 </button>
 )}
 </div>
 </div>

 {/* Notifications feed list */}
 <div className="space-y-4 pt-2">
 {filteredNotifications.map(item => {
 const spec = getLevelStyles(item.level);
 const hasSmtp = !!item.smtpPayload;
 const isSmtpExpanded = expandedSmtpMsgId === item.id;

 return (
 <div key={item.id} className={`p-4 border rounded-xl flex flex-col transition-all ${spec.border} animate-fadeIn`}>
 
 <div className="flex items-start gap-4">
 <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs">
 {spec.icon}
 </div>

 <div className="flex-1 space-y-1">
 <div className="flex justify-between items-start flex-wrap gap-2">
 <div>
 <div className="flex items-center gap-2">
 <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">{item.title}</h4>
 {item.unread && (
 <span className="bg-red-500 w-1.5 h-1.5 rounded-full animate-ping" />
 )}
 </div>
 <span className="text-sm text-slate-450 font-sans tracking-wider font-semibold uppercase">ID: {item.id} • Category: {item.category}</span>
 </div>
 <span className="text-sm text-slate-450 font-sans">{item.time}</span>
 </div>

 <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
 {item.message}
 </p>

 {/* Interactive footer links */}
 <div className="pt-2 flex items-center flex-wrap gap-3 select-none">
 {item.unread && (
 <button
 onClick={() => handleMarkAsRead(item.id, item.title)}
 className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:bg-slate-800 border border-slate-250 text-slate-700 dark:text-slate-300 font-bold px-2 py-1 text-sm rounded inline-flex items-center gap-1 shadow-xs font-sans cursor-pointer"
 >
 <Check className="w-3 h-3 text-blue-500" /> Mark Read
 </button>
 )}

 {hasSmtp && (
 <button
 onClick={() => toggleSmtpDropdown(item.id)}
 className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:bg-slate-800 border border-slate-250 text-slate-600 dark:text-slate-300 text-sm rounded px-2 py-1 flex items-center gap-1 font-sans cursor-pointer shadow-xs"
 >
 <Mail className="w-3 h-3 text-blue-500" /> 
 SMTP Outbound Dispatched
 {isSmtpExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
 </button>
 )}
 </div>
 </div>
 </div>

 {/* Collapsible SMTP raw delivery logger inside card */}
 {hasSmtp && isSmtpExpanded && (
 <div className="mt-3 p-3 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 font-sans text-sm space-y-1.5 animate-slideDown overflow-x-auto select-all">
 <div className="text-blue-600 dark:text-blue-400 font-bold border-b border-slate-200 dark:border-slate-700 pb-1.5 flex items-center gap-1">
 <Server className="w-3 h-3 text-blue-600 dark:text-blue-400" /> Outbound Delivery Receipt Trace:
 </div>
 <div className="text-slate-450">MTA Connection: secure-ssl-tls://smtp.sendgrid.net:465</div>
 <div className="text-slate-600 dark:text-slate-300 font-semibold">{item.smtpPayload}</div>
 <div className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 italic">Delivery-Status: 250 OK. Message Accepted for delivery channel.</div>
 </div>
 )}

 </div>
 );
 })}

 {filteredNotifications.length === 0 && (
 <div className="p-10 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-center text-slate-450 text-xs italic">
 No active clinical or system log updates. Good telemetry bounds!
 </div>
 )}
 </div>
 </div>

 </div>

 {/* Right column / Simulator Panel (4 columns) */}
 <div className="lg:col-span-4 space-y-6">
 
 {/* Real-time Alert Simulation Engine */}
 <div className="bg-white dark:bg-slate-900 #0a0f1d] border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-4 shadow-sm">
 <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2.5">
 <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
 <h3 className="font-bold text-xs text-slate-850 font-medium font-sans font-semibold">
 Alert Simulator
 </h3>
 </div>

 <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-relaxed font-normal">
 Trigger a live warning over WebSockets. Check push alarms & SMTP envelope decorders immediately:
 </p>

 <form onSubmit={handleTriggerSimulation} className="space-y-3.5">
 <div>
 <label className="block text-sm font-sans text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium mb-1.5">Alert Title</label>
 <input 
 type="text" 
 value={simTitle}
 onChange={e => setSimTitle(e.target.value)}
 className="w-full bg-white dark:bg-slate-900 border border-slate-250 rounded-lg p-2 text-xs focus:outline-none"
 placeholder="Alert title..."
 />
 </div>

 <div>
 <label className="block text-sm font-sans text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium mb-1.5">Message / Details</label>
 <textarea 
 rows={2}
 value={simMessage}
 onChange={e => setSimMessage(e.target.value)}
 className="w-full bg-white dark:bg-slate-900 border border-slate-250 rounded-lg p-2 text-xs focus:outline-none resize-none"
 placeholder="Details message payload..."
 />
 </div>

 <div className="grid grid-cols-2 gap-2.5">
 <div>
 <label className="block text-sm font-sans text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium mb-1">Category</label>
 <select 
 value={simCategory}
 onChange={e => setSimCategory(e.target.value as any)}
 className="w-full bg-white dark:bg-slate-900 border border-slate-250 p-1.5 rounded-lg text-xs font-sans"
 >
 <option value="clinical">Clinical</option>
 <option value="system">Machinery</option>
 <option value="delivery">Shipment</option>
 <option value="chat">Messenger</option>
 </select>
 </div>

 <div>
 <label className="block text-sm font-sans text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium mb-1">Severity</label>
 <select 
 value={simLevel}
 onChange={e => setSimLevel(e.target.value as any)}
 className="w-full bg-white dark:bg-slate-900 border border-slate-250 p-1.5 rounded-lg text-xs font-sans"
 >
 <option value="info">Info (Slate)</option>
 <option value="success">Success (Green)</option>
 <option value="warning">Warning (Amber)</option>
 <option value="error">Critical (Red)</option>
 </select>
 </div>
 </div>

 <div>
 <label className="block text-sm font-sans text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium mb-1">Alert Medium</label>
 <div className="flex gap-2">
 {[
 { key: "push", label: "Push Only" },
 { key: "email", label: "SMTP Email" },
 { key: "both", label: "Both" }
 ].map(med => (
 <button
 key={med.key}
 type="button"
 onClick={() => setSimType(med.key as any)}
 className={`flex-1 py-1.5 rounded-lg text-sm font-sans border transition-all ${
 simType === med.key 
 ? 'border-blue-200 dark:border-blue-800 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 font-bold' 
 : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:bg-slate-800 '
 }`}
 >
 {med.label}
 </button>
 ))}
 </div>
 </div>

 <div className="pt-1.5">
 <button
 type="submit"
 disabled={isSimulating}
 className="w-full bg-blue-600 dark:bg-blue-500 hover:bg-indigo-550 text-slate-600 dark:text-slate-300 font-bold py-2 rounded-xl transition-all font-sans text-xs cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
 >
 {isSimulating ? "Transmitting..." : "Dispatch Real-Time Alert"}
 </button>
 </div>
 </form>
 </div>

 {/* Alert priority guidelines */}
 <div className="bg-white dark:bg-slate-900 #0a0f1d] border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-4 shadow-sm">
 <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 font-medium font-sans flex items-center gap-1.5 font-semibold">
 <Activity className="w-4 h-4 text-indigo-550" />
 Priority Guide
 </h3>

 <div className="space-y-3 pt-1 text-xs">
 <div className="border-l-2 border-red-500 pl-3">
 <strong className="text-red-700 block font-semibold">Level 1: System block (Error)</strong>
 <span className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-0.5 block">Furnace cooling anomaly or high-speed milling drill calibrations failures.</span>
 </div>

 <div className="border-l-2 border-amber-500 pl-3">
 <strong className="text-amber-700 block font-semibold">Level 2: Calibration Drift (Warning)</strong>
 <span className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-0.5 block">Bite registration scans exceeding target tolerance parameters. Offsets above 0.05mm.</span>
 </div>

 <div className="border-l-2 border-slate-350 pl-3">
 <strong className="text-slate-700 dark:text-slate-300 block font-semibold">Level 3: Registry operations (Info)</strong>
 <span className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-0.5 block">Couriers assigning barcodes, shipping pickups, and clinician registrations.</span>
 </div>
 </div>
 </div>

 </div>

 </div>

 </div>
 );
}
