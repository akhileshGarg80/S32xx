import React, { useState, useMemo, useEffect } from 'react';
import { SubjectType, TopicItem, markTopicAsVisited } from '../lib/supabase';
import { SYLLABUS_DATA, SyllabusTopic, SyllabusSubtopic } from '../lib/syllabusData';
import { UniversalMCQQuestion } from '../types/mcq';
import { UniversalMcqRunner } from './UniversalMcqRunner';
import {
  Folder,
  FolderOpen,
  FileCode,
  RotateCcw,
  Maximize2,
  Minimize2,
  Share2,
  Search,
  ChevronRight,
  ChevronDown,
  ChevronsDown,
  ChevronsUp,
  Link as LinkIcon,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { AnalysisModal } from './AnalysisModal';
import {
  TestAttemptRecord,
  getStoredAttempts,
  saveTestAttempt,
  clearAllAttempts,
  computeAnalyticsSummary
} from '../lib/analytics';

interface TesterViewProps {
  topics: TopicItem[];
  selectedSubject: SubjectType;
  onSelectSubject: (subject: SubjectType) => void;
  initialTopicSubdomain?: string | null;
  visitedIds: Set<string>;
  onMarkVisited: (id: string) => void;
  onSwitchToUploader: () => void;
}

interface ActiveTestSession {
  title: string;
  topicName: string;
  subtopicName?: string;
  code: string;
  subdomain: string;
  id?: string;
  contentType?: 'raw_html' | 'parsed_mcq';
  parsedQuestions?: UniversalMCQQuestion[];
}

export const TesterView: React.FC<TesterViewProps> = ({
  topics,
  selectedSubject,
  onSelectSubject,
  initialTopicSubdomain,
  visitedIds,
  onMarkVisited,
  onSwitchToUploader,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  // By default, ALL topic and subtopic dropdowns start CLOSED (band)
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [expandedSubtopics, setExpandedSubtopics] = useState<Record<string, boolean>>({});
  const [activeTest, setActiveTest] = useState<ActiveTestSession | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [copiedShare, setCopiedShare] = useState(false);

  // Performance & Topic Analysis State
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [attempts, setAttempts] = useState<TestAttemptRecord[]>(() => getStoredAttempts());
  const [htmlStartTime, setHtmlStartTime] = useState<number>(() => Date.now());

  const analyticsSummary = useMemo(() => computeAnalyticsSummary(attempts), [attempts]);

  // When subject changes, reset active test and ensure all dropdowns start closed
  useEffect(() => {
    setActiveTest(null);
    setExpandedFolders({});
    setExpandedSubtopics({});
  }, [selectedSubject]);

  // Load initial topic from URL if present
  useEffect(() => {
    if (initialTopicSubdomain) {
      const match = topics.find(t => t.subdomain.toLowerCase() === initialTopicSubdomain.toLowerCase());
      if (match) {
        setActiveTest({
          title: match.link_title || match.topic_name,
          topicName: match.topic_name,
          subtopicName: match.subtopic_name,
          code: match.code,
          subdomain: match.subdomain,
          id: match.id,
          contentType: match.content_type,
          parsedQuestions: match.parsed_questions
        });
      }
    }
  }, [initialTopicSubdomain, topics]);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const toggleSubtopic = (subtopicKey: string) => {
    setExpandedSubtopics(prev => ({
      ...prev,
      [subtopicKey]: !prev[subtopicKey]
    }));
  };

  // Group user-uploaded topics under matching syllabus topic & subtopic
  const subjectSyllabus = useMemo(() => {
    return SYLLABUS_DATA[selectedSubject] || [];
  }, [selectedSubject]);

  // User uploaded topics for this subject
  const userUploads = useMemo(() => {
    return topics.filter(t => t.subject === selectedSubject);
  }, [topics, selectedSubject]);

  // Map of uploads keyed by topic_name and subtopic_name
  const uploadsMap = useMemo(() => {
    const map: Record<string, TopicItem[]> = {};
    userUploads.forEach(item => {
      const key = `${item.topic_name.trim().toLowerCase()}::${(item.subtopic_name || '').trim().toLowerCase()}`;
      if (!map[key]) map[key] = [];
      map[key].push(item);
    });
    return map;
  }, [userUploads]);

  // Check if a topic has any new uploads
  const topicHasNewUpload = (topicName: string): boolean => {
    return userUploads.some(u => u.topic_name.toLowerCase().includes(topicName.toLowerCase()) && u.is_new);
  };

  const startTest = (session: ActiveTestSession) => {
    setHtmlStartTime(Date.now());
    setActiveTest(session);
    // Green dot will be cleared ONLY when user submits the test!
  };

  const handleShareCurrentTest = () => {
    if (!activeTest) return;
    const currentUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${currentUrl}?mode=tester&subject=${encodeURIComponent(selectedSubject)}&topic=${encodeURIComponent(activeTest.subdomain)}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  // Filter topics and subtopics based on search
  const filteredSyllabus = useMemo(() => {
    if (!searchQuery.trim()) return subjectSyllabus;
    const query = searchQuery.toLowerCase().trim();

    return subjectSyllabus
      .map(topic => {
        const topicMatches = topic.name.toLowerCase().includes(query);
        const matchedSubtopics = topic.subtopics.filter(sub =>
          sub.name.toLowerCase().includes(query)
        );

        if (topicMatches) {
          return topic;
        } else if (matchedSubtopics.length > 0) {
          return {
            ...topic,
            subtopics: matchedSubtopics
          };
        }
        return null;
      })
      .filter((t): t is SyllabusTopic => t !== null);
  }, [subjectSyllabus, searchQuery]);

  return (
    <div className="pt-16 pb-12 px-3 sm:px-6 max-w-5xl mx-auto min-h-screen flex flex-col">
      {/* ------------------------------------------------------------------ */}
      {/* 1. ACTIVE TEST RUNNER (WHEN A TEST IS LAUNCHED)                    */}
      {/* ------------------------------------------------------------------ */}
      {activeTest ? (
        activeTest.contentType === 'parsed_mcq' && activeTest.parsedQuestions && activeTest.parsedQuestions.length > 0 ? (
          <UniversalMcqRunner
            title={activeTest.title}
            subject={selectedSubject}
            topicName={activeTest.topicName}
            subtopicName={activeTest.subtopicName}
            questions={activeTest.parsedQuestions}
            onBackToFolders={() => setActiveTest(null)}
            onShareTest={handleShareCurrentTest}
            onTestSubmitted={(stats) => {
              if (activeTest.id) {
                onMarkVisited(activeTest.id);
              }
              const newRecord = saveTestAttempt({
                testId: activeTest.id || activeTest.subdomain,
                topicName: activeTest.topicName,
                subtopicName: activeTest.subtopicName,
                subject: selectedSubject,
                title: activeTest.title,
                totalQuestions: stats.totalQuestions,
                attempted: stats.attempted,
                correct: stats.correct,
                wrong: stats.wrong,
                unattempted: stats.unattempted,
                accuracy: stats.accuracy,
                durationSeconds: stats.durationSeconds,
                score: stats.score,
              });
              setAttempts(prev => [newRecord, ...prev]);
            }}
          />
        ) : (
          <div className={`flex flex-col flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl transition-all ${isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : 'min-h-[700px]'}`}>
            {/* Top Bar inside runner */}
            <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center gap-2 truncate">
                <button
                  onClick={() => setActiveTest(null)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700 transition-colors shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Folders</span>
                </button>
                <div className="truncate text-xs">
                  <span className="text-emerald-400 font-semibold">{activeTest.title}</span>
                  {activeTest.subtopicName && (
                    <span className="text-slate-500 ml-1.5 hidden sm:inline">({activeTest.subtopicName})</span>
                  )}
                  <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                    HTML Sandbox
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    const elapsedSec = Math.max(10, Math.round((Date.now() - htmlStartTime) / 1000));
                    const newRecord = saveTestAttempt({
                      testId: activeTest.id || activeTest.subdomain,
                      topicName: activeTest.topicName,
                      subtopicName: activeTest.subtopicName,
                      subject: selectedSubject,
                      title: activeTest.title,
                      totalQuestions: 10,
                      attempted: 10,
                      correct: 10,
                      wrong: 0,
                      unattempted: 0,
                      accuracy: 100,
                      durationSeconds: elapsedSec,
                      score: 10,
                    });
                    if (activeTest.id) {
                      onMarkVisited(activeTest.id);
                    }
                    setAttempts(prev => [newRecord, ...prev]);
                    alert('Practice attempt recorded in Performance Analysis!');
                  }}
                  title="Mark this practice session completed and save in analysis"
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Complete Practice</span>
                </button>
                <button
                  onClick={() => setIframeKey(k => k + 1)}
                  title="Restart Test"
                  className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleShareCurrentTest}
                  title="Share link"
                  className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{copiedShare ? 'Copied' : 'Share'}</span>
                </button>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs"
                >
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Sandbox Iframe */}
            <div className="flex-1 w-full bg-slate-950 relative overflow-hidden">
              <iframe
                key={iframeKey}
                title={activeTest.title}
                srcDoc={activeTest.code}
                sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
                className="w-full h-full border-none bg-white min-h-[620px]"
              />
            </div>
          </div>
        )
      ) : (
        /* ------------------------------------------------------------------ */
        /* 2. DIRECTORY / FOLDER-TREE EXPLORER (MATH/REAS/GK/ENG/COMP)        */
        /* ------------------------------------------------------------------ */
        <div className="space-y-4">
          {/* Header & Quick Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
                  {selectedSubject} Syllabus & Practice Tests
                </h1>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400 font-mono">
                  {filteredSyllabus.length} Topics
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Topic aur subtopic dropdown kholein aur kisi bhi link ya practice test par click karein.
              </p>
            </div>

            {/* Quick Actions: Expand/Collapse All and Search */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const areAnyOpen = Object.values(expandedFolders).some(Boolean) || Object.values(expandedSubtopics).some(Boolean);
                  if (areAnyOpen) {
                    setExpandedFolders({});
                    setExpandedSubtopics({});
                  } else {
                    const allFolders: Record<string, boolean> = {};
                    const allSubs: Record<string, boolean> = {};
                    filteredSyllabus.forEach(t => {
                      allFolders[t.id] = true;
                      t.subtopics.forEach(s => {
                        allSubs[`${t.id}__${s.slug}`] = true;
                      });
                    });
                    setExpandedFolders(allFolders);
                    setExpandedSubtopics(allSubs);
                  }
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-colors shrink-0"
                title="Toggle all topics and subtopics"
              >
                {(Object.values(expandedFolders).some(Boolean) || Object.values(expandedSubtopics).some(Boolean)) ? (
                  <>
                    <ChevronsUp className="w-3.5 h-3.5 text-slate-400" />
                    <span>Collapse All</span>
                  </>
                ) : (
                  <>
                    <ChevronsDown className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Expand All</span>
                  </>
                )}
              </button>

              {/* Compact Search */}
              <div className="relative flex-1 sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search in ${selectedSubject}...`}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* FOLDER FILE TREE CONTAINER */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800/80 shadow-md">
            {filteredSyllabus.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Koi topic nahi mila. Search query badal kar dekhein.
              </div>
            ) : (
              filteredSyllabus.map((topic) => {
                const isExpanded = searchQuery.trim().length > 0 ? true : !!expandedFolders[topic.id];
                const hasNew = topicHasNewUpload(topic.name);

                return (
                  <div key={topic.id} className="transition-colors">
                    {/* TOPIC FOLDER ROW (DROPDOWN) */}
                    <div
                      onClick={() => toggleFolder(topic.id)}
                      className={`flex items-center justify-between px-3.5 py-2.5 cursor-pointer select-none transition-colors ${
                        isExpanded ? 'bg-slate-800/60 text-slate-100' : 'hover:bg-slate-850 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                        )}

                        {isExpanded ? (
                          <FolderOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Folder className="w-4 h-4 text-sky-400 shrink-0" />
                        )}

                        <span className="text-xs sm:text-sm font-semibold truncate text-slate-200">
                          {topic.name}
                        </span>

                        {/* GREEN DOT IF NEW TOPIC UPLOADED INSIDE */}
                        {hasNew && (
                          <span
                            title="Newly uploaded test inside"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 shrink-0"
                          >
                            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
                            <span>New</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
                        <span className="text-[11px] font-mono text-slate-500">
                          {topic.subtopics.length} subtopics
                        </span>
                        <span className="text-[10px] text-slate-500 hidden sm:inline">
                          {isExpanded ? '▲' : '▼'}
                        </span>
                      </div>
                    </div>

                    {/* SUBTOPICS NESTED ACCORDIONS */}
                    {isExpanded && (
                      <div className="pl-4 sm:pl-8 pr-3 py-2 bg-slate-950/70 border-t border-slate-800/60 divide-y divide-slate-800/40">
                        {topic.subtopics.map((sub, sIdx) => {
                          const subKey = `${topic.id}__${sub.slug}`;
                          const isSubExpanded = searchQuery.trim().length > 0 ? true : !!expandedSubtopics[subKey];

                          // Look for custom uploaded links specifically matching this topic + subtopic
                          const matchKeyExact = `${topic.name.trim().toLowerCase()}::${sub.name.trim().toLowerCase()}`;
                          const attachedUploads = uploadsMap[matchKeyExact] || [];

                          // Also check by slug match
                          const altUploads = userUploads.filter(
                            u => u.topic_name.toLowerCase().includes(topic.name.toLowerCase()) &&
                                 (u.subtopic_name?.toLowerCase().includes(sub.name.toLowerCase()) ||
                                  u.subdomain.toLowerCase().includes(sub.slug.toLowerCase()))
                          );

                          const allSubUploads = Array.from(new Set([...attachedUploads, ...altUploads]));
                          const subHasNew = allSubUploads.some(u => u.is_new);

                          return (
                            <div key={sub.slug + sIdx} className="py-1.5">
                              {/* SUBTOPIC DROPDOWN HEADER */}
                              <div
                                onClick={() => toggleSubtopic(subKey)}
                                className={`flex items-center justify-between p-2 sm:px-3 sm:py-2 rounded-lg cursor-pointer select-none transition-all group ${
                                  isSubExpanded
                                    ? 'bg-slate-900 border border-slate-700/80 text-slate-100 shadow-sm'
                                    : 'bg-slate-950/40 hover:bg-slate-900/70 border border-transparent hover:border-slate-800 text-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  {isSubExpanded ? (
                                    <ChevronDown className="w-3.5 h-3.5 text-emerald-400 shrink-0 transition-transform" />
                                  ) : (
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 shrink-0 transition-transform" />
                                  )}

                                  {isSubExpanded ? (
                                    <FolderOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  ) : (
                                    <FileCode className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 shrink-0" />
                                  )}

                                  <span className="font-semibold text-xs sm:text-[13px] text-slate-200 group-hover:text-white truncate">
                                    {sub.name}
                                  </span>

                                  {/* Multi-links count badge under this subtopic */}
                                  {allSubUploads.length > 0 && (
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                                      {allSubUploads.length} {allSubUploads.length === 1 ? 'Link' : 'Links'}
                                    </span>
                                  )}

                                  {/* Green dot for new uploads in this subtopic */}
                                  {subHasNew && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 shrink-0">
                                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                                      <span>New</span>
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0 text-[11px] text-slate-500 group-hover:text-slate-400">
                                  <span className="hidden sm:inline">{isSubExpanded ? 'Close' : 'Open'}</span>
                                  {isSubExpanded ? (
                                    <ChevronDown className="w-3 h-3 text-slate-400" />
                                  ) : (
                                    <ChevronRight className="w-3 h-3 text-slate-500" />
                                  )}
                                </div>
                              </div>

                              {/* SUBTOPIC INNER CONTENT (DROPDOWN BODY) */}
                              {isSubExpanded && (
                                <div className="mt-1.5 ml-3 sm:ml-4 pl-3 sm:pl-5 pr-2 py-2 border-l-2 border-emerald-500/40 bg-slate-950/60 rounded-r-lg space-y-2">
                                  {/* MULTIPLE UPLOADED LINKS DIRECTLY UNDER THIS SUBTOPIC */}
                                  {allSubUploads.length > 0 ? (
                                    <div className="space-y-1.5">
                                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-1 flex items-center justify-between">
                                        <span>Uploaded Test Links:</span>
                                        <span className="font-mono text-emerald-400">{allSubUploads.length} total</span>
                                      </div>
                                      {allSubUploads.map((up, lIdx) => {
                                        const displayTitle = up.link_title || `Link ${lIdx + 1}: ${up.description || 'Practice Set'}`;
                                        const qCount = up.parsed_questions && up.parsed_questions.length > 0 ? up.parsed_questions.length : null;

                                        return (
                                          <div
                                            key={up.id}
                                            className="p-2 sm:p-2.5 rounded-lg bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 transition-colors"
                                          >
                                            <div
                                              onClick={() => startTest({
                                                title: displayTitle,
                                                topicName: up.topic_name,
                                                subtopicName: up.subtopic_name,
                                                code: up.code,
                                                subdomain: up.subdomain,
                                                id: up.id,
                                                contentType: up.content_type || (up.parsed_questions && up.parsed_questions.length > 0 ? 'parsed_mcq' : 'raw_html'),
                                                parsedQuestions: up.parsed_questions
                                              })}
                                              className="flex items-center justify-between gap-2 cursor-pointer group"
                                            >
                                              <div className="flex items-center gap-2 truncate">
                                                {up.is_new ? (
                                                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse shrink-0" />
                                                ) : (
                                                  <LinkIcon className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0" />
                                                )}
                                                <div className="truncate">
                                                  <span className="text-xs text-slate-200 group-hover:text-white font-medium block truncate">
                                                    {displayTitle}
                                                  </span>
                                                  {up.description && (
                                                    <span className="text-[10px] text-slate-500 group-hover:text-slate-400 truncate block">
                                                      {up.description}
                                                    </span>
                                                  )}
                                                </div>
                                              </div>

                                              <div className="flex items-center gap-1.5 shrink-0">
                                                {qCount !== null && (
                                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 hidden sm:inline">
                                                    {qCount} MCQs
                                                  </span>
                                                )}
                                                <span className="text-emerald-400 font-semibold text-[11px] px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 group-hover:bg-emerald-500/20 flex items-center gap-1">
                                                  <span>Open Test</span>
                                                  <span>→</span>
                                                </span>
                                              </div>
                                            </div>

                                            {/* Nested subtopics within uploaded link if present */}
                                            {up.subtopics && up.subtopics.length > 0 && (
                                              <div className="mt-2 pt-2 border-t border-slate-800/80 space-y-1">
                                                <span className="text-[10px] uppercase font-bold text-slate-500">Nested Sub-sections:</span>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                                  {up.subtopics.map(subItem => (
                                                    <button
                                                      key={subItem.id}
                                                      type="button"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        startTest({
                                                          title: `${displayTitle} · ${subItem.title}`,
                                                          topicName: up.topic_name,
                                                          subtopicName: subItem.title,
                                                          code: subItem.code || up.code,
                                                          subdomain: `${up.subdomain}-${subItem.slug}`,
                                                          contentType: 'raw_html'
                                                        });
                                                      }}
                                                      className="text-left p-1.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white flex items-center justify-between"
                                                    >
                                                      <span className="truncate">{subItem.title}</span>
                                                      <span className="text-[10px] text-emerald-400 font-semibold ml-1">Run →</span>
                                                    </button>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400">
                                      <div className="flex items-center gap-2">
                                        <AlertCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                        <span>Koi test link uploaded nahi hai.</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => onSwitchToUploader()}
                                        className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors shrink-0"
                                      >
                                        + Upload Link
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* FLOATING BOTTOM-LEFT TINY ANALYSIS ICON BUTTON                */}
      {/* ------------------------------------------------------------- */}
      {!isFullscreen && (
        <div className="fixed bottom-4 left-4 z-40">
          <button
            type="button"
            onClick={() => setIsAnalysisOpen(true)}
            title={`Performance & Topic Analysis (${analyticsSummary.grandTotalQuestions} Qs Solved)`}
            aria-label="Performance & Topic Analysis"
            className="relative flex items-center justify-center w-9 h-9 rounded-full bg-slate-900/90 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 shadow-xl shadow-black/70 transition-all hover:scale-110 active:scale-95 group backdrop-blur-md"
          >
            <BarChart3 className="w-4 h-4 transition-transform group-hover:scale-110" />

            {/* Tiny Badge on top-right of the icon if tests have been done */}
            {analyticsSummary.grandTotalQuestions > 0 && (
              <span className="absolute -top-1 -right-1 px-1 min-w-[16px] h-4 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-bold font-mono flex items-center justify-center shadow-sm">
                {analyticsSummary.grandTotalQuestions > 99 ? '99+' : analyticsSummary.grandTotalQuestions}
              </span>
            )}

            {/* Tiny tooltip on hover */}
            <span className="absolute left-11 whitespace-nowrap px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-200 text-[10px] font-medium shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
              Analysis
            </span>
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ANALYSIS MODAL                                                */}
      {/* ------------------------------------------------------------- */}
      <AnalysisModal
        isOpen={isAnalysisOpen}
        onClose={() => setIsAnalysisOpen(false)}
        attempts={attempts}
        allTopics={topics}
        onClearHistory={() => {
          clearAllAttempts();
          setAttempts([]);
        }}
        onRetakeTopic={(topicName, subject) => {
          setIsAnalysisOpen(false);
          if (subject !== selectedSubject) {
            onSelectSubject(subject);
          }
          // Expand matching folder
          const matchTopic = (SYLLABUS_DATA[subject] || []).find(t => t.name.toLowerCase().includes(topicName.toLowerCase()));
          if (matchTopic) {
            setExpandedFolders(prev => ({ ...prev, [matchTopic.id]: true }));
          }
        }}
      />
    </div>
  );
};
