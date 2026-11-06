import React, { useState, useMemo } from 'react';
import {
  X,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  BookOpen,
  Layers,
  ChevronDown,
  ChevronUp,
  Search,
  Trash2,
  Award,
  Zap,
  Target,
  ArrowLeft,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import {
  TestAttemptRecord,
  GrandAnalyticsSummary,
  TopicPerformanceGroup,
  formatTimeSeconds,
  clearAllAttempts,
  computeAnalyticsSummary
} from '../lib/analytics';
import { SubjectType, ALL_SUBJECTS, TopicItem } from '../lib/supabase';

export function countQuestionsInTopic(topic: TopicItem): number {
  if (topic.parsed_questions && Array.isArray(topic.parsed_questions) && topic.parsed_questions.length > 0) {
    return topic.parsed_questions.length;
  }
  if (topic.content_type === 'raw_html' || !topic.content_type) {
    if (topic.code) {
      const qCardMatches = topic.code.match(/class=["'][^"']*(?:question-card|q-card|question_text|q-item|question)/gi);
      if (qCardMatches && qCardMatches.length > 0) {
        return qCardMatches.length;
      }
      const qNumberMatches = topic.code.match(/Q\d+[\.\:]/gi);
      if (qNumberMatches && qNumberMatches.length > 0) {
        return qNumberMatches.length;
      }
    }
    if (topic.subtopics && topic.subtopics.length > 0) {
      return topic.subtopics.length;
    }
    return 10;
  }
  return 0;
}

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary?: GrandAnalyticsSummary;
  attempts: TestAttemptRecord[];
  allTopics?: TopicItem[];
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onClearHistory: () => void;
  onRetakeTopic?: (topicName: string, subject: SubjectType, subtopicName?: string) => void;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({
  isOpen,
  onClose,
  summary: externalSummary,
  attempts,
  allTopics = [],
  theme = 'dark',
  onToggleTheme,
  onClearHistory,
  onRetakeTopic,
}) => {
  const summary: GrandAnalyticsSummary = useMemo(() => {
    return externalSummary || computeAnalyticsSummary(attempts);
  }, [externalSummary, attempts]);

  // Live 5-Subject Uploaded Question Bank Stats (grows dynamically as user uploads)
  const bankStats = useMemo(() => {
    const stats: Record<SubjectType, { uploadedQuestions: number; uploadedTopics: number }> = {
      Math: { uploadedQuestions: 0, uploadedTopics: 0 },
      Reasoning: { uploadedQuestions: 0, uploadedTopics: 0 },
      GK: { uploadedQuestions: 0, uploadedTopics: 0 },
      English: { uploadedQuestions: 0, uploadedTopics: 0 },
      Computer: { uploadedQuestions: 0, uploadedTopics: 0 },
    };

    let grandTotalUploadedQuestions = 0;
    let grandTotalUploadedTopics = 0;

    (allTopics || []).forEach((item) => {
      if (stats[item.subject]) {
        const qCount = countQuestionsInTopic(item);
        stats[item.subject].uploadedQuestions += qCount;
        stats[item.subject].uploadedTopics += 1;
        grandTotalUploadedQuestions += qCount;
        grandTotalUploadedTopics += 1;
      }
    });

    return {
      subjectStats: stats,
      grandTotalUploadedQuestions,
      grandTotalUploadedTopics,
    };
  }, [allTopics]);

  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<SubjectType | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTopicKey, setExpandedTopicKey] = useState<string | null>(null);

  // Filter topic groups
  const filteredTopics = useMemo(() => {
    return summary.topicGroups.filter(grp => {
      const matchSubj = selectedSubjectFilter === 'All' || grp.subject === selectedSubjectFilter;
      const matchQuery =
        !searchQuery.trim() ||
        grp.topicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (grp.subtopicName && grp.subtopicName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        grp.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSubj && matchQuery;
    });
  }, [summary.topicGroups, selectedSubjectFilter, searchQuery]);

  if (!isOpen) return null;

  const toggleTopicDetails = (key: string) => {
    setExpandedTopicKey(prev => (prev === key ? null : key));
  };

  // Subject colors
  const subjectColors: Record<SubjectType, { badge: string; text: string; bg: string }> = {
    Math: { badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30', text: 'text-blue-400', bg: 'bg-blue-500' },
    Reasoning: { badge: 'bg-purple-500/15 text-purple-400 border-purple-500/30', text: 'text-purple-400', bg: 'bg-purple-500' },
    GK: { badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30', text: 'text-amber-400', bg: 'bg-amber-500' },
    English: { badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', text: 'text-emerald-400', bg: 'bg-emerald-500' },
    Computer: { badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30', text: 'text-cyan-400', bg: 'bg-cyan-500' },
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col w-full h-full overflow-hidden animate-in fade-in">
      {/* ------------------------------------------------------------------ */}
      {/* 1. TOP APP BAR (SLEEK, RESPONSIVE, APP-LIKE HEADER)                */}
      {/* ------------------------------------------------------------------ */}
      <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-6 py-2.5 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3 truncate">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all active:scale-95 shrink-0"
            title="Wapas Jayein / Back"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="h-5 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2 truncate">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-slate-100 tracking-tight truncate">
                  Topic & Performance Analysis
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {summary.grandTotalTests} Tests Given
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden xs:block truncate">
                5 Subjects Question Bank · Test Counts · Accuracy · Improvement & Flop Tracker
              </p>
            </div>
          </div>
        </div>

        {/* Right side actions in Top Header */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Top Dark / Light Mode Toggle Button (Entire Site Theme) */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-colors shadow-sm cursor-pointer"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode (Pure site ka theme badlega)`}
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Light</span>
                </>
              )}
            </button>
          )}

          {attempts.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Kya aap sach me saari test history clear karna chahte hain?')) {
                  onClearHistory();
                }
              }}
              title="Clear Test History"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 text-xs font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset History</span>
            </button>
          )}

          {/* Top Cross Icon to close */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* 2. FULL-HEIGHT RESPONSIVE SCROLLABLE BODY                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 max-w-6xl w-full mx-auto space-y-6 pb-12">
          {/* TOP GRAND TOTALS HERO CARD */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg space-y-4">
            {/* Row 1: Dual Grand Cards (Total Uploaded Questions in 5 Subjects vs Solved Questions) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-3 border-b border-slate-800/80">
              {/* Grand Total Uploaded Questions Across 5 Subjects */}
              <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-3.5 relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-400 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                      5 Subjects Total Uploaded Questions
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold shrink-0">
                      Live Bank
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
                      {bankStats.grandTotalUploadedQuestions}
                    </span>
                    <span className="text-xs text-slate-300 font-medium">Questions Available in 5 Subjects</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Total <strong>{bankStats.grandTotalUploadedTopics}</strong> Uploaded Tests / Sets</span>
                  <span className="text-emerald-400 font-medium text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    +Upload hone par automatic badhega
                  </span>
                </div>
              </div>

              {/* Grand Total Questions Solved by User */}
              <div className="bg-slate-900/90 border border-sky-500/30 rounded-xl p-3.5 relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-sky-400 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-sky-400" />
                      Grand Total Questions Solved
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${summary.overallAccuracy >= 70 ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-300 border border-slate-700'} shrink-0`}>
                      Accuracy: {summary.overallAccuracy}%
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
                      {summary.grandTotalQuestions}
                    </span>
                    <span className="text-xs text-slate-300 font-medium">Attempted Across {summary.grandTotalTests} Tests</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Practice Time: <strong className="text-slate-200 font-mono">{formatTimeSeconds(summary.grandTotalTimeSeconds)}</strong></span>
                  <span>Coverage: <strong className="text-emerald-400 font-mono">{bankStats.grandTotalUploadedQuestions > 0 ? Math.min(100, Math.round((summary.grandTotalQuestions / bankStats.grandTotalUploadedQuestions) * 100)) : 0}%</strong></span>
                </div>
              </div>
            </div>

            {/* Row 2: 5 Subjects Individual Question Breakdown (Uploaded Available vs Solved) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  5 Subjects Question Count (Uploaded Available vs Solved):
                </span>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                  Math · Reasoning · GK · English · Computer
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {ALL_SUBJECTS.map(subj => {
                  const sStats = summary.subjectStats[subj];
                  const bStat = bankStats.subjectStats[subj];
                  const colors = subjectColors[subj];
                  const coverage = bStat.uploadedQuestions > 0
                    ? Math.min(100, Math.round((sStats.totalQuestionsAttempted / bStat.uploadedQuestions) * 100))
                    : 0;

                  return (
                    <div
                      key={subj}
                      className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between space-y-2"
                    >
                      <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                        <span className={`text-xs font-bold ${colors.text}`}>{subj}</span>
                        <span className="text-[10px] font-mono text-slate-400">{bStat.uploadedTopics} tests</span>
                      </div>

                      {/* Uploaded Question Count in this subject */}
                      <div className="space-y-1">
                        <div className="flex items-baseline justify-between">
                          <span className="text-[10px] uppercase text-slate-400 font-medium">Uploaded:</span>
                          <span className="text-sm font-extrabold text-white font-mono">
                            {bStat.uploadedQuestions} <span className="text-[9px] font-normal text-slate-400">Qs</span>
                          </span>
                        </div>

                        {/* Solved Question Count in this subject */}
                        <div className="flex items-baseline justify-between">
                          <span className="text-[10px] uppercase text-slate-400 font-medium">Solved:</span>
                          <span className="text-xs font-bold text-emerald-400 font-mono">
                            {sStats.totalQuestionsAttempted} <span className="text-[9px] font-normal text-slate-400">Qs</span>
                          </span>
                        </div>

                        {/* Mini progress bar */}
                        <div className="w-full bg-slate-800 rounded-full h-1 mt-1 overflow-hidden">
                          <div
                            className="bg-emerald-400 h-full rounded-full transition-all"
                            style={{ width: `${coverage}%` }}
                          />
                        </div>
                      </div>

                      {/* Footer stats */}
                      <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>{sStats.testsCount} given</span>
                        <span>{sStats.accuracy}% acc</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* TOPIC-BY-TOPIC PRACTICE HISTORY & IMPROVEMENT TRACKER         */}
          {/* ------------------------------------------------------------- */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>Topic-wise Test Attempts & Improvement Analysis</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Konsa topic kitni baar diya, kitna time laga aur kitna number badha ya gira:
                </p>
              </div>

              {/* Subject Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
                {(['All', ...ALL_SUBJECTS] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setSelectedSubjectFilter(tab)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedSubjectFilter === tab
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Filter inside topics */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topic or test..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* TOPIC LIST */}
            {filteredTopics.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/40 border border-slate-800 rounded-xl space-y-2">
                <AlertCircle className="w-6 h-6 text-slate-500 mx-auto" />
                <p>
                  {attempts.length === 0
                    ? 'Abhi tak koi test submit nahi kiya hai. Tester me jaakar koi bhi test dein, yahan detailed analysis dikhai dega!'
                    : 'Is filter ke hisab se koi record nahi mila.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredTopics.map((group) => {
                  const isExpanded = expandedTopicKey === group.key;
                  const colors = subjectColors[group.subject] || subjectColors.Math;

                  return (
                    <div
                      key={group.key}
                      className="bg-slate-950/80 border border-slate-800/90 hover:border-slate-700/80 rounded-xl overflow-hidden transition-all shadow-sm"
                    >
                      {/* Topic Summary Card Row */}
                      <div
                        onClick={() => toggleTopicDetails(group.key)}
                        className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none hover:bg-slate-900/60"
                      >
                        <div className="space-y-1 truncate">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${colors.badge}`}>
                              {group.subject}
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                              {group.topicName}
                            </span>
                          </div>

                          {group.subtopicName && (
                            <div className="text-[11px] text-slate-400 truncate pl-0.5">
                              Subtopic: <span className="text-slate-300 font-medium">{group.subtopicName}</span>
                            </div>
                          )}

                          {/* Stat metrics pill */}
                          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                            {/* Attempt count */}
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                              Kitni baar diya: <strong className="text-emerald-400">{group.attemptCount} Baar</strong>
                            </span>

                            {/* Total Time */}
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>Total Time: {formatTimeSeconds(group.totalTimeSeconds)}</span>
                            </span>

                            {/* Latest Score */}
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                              Latest Score: <strong className="text-white">{group.latestAttempt.accuracy}%</strong>
                            </span>
                          </div>
                        </div>

                        {/* Right side: Improvement / Flop Status Badge */}
                        <div className="flex items-center gap-2 sm:self-center shrink-0">
                          {group.status === 'improved' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <TrendingUp className="w-3.5 h-3.5" />
                              <span>Sudhaar Hua (+{group.recentImprovement}%) 📈</span>
                            </span>
                          )}

                          {group.status === 'flop' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                              <TrendingDown className="w-3.5 h-3.5" />
                              <span>Score Gira ({group.recentImprovement}%) 📉</span>
                            </span>
                          )}

                          {group.status === 'consistent' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              <span>Barabar (Consistent ⚖️)</span>
                            </span>
                          )}

                          {group.status === 'baseline' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                              <span>Pahla Test (1st Attempt 🎯)</span>
                            </span>
                          )}

                          {/* Retake Button */}
                          {onRetakeTopic && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                                onRetakeTopic(group.topicName, group.subject, group.subtopicName);
                              }}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                            >
                              <RotateCcw className="w-3 h-3 text-emerald-400" />
                              <span>Test Dein</span>
                            </button>
                          )}

                          <button className="p-1 text-slate-500 hover:text-slate-300">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Expandable History Drawer */}
                      {isExpanded && (
                        <div className="px-4 py-3 bg-slate-900/90 border-t border-slate-800 text-xs space-y-2">
                          <div className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider flex items-center justify-between">
                            <span>Sabhi Attempts ki History:</span>
                            <span className="font-mono text-emerald-400">Total {group.attempts.length} Attempts</span>
                          </div>

                          <div className="divide-y divide-slate-800/80">
                            {group.attempts.map((att, aIdx) => {
                              const isFirst = aIdx === 0;
                              const isLatest = aIdx === group.attempts.length - 1;
                              const dateStr = new Date(att.timestamp).toLocaleString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              });

                              return (
                                <div key={att.id} className="py-2 flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 font-mono text-[10px] flex items-center justify-center font-bold text-slate-300">
                                      #{aIdx + 1}
                                    </span>
                                    <div>
                                      <span className="text-slate-200 font-medium">
                                        Attempt #{aIdx + 1}
                                      </span>
                                      {isFirst && <span className="ml-1.5 text-[10px] text-slate-400 font-mono">(Pahla)</span>}
                                      {isLatest && group.attempts.length > 1 && (
                                        <span className="ml-1.5 text-[10px] text-emerald-400 font-semibold font-mono">(Latest)</span>
                                      )}
                                      <span className="text-[10px] text-slate-500 ml-2">{dateStr}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 font-mono text-[11px]">
                                    <span className="text-slate-400 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {formatTimeSeconds(att.durationSeconds)}
                                    </span>
                                    <span className="text-slate-300 font-semibold">
                                      {att.score}/{att.totalQuestions} ({att.accuracy}%)
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
      </div>
    </div>
  );
};
