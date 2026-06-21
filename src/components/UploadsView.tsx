import React, { useState } from "react";
import { 
 FileUp, FileText, Download, ShieldCheck, Clock, Trash2, Search,
 Tv, Database, Plus, Sparkles, CheckCircle2, ChevronRight, FileCode
} from "lucide-react";

interface FileItem {
 id: string;
 name: string;
 type: string;
 size: string;
 checksum: string;
 uploadedAt: string;
}

interface UploadsViewProps {
 triggerGlobalToast: (msg: string) => void;
}

export default function UploadsView({ triggerGlobalToast }: UploadsViewProps) {
 const [files, setFiles] = useState<FileItem[]>([
 { id: "FL-001", name: "Apex_UpperJaw_3DScan.ply", type: "PLY Scan Data (3D)", size: "28.4 MB", checksum: "8f4a21cd...4e9fb12a", uploadedAt: "2026-06-16" },
 { id: "FL-002", name: "RM_SmilePhotos_ShadeRef.jpg", type: "JPEG Clinic Photo", size: "3.2 MB", checksum: "bf01a3ce...2cd430be", uploadedAt: "2026-06-16" },
 { id: "FL-003", name: "Veneer_3DScan_Prep.gltf", type: "GLTF Mesh Alignment", size: "41.2 MB", checksum: "9e3c45ab...8f0b12bc", uploadedAt: "2026-06-17" }
 ]);

 const [searchQuery, setSearchQuery] = useState("");
 const [dragActive, setDragActive] = useState(false);

 const handleDrag = (e: React.DragEvent) => {
 e.preventDefault();
 e.stopPropagation();
 if (e.type === "dragenter" || e.type === "dragover") {
 setDragActive(true);
 } else if (e.type === "dragleave") {
 setDragActive(false);
 }
 };

 const handleDrop = (e: React.DragEvent) => {
 e.preventDefault();
 e.stopPropagation();
 setDragActive(false);

 if (e.dataTransfer.files && e.dataTransfer.files[0]) {
 const droppedFile = e.dataTransfer.files[0];
 const newFileItem: FileItem = {
 id: `FL-00${files.length + 1}`,
 name: droppedFile.name,
 type: droppedFile.name.endsWith(".jpg") ? "JPEG Clinic Photo" : "PLY Scan Data (3D)",
 size: `${(droppedFile.size / 1024 / 1024).toFixed(1)} MB`,
 checksum: Math.random().toString(36).substring(2, 10) + "..." + Math.random().toString(36).substring(2, 10),
 uploadedAt: new Date().toISOString().split("T")[0]
 };

 setFiles(prev => [newFileItem, ...prev]);
 triggerGlobalToast(`Successfully uploaded and sanitized ${droppedFile.name}!`);
 }
 };

 const handleDeleteFile = (id: string, name: string) => {
 setFiles(prev => prev.filter(f => f.id !== id));
 triggerGlobalToast(`Deleted secure file register: ${name}`);
 };

 const filteredFiles = files.filter(f => 
 f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 f.type.toLowerCase().includes(searchQuery.toLowerCase())
 );

 return (
 <div id="uploads-secure-storage-view" className="space-y-6 animate-fadeIn">
 
 {/* View Title */}
 <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700 ">
 <div>
 <h2 className="text-sm font-bold font-medium text-slate-855 flex items-center gap-1.5">
 <FileUp className="w-5 h-5 text-blue-600 dark:text-blue-400 " />
 Digital CAD/CAM Scans Cabinet
 </h2>
 <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-0.5">Secure, S3-powered clinical imaging & bite structure attachments</p>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
 
 {/* Left Column: Drag & Drop Area and File List (8 columns) */}
 <div className="lg:col-span-8 space-y-6">
 
 {/* File Drag zone */}
 <div
 onDragEnter={handleDrag}
 onDragOver={handleDrag}
 onDragLeave={handleDrag}
 onDrop={handleDrop}
 className={`border border-dashed p-8 rounded-2xl text-center transition-all shadow-xs ${
 dragActive 
 ? "border-orange-500 bg-orange-500/5" 
 : "border-slate-300 dark:border-slate-600 hover:border-slate-400 bg-white dark:bg-slate-900 #0f172a]/30"
 }`}
 >
 <div className="space-y-3 max-w-md mx-auto">
 <FileCode className="w-10 h-10 text-slate-405 mx-auto animate-pulse" />
 <div>
 <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Drag & Drop Patient Scans & Clinical Photos</span>
 <span className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 block mt-1 leading-relaxed">
 Supported formats: STL, PLY, OBJ, and JPEG shadow templates. HIPAA anonymization is applied on load.
 </span>
 </div>
 </div>
 </div>

 {/* Secure cabinet file list */}
 <div className="bg-white dark:bg-slate-900 #0a0f1d] border border-slate-205 rounded-2xl p-5 shadow-sm space-y-4">
 
 <div className="flex justify-between items-center gap-4 flex-wrap">
 <h3 className="font-bold text-xs text-slate-850 font-medium font-sans">
 Active Scan Records ({filteredFiles.length})
 </h3>

 <div className="relative">
 <Search className="w-3.5 h-3.5 text-slate-450 absolute left-3 top-2.5" />
 <input
 type="text"
 value={searchQuery}
 onChange={e => setSearchQuery(e.target.value)}
 placeholder="Search index cabinet..."
 className="bg-white dark:bg-slate-900 border border-slate-250 p-1 px-3 pl-9 text-xs rounded-xl focus:outline-none focus:border-blue-200 dark:border-blue-800 text-slate-800 dark:text-slate-200 font-sans shadow-xs"
 />
 </div>
 </div>

 <div className="space-y-3 pt-1">
 {filteredFiles.map(f => (
 <div key={f.id} className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex items-center justify-between text-xs flex-wrap gap-4 transition-all shadow-xs">
 <div className="flex items-start gap-3.5">
 <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 ">
 <FileText className="w-4 h-4" />
 </div>
 <div>
 <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
 {f.name}
 <span className="text-sm font-sans text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium text-sm bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-bold">
 {f.id}
 </span>
 </h4>
 <div className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1 font-sans flex gap-3">
 <span>Format: <strong className="text-slate-700 dark:text-slate-300 ">{f.type}</strong></span>
 <span>•</span>
 <span>Size: <strong className="text-slate-700 dark:text-slate-300 ">{f.size}</strong></span>
 </div>
 </div>
 </div>

 {/* Actions & integrity detail */}
 <div className="flex items-center gap-6">
 <div className="text-right hidden sm:block font-sans text-sm text-slate-550 space-y-1">
 <div>SHA-256: <code className="text-blue-600 dark:text-blue-400 font-bold">{f.checksum}</code></div>
 <div>Uploaded: <span className="text-slate-700 dark:text-slate-300 ">{f.uploadedAt}</span></div>
 </div>

 <div className="flex gap-2.5">
 <button
 onClick={() => {
 triggerGlobalToast(`Authorized 5-minute pre-signed link. Downloading ${f.name}!`);
 }}
 className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:text-slate-200 hover:border-blue-200 dark:border-blue-800 rounded-lg transition-all cursor-pointer shadow-xs"
 title="Download Pre-signed file"
 >
 <Download className="w-3.5 h-3.5" />
 </button>

 <button
 onClick={() => handleDeleteFile(f.id, f.name)}
 className="p-1.5 bg-white dark:bg-slate-900 hover:bg-red-50 dark:bg-red-900/20 text-slate-405 hover:text-red-650 rounded-lg transition-all border border-slate-200 dark:border-slate-700 hover:border-red-200 cursor-pointer shadow-xs"
 title="Purge attachment"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>
 </div>
 ))}

 {filteredFiles.length === 0 && (
 <div className="p-8 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-center text-slate-500 dark:text-slate-400 dark:text-slate-500 text-xs italic">
 No scan files matching active criteria inside clinical cabinet.
 </div>
 )}
 </div>
 </div>

 </div>

 {/* Right Column: S3 configuration metadata (4 columns) */}
 <div className="lg:col-span-4 space-y-6">
 <div className="bg-white dark:bg-slate-900 #0a0f1d] border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-4 shadow-sm ">
 <h3 className="font-bold text-xs text-slate-850 font-medium font-sans flex items-center gap-1.5">
 <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 " />
 S3 Sanitization Protocol
 </h3>
 
 <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
 Our storage engine enforces strict dental file compliance standards. All files undergo sanitization at the API boundary before being archived to prevent data exposure:
 </p>

 <div className="space-y-3.5 pt-1 text-xs">
 <div className="flex items-start gap-2.5">
 <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
 <div>
 <h4 className="font-bold text-slate-800 dark:text-slate-200 ">5-Min Presigned Link Expiry</h4>
 <p className="text-sm text-slate-550 mt-0.5 leading-snug">Public fetch triggers generate short-lived signed URLs that automatically decay protecting records from search crawler indexers.</p>
 </div>
 </div>

 <div className="flex items-start gap-2.5">
 <Database className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
 <div>
 <h4 className="font-bold text-slate-800 dark:text-slate-200 ">Isolated HIPAA Buckets</h4>
 <p className="text-sm text-slate-550 mt-0.5 leading-snug">All 3D PLY and OBJ coordinate scans reside in write-once read-many vaults. Patient identifying parameters are scrubbed completely.</p>
 </div>
 </div>
 </div>
 </div>
 </div>

 </div>

 </div>
 );
}
