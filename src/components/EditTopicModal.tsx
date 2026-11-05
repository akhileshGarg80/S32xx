import React, { useState, useEffect } from 'react';
import { TopicItem, SubjectType, ALL_SUBJECTS } from '../lib/supabase';
import { UniversalMCQQuestion } from '../types/mcq';
import { generateHtmlFromMCQ } from '../lib/htmlTestGenerator';
import {
  X,
  Check,
  Edit3,
  Trash2,
  Plus,
  Code2,
  FileText,
  AlertCircle,
  RefreshCw,
  Layers,
  HelpCircle
} from 'lucide-react';
import { SYLLABUS_DATA } from '../lib/syllabusData';

interface EditTopicModalProps {
  isOpen: boolean;
  topic: TopicItem | null;
  onClose: () => void;
  onSave: (updated: TopicItem) => Promise<boolean>;
}

export const EditTopicModal: React.FC<EditTopicModalProps> = ({
  isOpen,
  topic,
  onClose,
  onSave,
}) => {
  const [subject, setSubject] = useState<SubjectType>('Math');
  const [topicName, setTopicName] = useState('');
  const [subtopicName, setSubtopicName] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [contentType, setContentType] = useState<'raw_html' | 'parsed_mcq'>('raw_html');
  const [questions, setQuestions] = useState<UniversalMCQQuestion[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize modal state when topic changes
  useEffect(() => {
    if (topic) {
      setSubject(topic.subject);
      setTopicName(topic.topic_name);
      setSubtopicName(topic.subtopic_name || '');
      setLinkTitle(topic.link_title || '');
      setSubdomain(topic.subdomain);
      setDescription(topic.description || '');
      setCode(topic.code || '');
      setContentType(topic.content_type || (topic.parsed_questions && topic.parsed_questions.length > 0 ? 'parsed_mcq' : 'raw_html'));
      setQuestions(topic.parsed_questions ? JSON.parse(JSON.stringify(topic.parsed_questions)) : []);
      setErrorMessage(null);
    }
  }, [topic]);

  if (!isOpen || !topic) return null;

  const handleQuestionTextChange = (qIdx: number, newText: string) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[qIdx] = { ...copy[qIdx], question_text: newText };
      return copy;
    });
  };

  const handleOptionTextChange = (qIdx: number, optIdx: number, newText: string) => {
    setQuestions(prev => {
      const copy = [...prev];
      const optsCopy = [...copy[qIdx].options];
      optsCopy[optIdx] = { ...optsCopy[optIdx], text: newText };
      copy[qIdx] = { ...copy[qIdx], options: optsCopy };
      return copy;
    });
  };

  const handleSelectCorrectOption = (qIdx: number, optLabel: string) => {
    setQuestions(prev => {
      const copy = [...prev];
      const q = copy[qIdx];
      const opt = q.options.find(o => o.label.toUpperCase() === optLabel.toUpperCase());
      copy[qIdx] = {
        ...q,
        correct_answer_label: optLabel,
        correct_answer_text: opt ? opt.text : q.correct_answer_text
      };
      return copy;
    });
  };

  const handleExplanationChange = (qIdx: number, newExp: string) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[qIdx] = { ...copy[qIdx], explanation: newExp };
      return copy;
    });
  };

  const handleDeleteQuestion = (qIdx: number) => {
    if (questions.length <= 1) {
      alert('Kam se kam ek question hona chahiye.');
      return;
    }
    setQuestions(prev => prev.filter((_, idx) => idx !== qIdx));
  };

  const handleAddNewQuestion = () => {
    const newQ: UniversalMCQQuestion = {
      id: `edit-q-${Date.now()}`,
      question_number: questions.length + 1,
      question_text: `Question ${questions.length + 1}`,
      options: [
        { label: 'A', text: 'Option A' },
        { label: 'B', text: 'Option B' },
        { label: 'C', text: 'Option C' },
        { label: 'D', text: 'Option D' }
      ],
      original_option_labels: ['A', 'B', 'C', 'D'],
      correct_answer_label: 'A',
      correct_answer_text: 'Option A',
      explanation: 'Sahi answer explanation yahan likhein.',
      question_type: 'single_choice'
    };
    setQuestions(prev => [...prev, newQ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicName.trim()) {
      setErrorMessage('Topic name khali nahi ho sakta');
      return;
    }
    if (!subdomain.trim()) {
      setErrorMessage('Subdomain / Slug khali nahi ho sakta');
      return;
    }

    let finalCode = code;
    if (contentType === 'parsed_mcq') {
      if (questions.length === 0) {
        setErrorMessage('Kam se kam ek question hona chahiye.');
        return;
      }
      finalCode = generateHtmlFromMCQ(
        linkTitle || topicName,
        subject,
        topicName,
        subtopicName,
        questions
      );
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const cleanSlug = subdomain.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const updatedRecord: TopicItem = {
      ...topic,
      subject,
      topic_name: topicName.trim(),
      subtopic_name: subtopicName.trim(),
      link_title: linkTitle.trim(),
      subdomain: cleanSlug,
      description: description.trim() || linkTitle.trim(),
      code: finalCode,
      content_type: contentType,
      parsed_questions: contentType === 'parsed_mcq' ? questions : undefined,
    };

    try {
      const ok = await onSave(updatedRecord);
      if (ok) {
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Edit Topic / Test Link</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                  {topic.subdomain}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Subject, topic, link title aur questions/code ko modify karein
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Grid Settings: Subject, Topic, Subtopic, Link Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            {/* Subject */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                1. Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as SubjectType)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                {ALL_SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Link Title */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                2. Link / Test Title
              </label>
              <input
                type="text"
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                placeholder="e.g. Set 1: Basic Formulas"
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Topic Name */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                3. Topic Name
              </label>
              <input
                type="text"
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                placeholder="Topic name..."
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Subtopic Name */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                4. Subtopic Name
              </label>
              <input
                type="text"
                value={subtopicName}
                onChange={(e) => setSubtopicName(e.target.value)}
                placeholder="Subtopic name..."
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Subdomain */}
            <div className="sm:col-span-2">
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                5. Subdomain / URL Slug
              </label>
              <input
                type="text"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                placeholder="e.g. number-system-hcf-set-1"
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono text-[11px] focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Mode Tabs: Parsed MCQ vs Raw HTML Code */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                {contentType === 'parsed_mcq' ? (
                  <>
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>MCQ Questions Editor ({questions.length} Questions)</span>
                  </>
                ) : (
                  <>
                    <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Raw HTML/JS Code Sandbox</span>
                  </>
                )}
              </span>

              {contentType === 'parsed_mcq' && (
                <button
                  type="button"
                  onClick={handleAddNewQuestion}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-emerald-400 font-semibold text-[11px] border border-slate-700"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Add Question</span>
                </button>
              )}
            </div>

            {/* Questions Editor */}
            {contentType === 'parsed_mcq' ? (
              <div className="space-y-3">
                {questions.map((q, qIdx) => (
                  <div
                    key={q.id || qIdx}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-emerald-400 font-mono">
                        Q{qIdx + 1}.
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(qIdx)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Delete question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Question Text */}
                    <textarea
                      rows={2}
                      value={q.question_text}
                      onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                      placeholder="Question text..."
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                    />

                    {/* Options (A, B, C, D) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = q.correct_answer_label && q.correct_answer_label.toUpperCase() === opt.label.toUpperCase();

                        return (
                          <div
                            key={opt.label}
                            className={`flex items-center gap-2 p-1.5 rounded-lg border text-xs transition-colors ${
                              isCorrect
                                ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                                : 'bg-slate-900 border-slate-800 text-slate-300'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => handleSelectCorrectOption(qIdx, opt.label)}
                              className={`w-5 h-5 rounded font-bold text-[10px] flex items-center justify-center shrink-0 ${
                                isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                              }`}
                              title="Click to set as correct answer"
                            >
                              {opt.label}
                            </button>
                            <input
                              type="text"
                              value={opt.text}
                              onChange={(e) => handleOptionTextChange(qIdx, optIdx, e.target.value)}
                              placeholder={`Option ${opt.label}...`}
                              className="w-full bg-transparent border-none text-xs text-slate-200 focus:outline-none"
                            />
                            {isCorrect && <Check className="w-3.5 h-3.5 text-emerald-400 ml-auto shrink-0" />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div>
                      <input
                        type="text"
                        value={q.explanation || ''}
                        onChange={(e) => handleExplanationChange(qIdx, e.target.value)}
                        placeholder="Explanation (optional)..."
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-850 rounded text-[11px] text-slate-400 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Raw HTML Code Editor */
              <div>
                <textarea
                  rows={10}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste HTML/JS sandbox code here..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
