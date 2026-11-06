import React, { useState, useEffect, useRef } from 'react';
import { SubjectType, ALL_SUBJECTS, TopicItem, insertTopic, updateTopicById } from '../lib/supabase';
import { SYLLABUS_DATA } from '../lib/syllabusData';
import { UniversalMCQQuestion, UniversalMCQParseResult, MCQInputSourceType } from '../types/mcq';
import { parsePlainText, parseUniversalFile } from '../lib/universalParser';
import { generateHtmlFromMCQ, generateHtmlFromBook } from '../lib/htmlTestGenerator';
import { EditTopicModal } from './EditTopicModal';
import {
  Code2,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Eye,
  Trash2,
  Link as LinkIcon,
  PlusCircle,
  FileText,
  UploadCloud,
  FileUp,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
  FileCheck,
  Pencil,
  BookOpen
} from 'lucide-react';

interface UploaderViewProps {
  onTopicCreated: (topic: TopicItem) => void;
  onTopicUpdated?: (topic: TopicItem) => void;
  onOpenTesterWithTopic: (subject: SubjectType, subdomain: string) => void;
  allTopics: TopicItem[];
  onDeleteTopic: (id: string) => void;
  activeTab: 'form' | 'manage';
  onTabChange: (tab: 'form' | 'manage') => void;
}

