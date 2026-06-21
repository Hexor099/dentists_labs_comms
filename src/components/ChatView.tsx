import React, { useState, useRef, useEffect } from "react";
import { 
 Send, Users, Sparkles, MessageCircle, Volume2, Trash2, 
 FileCode, CheckCircle2, Bookmark, Paperclip, Download, Info, Lock, 
 Wifi, WifiOff
} from "lucide-react";
import { UserRole } from "../types";

interface MessageItem {
 id: string;
 sender: string;
 role: string | UserRole;
 text: string;
 time: string;
 timestamp: string;
 channel: string;
 attachment?: {
 name: string;
 originalName?: string;
 size: string;
 url: string;
 };
 readBy: string[];
}

interface ChatViewProps {
 activeRole: UserRole;
 triggerGlobalToast: (msg: string) => void;
}

export default function ChatView({ activeRole: globalActiveRole, triggerGlobalToast }: ChatViewProps) {
 // Local role override to allow easy local testing of communication loops
 const [chatActiveRole, setChatActiveRole] = useState<UserRole>(globalActiveRole);
 const [selectedChannel, setSelectedChannel] = useState<"dentist_lab" | "internal_lab" >("dentist_lab");
 const [messages, setMessages] = useState<MessageItem[]>([]);
 const [inputText, setInputText] = useState("");
 const [socketConnected, setSocketConnected] = useState(false);
 const [isUploading, setIsUploading] = useState(false);
 const [smtpLogs, setSmtpLogs] = useState<string[]>([
 "[SMTP MTA Server Live] - SSL Active on port 587",
 "SMTP: Listener bound safely to smtp-outbound.densync.com"
 ]);

 const socketRef = useRef<WebSocket | null>(null);
 const chatBottomRef = useRef<HTMLDivElement>(null);
 const fileInputRef = useRef<HTMLInputElement>(null);

 const chatTemplates = [
 "Please verify the VITA shade profile A2 on anterior veneer.",
 "The PLY 3D scan is aligned correctly. Please proceed to mill.",
 "Can you double-check the bite occlusion spacing on Molar #30?",
 "Aesthetic zirconia thermal run completed successfully."
 ];

 // Resolve human-friendly sender details
 const getSenderName = (role: UserRole) => {
 if (role === UserRole.DENTIST) return "Dr. Catherine Vance";
 if (role === UserRole.LAB_ADMIN) return "Sophia Miller";
 if (role === UserRole.TECHNICIAN) return "Marcus Aurelius";
 return "Staff Member";
 };

 // Re-establish WebSocket Connection on role or channel change
 useEffect(() => {
 // If dentist tries to access internal_lab, force back to dentist_lab
 if (chatActiveRole === UserRole.DENTIST && selectedChannel === "internal_lab") {
 setSelectedChannel("dentist_lab");
 return;
 }

 const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
 const socketUrl = `${wsProtocol}//${window.location.host}`;
 console.log(`[ChatWS] Connecting to ${socketUrl}...`);
 
 const ws = new WebSocket(socketUrl);
 socketRef.current = ws;

 ws.onopen = () => {
 console.log("[ChatWS] Socket connection opened successfully.");
 setSocketConnected(true);
 
 // Join corresponding stream
 const joinPayload = {
 type: "join",
 data: {
 role: chatActiveRole,
 name: getSenderName(chatActiveRole),
 channel: selectedChannel
 }
 };
 ws.send(JSON.stringify(joinPayload));
 };

 ws.onmessage = (event) => {
 try {
 const payload = JSON.parse(event.data);
 const { type, data } = payload;

 if (type === "init") {
 if (data.channel === selectedChannel) {
 setMessages(data.messages);
 
 // Mark unread messages as read
 const unreadIds = data.messages
 .filter((m: MessageItem) => !m.readBy.includes(chatActiveRole))
 .map((m: MessageItem) => m.id);

 if (unreadIds.length > 0) {
 ws.send(JSON.stringify({
 type: "mark_as_read",
 data: { channel: selectedChannel, messageIds: unreadIds }
 }));
 }
 }
 } 
 else if (type === "message_received") {
 if (data.channel === selectedChannel) {
 setMessages(prev => {
 // Deduplicate
 if (prev.some(m => m.id === data.message.id)) return prev;
 const next = [...prev, data.message];
 
 // Automatically send read receipt if we are in this channel
 if (!data.message.readBy.includes(chatActiveRole)) {
 ws.send(JSON.stringify({
 type: "mark_as_read",
 data: { channel: selectedChannel, messageIds: [data.message.id] }
 }));
 }
 return next;
 });
 }
 }
 else if (type === "messages_read") {
 setMessages(prev => prev.map(m => {
 if (data.messageIds.includes(m.id)) {
 const updatedRead = [...m.readBy];
 if (!updatedRead.includes(data.role)) {
 updatedRead.push(data.role);
 }
 return { ...m, readBy: updatedRead };
 }
 return m;
 }));
 }
 else if (type === "notification_dispatched") {
 const notif = data.notification;
 if (notif.smtpPayload) {
 setSmtpLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${notif.smtpPayload}`]);
 }
 }
 } catch (err) {
 console.error("[ChatWS] Error parsing message:", err);
 }
 };

 ws.onclose = () => {
 console.log("[ChatWS] Socket closed.");
 setSocketConnected(false);
 };

 ws.onerror = (err) => {
 console.error("[ChatWS] Socket encountered error:", err);
 setSocketConnected(false);
 };

 return () => {
 ws.close();
 };
 }, [chatActiveRole, selectedChannel]);

 useEffect(() => {
 if (chatBottomRef.current) {
 chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
 }
 }, [messages]);

 // Handle Send Text Message
 const handleSendMessage = (e?: React.FormEvent) => {
 if (e) e.preventDefault();
 if (!inputText.trim()) return;

 if (socketRef.current && socketConnected) {
 socketRef.current.send(JSON.stringify({
 type: "send_message",
 data: {
 channel: selectedChannel,
 text: inputText.trim()
 }
 }));
 setInputText("");
 } else {
 // Fallback to HTTP API
 const senderName = getSenderName(chatActiveRole);
 fetch("/api/chat/messages", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({
 channel: selectedChannel,
 sender: senderName,
 role: chatActiveRole,
 text: inputText.trim()
 })
 })
 .then(res => res.json())
 .then(result => {
 if (result.success) {
 setMessages(prev => [...prev, result.message]);
 setInputText("");
 triggerGlobalToast("Message sent via REST fallback (Socket disconnected).");
 }
 })
 .catch(err => {
 console.error("HTTP chat post failed:", err);
 triggerGlobalToast("Failed to transmit. Communication channel offline.");
 });
 }
 };

 // Handle Mock Secure S3 Upload
 const handleAttachFileClick = () => {
 if (fileInputRef.current) {
 fileInputRef.current.click();
 }
 };

 const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file) return;

 setIsUploading(true);
 triggerGlobalToast(`Anonymizing STL scan package: ${file.name}`);

 try {
 const uploadRes = await fetch("/api/chat/upload-mock", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({
 name: file.name,
 size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
 })
 });
 const uploadData = await uploadRes.json();

 if (uploadData.success && socketRef.current && socketConnected) {
 // Send attachment message over WS
 socketRef.current.send(JSON.stringify({
 type: "send_message",
 data: {
 channel: selectedChannel,
 text: `Attachment: Secure CAD restoration scans uploaded. Filename masked for clinical privacy.`,
 attachment: {
 name: uploadData.file.name,
 originalName: file.name,
 size: uploadData.file.size,
 url: uploadData.file.url
 }
 }
 }));
 triggerGlobalToast("HIPAA envelope scan registered and dispatched.");
 } else {
 triggerGlobalToast("Attachment registration rejected.");
 }
 } catch (err) {
 console.error(err);
 triggerGlobalToast("Failed uploading scanned clinical objects.");
 } finally {
 setIsUploading(false);
 }
 };

 const handleApplyTemplate = (text: string) => {
 setInputText(text);
 triggerGlobalToast("Applied clinician workspace template phrase.");
 };

 const handleClearChatLogs = () => {
 setMessages([]);
 triggerGlobalToast("Purged local messenger buffer.");
 };

 // Diagnostic filters for Read receipts indicators
 const renderReadReceipts = (msg: MessageItem) => {
 const readers = msg.readBy.filter(role => role !== msg.role);
 if (readers.length === 0) {
 return <span className="text-sm text-slate-600 dark:text-slate-300 italic">Unread</span>;
 }
 
 const names = readers.map(r => r.replace("LAB_ADMIN", "Admin").replace("DENTIST", "Dentist").replace("TECHNICIAN", "Ceramist")).join(", ");
 return (
 <span className="text-sm text-blue-600 dark:text-blue-400 font-sans flex items-center gap-1">
 <CheckCircle2 className="w-3 h-3 text-orange-500 inline" /> Read by {names}
 </span>
 );
 };

 return (
 <div id="immersive-chat-workspace" className="space-y-6 animate-fadeIn">
 
 {/* View Title */}
 <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700 ">
 <div>
 <h2 className="text-sm font-bold font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
 <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 " />
 Clinical Messaging Hub
 </h2>
 <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-0.5 animate-fadeIn">Secure, HIPAA-auditable real-time chat between dental practitioners and laboratory ceramists</p>
 </div>

 {/* Connection status badge */}
 <div className={`p-1 px-3 rounded-full text-sm font-sans flex items-center gap-1.5 transition-all ${socketConnected ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 ' : 'bg-amber-50 text-amber-700 '}`}>
 {socketConnected ? (
 <>
 <Wifi className="w-3 h-3" />
 <span>Real-Time Active</span>
 </>
 ) : (
 <>
 <WifiOff className="w-3 h-3 text-rose-500" />
 <span>Rest Fallback Mode</span>
 </>
 )}
 </div>
 </div>

 {/* Main Grid split */}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
 
 {/* Left column / Chat frame (8 columns) */}
 <div className="lg:col-span-8 flex flex-col bg-white dark:bg-slate-900 #0a0f1d] border border-slate-200 dark:border-slate-700 rounded-3xl min-h-[500px] shadow-sm overflow-hidden relative">
 
 {/* Active Persona Switcher bar */}
 <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-3 flex justify-between items-center flex-wrap gap-2 select-none">
 <div className="flex items-center gap-1.5">
 <Users className="w-4 h-4 text-slate-500 dark:text-slate-400 dark:text-slate-500" />
 <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-sans font-medium text-sm">Simulate Role:</span>
 </div>

 <div className="flex bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 gap-1 flex-wrap">
 {[
 { role: UserRole.DENTIST, name: "Dr. Vance" },
 { role: UserRole.LAB_ADMIN, name: "Admin (Sophia)" },
 { role: UserRole.TECHNICIAN, name: "Tech (Marcus)" }
 ].map(opt => (
 <button
 key={opt.role}
 type="button"
 onClick={() => {
 setChatActiveRole(opt.role);
 triggerGlobalToast(`Role simulation switched: ${opt.name}`);
 }}
 className={`text-sm font-sans px-2 py-1 rounded transition-all cursor-pointer font-bold ${
 chatActiveRole === opt.role
 ? "bg-blue-600 dark:bg-blue-500 text-slate-600 dark:text-slate-300 font-semibold"
 : "text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:text-slate-200 "
 }`}
 >
 {opt.name}
 </button>
 ))}
 </div>
 </div>

 {/* Channels Isolation Drawer (Top) */}
 <div className="bg-slate-150/40 p-3 border-b border-slate-200 dark:border-slate-700 flex justify-start gap-2 select-none">
 <button
 type="button"
 onClick={() => {
 setSelectedChannel("dentist_lab");
 triggerGlobalToast("Loaded Dentist-Lab Channel.");
 }}
 className={`p-2 px-3 rounded-xl text-xs font-sans font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
 selectedChannel === "dentist_lab"
 ? "bg-white dark:bg-slate-900 text-indigo-700 shadow-sm border border-slate-200 dark:border-slate-700 "
 : "text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:text-slate-200 "
 }`}
 >
 <MessageCircle className="w-3.5 h-3.5" />
 Dentist ↔ Lab Messaging
 </button>

 {chatActiveRole !== UserRole.DENTIST && (
 <button
 type="button"
 onClick={() => {
 setSelectedChannel("internal_lab");
 triggerGlobalToast("Loaded Internal Backroom Messaging.");
 }}
 className={`p-2 px-3 rounded-xl text-xs font-sans font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
 selectedChannel === "internal_lab"
 ? "bg-white dark:bg-slate-900 text-indigo-700 shadow-sm border border-slate-200 dark:border-slate-700 "
 : "text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-850 "
 }`}
 >
 <Lock className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
 Internal Lab Chat
 </button>
 )}
 </div>

 {/* Active room notification info */}
 <div className="bg-indigo-50 dark:bg-indigo-900/20/40 p-2.5 px-4 text-sm text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
 <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
 <span>
 {selectedChannel === "dentist_lab" 
 ? "This secure line handles cases specifications, shades modifications, and logistics. Technician comments are masked from the clinicians view."
 : "Lab-restricted line used to organize workflow weights, kiln programs, and sintering parameters. Private to laboratory staff."}
 </span>
 </div>

 {/* Messages stream area */}
 <div className="flex-grow p-4 md:p-5 overflow-y-auto space-y-4 max-h-[340px]">
 {messages.map((msg, idx) => {
 const isMine = msg.sender === getSenderName(chatActiveRole);

 return (
 <div key={msg.id || idx} className={`flex ${isMine ? "justify-end" : "justify-start"} animate-fadeIn`}>
 <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-xs border ${
 isMine 
 ? "bg-blue-600 dark:bg-blue-500 border-blue-200 dark:border-blue-800 text-white " 
 : msg.role === UserRole.DENTIST
 ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 "
 : msg.role === UserRole.LAB_ADMIN
 ? "bg-sky-50 border-sky-100 text-slate-800 dark:text-slate-200 "
 : "bg-orange-50 dark:bg-orange-900/20/50 border-orange-100 text-slate-800 dark:text-slate-200 "
 }`}>
 
 {/* Message Header row */}
 <div className={`flex justify-between items-center gap-10 pb-1.5 border-b text-sm font-sans tracking-wider mb-2 ${isMine ? 'border-white/10 text-indigo-200' : 'border-slate-150 text-slate-500 dark:text-slate-400 dark:text-slate-500 '}`}>
 <span className="font-bold">{msg.sender} ({msg.role.replace("_", " ")})</span>
 <span>{msg.time}</span>
 </div>

 <p className="whitespace-pre-line leading-relaxed pb-0.5">{msg.text}</p>

 {/* Check if attachment is present */}
 {msg.attachment && (
 <div className="mt-3 p-3 bg-slate-100 dark:bg-slate-800/80/55 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between gap-4 text-xs select-none animate-fadeIn">
 <div className="flex items-center gap-2.5 min-w-0">
 <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-lg border border-indigo-105 text-blue-600 dark:text-blue-400 shrink-0">
 <FileCode className="w-4 h-4" />
 </div>
 <div className="truncate">
 <span className="block font-semibold text-slate-700 dark:text-slate-300 truncate text-sm font-sans">
 {msg.attachment.originalName || msg.attachment.name}
 </span>
 <span className="block text-sm text-slate-405 font-sans">{msg.attachment.size} • HIPAA Encrypted</span>
 </div>
 </div>

 <a 
 href="#"
 onClick={(e) => {
 e.preventDefault();
 triggerGlobalToast(`Retrieving secure 3D restoration mesh download envelope for clinical review.`);
 }}
 className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 p-1.5 px-2.5 rounded-lg text-sm font-bold font-sans flex items-center gap-1 transition-all shrink-0 shadow-xs"
 >
 <Download className="w-3 h-3" /> Get STL
 </a>
 </div>
 )}

 {/* Show read receipt */}
 {isMine && (
 <div className="mt-1.5 pt-1 text-right flex justify-end select-none">
 {renderReadReceipts(msg)}
 </div>
 )}

 </div>
 </div>
 );
 })}

 <div ref={chatBottomRef} />

 {messages.length === 0 && (
 <div className="p-16 text-center text-slate-600 dark:text-slate-300 text-xs italic font-sans">
 Chat terminal empty. Connect and stream instructions.
 </div>
 )}
 </div>

 {/* Secure Draft / Input container bar */}
 <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-3 flex justify-between select-none text-sm text-slate-550 font-sans">
 <span>Drafting message as: <strong className="text-blue-600 dark:text-blue-400 ">{getSenderName(chatActiveRole)}</strong></span>
 <span>Channel: <strong className="upper tracking-wider text-slate-600 dark:text-slate-300 ">{selectedChannel.replace("_", " ")}</strong></span>
 </div>

 <form onSubmit={handleSendMessage} className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-3.5 flex gap-2 items-center relative">
 <input 
 type="file" 
 ref={fileInputRef} 
 className="hidden" 
 accept=".stl,.ply,.obj"
 onChange={handleFileChange}
 />

 {/* Paperclip attachment triggers */}
 <button
 type="button"
 disabled={isUploading}
 onClick={handleAttachFileClick}
 className={`p-2.5 rounded-xl border transition-all text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:bg-slate-800/80 hover:text-slate-800 dark:text-slate-200 cursor-pointer shadow-sm ${
 isUploading 
 ? 'bg-amber-100 border-amber-300 animate-pulse text-amber-705' 
 : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
 }`}
 title="Secure HIPAA DICOM/STL Attachment"
 >
 <Paperclip className="w-4 h-4" />
 </button>

 <input
 type="text"
 value={inputText}
 onChange={e => setInputText(e.target.value)}
 placeholder={isUploading ? "Uploading file..." : `Type direct response for ${selectedChannel === 'dentist_lab' ? "Dentist-Lab" : "Lab Ceramists"}...`}
 disabled={isUploading}
 className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none shadow-inner transition-all"
 />
 
 <button
 type="submit"
 disabled={isUploading}
 className="bg-blue-600 dark:bg-blue-500 hover:bg-indigo-550 text-slate-600 dark:text-slate-300 font-bold p-2.5 px-4.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs shadow-sm"
 >
 <Send className="w-3.5 h-3.5" /> Post
 </button>
 </form>

 </div>

 {/* Right column / Workspace helpers (4 columns) */}
 <div className="lg:col-span-4 space-y-6 select-none">
 
 {/* Quick clinical templates */}
 <div className="bg-white dark:bg-slate-900 #0a0f1d] border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-4 shadow-xs">
 
 <div className="flex justify-between items-center">
 <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 font-medium font-sans flex items-center gap-1.5 font-semibold">
 <Bookmark className="w-4 h-4 text-indigo-550" />
 Clinical Presets
 </h3>
 <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-pulse" />
 </div>

 <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
 Click any clinical phrase to draft instantly before submitting to the kiln workspace:
 </p>

 <div className="space-y-2 pt-1">
 {chatTemplates.map((phr, idx) => (
 <button
 key={idx}
 type="button"
 onClick={() => handleApplyTemplate(phr)}
 className="w-full text-left p-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:bg-indigo-900/20 hover:text-indigo-750 border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 transition-all block cursor-pointer leading-tight truncate shadow-xs"
 >
 "{phr}"
 </button>
 ))}
 </div>

 <div className="pt-2">
 <button
 type="button"
 onClick={handleClearChatLogs}
 className="w-full bg-white dark:bg-slate-900 hover:bg-rose-50 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-rose-650 border border-slate-200 dark:border-slate-700 hover:border-rose-200 font-semibold py-1.5 rounded-lg transition-all font-sans cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
 >
 <Trash2 className="w-3.5 h-3.5" /> Wipe Chat Buffer
 </button>
 </div>
 </div>

 {/* Simulated MTA SMTP Email Dispatch diagnostics window! */}
 <div className="bg-white dark:bg-slate-900 #0a0f1d] border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-4 shadow-xs">
 <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 font-medium font-sans flex items-center gap-1.5 font-semibold">
 <Volume2 className="w-4 h-4 text-blue-500 " />
 SMTP Delivery Logs
 </h3>
 
 <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-relaxed font-sans">
 [Simulated SMTP Outbound Monitor] Whenever dentists submit updates, email alerts are dispatched to the lab:
 </p>
 
 <div className="bg-white dark:bg-slate-900 p-3 rounded-xl max-h-[140px] overflow-y-auto space-y-2 border border-slate-200 dark:border-slate-700 font-sans text-sm">
 {smtpLogs.map((log, lIdx) => (
 <div key={lIdx} className={`${log.startsWith("[SMTP MTA") ? "text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-300"} break-all leading-normal`}>
 {log}
 </div>
 ))}
 </div>
 </div>

 </div>

 </div>

 </div>
 );
}
