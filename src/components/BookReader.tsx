import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Share2,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Search,
  RotateCcw,
  Sparkles,
  BookMarked,
  Sun,
  Moon,
  AlignLeft,
  X
} from 'lucide-react';

interface BookReaderProps {
  title: string;
  subject: string;
  topicName: string;
  subtopicName?: string;
  content: string; // The raw book/notes content typed or pasted by the user
  onBackToFolders: () => void;
  onShareBook?: () => void;
  onMarkRead?: (durationSeconds: number) => void;
}

export const BookReader: React.FC<BookReaderProps> = ({
  title,
  subject,
  topicName,
  subtopicName,
  content,
  onBackToFolders,
  onShareBook,
  onMarkRead,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Font size multiplier: 1 (normal: 16px), 2 (large: 18px), 3 (xl: 20px), 4 (xxl: 22px), 0 (compact: 14px)
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(() => {
    const saved = localStorage.getItem('topictest_reader_fontsize');
    return saved ? parseInt(saved, 10) : 1;
  });

  // Reader Style Theme: 'default' | 'sepia' | 'dark' | 'light'
  const [readerTheme, setReaderTheme] = useState<'default' | 'sepia' | 'dark' | 'light'>('default');

  // Reading progress (0-100%)
  const [readProgress, setReadProgress] = useState(0);
  const [hasMarkedCompleted, setHasMarkedCompleted] = useState(false);
  const [startTime] = useState<number>(() => Date.now());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Calculate word count & estimated read time
  const { wordCount, readTimeMinutes } = useMemo(() => {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 180)); // average reading speed ~180 wpm
    return { wordCount: words, readTimeMinutes: minutes };
  }, [content]);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const totalScroll = el.scrollHeight - el.clientHeight;
      if (totalScroll <= 0) {
        setReadProgress(100);
        return;
      }
      const currentScroll = el.scrollTop;
      const progress = Math.min(100, Math.round((currentScroll / totalScroll) * 100));
      setReadProgress(progress);
    };

    const el = containerRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
    }
    return () => {
      if (el) el.removeEventListener('scroll', handleScroll);
    };
  }, [content]);

  const handleFontSizeChange = (delta: number) => {
    setFontSizeLevel((prev) => {
      const next = Math.max(0, Math.min(4, prev + delta));
      localStorage.setItem('topictest_reader_fontsize', next.toString());
      return next;
    });
  };

  const handleShare = () => {
    if (onShareBook) {
      onShareBook();
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handleComplete = () => {
    const elapsedSeconds = Math.max(15, Math.round((Date.now() - startTime) / 1000));
    setHasMarkedCompleted(true);
    if (onMarkRead) {
      onMarkRead(elapsedSeconds);
    }
  };

  // Font size classes
  const fontSizes = [
    'text-sm leading-relaxed',       // 0: 14px
    'text-base leading-relaxed',     // 1: 16px (default)
    'text-lg leading-loose',         // 2: 18px
    'text-xl leading-loose',         // 3: 20px
    'text-2xl leading-loose',        // 4: 22px
  ];

  // Reader background and text colors based on selected reading theme
  const themeStyles = {
    default: {
      bg: 'bg-slate-950',
      panel: 'bg-slate-900 border-slate-800',
      text: 'text-slate-100',
      subtext: 'text-slate-400',
      heading: 'text-emerald-400',
      border: 'border-slate-800',
    },
    sepia: {
      bg: 'bg-[#fbf0d9]',
      panel: 'bg-[#f4e4c1] border-[#dfcd9f]',
      text: 'text-[#433422]',
      subtext: 'text-[#725a3d]',
      heading: 'text-[#873600]',
      border: 'border-[#dfcd9f]',
    },
    dark: {
      bg: 'bg-black',
      panel: 'bg-[#111115] border-[#22222a]',
      text: 'text-[#e6edf3]',
      subtext: 'text-[#8b949e]',
      heading: 'text-emerald-400',
      border: 'border-[#22222a]',
    },
    light: {
      bg: 'bg-[#ffffff]',
      panel: 'bg-[#f8fafc] border-[#e2e8f0]',
      text: 'text-[#0f172a]',
      subtext: 'text-[#475569]',
      heading: 'text-emerald-700',
      border: 'border-[#e2e8f0]',
    },
  }[readerTheme];

  // Parse raw text into structured paragraphs and headings
  const formattedSections = useMemo(() => {
    if (!content.trim()) return [];

    // Split text into paragraphs by double newlines or single newlines
    const rawParagraphs = content.split(/\r?\n\r?\n/);

    return rawParagraphs.map((para, idx) => {
      const trimmed = para.trim();
      if (!trimmed) return null;

      // Check if it's a heading
      const isHeading =
        trimmed.startsWith('#') ||
        trimmed.startsWith('अध्याय') ||
        trimmed.startsWith('Chapter') ||
        trimmed.startsWith('भाग') ||
        trimmed.startsWith('Part') ||
        (trimmed.length < 60 && trimmed.endsWith(':')) ||
        (trimmed.length < 50 && /^[A-Z0-9\s\-_:\u0900-\u097F]+$/.test(trimmed) && trimmed.length > 3);

      const cleanHeadingText = trimmed.replace(/^#+\s*/, '');

      // Check for bullet lists
      const isList = trimmed.split('\n').every(line => /^\s*[-•*]\s+/.test(line) || /^\s*\d+[\.\)]\s+/.test(line));

      if (isList) {
        const items = trimmed.split('\n').map(line => line.replace(/^\s*[-•*]\s+|\s*\d+[\.\)]\s+/, '').trim()).filter(Boolean);
        return {
          type: 'list' as const,
          items,
          id: `para-${idx}`,
        };
      }

      if (isHeading) {
        return {
          type: 'heading' as const,
          text: cleanHeadingText,
          id: `para-${idx}`,
        };
      }

      // Standard paragraph (with internal newlines preserved if poetry or verse)
      return {
        type: 'paragraph' as const,
        text: trimmed,
        id: `para-${idx}`,
      };
    }).filter(Boolean);
  }, [content]);

  // Filter sections by search query if search is active
  const searchMatchesCount = useMemo(() => {
    if (!searchQuery.trim()) return 0;
    const q = searchQuery.toLowerCase();
    return (content.toLowerCase().match(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  }, [content, searchQuery]);

  return (
    <div
      className={`flex flex-col transition-colors ${themeStyles.bg} ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none w-screen h-screen'
          : 'flex-1 min-h-[750px] border rounded-2xl overflow-hidden shadow-2xl ' + themeStyles.border
      }`}
    >
      {/* ------------------------------------------------------------- */}
      {/* READING PROGRESS BAR AT VERY TOP                              */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full h-1 bg-slate-800/40 relative overflow-hidden shrink-0">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-150"
          style={{ width: `${readProgress}%` }}
        />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* E-READER TOP BAR CONTROLS                                     */}
      {/* ------------------------------------------------------------- */}
      <div
        className={`px-3 sm:px-6 py-2.5 flex items-center justify-between border-b gap-2 shrink-0 ${themeStyles.panel}`}
      >
        {/* Left: Back & Breadcrumbs */}
        <div className="flex items-center gap-2 truncate">
          <button
            type="button"
            onClick={onBackToFolders}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-950/40 hover:bg-slate-950/70 border border-slate-700/50 text-xs font-semibold transition-all active:scale-95 shrink-0"
            title="Back"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-emerald-500" />
            <span>Back</span>
          </button>

          <div className="h-4 w-px bg-slate-700/60 hidden sm:block" />

          <div className="truncate">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-xs font-bold truncate">{title}</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                📖 Book
              </span>
            </div>
            <div className={`text-[10px] truncate ${themeStyles.subtext}`}>
              <span>{subject}</span>
              {topicName && <span> → {topicName}</span>}
              {subtopicName && <span> → {subtopicName}</span>}
            </div>
          </div>
        </div>

        {/* Right: Reader Customization Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick Stats: Word count & read time */}
          <div className={`hidden md:flex items-center gap-2 text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-950/30 border border-slate-700/40 ${themeStyles.subtext}`}>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-500" />
              <span>{readTimeMinutes} min read</span>
            </span>
            <span>•</span>
            <span>{wordCount} words</span>
            <span>•</span>
            <span className="text-emerald-500 font-bold">{readProgress}% read</span>
          </div>

          {/* Search Toggle */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-1.5 rounded-lg bg-slate-950/30 hover:bg-slate-950/60 border border-slate-700/40 text-xs transition-colors"
            title="Search text"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* Font Size Adjusters */}
          <div className="flex items-center bg-slate-950/30 border border-slate-700/40 rounded-lg p-0.5 text-xs font-bold font-mono">
            <button
              type="button"
              onClick={() => handleFontSizeChange(-1)}
              disabled={fontSizeLevel <= 0}
              className="px-2 py-0.5 rounded hover:bg-slate-800/50 disabled:opacity-30"
              title="Font Chhota Karein (A-)"
            >
              A-
            </button>
            <span className="px-1 text-[10px] opacity-75">{fontSizeLevel + 1}</span>
            <button
              type="button"
              onClick={() => handleFontSizeChange(1)}
              disabled={fontSizeLevel >= 4}
              className="px-2 py-0.5 rounded hover:bg-slate-800/50 disabled:opacity-30"
              title="Font Bada Karein (A+)"
            >
              A+
            </button>
          </div>

          {/* Reading Tone Selector (Default, Sepia, Dark, Light) */}
          <div className="hidden sm:flex items-center bg-slate-950/30 border border-slate-700/40 rounded-lg p-0.5 text-[10px] font-semibold">
            <button
              type="button"
              onClick={() => setReaderTheme('default')}
              className={`px-2 py-0.5 rounded transition-colors ${readerTheme === 'default' ? 'bg-emerald-500 text-slate-950 font-bold' : 'opacity-70 hover:opacity-100'}`}
              title="System Theme"
            >
              App
            </button>
            <button
              type="button"
              onClick={() => setReaderTheme('sepia')}
              className={`px-2 py-0.5 rounded transition-colors ${readerTheme === 'sepia' ? 'bg-[#dfcd9f] text-[#433422] font-bold' : 'opacity-70 hover:opacity-100'}`}
              title="Sepia Book Paper Theme"
            >
              Sepia
            </button>
            <button
              type="button"
              onClick={() => setReaderTheme('dark')}
              className={`px-2 py-0.5 rounded transition-colors ${readerTheme === 'dark' ? 'bg-slate-800 text-white font-bold' : 'opacity-70 hover:opacity-100'}`}
              title="Dark Mode"
            >
              Dark
            </button>
            <button
              type="button"
              onClick={() => setReaderTheme('light')}
              className={`px-2 py-0.5 rounded transition-colors ${readerTheme === 'light' ? 'bg-white text-slate-950 font-bold' : 'opacity-70 hover:opacity-100'}`}
              title="Crisp Light"
            >
              Light
            </button>
          </div>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-950/30 hover:bg-slate-950/60 border border-slate-700/40 text-xs transition-colors"
            title="Share Book Link"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{copiedShare ? 'Copied' : 'Share'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-slate-950/30 hover:bg-slate-950/60 border border-slate-700/40 text-xs transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Reading Mode'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SEARCH BAR (IF TOGGLED)                                       */}
      {/* ------------------------------------------------------------- */}
      {isSearchOpen && (
        <div className={`px-4 py-2 border-b flex items-center justify-between gap-3 ${themeStyles.panel}`}>
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 opacity-60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search words in this book/chapter..."
              className="w-full bg-transparent border-none text-xs focus:outline-none placeholder:opacity-50"
              autoFocus
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="p-1 opacity-60 hover:opacity-100">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          {searchQuery && (
            <span className="text-[11px] font-mono opacity-80">
              {searchMatchesCount} matches found
            </span>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MAIN BOOK READING SURFACE (PARAGRAPH FORMATTED LIKE A BOOK)   */}
      {/* ------------------------------------------------------------- */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 sm:px-10 md:px-16 lg:px-24 py-8 sm:py-12"
      >
        <div ref={contentRef} className="max-w-3xl mx-auto space-y-6">
          {/* Book / Chapter Header Badge */}
          <div className="text-center pb-6 border-b border-slate-700/40 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold text-xs border border-emerald-500/30">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{subject} · Study Book</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              {title}
            </h1>

            {(topicName || subtopicName) && (
              <p className={`text-xs sm:text-sm font-medium ${themeStyles.subtext}`}>
                {topicName} {subtopicName && `· ${subtopicName}`}
              </p>
            )}

            <div className={`flex items-center justify-center gap-3 text-xs pt-2 font-mono ${themeStyles.subtext}`}>
              <span>📖 {wordCount} Words</span>
              <span>•</span>
              <span>⏱️ ~{readTimeMinutes} min read</span>
            </div>
          </div>

          {/* Book Content Paragraphs */}
          <article className={`space-y-5 text-justify ${fontSizes[fontSizeLevel]}`}>
            {formattedSections.map((section, sIdx) => {
              if (!section) return null;

              if (section.type === 'heading') {
                return (
                  <h2
                    key={section.id}
                    className={`pt-6 pb-2 text-lg sm:text-xl md:text-2xl font-bold tracking-tight border-b border-slate-700/30 ${themeStyles.heading}`}
                  >
                    {section.text}
                  </h2>
                );
              }

              if (section.type === 'list') {
                return (
                  <ul key={section.id} className="space-y-2 pl-5 list-disc my-3">
                    {section.items.map((item, lIdx) => (
                      <li key={lIdx} className="leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                );
              }

              // Standard Book Paragraph
              return (
                <p
                  key={section.id}
                  className="leading-relaxed sm:leading-loose tracking-normal indent-4 sm:indent-8 first-letter:text-xl first-letter:font-bold first-letter:float-none"
                >
                  {section.text}
                </p>
              );
            })}
          </article>

          {/* ----------------------------------------------------------- */}
          {/* CHAPTER / BOOK COMPLETION CARD                              */}
          {/* ----------------------------------------------------------- */}
          <div className={`mt-12 p-6 rounded-2xl border text-center space-y-4 shadow-xl ${themeStyles.panel}`}>
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center border border-emerald-500/40">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold">
                {hasMarkedCompleted ? '🎉 Badhai Ho! Chapter Padh Liya Gaya' : 'Yeh Chapter Padh Liya?'}
              </h3>
              <p className={`text-xs mt-1 max-w-md mx-auto ${themeStyles.subtext}`}>
                {hasMarkedCompleted
                  ? 'Aapka reading session record ho gaya hai aur Performance Analysis me add ho chuka hai.'
                  : 'Niche diye gaye button par click karein taaki aapka reading completion analysis me jud sake.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {!hasMarkedCompleted ? (
                <button
                  type="button"
                  onClick={handleComplete}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark as Completed & Save Analysis</span>
                </button>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-bold text-xs">
                  <span>✓ Completed</span>
                </div>
              )}

              <button
                type="button"
                onClick={onBackToFolders}
                className="px-5 py-2.5 rounded-xl bg-slate-950/40 hover:bg-slate-950/70 border border-slate-700/60 text-xs font-semibold transition-colors"
              >
                Back to Syllabus
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
