import React, { useState } from "react";
import { UserRole } from "../types";
import { Stethoscope, Settings, PenTool, ArrowLeft } from "lucide-react";

export default function SignupView({ onSignup, onNavigate }: { onSignup: (role: UserRole, fullName: string) => void, onNavigate: (view: 'landing' | 'login') => void }) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [labName, setLabName] = useState("");
  const [gstin, setGstin] = useState("");
  const [clinicName, setClinicName] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRoleSelection = (role: UserRole) => {
    setSelectedRole(role);
    setError("");
  };

  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !fullName || !email || !password) {
      setError("Please fill out all required fields.");
      return;
    }
    
    if (selectedRole === UserRole.LAB_ADMIN && (!labName || !gstin)) {
      setError("Please fill out Lab Name and GSTIN No.");
      return;
    }

    if (selectedRole === UserRole.DENTIST && !clinicName) {
      setError("Please fill out Clinic Name.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName, role: selectedRole, labName, gstin, clinicName })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Signup failed");
        setIsLoading(false);
        return;
      }

      onSignup(data.role as UserRole, fullName);
    } catch (err) {
      setError("An error occurred during signup.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6 cursor-pointer" onClick={() => onNavigate('landing')}>
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center transform rotate-3 hover:rotate-6 transition-transform shadow-lg">
             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-slate-900 dark:text-white">
          Create an account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{' '}
          <button onClick={() => onNavigate('login')} className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-slate-200 dark:border-slate-700">
          {!selectedRole ? (
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4 text-center">Select your account type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => handleRoleSelection(UserRole.DENTIST)}
                  className="flex flex-col items-center justify-center p-6 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-all text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Stethoscope className="w-10 h-10 mb-3" />
                  <span className="font-semibold">Doctor</span>
                  <span className="text-xs text-center mt-2 text-slate-500">Submit cases and track restorations</span>
                </button>
                <button
                  onClick={() => handleRoleSelection(UserRole.LAB_ADMIN)}
                  className="flex flex-col items-center justify-center p-6 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-slate-700/50 transition-all text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400"
                >
                  <Settings className="w-10 h-10 mb-3" />
                  <span className="font-semibold">Lab Admin</span>
                  <span className="text-xs text-center mt-2 text-slate-500">Manage lab workflows and assignments</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCompleteSignup} className="space-y-6 animate-fadeIn">
              <div className="flex items-center mb-6">
                <button type="button" onClick={() => setSelectedRole(null)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-1">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h3 className="ml-2 text-lg font-medium text-slate-900 dark:text-white">
                  Finish setting up your {selectedRole.replace("_", " ")} profile
                </h3>
              </div>
              
              {error && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4 border border-red-200 dark:border-red-800">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-300">{error}</h3>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              {selectedRole === UserRole.DENTIST && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Clinic Name
                  </label>
                  <input
                    type="text"
                    required
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    placeholder="Enter Clinic Name"
                  />
                </div>
              )}

              {selectedRole === UserRole.LAB_ADMIN && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Lab Name
                    </label>
                    <input
                      type="text"
                      required
                      value={labName}
                      onChange={(e) => setLabName(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      placeholder="Enter Lab Name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      GSTIN No.
                    </label>
                    <input
                      type="text"
                      required
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      placeholder="e.g. 22AAAAA0000A1Z5"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
