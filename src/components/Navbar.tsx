import React from 'react';
import { SubjectType, ALL_SUBJECTS } from '../lib/supabase';
import { UploadCloud, Eye, Database, Plus } from 'lucide-react';

interface NavbarProps {
  mode: 'tester' | 'uploader';
  onModeChange: (mode: 'tester' | 'uploader') => void;
  onOpenRoleSelect: () => void;
  selectedSubject: SubjectType;
  onSelectSubject: (subject: SubjectType) => void;
  onOpenSqlModal: () => void;
  onNewUploadClick?: () => void;
  uploaderTab?: 'form' | 'manage';
  onUploaderTabChange?: (tab: 'form' | 'manage') => void;
  subjectNewCounts: Record<SubjectType, number>;
}

export const Navbar: React.FC<NavbarProps> = ({
  mode,
  onModeChange,
  onOpenRoleSelect,
  selectedSubject,
  onSelectSubject,
  onOpenSqlModal,
  onNewUploadClick,
  uploaderTab = 'form',
  onUploaderTabChange,
  subjectNewCounts,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-13 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-2 sm:gap-4">
        {/* Left / Center Zone */}
        {mode === 'tester' ? (
          /* Tester Mode Navigation: 5 Subjects only, clean and direct */
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1">
            {ALL_SUBJECTS.map((sub) => {
              const isActive = selectedSubject === sub;
              const hasNew = (subjectNewCounts[sub] || 0) > 0;

              return (
                <button
                  key={sub}
                  onClick={() => onSelectSubject(sub)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                    isActive
                      ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <span>{sub}</span>
                  {hasNew && (
                    <span
                      title={`${subjectNewCounts[sub]} new topics`}
                      className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"
                    />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          /* Uploader Mode Navigation: Simple action tabs */
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => {
                if (onUploaderTabChange) onUploaderTabChange('form');
                if (onNewUploadClick) onNewUploadClick();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                uploaderTab === 'form'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload New</span>
            </button>

            <button
              onClick={() => onUploaderTabChange && onUploaderTabChange('manage')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                uploaderTab === 'manage'
                  ? 'bg-slate-800 text-slate-100 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Manage Uploads
            </button>
          </div>
        )}

        {/* Right Zone */}
        <div className="flex items-center gap-1.5 shrink-0">
          {mode === 'tester' ? (
            /* Tester: NO SQL, NO upload text, ONLY very small icon */
            <button
              onClick={() => onModeChange('uploader')}
              title="Go to Uploader"
              className="p-1.5 rounded-md text-slate-400 hover:text-emerald-400 hover:bg-slate-900 transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
            </button>
          ) : (
            /* Uploader: SQL button and back to tester icon */
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenSqlModal}
                title="Supabase SQL Setup"
                className="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>SQL</span>
              </button>
              <button
                onClick={() => onModeChange('tester')}
                title="Go to Tester"
                className="p-1.5 rounded-md text-slate-400 hover:text-emerald-400 hover:bg-slate-900 transition-colors"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
