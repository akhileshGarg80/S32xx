import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, ChevronRight, Eye, Sparkles, Download, Smartphone, Monitor } from 'lucide-react';
import { usePWAInstall } from '../lib/usePWAInstall';
import { PWAInstallGuideModal } from './PWAInstallGuideModal';

interface RoleSelectScreenProps {
  onSelectRole: (role: 'tester' | 'uploader') => void;
  newTopicsTotal: number;
  totalTopics: number;
}

export const RoleSelectScreen: React.FC<RoleSelectScreenProps> = ({
  onSelectRole,
  newTopicsTotal,
  totalTopics,
}) => {
  const { isInstallable, isInstalled, isIOS, showInstallGuide, setShowInstallGuide, installRoleTarget, triggerInstall } = usePWAInstall();
  const [activeGuideRole, setActiveGuideRole] = useState<'tester' | 'uploader' | null>(null);

  const handleDownloadPwa = (e: React.MouseEvent, role: 'tester' | 'uploader') => {
    e.stopPropagation();
    setActiveGuideRole(role);
    triggerInstall(role);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl w-full mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>PWA Enabled · 2-in-1 Workspace & App Installer</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 tracking-tight mb-3">
            Select or Download App
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            Neeche diye gaye dono cards se aap direct dashboard khol sakte hain ya seedhe apne phone/desktop par <strong className="text-emerald-400">PWA App Download (Install)</strong> kar sakte hain.
          </p>
        </div>

        {/* 2 Interactive Dual-Purpose Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ========================================================= */}
          {/* CARD 1: TESTER WORKSPACE & PWA DOWNLOAD                  */}
          {/* ========================================================= */}
          <div
            onClick={() => onSelectRole('tester')}
            className="group relative cursor-pointer bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/60 rounded-2xl p-6 sm:p-7 transition-all duration-300 shadow-xl hover:shadow-emerald-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                  <Eye className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    PWA Ready
                  </span>
                  {newTopicsTotal > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      {newTopicsTotal} New
                    </span>
                  )}
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-100 group-hover:text-emerald-300 transition-colors mb-2">
                Tester Dashboard
              </h2>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                Access 5 core subjects: <strong className="text-slate-200">Math, Reasoning, GK, English, Computer</strong>. Test interactive questions, solve practice MCQs, and track new uploads with real-time green dots.
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>5 Subject tabs with instant test runner</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Fixed bottom submit bar & instant score card</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Offline testing & quick home-screen launch</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions: Open & Download PWA */}
            <div className="mt-8 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={(e) => handleDownloadPwa(e, 'tester')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-850 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 transition-all hover:border-emerald-500/50 shadow-sm"
                title="Download Tester PWA on phone / desktop"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isInstalled ? 'Installed ✓' : 'Download PWA'}</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectRole('tester')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-500 text-slate-950 group-hover:bg-emerald-400 transition-colors shadow-sm ml-auto"
              >
                <span>Open Tester</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* CARD 2: UPLOADER WORKSPACE & PWA DOWNLOAD                */}
          {/* ========================================================= */}
          <div
            onClick={() => onSelectRole('uploader')}
            className="group relative cursor-pointer bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-sky-500/60 rounded-2xl p-6 sm:p-7 transition-all duration-300 shadow-xl hover:shadow-sky-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform duration-300">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                    PWA Ready
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                    {totalTopics} Topics
                  </span>
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-100 group-hover:text-sky-300 transition-colors mb-2">
                Uploader Dashboard
              </h2>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                Universal MCQ parser for <strong className="text-slate-200">Word (.doc, .docx), TXT, HTML & Text</strong>. Auto-detects questions, answer keys, and builds shareable test links under subtopics.
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Universal MCQ parser (Word, TXT, HTML)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Live question preview & answer verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Instant link creation + Supabase cloud sync</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions: Open & Download PWA */}
            <div className="mt-8 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={(e) => handleDownloadPwa(e, 'uploader')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-850 hover:bg-slate-800 text-sky-400 hover:text-sky-300 border border-sky-500/30 transition-all hover:border-sky-500/50 shadow-sm"
                title="Download Uploader PWA on phone / desktop"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isInstalled ? 'Installed ✓' : 'Download PWA'}</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectRole('uploader')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-sky-500 text-slate-950 group-hover:bg-sky-400 transition-colors shadow-sm ml-auto"
              >
                <span>Open Uploader</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quiet Subtext */}
        <div className="mt-8 text-center text-xs text-slate-500">
          Website aur PWA dono offline support ke sath real-time sync karte hain.
        </div>
      </div>

      {/* Guided PWA Installation Modal */}
      <PWAInstallGuideModal
        isOpen={showInstallGuide}
        onClose={() => setShowInstallGuide(false)}
        roleTarget={activeGuideRole || installRoleTarget}
        isIOS={isIOS}
      />
    </div>
  );
};
