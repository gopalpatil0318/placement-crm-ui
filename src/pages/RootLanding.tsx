import React from "react";
import { Link } from "react-router-dom";

export default function RootLanding() {
  return (
    <div className="min-h-screen bg-[#080C14] text-[#F8FAFC] flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background Decorators */}
      {/* Background gradients via arbitrary tailwind classes */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          backgroundImage: `
            radial-gradient(circle at 10% 50%, rgba(99, 102, 241, 0.15), transparent 35%),
            radial-gradient(circle at 90% 20%, rgba(14, 165, 233, 0.15), transparent 35%)
          `
        }} 
      />
      
      {/* Decorative Blob 1 */}
      <div className="absolute -top-[15%] -left-[10%] w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[80px] pointer-events-none mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }} />
      {/* Decorative Blob 2 */}
      <div className="absolute -bottom-[20%] -right-[10%] w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[80px] pointer-events-none mix-blend-screen animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />

      <div className="max-w-4xl w-full px-6 py-12 text-center relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-4 bg-gradient-to-br from-indigo-500 to-sky-500 bg-clip-text text-transparent tracking-tight">
          Placenex
        </h1>
        <p className="text-xl md:text-2xl text-slate-400 mb-16 font-light tracking-wide uppercase">
          This page is in under development
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Admin Portal Card */}
          <div className="group relative bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 text-left transition-all hover:-translate-y-2 hover:shadow-[0_30px_40px_-10px_rgba(0,0,0,0.4)] overflow-hidden">
             {/* Gradient glow border effect */}
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-sky-500 opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none" />
             
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-3 relative z-10">Admin Portal</h2>
            <p className="text-slate-400 leading-relaxed mb-6 relative z-10">
              Access the central administration platform to manage institutions, configurations, and system health.
            </p>
            
            <div className="flex flex-col gap-3 relative z-10">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-sky-500/10 text-sky-400 self-start px-2 py-1 rounded">For Admin Use</span>
              <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors">
                <a href="https://admin.placenex.in" className="text-slate-100 font-mono hover:text-sky-400 transition-colors">admin.placenex.in</a>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-slate-500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </div>
            </div>
          </div>

          {/* College Portal Card */}
          <div className="group relative bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 text-left transition-all hover:-translate-y-2 hover:shadow-[0_30px_40px_-10px_rgba(0,0,0,0.4)] overflow-hidden">
             {/* Gradient glow border effect */}
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-sky-500 opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none" />

            <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-3 relative z-10">College Portal</h2>
            <p className="text-slate-400 leading-relaxed mb-6 relative z-10">
              Manage campus placements, track student applications, and connect with recruiters via your dedicated domain.
            </p>
            
            <div className="flex flex-col gap-3 relative z-10">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-sky-500/10 text-sky-400 self-start px-2 py-1 rounded">For Colleges Use</span>
              <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors">
                <span className="text-slate-100 font-mono">collegedomain.placenex.in</span>
              </div>

              <span className="text-[11px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 self-start px-2 py-1 rounded mt-2">Example</span>
              <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors">
                <a href="https://rcpit.placenex.in" className="text-slate-100 font-mono hover:text-sky-400 transition-colors">rcpit.placenex.in</a>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-slate-500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 text-slate-500 text-sm mt-12">
          <span>&copy; {new Date().getFullYear()} Placenex</span>
          <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
          <span>aaa</span>
        </div>
      </div>
    </div>
  );
}
