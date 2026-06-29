import React from "react";

export default function LandingView({ onNavigate }: { onNavigate: (view: 'login' | 'signup') => void }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="z-10 text-center max-w-2xl px-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
          Dental Laboratory Solutions
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10">
          The high-performance platform connecting dentists, lab administrators, and technicians.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => onNavigate('login')}
            className="w-full sm:w-auto px-8 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Log in
          </button>
          <button
            onClick={() => onNavigate('signup')}
            className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors"
          >
            Sign up
          </button>
        </div>
      </div>
      
      {/* Abstract background shapes */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 dark:opacity-10 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 dark:opacity-10 animate-blob animation-delay-4000"></div>
    </div>
  );
}
