import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot, User, RefreshCw, AlertTriangle, HelpCircle } from "lucide-react";

interface Message {
 role: "user" | "model";
 text: string;
}

export default function AiAssistant() {
 const [messages, setMessages] = useState<Message[]>([
 {
 role: "model",
 text: "Hello! I am your DenSync Platform Support Copilot. I can guide you through HIPAA compliance requirements, 3D scanning guides, Vita shade selection rules, or database security protocols.\n\nHow can I support your dental laboratory operation or clinical workflow today?"
 }
 ]);
 const [inputText, setInputText] = useState<string>("");
 const [isLoading, setIsLoading] = useState<boolean>(false);
 const [hasError, setHasError] = useState<string | null>(null);

 const endOfChatRef = useRef<HTMLDivElement>(null);

 // Auto-scroll on new message arrivals
 useEffect(() => {
 endOfChatRef.current?.scrollIntoView({ behavior: "smooth" });
 }, [messages, isLoading]);

 const triggerChatCall = async (prompt: string) => {
 if (!prompt.trim() || isLoading) return;

 const userMessage: Message = { role: "user", text: prompt };
 setMessages(prev => [...prev, userMessage]);
 setInputText("");
 setIsLoading(true);
 setHasError(null);

 // Slice chat history for standard context matching
 const chatHistory = messages.map(m => ({ role: m.role, text: m.text }));

 try {
 const response = await fetch("/api/chat", {
 method: "POST",
 headers: {
 "Content-Type": "application/json"
 },
 body: JSON.stringify({
 message: prompt,
 chatHistory
 })
 });

 if (!response.ok) {
 const errorData = await response.json().catch(() => ({}));
 throw new Error(errorData.error || `Server responded with status ${response.status}`);
 }

 const data = await response.json();
 setMessages(prev => [...prev, { role: "model", text: data.text }]);
 } catch (err: any) {
 console.error("AI Assistant communications failure:", err);
 // Give a highly detailed explanation of what went wrong, keeping it safe and helpful
 setHasError(err.message || "Failed to make contact with the AI server. Please make sure process.env.GEMINI_API_KEY is configured.");
 } finally {
 setIsLoading(false);
 }
 };

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 triggerChatCall(inputText);
 };

 const quickPrompts = [
 { label: "Crown Milling Materials", query: "What are the recommended zirconia blocks and shrinkage coefficents for highly translucent posterior restorations?" },
 { label: "Clinician HIPAA Privacy Rules", query: "How does the platform isolate patient identifiable details on 3D scans between clinics and outsourced technicians?" },
 { label: "Bite Scan Ingestion Guides", query: "What are the optimal STL/PLY file resolution settings to import prep structures into Exocad securely?" }
 ];

 return (
 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col h-[520px] overflow-hidden shadow-sm">
 
 {/* Header */}
 <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-4 flex justify-between items-center flex-shrink-0">
 <div className="flex items-center gap-2">
 <Bot className="text-blue-600 dark:text-blue-400 w-5 h-5 animate-pulse" />
 <div>
 <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 leading-normal">
 DenSync Platform Copilot (AI)
 </h4>
 <p className="text-sm text-slate-600 dark:text-slate-300">Clinical Guide & Workspace Support</p>
 </div>
 </div>
 <span className="text-sm bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 dark:text-slate-500 font-sans">
 MODEL: gemini-3.5-flash
 </span>
 </div>

 {/* Message bubble stream */}
 <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-white dark:bg-slate-900">
 {messages.map((m, idx) => {
 const isBot = m.role === "model";
 return (
 <div key={idx} className={`flex gap-2.5 items-start ${isBot ? "justify-start" : "justify-end"}`}>
 {isBot && (
 <div className="w-6 h-6 rounded-lg bg-blue-600 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
 <Bot className="w-3.5 h-3.5" />
 </div>
 )}
 
 <div className={`p-3 rounded-xl text-xs max-w-[85%] leading-relaxed ${
 isBot 
 ? "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-tl-none border border-slate-200 dark:border-slate-700" 
 : "bg-blue-600 dark:bg-blue-500 text-slate-600 dark:text-slate-300 rounded-tr-none shadow-sm"
 }`}>
 {/* Visual markdown paragraph renderer */}
 <span className="whitespace-pre-wrap">{m.text}</span>
 </div>

 {!isBot && (
 <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5 animate-pulse">
 <User className="w-3.5 h-3.5" />
 </div>
 )}
 </div>
 );
 })}

 {isLoading && (
 <div className="flex gap-2.5 items-start justify-start">
 <div className="w-6 h-6 rounded-lg bg-blue-600 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 animate-spin">
 <RefreshCw className="w-3.5 h-3.5" />
 </div>
 <div className="p-3 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-xl rounded-tl-none border border-slate-200 dark:border-slate-700 text-xs italic">
 AI Support is researching details...
 </div>
 </div>
 )}

 {hasError && (
 <div className="p-3 bg-red-950/20 border border-red-500/20 text-red-300 rounded-xl text-xs flex gap-2 items-start leading-normal">
 <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" />
 <div>
 <p className="font-semibold text-red-200">System Integration Hook Alert:</p>
 <p className="mt-1 text-sm opacity-90">{hasError}</p>
 </div>
 </div>
 )}

 <div ref={endOfChatRef} />
 </div>

 {/* Quick Prompts Panel */}
 <div className="px-4 py-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 select-none flex-shrink-0 overflow-x-auto whitespace-nowrap scrollbar-hide flex gap-1.5">
 {quickPrompts.map((qp, idx) => (
 <button
 id={`btn-quick-prompt-${idx}`}
 key={idx}
 onClick={() => triggerChatCall(qp.query)}
 className="text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-755 hover:bg-white dark:bg-slate-900 font-sans px-2.5 py-1 rounded-full transition-all flex-shrink-0 cursor-pointer"
 >
 {qp.label}
 </button>
 ))}
 </div>

 {/* Input container */}
 <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex gap-2 flex-shrink-0">
 <input
 id="chat-input-text"
 type="text"
 value={inputText}
 onChange={e => setInputText(e.target.value)}
 placeholder="Ask a workspace workflow or clinical guard template..."
 className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-200 dark:border-blue-800"
 />
 <button
 id="chat-submit-btn"
 type="submit"
 disabled={!inputText.trim() || isLoading}
 className="p-2.5 rounded-xl bg-blue-600 dark:bg-blue-500 hover:bg-blue-600 dark:bg-blue-500 text-slate-600 dark:text-slate-300 disabled:opacity-40 transition-all cursor-pointer flex-shrink-0"
 >
 <Send className="w-4 h-4" />
 </button>
 </form>

 </div>
 );
}