export const UploaderView: React.FC<UploaderViewProps> = ({
  onTopicCreated,
  onTopicUpdated,
  onOpenTesterWithTopic,
  allTopics,
  onDeleteTopic,
  activeTab,
  onTabChange,
}) => {
  // Input Mode: 'mcq_parser' (default) vs 'book_notes' vs 'raw_code'
  const [inputMode, setInputMode] = useState<'mcq_parser' | 'book_notes' | 'raw_code'>('mcq_parser');

  // Book / Notes Content
  const [bookContent, setBookContent] = useState('');

  // Universal MCQ Parser Source: 'copy_paste' | 'file_upload'
  const [mcqSourceType, setMcqSourceType] = useState<'copy_paste' | 'file_upload'>('copy_paste');
  const [mcqRawText, setMcqRawText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [parseResult, setParseResult] = useState<UniversalMCQParseResult | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Edit Topic in Manage view
  const [editingTopic, setEditingTopic] = useState<TopicItem | null>(null);

  // Raw Code fallback
  const [code, setCode] = useState('');

  // Subject & Topic selectors with LocalStorage Memory
  const [subject, setSubject] = useState<SubjectType>(() => {
    const saved = localStorage.getItem('topictest_last_upload_subject');
    return (saved && ALL_SUBJECTS.includes(saved as SubjectType)) ? (saved as SubjectType) : 'Math';
  });

  const [selectedTopicName, setSelectedTopicName] = useState<string>(() => {
    const saved = localStorage.getItem('topictest_last_upload_topic');
    return saved || '';
  });
  const [customTopicName, setCustomTopicName] = useState<string>('');
  const [isCustomTopic, setIsCustomTopic] = useState<boolean>(false);

  // Subtopic selector with LocalStorage Memory
  const [selectedSubtopicName, setSelectedSubtopicName] = useState<string>(() => {
    const saved = localStorage.getItem('topictest_last_upload_subtopic');
    return saved || '';
  });
  const [customSubtopicName, setCustomSubtopicName] = useState<string>('');
  const [isCustomSubtopic, setIsCustomSubtopic] = useState<boolean>(false);

  // Link details
  const [linkTitle, setLinkTitle] = useState('');
  const [subdomain, setSubdomain] = useState('');

  // Status & Notifications
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successLink, setSuccessLink] = useState<{ url: string; topic: TopicItem } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Topics available for the selected subject
  const currentSyllabusTopics = SYLLABUS_DATA[subject] || [];

  // When subject changes, keep remembered topic if valid in this subject, otherwise pick first
  useEffect(() => {
    localStorage.setItem('topictest_last_upload_subject', subject);

    if (currentSyllabusTopics.length > 0) {
      const topicExists = currentSyllabusTopics.some(t => t.name === selectedTopicName);
      if (!topicExists && !isCustomTopic) {
        const firstTopic = currentSyllabusTopics[0];
        setSelectedTopicName(firstTopic.name);
        setIsCustomTopic(false);
        setCustomTopicName('');

        const firstSubs = firstTopic.subtopics;
        if (firstSubs.length > 0) {
          setSelectedSubtopicName(firstSubs[0].name);
          setIsCustomSubtopic(false);
          setCustomSubtopicName('');
        }
      }
    }
  }, [subject]);

  // When topic changes, update available subtopics and save memory
  const currentTopicObj = currentSyllabusTopics.find(t => t.name === selectedTopicName);
  const availableSubtopics = currentTopicObj ? currentTopicObj.subtopics : [];

  useEffect(() => {
    if (selectedTopicName) {
      localStorage.setItem('topictest_last_upload_topic', selectedTopicName);
    }

    if (availableSubtopics.length > 0) {
      const subExists = availableSubtopics.some(s => s.name === selectedSubtopicName);
      if (!subExists && !isCustomSubtopic) {
        setSelectedSubtopicName(availableSubtopics[0].name);
        setIsCustomSubtopic(false);
        setCustomSubtopicName('');
      }
    } else if (!isCustomSubtopic) {
      setSelectedSubtopicName('');
    }
  }, [selectedTopicName]);

  // Save subtopic to memory when selected
  useEffect(() => {
    if (selectedSubtopicName) {
      localStorage.setItem('topictest_last_upload_subtopic', selectedSubtopicName);
    }
  }, [selectedSubtopicName]);

  // Existing links count under the currently selected subtopic
  const finalTopic = isCustomTopic ? customTopicName : selectedTopicName;
  const finalSubtopic = isCustomSubtopic ? customSubtopicName : selectedSubtopicName;

  const existingLinksForSubtopic = allTopics.filter(
    t => t.subject === subject &&
         t.topic_name.toLowerCase().includes(finalTopic.toLowerCase()) &&
         (t.subtopic_name || '').toLowerCase().includes(finalSubtopic.toLowerCase())
  );

  // Auto-generate clean link title & slug if untouched
  useEffect(() => {
    const isEssence = finalSubtopic === '🦋⃝ 𝐄𝐒𝐒𝐄𝐍𝐂𝐄 ✨' || finalSubtopic.includes('𝐄𝐒𝐒𝐄𝐍𝐂𝐄') || finalSubtopic.includes('ESSENCE');
    const nextNum = existingLinksForSubtopic.length + 1;

    if (isEssence) {
      // User requirement: "jab hmm deta uplode kare tab uska title default mai ye rahe 🪄 Insights🪷 samjh gaye aap ye sab mai lagu nhi hoga only 🦋⃝ 𝐄𝐒𝐒𝐄𝐍𝐂𝐄 ✨ isme ye 🪄 Insights🪷 ok"
      if (!linkTitle || linkTitle.startsWith('Link ') || linkTitle === '🪄 Insights🪷' || linkTitle.startsWith('🪄 Insights🪷')) {
        setLinkTitle(nextNum > 1 ? `🪄 Insights🪷 ${nextNum}` : '🪄 Insights🪷');
      }
      setSubdomain(`essence-insights-${nextNum}-${Date.now().toString().slice(-4)}`);
    } else {
      if (!linkTitle || linkTitle === '🪄 Insights🪷' || linkTitle.startsWith('🪄 Insights🪷') || linkTitle.startsWith('Link ')) {
        setLinkTitle(`Link ${nextNum}: Practice Set`);
      }

      const cleanSub = finalSubtopic
        .toLowerCase()
        .split('(')[0]
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 20);

      setSubdomain(`${cleanSub || 'test'}-link-${nextNum}-${Date.now().toString().slice(-4)}`);
    }
  }, [selectedTopicName, customTopicName, selectedSubtopicName, customSubtopicName]);

  // Auto-parse copy-pasted text when changed
  useEffect(() => {
    if (inputMode === 'mcq_parser' && mcqSourceType === 'copy_paste' && mcqRawText.trim().length > 15) {
      const timer = setTimeout(() => {
        try {
          const res = parsePlainText(mcqRawText, 'copy_paste', subject, finalTopic, finalSubtopic);
          setParseResult(res);
          setErrorMessage(null);
        } catch (e: any) {
          console.warn('Live parsing issue:', e);
        }
      }, 350);
      return () => clearTimeout(timer);
    } else if (!mcqRawText.trim() && mcqSourceType === 'copy_paste') {
      setParseResult(null);
    }
  }, [mcqRawText, inputMode, mcqSourceType, subject, finalTopic, finalSubtopic]);

  // File Upload Handler (Word .doc, .docx, .txt, .html, .htm ONLY)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    const isSupported =
      lowerName.endsWith('.docx') ||
      lowerName.endsWith('.doc') ||
      lowerName.endsWith('.txt') ||
      lowerName.endsWith('.html') ||
      lowerName.endsWith('.htm');

    if (!isSupported) {
      setErrorMessage(`Format "${file.name}" supported nahi hai. Kripya Word (.doc/.docx), HTML, ya TXT file hi upload karein.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploadedFile(file);
    setIsParsingFile(true);
    setErrorMessage(null);

    try {
      const res = await parseUniversalFile(file, subject, finalTopic, finalSubtopic);
      setParseResult(res);
      if (!linkTitle || linkTitle.startsWith('Link ')) {
        const cleanFileName = file.name.replace(/\.[^/.]+$/, '').slice(0, 30);
        setLinkTitle(cleanFileName);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'File parse karne me samasya aayi.');
      setParseResult(null);
    } finally {
      setIsParsingFile(false);
    }
  };

  // Allow user to manually change or select correct answer in preview
  const handleSelectCorrectOptionInPreview = (qIdx: number, optLabel: string) => {
    if (!parseResult) return;
    const updatedQuestions = [...parseResult.questions];
    const targetQ = { ...updatedQuestions[qIdx] };
    targetQ.correct_answer_label = optLabel;
    targetQ.options = targetQ.options.map(opt => ({
      ...opt,
      is_correct: opt.label.toUpperCase() === optLabel.toUpperCase()
    }));
    const matchedOpt = targetQ.options.find(o => o.label.toUpperCase() === optLabel.toUpperCase());
    targetQ.correct_answer_text = matchedOpt ? matchedOpt.text : '';
    targetQ.has_error = false;
    targetQ.error_message = undefined;
    targetQ.is_verified = true;

    updatedQuestions[qIdx] = targetQ;

    const unmapped = updatedQuestions.filter(q => q.has_error).length;
    setParseResult({
      ...parseResult,
      questions: updatedQuestions,
      mapped_answers_count: updatedQuestions.length - unmapped,
      unmapped_answers_count: unmapped
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const topicToSave = (isCustomTopic ? customTopicName : selectedTopicName).trim();
    const subtopicToSave = (isCustomSubtopic ? customSubtopicName : selectedSubtopicName).trim();
    const isEssence = subtopicToSave === '🦋⃝ 𝐄𝐒𝐒𝐄𝐍𝐂𝐄 ✨' || subtopicToSave.includes('𝐄𝐒𝐒𝐄𝐍𝐂𝐄') || subtopicToSave.includes('ESSENCE');
    const defaultTitle = isEssence ? '🪄 Insights🪷' : `Link ${existingLinksForSubtopic.length + 1}`;
    const titleToSave = (linkTitle || defaultTitle).trim();

    if (!topicToSave) {
      setErrorMessage('Kripya Topic chunein ya dalein');
      return;
    }

    if (!subtopicToSave) {
      setErrorMessage('Kripya Subtopic chunein ya dalein');
      return;
    }

    if (!subdomain.trim()) {
      setErrorMessage('Kripya Link Slug / Subdomain dalein');
      return;
    }

    let finalCode = '';
    let finalQuestions: UniversalMCQQuestion[] | undefined = undefined;
    let finalContentType: 'raw_html' | 'parsed_mcq' | 'book_notes' = 'raw_html';
    let finalRawSource = '';

    if (inputMode === 'mcq_parser') {
      if (!parseResult || parseResult.questions.length === 0) {
        setErrorMessage('Kripya Word document, TXT, HTML ya text paste karein taaki questions parse ho sakein.');
        return;
      }

      finalContentType = 'parsed_mcq';
      finalQuestions = parseResult.questions;
      finalRawSource = parseResult.raw_source;
      // Generate standalone complete HTML code for fallback/iframe/export
      finalCode = generateHtmlFromMCQ(
        titleToSave,
        subject,
        topicToSave,
        subtopicToSave,
        finalQuestions
      );
    } else if (inputMode === 'book_notes') {
      if (!bookContent.trim()) {
        setErrorMessage('Kripya Book ya Study Notes ka content box me dalein / paste karein.');
        return;
      }

      finalContentType = 'book_notes';
      finalRawSource = bookContent;
      // Generate readable standalone HTML export for fallback/iframe
      finalCode = generateHtmlFromBook(
        titleToSave,
        subject,
        topicToSave,
        subtopicToSave,
        bookContent
      );
    } else {
      // Raw HTML mode
      if (!code.trim()) {
        setErrorMessage('Kripya code box me HTML/JS code paste karein');
        return;
      }
      finalContentType = 'raw_html';
      finalCode = code;
    }

    setIsSubmitting(true);

    try {
      const cleanSubdomain = subdomain.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      const res = await insertTopic({
        subject,
        topic_name: topicToSave,
        subtopic_name: subtopicToSave,
        link_title: titleToSave,
        subdomain: cleanSubdomain,
        description: titleToSave,
        code: finalCode,
        content_type: finalContentType,
        parsed_questions: finalQuestions,
        raw_source: finalRawSource,
        subtopics: []
      });

      if (res.data) {
        onTopicCreated(res.data);
        const currentUrl = window.location.origin + window.location.pathname;
        const generatedShareUrl = `${currentUrl}?mode=tester&subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(cleanSubdomain)}`;

        // Remember subject, topic, subtopic in memory
        localStorage.setItem('topictest_last_upload_subject', subject);
        localStorage.setItem('topictest_last_upload_topic', topicToSave);
        localStorage.setItem('topictest_last_upload_subtopic', subtopicToSave);

        setSuccessLink({
          url: generatedShareUrl,
          topic: res.data
        });

        if (res.error) {
          setErrorMessage(`Supabase Error: ${res.error}. (Supabase SQL Editor me "GRANT ALL ON TABLE public.topics TO anon, authenticated, service_role;" run karein).`);
        } else {
          setErrorMessage(null);
        }
      } else if (res.error) {
        setErrorMessage(`Supabase Error: ${res.error}. (Fix: Supabase SQL Editor me "GRANT ALL ON TABLE public.topics TO anon, authenticated, service_role;" run karein).`);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Save nahi ho saka.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEditedTopic = async (updated: TopicItem): Promise<boolean> => {
    try {
      const res = await updateTopicById(updated.id, updated);
      if (res.data) {
        if (onTopicUpdated) {
          onTopicUpdated(res.data);
        }
        return true;
      }
      if (res.error) {
        setErrorMessage(`Update failed: ${res.error}`);
        return false;
      }
      return true;
    } catch (err: any) {
      setErrorMessage(`Update failed: ${err?.message || 'Unknown error'}`);
      return false;
    }
  };

  const handleCopyLink = () => {
    if (!successLink) return;
    navigator.clipboard.writeText(successLink.url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddAnotherLinkUnderSameSubtopic = () => {
    setCode('');
    setBookContent('');
    setMcqRawText('');
    setUploadedFile(null);
    setParseResult(null);
    setSuccessLink(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    const nextNum = existingLinksForSubtopic.length + 2;
    const isEssence = finalSubtopic === '🦋⃝ 𝐄𝐒𝐒𝐄𝐍𝐂𝐄 ✨' || finalSubtopic.includes('𝐄𝐒𝐒𝐄𝐍𝐂𝐄') || finalSubtopic.includes('ESSENCE');
    if (isEssence) {
      setLinkTitle(`🪄 Insights🪷 ${nextNum}`);
      setSubdomain(`essence-insights-${nextNum}-${Date.now().toString().slice(-4)}`);
    } else {
      setLinkTitle(`Link ${nextNum}: Practice Set`);
      const cleanSub = finalSubtopic
        .toLowerCase()
        .split('(')[0]
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 20);
      setSubdomain(`${cleanSub || 'test'}-link-${nextNum}-${Date.now().toString().slice(-4)}`);
    }
  };

  const resetForm = () => {
    setCode('');
    setBookContent('');
    setMcqRawText('');
    setUploadedFile(null);
    setParseResult(null);
    setSuccessLink(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    const isEssence = finalSubtopic === '🦋⃝ 𝐄𝐒𝐒𝐄𝐍𝐂𝐄 ✨' || finalSubtopic.includes('𝐄𝐒𝐒𝐄𝐍𝐂𝐄') || finalSubtopic.includes('ESSENCE');
    if (isEssence) {
      setLinkTitle('🪄 Insights🪷');
    } else {
      setLinkTitle(`Link ${existingLinksForSubtopic.length + 1}: Practice Set`);
    }
  };

  return (
    <div className="pt-16 pb-12 px-3 sm:px-6 max-w-4xl mx-auto flex flex-col justify-center">
      {/* Top Header Switch */}
      <div className="mb-3 flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Universal MCQ & Code Uploader
          </span>
        </div>

        <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-0.5 text-xs">
          <button
            onClick={() => onTabChange('form')}
            className={`px-2.5 py-0.5 rounded transition-colors ${
              activeTab === 'form' ? 'bg-slate-800 text-slate-100 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Upload
          </button>
          <button
            onClick={() => onTabChange('manage')}
            className={`px-2.5 py-0.5 rounded transition-colors ${
              activeTab === 'manage' ? 'bg-slate-800 text-slate-100 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Uploads ({allTopics.length})
          </button>
        </div>
      </div>

      {/* Mode Switcher: Universal MCQ Parser vs Book / Notes Upload vs Raw HTML Code */}
      {activeTab === 'form' && (
        <div className="mb-3 flex flex-wrap items-center justify-between bg-slate-900/80 border border-slate-800 rounded-lg p-1.5 text-xs gap-1.5">
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => setInputMode('mcq_parser')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                inputMode === 'mcq_parser'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Universal MCQ Parser (Word/TXT/HTML/Text)</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('book_notes')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                inputMode === 'book_notes'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>📖 Book / Study Notes Upload</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('raw_code')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                inputMode === 'raw_code'
                  ? 'bg-slate-800 text-slate-100 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Raw HTML/JS Code</span>
            </button>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline font-mono">
            {inputMode === 'mcq_parser'
              ? 'Auto detects questions & answer key'
              : inputMode === 'book_notes'
              ? 'Hindi/English chapter & paragraph reader'
              : 'Direct iframe code sandbox'}
          </span>
        </div>
      )}

      {/* Success Link Banner */}
      {successLink && (
        <div className="mb-3.5 p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs animate-in fade-in">
          <div className="truncate max-w-md">
            <span className="text-emerald-400 font-semibold mr-1.5">✓ Uploaded under {successLink.topic.subtopic_name}!</span>
            <span className="text-slate-300 font-mono truncate">{successLink.url}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleCopyLink}
              className="px-2.5 py-1 rounded bg-emerald-500 text-slate-950 font-semibold text-xs hover:bg-emerald-400"
            >
              {copiedLink ? 'Copied' : 'Copy Link'}
            </button>
            <button
              onClick={() => onOpenTesterWithTopic(successLink.topic.subject, successLink.topic.subdomain)}
              className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 text-xs hover:bg-slate-700 border border-slate-700 font-medium"
            >
              Test Now →
            </button>
            <button
              onClick={handleAddAnotherLinkUnderSameSubtopic}
              className="px-2.5 py-1 rounded bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-500/40 text-xs font-medium"
            >
              + Add Next Link Here
            </button>
            <button
              onClick={resetForm}
              className="px-2 py-1 text-slate-400 hover:text-slate-200 text-xs"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="mb-3 p-2.5 bg-rose-950/40 border border-rose-500/40 rounded-lg text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* TAB 1: ALL UPLOADS MANAGE */}
      {activeTab === 'manage' ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-semibold text-slate-200">Uploaded Topics & Links</span>
            <span className="text-slate-400 font-mono">{allTopics.length} total</span>
          </div>
          {allTopics.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">Koi link upload nahi hua hai.</div>
          ) : (
            <div className="divide-y divide-slate-800 text-xs">
              {allTopics.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="truncate">
                    <span className="text-emerald-400 font-mono mr-1.5">[{item.subject}]</span>
                    <span className="text-slate-300">{item.topic_name} →</span>
                    <span className="text-slate-200 font-medium ml-1">{item.subtopic_name || item.topic_name}</span>
                    {item.link_title && (
                      <span className="text-emerald-300 font-medium ml-1.5 font-mono">({item.link_title})</span>
                    )}
                    <span className="ml-1.5 px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                      {item.content_type === 'book_notes'
                        ? '📖 Book / Notes'
                        : item.content_type === 'parsed_mcq'
                        ? 'Universal MCQ'
                        : 'HTML Code'}
                    </span>
                    <span className="text-slate-500 font-mono ml-2">/{item.subdomain}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onOpenTesterWithTopic(item.subject, item.subdomain)}
                      className="px-2 py-0.5 bg-slate-800 text-slate-200 rounded hover:bg-slate-700 border border-slate-700"
                    >
                      {item.content_type === 'book_notes' ? 'Padhein 📖' : 'Test'}
                    </button>
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}${window.location.pathname}?mode=tester&subject=${encodeURIComponent(item.subject)}&topic=${encodeURIComponent(item.subdomain)}`;
                        navigator.clipboard.writeText(url);
                        setCopiedItemId(item.id);
                        setTimeout(() => setCopiedItemId(null), 2000);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                      title={copiedItemId === item.id ? 'Copied!' : 'Copy'}
                    >
                      {copiedItemId === item.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                    <button
                      onClick={() => setEditingTopic(item)}
                      className="p-1 text-sky-400 hover:text-sky-300 transition-colors"
                      title="Edit topic/questions"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDeleteTopic(item.id)}
                      className="p-1 text-rose-400 hover:text-rose-300"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* TAB 2: COMPACT UPLOAD FORM (HALF CODE/PARSER, HALF TOPIC SETTINGS) */
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-start">
          {/* LEFT CHHOTA CARD: UNIVERSAL MCQ PARSER OR RAW CODE */}
          {inputMode === 'mcq_parser' ? (
            <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-lg overflow-hidden h-72 shadow-sm">
              {/* Header inside left card */}
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950 border-b border-slate-800 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <FileText className="w-3 h-3 text-emerald-400" />
                    Input Source
                  </span>
                  <div className="flex items-center bg-slate-900 rounded p-0.5 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setMcqSourceType('copy_paste')}
                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                        mcqSourceType === 'copy_paste' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400'
                      }`}
                    >
                      Text Paste
                    </button>
                    <button
                      type="button"
                      onClick={() => setMcqSourceType('file_upload')}
                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                        mcqSourceType === 'file_upload' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400'
                      }`}
                    >
                      Word / TXT / HTML File
                    </button>
                  </div>
                </div>

                {parseResult && (
                  <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    {parseResult.total_questions} Qs Detected
                  </span>
                )}
              </div>

              {/* Body inside left card */}
              <div className="flex-1 bg-slate-950 p-2.5 overflow-y-auto space-y-2">
                {mcqSourceType === 'file_upload' ? (
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-lg p-4 text-center cursor-pointer transition-colors h-full">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".docx,.doc,.txt,.html,.htm"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="universal-file-input"
                    />
                    <label htmlFor="universal-file-input" className="cursor-pointer space-y-2">
                      <div className="w-9 h-9 mx-auto rounded-full bg-slate-900 flex items-center justify-center text-emerald-400 border border-slate-800">
                        {isParsingFile ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
                      </div>
                      <div className="text-xs text-slate-300 font-medium">
                        {uploadedFile ? uploadedFile.name : 'Word (.doc, .docx), TXT ya HTML File Chunein'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Only .docx, .doc, .txt, .html files accepted
                      </div>
                    </label>
                  </div>
                ) : (
                  <textarea
                    value={mcqRawText}
                    onChange={(e) => setMcqRawText(e.target.value)}
                    placeholder={`Yahan questions paste karein. Example:

Q1. Bharat ki rajdhani kya hai?
A. Mumbai
B. Bhopal
C. Delhi
D. Jaipur

Answer Key:
1-C`}
                    spellCheck={false}
                    className="w-full h-full p-2 bg-transparent text-slate-200 font-mono text-[11px] leading-relaxed resize-none focus:outline-none"
                  />
                )}
              </div>

              {/* Footer inside left card with Parse Status & Preview trigger */}
              {parseResult && (
                <div className="px-3 py-1.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-medium">
                      ✓ {parseResult.mapped_answers_count}/{parseResult.total_questions} Answers Mapped
                    </span>
                    {parseResult.unmapped_answers_count > 0 && (
                      <span className="text-amber-400 text-[10px] flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {parseResult.unmapped_answers_count} missing
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(true)}
                    className="text-sky-400 hover:text-sky-300 text-[11px] font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Questions Preview & Verify</span>
                  </button>
                </div>
              )}
            </div>
          ) : inputMode === 'book_notes' ? (
            /* BOOK / STUDY NOTES TEXTAREA */
            <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-lg overflow-hidden h-72 shadow-sm">
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950 border-b border-slate-800 text-[11px]">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <BookOpen className="w-3 h-3 text-emerald-400" />
                  <span>Book / Chapter Notes (Hindi / English)</span>
                </span>
                <span className="text-emerald-400 font-mono text-[10px]">
                  {bookContent.trim() ? `${bookContent.trim().split(/\s+/).filter(Boolean).length} words` : 'Empty'}
                </span>
              </div>
              <div className="flex-1 bg-slate-950 overflow-hidden flex flex-col">
                <textarea
                  value={bookContent}
                  onChange={(e) => setBookContent(e.target.value)}
                  placeholder={`Yahan book ka chapter ya notes paste ya type karein (Hindi ya English).
Paragraphs, headings, bullet points - jo jaise hai sab waise hi tester me book reader jaisa dikhega.

Example:
# अध्याय 1: विषय का परिचय
यह पहला पैराग्राफ है। इसमें जो भी जानकारी आप लिखेंगे, वह बिल्कुल एक साफ सुथरी किताब के पन्नों जैसी दिखेगी।`}
                  spellCheck={false}
                  className="w-full h-full p-2.5 bg-transparent text-slate-200 text-xs leading-relaxed resize-none focus:outline-none overflow-y-auto placeholder:text-slate-600"
                />
              </div>
              <div className="px-3 py-1.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                <span>📖 Paragraphs tester me real book reader jaise khulenge</span>
                <span className="font-mono text-emerald-400">
                  ~{Math.max(1, Math.ceil((bookContent.trim().split(/\s+/).filter(Boolean).length) / 180))} min read
                </span>
              </div>
            </div>
          ) : (
            /* RAW CODE TEXTAREA */
            <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-lg overflow-hidden h-72 shadow-sm">
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950 border-b border-slate-800 text-[11px]">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Code2 className="w-3 h-3 text-emerald-400" />
                  Raw HTML / JS Code Paste
                </span>
                <span className="text-slate-500 font-mono text-[10px]">
                  {code ? `${code.length} chars` : 'Empty'}
                </span>
              </div>
              <div className="flex-1 bg-slate-950 overflow-hidden">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Yahan raw HTML/JS code paste karein..."
                  spellCheck={false}
                  className="w-full h-full p-2.5 bg-transparent text-slate-200 font-mono text-[11px] leading-relaxed resize-none focus:outline-none overflow-y-auto"
                />
              </div>
            </div>
          )}

          {/* RIGHT CHHOTA CARD: SUBJECT -> TOPIC -> SUBTOPIC -> LINK TITLE */}
          <div className="flex flex-col justify-between bg-slate-900 border border-slate-800 rounded-lg p-3 h-72 overflow-y-auto shadow-sm text-xs">
            <div className="space-y-2">
              {/* Row 1: Subject & Subdomain */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase text-slate-400 font-medium mb-0.5">
                    1. Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value as SubjectType)}
                    className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100 focus:outline-none"
                  >
                    {ALL_SUBJECTS.map((sub) => (
                      <option key={sub} value={sub} className="bg-slate-900">
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-slate-400 font-medium mb-0.5">
                    Link Slug / Subdomain
                  </label>
                  <input
                    type="text"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value)}
                    placeholder="hcf-drill-1"
                    className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs font-mono text-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Topic Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-[10px] uppercase text-slate-400 font-medium">
                    2. Topic ({currentSyllabusTopics.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomTopic(!isCustomTopic)}
                    className="text-[10px] text-emerald-400 hover:underline"
                  >
                    {isCustomTopic ? 'List se chunein' : '+ Naya Topic'}
                  </button>
                </div>
                {isCustomTopic ? (
                  <input
                    type="text"
                    value={customTopicName}
                    onChange={(e) => setCustomTopicName(e.target.value)}
                    placeholder="Topic name..."
                    className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100 focus:outline-none"
                  />
                ) : (
                  <select
                    value={selectedTopicName}
                    onChange={(e) => setSelectedTopicName(e.target.value)}
                    className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100 focus:outline-none truncate"
                  >
                    {currentSyllabusTopics.map((t) => (
                      <option key={t.id} value={t.name} className="bg-slate-900">
                        {t.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Row 3: Subtopic Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <label className="text-[10px] uppercase text-slate-400 font-medium">
                      3. Subtopic
                    </label>
                    {existingLinksForSubtopic.length > 0 && (
                      <span className="text-[10px] text-emerald-400 font-mono">
                        ({existingLinksForSubtopic.length} links added)
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCustomSubtopic(!isCustomSubtopic)}
                    className="text-[10px] text-emerald-400 hover:underline"
                  >
                    {isCustomSubtopic ? 'List se chunein' : '+ Naya Subtopic'}
                  </button>
                </div>
                {isCustomSubtopic ? (
                  <input
                    type="text"
                    value={customSubtopicName}
                    onChange={(e) => setCustomSubtopicName(e.target.value)}
                    placeholder="Subtopic name (e.g. HCF)..."
                    className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100 focus:outline-none"
                  />
                ) : (
                  <select
                    value={selectedSubtopicName}
                    onChange={(e) => setSelectedSubtopicName(e.target.value)}
                    className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100 focus:outline-none truncate"
                  >
                    {availableSubtopics.map((s, idx) => {
                      const isEssence = s.name === '🦋⃝ 𝐄𝐒𝐒𝐄𝐍𝐂𝐄 ✨' || s.name.includes('𝐄𝐒𝐒𝐄𝐍𝐂𝐄') || s.name.includes('ESSENCE');
                      return (
                        <option key={s.slug + idx} value={s.name} className={isEssence ? 'bg-amber-950/80 text-amber-300 font-bold' : 'bg-slate-900'}>
                          {s.name}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              {/* Row 4: Link / Test Title under this subtopic */}
              <div>
                <label className="block text-[10px] uppercase text-slate-400 font-medium mb-0.5">
                  4. Link / Test Name
                </label>
                <input
                  type="text"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder={
                    finalSubtopic === '🦋⃝ 𝐄𝐒𝐒𝐄𝐍𝐂𝐄 ✨' || finalSubtopic.includes('𝐄𝐒𝐒𝐄𝐍𝐂𝐄') || finalSubtopic.includes('ESSENCE')
                      ? '🪄 Insights🪷'
                      : 'e.g. Set 1: Basic Formulas'
                  }
                  className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 border-t border-slate-800">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-1.5 rounded bg-emerald-400 text-slate-950 text-xs font-semibold hover:bg-emerald-300 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Uploading & Parsing...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>
                      {inputMode === 'mcq_parser' && parseResult
                        ? `Save & Publish ${parseResult.total_questions} Questions`
                        : `Upload Link to ${finalSubtopic ? finalSubtopic.slice(0, 15) + '...' : 'Subtopic'}`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ------------------------------------------------------------- */}
      {/* QUESTIONS PREVIEW & VERIFICATION MODAL                        */}
      {/* ------------------------------------------------------------- */}
      {showPreviewModal && parseResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span>Parsed Questions Verification</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono">
                    {parseResult.total_questions} Questions
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Aap yahan correct option pick ya verify kar sakte hain. Sahi answer par click karein.
                </p>
              </div>

              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Done
              </button>
            </div>

            {/* Modal Body: Question List */}
            <div className="p-4 overflow-y-auto space-y-3.5 divide-y divide-slate-800/60">
              {parseResult.questions.map((q, qIdx) => (
                <div key={q.id || qIdx} className="pt-3 first:pt-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-emerald-400 shrink-0">
                      Q{q.question_number || qIdx + 1}.
                    </span>
                    <span className="text-xs text-slate-200 font-medium flex-1">
                      {q.question_text}
                    </span>
                    {q.has_error && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium shrink-0">
                        Answer Missing
                      </span>
                    )}
                  </div>

                  {/* Options with Click-to-set correct answer */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-4">
                    {q.options.map((opt) => {
                      const isCorrect = q.correct_answer_label && q.correct_answer_label.toUpperCase() === opt.label.toUpperCase();

                      return (
                        <div
                          key={opt.label}
                          onClick={() => handleSelectCorrectOptionInPreview(qIdx, opt.label)}
                          className={`flex items-center gap-2 p-1.5 rounded border text-[11px] cursor-pointer transition-colors ${
                            isCorrect
                              ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded text-[10px] flex items-center justify-center font-bold shrink-0 ${
                            isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {opt.label}
                          </span>
                          <span className="truncate">{opt.text}</span>
                          {isCorrect && <Check className="w-3 h-3 text-emerald-400 ml-auto shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="text-[11px] text-slate-400 pl-4 italic">
                      <span className="text-slate-500">Explanation:</span> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Correct answer badalne ke liye kisi bhi option par click karein.
              </span>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
              >
                Accept & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Topic Modal */}
      <EditTopicModal
        isOpen={!!editingTopic}
        topic={editingTopic}
        onClose={() => setEditingTopic(null)}
        onSave={handleSaveEditedTopic}
      />
    </div>
  );
};
