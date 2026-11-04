import React from 'react';
import { X, Download, Share, PlusSquare, Smartphone, Monitor, CheckCircle2 } from 'lucide-react';

interface PWAInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleTarget?: 'tester' | 'uploader' | null;
  isIOS?: boolean;
}

export const PWAInstallGuideModal: React.FC<PWAInstallGuideModalProps> = ({
  isOpen,
  onClose,
  roleTarget,
  isIOS,
}) => {
  if (!isOpen) return null;

  const titleRole = roleTarget === 'uploader' ? 'Uploader App' : roleTarget === 'tester' ? 'Tester App' : 'TopicTest Hub';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Install {titleRole} (PWA)
            </h3>
            <p className="text-xs text-slate-400">
              Direct mobile & desktop application download
            </p>
          </div>
        </div>

        {/* Instructions based on platform */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs text-slate-300">
          {isIOS ? (
            <div className="space-y-2.5">
              <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" />
                <span>iPhone / iPad (Safari) me install karein:</span>
              </div>
              <ol className="space-y-2 pl-1 list-decimal list-inside text-slate-300 leading-relaxed">
                <li>
                  Safari browser ke bottom me <strong className="text-slate-100 inline-flex items-center gap-1 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700"><Share className="w-3 h-3 text-sky-400" /> Share</strong> button dabayein.
                </li>
                <li>
                  Neeche scroll karein aur <strong className="text-slate-100 inline-flex items-center gap-1 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700"><PlusSquare className="w-3 h-3 text-emerald-400" /> Add to Home Screen</strong> par tap karein.
                </li>
                <li>
                  Upar <strong className="text-emerald-400">Add</strong> par click karein. App aapke home screen par download ho jayega.
                </li>
              </ol>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5" />
                <span>Android / Chrome / Desktop me install karein:</span>
              </div>
              <ol className="space-y-2 pl-1 list-decimal list-inside text-slate-300 leading-relaxed">
                <li>
                  Browser address bar me <strong className="text-slate-100">Install icon (⊕)</strong> ya 3-dots menu par click karein.
                </li>
                <li>
                  <strong className="text-emerald-400">"Install TopicTest"</strong> ya <strong className="text-emerald-400">"Add to Home screen"</strong> choose karein.
                </li>
                <li>
                  App aapke device par standalone icon ke roop me download ho jayega bina kisi browser bar ke!
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* Benefits list */}
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Fast Native Feel</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Offline Support</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Direct Home Icon</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>No App Store needed</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-lg"
        >
          Samajh Gaya (Close)
        </button>
      </div>
    </div>
  );
};
