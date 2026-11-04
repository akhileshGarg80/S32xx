import React, { useState } from 'react';
import { Copy, Check, Terminal, ExternalLink, X, Database } from 'lucide-react';
import { SUPABASE_SETUP_SQL, SUPABASE_URL } from '../lib/supabase';

interface SqlSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFromSupabase?: boolean;
}

export const SqlSetupModal: React.FC<SqlSetupModalProps> = ({ isOpen, onClose, isFromSupabase }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Supabase SQL Setup</h2>
              <p className="text-xs text-slate-400">One-click database migration command</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-300">
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-mono">Connected Supabase Project</span>
              <div className="font-mono text-xs text-emerald-400 truncate max-w-md">{SUPABASE_URL}</div>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${isFromSupabase ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'}`}>
              {isFromSupabase ? 'Table Synced' : 'Ready to Run'}
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Run the SQL command below in your <span className="text-slate-200 font-medium">Supabase Dashboard &gt; SQL Editor</span>. It creates the <code className="text-emerald-300 bg-slate-800 px-1 py-0.5 rounded text-[11px]">public.topics</code> table with RLS policies and grants full permissions to <code className="text-emerald-300 bg-slate-800 px-1 py-0.5 rounded text-[11px]">anon</code> role.
          </p>

          <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-xs space-y-1">
            <span className="font-semibold text-emerald-400">Important Permission Command:</span>
            <p className="text-slate-300">
              Agar pehle se table bani hai aur permission error aa raha ho, to sirf ye ek command run karein:
            </p>
            <code className="block p-2 bg-slate-950 border border-slate-800 rounded font-mono text-[11px] text-emerald-300 select-all">
              GRANT ALL ON TABLE public.topics TO anon, authenticated, service_role;
            </code>
          </div>

          <div className="relative">
            <div className="flex items-center justify-between bg-slate-950 px-3.5 py-2 border-t border-x border-slate-800 rounded-t-lg">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>setup_topics.sql</span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy SQL</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-b-lg font-mono text-xs text-slate-300 overflow-x-auto max-h-56 leading-relaxed selection:bg-emerald-500/30">
              {SUPABASE_SETUP_SQL}
            </pre>
          </div>

          <div className="flex items-center justify-between pt-2">
            <a
              href="https://supabase.com/dashboard/project/tnxuklrhfvfgbuvqspop/sql/new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 hover:underline"
            >
              <span>Open Supabase SQL Editor</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
