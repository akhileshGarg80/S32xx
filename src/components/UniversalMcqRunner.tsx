import React, { useState, useMemo } from 'react';
import { UniversalMCQQuestion } from '../types/mcq';
import {
  Check,
  RotateCcw,
  ArrowLeft,
  Award,
  ChevronDown,
  ChevronUp,
  Share2,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';

interface UniversalMcqRunnerProps {
  title: string;
  subject: string;
  topicName: string;
  subtopicName?: string;
  questions: UniversalMCQQuestion[];
  onBackToFolders: () => void;
  onShareTest?: () => void;
  onTestSubmitted?: () => void;
}

export const UniversalMcqRunner: React.FC<UniversalMcqRunnerProps> = ({
  title,
  subject,
  topicName,
  subtopicName,
  questions,
  onBackToFolders,
  onShareTest,
  onTestSubmitted
}) => {
  // User answers per question index: e.g. { 0: 'C', 1: 'B' }
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [filterReview, setFilterReview] = useState<'all' | 'correct' | 'wrong' | 'unattempted'>('all');
  const [expandedExplanations, setExpandedExplanations] = useState<Record<number, boolean>>({});

  // Handle option selection
  const handleSelectOption = (qIdx: number, label: string) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [qIdx]: label
    }));
  };

  const toggleExplanation = (qIdx: number) => {
    setExpandedExplanations(prev => ({
      ...prev,
      [qIdx]: !prev[qIdx]
    }));
  };

  // Helper to determine if question is correct
  const isQuestionCorrect = (q: UniversalMCQQuestion, userAns?: string): boolean => {
    if (!userAns) return false;
    if (q.correct_answer_label) {
      return q.correct_answer_label.trim().toUpperCase() === userAns.trim().toUpperCase();
    }
    if (q.correct_answer_text) {
      const chosenOpt = q.options.find(o => o.label.toUpperCase() === userAns.toUpperCase());
      return chosenOpt?.text.trim().toLowerCase() === q.correct_answer_text.trim().toLowerCase();
    }
    return false;
  };

  // Stats calculation
  const stats = useMemo(() => {
    let attempted = 0;
    let correct = 0;
    let wrong = 0;

    questions.forEach((q, idx) => {
      const userAns = selectedAnswers[idx];
      if (userAns !== undefined) {
        attempted++;
        if (isQuestionCorrect(q, userAns)) {
          correct++;
        } else {
          wrong++;
        }
      }
    });

    const unattempted = questions.length - attempted;
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    const score = correct;

    return { attempted, unattempted, correct, wrong, accuracy, score };
  }, [questions, selectedAnswers]);

  // Submit test: marks test submitted and notifies parent to clear green dot!
  const handleSubmitTest = () => {
    setIsSubmitted(true);
    if (onTestSubmitted) {
      onTestSubmitted();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setExpandedExplanations({});
    setFilterReview('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtered review list after test submission
  const filteredIndices = useMemo(() => {
    if (!isSubmitted) return questions.map((_, i) => i);
    return questions.map((q, idx) => {
      const userAns = selectedAnswers[idx];
      const hasAns = userAns !== undefined;
      const isCorrect = isQuestionCorrect(q, userAns);

      if (filterReview === 'all') return idx;
      if (filterReview === 'correct' && hasAns && isCorrect) return idx;
      if (filterReview === 'wrong' && hasAns && !isCorrect) return idx;
      if (filterReview === 'unattempted' && !hasAns) return idx;
      return null;
    }).filter((idx): idx is number => idx !== null);
  }, [questions, selectedAnswers, filterReview, isSubmitted]);

  if (!questions || questions.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-xl">
        Koi question load nahi ho saka.
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative pb-20 transition-all">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HEADER BAR                                             */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-2 truncate">
          <button
            onClick={onBackToFolders}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700 transition-colors shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Folders</span>
          </button>
          <div className="truncate text-xs">
            <span className="text-emerald-400 font-semibold">{title}</span>
            <span className="text-slate-500 ml-1.5 hidden sm:inline">
              ({subject} · {topicName}{subtopicName ? ` · ${subtopicName}` : ''})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onShareTest && (
            <button
              onClick={onShareTest}
              className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs transition-colors"
              title="Share Test Link"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleRestart}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs transition-colors"
            title="Restart Test"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Restart</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. RESULTS SCORE CARD (SHOWN ONLY AFTER SUBMIT)               */}
      {/* ------------------------------------------------------------- */}
      {isSubmitted && (
        <div className="p-4 sm:p-5 bg-gradient-to-b from-emerald-950/30 via-slate-950 to-slate-950 border-b border-slate-800 animate-in fade-in">
          <div className="max-w-2xl mx-auto text-center space-y-3.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Test Result & Score Summary</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-lg sm:text-xl font-bold text-slate-200">{questions.length}</div>
                <div className="text-[10px] text-slate-400">Total</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-lg sm:text-xl font-bold text-sky-400">{stats.attempted}</div>
                <div className="text-[10px] text-slate-400">Kiye</div>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30">
                <div className="text-lg sm:text-xl font-bold text-emerald-400">{stats.correct}</div>
                <div className="text-[10px] text-emerald-300 font-medium">Sahi</div>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/30">
                <div className="text-lg sm:text-xl font-bold text-rose-400">{stats.wrong}</div>
                <div className="text-[10px] text-rose-300 font-medium">Galat</div>
              </div>
              <div className="col-span-2 sm:col-span-1 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-lg sm:text-xl font-bold text-amber-400">{stats.accuracy}%</div>
                <div className="text-[10px] text-slate-400">Accuracy</div>
              </div>
            </div>

            {/* Filter review buttons */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-xs">
              <span className="text-slate-400 mr-1 text-[11px]">Filter:</span>
              <button
                onClick={() => setFilterReview('all')}
                className={`px-2 py-0.5 rounded text-[11px] ${
                  filterReview === 'all' ? 'bg-slate-700 text-white font-semibold' : 'bg-slate-900 text-slate-400'
                }`}
              >
                All ({questions.length})
              </button>
              <button
                onClick={() => setFilterReview('correct')}
                className={`px-2 py-0.5 rounded text-[11px] ${
                  filterReview === 'correct' ? 'bg-emerald-600/80 text-white font-semibold' : 'bg-slate-900 text-emerald-400'
                }`}
              >
                Sahi ({stats.correct})
              </button>
              <button
                onClick={() => setFilterReview('wrong')}
                className={`px-2 py-0.5 rounded text-[11px] ${
                  filterReview === 'wrong' ? 'bg-rose-600/80 text-white font-semibold' : 'bg-slate-900 text-rose-400'
                }`}
              >
                Galat ({stats.wrong})
              </button>
              <button
                onClick={() => setFilterReview('unattempted')}
                className={`px-2 py-0.5 rounded text-[11px] ${
                  filterReview === 'unattempted' ? 'bg-slate-700 text-white font-semibold' : 'bg-slate-900 text-slate-400'
                }`}
              >
                Nhi Kiye ({stats.unattempted})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. QUESTIONS LIST                                             */}
      {/* ------------------------------------------------------------- */}
      <div className="p-4 sm:p-6 space-y-4 max-w-3xl mx-auto w-full">
        {filteredIndices.map((qIdx) => {
          const q = questions[qIdx];
          const userAns = selectedAnswers[qIdx];
          const isAnswered = userAns !== undefined;
          const isCorrect = isQuestionCorrect(q, userAns);

          return (
            <div
              key={q.id || qIdx}
              className={`bg-slate-950/70 border rounded-xl p-3.5 sm:p-4.5 space-y-3 transition-colors ${
                isAnswered
                  ? isCorrect
                    ? 'border-emerald-500/30 bg-emerald-950/5'
                    : 'border-rose-500/30 bg-rose-950/5'
                  : 'border-slate-800'
              }`}
            >
              {/* Question Header: Number + Text */}
              <div className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded bg-slate-900 border border-slate-800 text-[11px] font-bold text-sky-400 shrink-0 mt-0.5">
                  {q.question_number || qIdx + 1}
                </span>
                <div className="text-xs sm:text-sm font-medium text-slate-100 whitespace-pre-line leading-relaxed flex-1">
                  {q.question_text}
                </div>
              </div>

              {/* Options List with Soft / Feeka Colors */}
              <div className="space-y-1.5 pt-0.5">
                {q.options.map((opt, oIdx) => {
                  const isChosen = userAns === opt.label;
                  const isCorrectOpt =
                    (q.correct_answer_label && q.correct_answer_label.toUpperCase() === opt.label.toUpperCase()) ||
                    (q.correct_answer_text && opt.text.trim().toLowerCase() === q.correct_answer_text.trim().toLowerCase());

                  // Feeka (Soft / Pastel) colors for Green & Red
                  let optContainerClass = 'bg-slate-900/60 hover:bg-slate-850/80 border-slate-800/80 text-slate-300';
                  let optBadgeClass = 'bg-slate-800/80 text-slate-400 border border-slate-700/60';

                  if (isAnswered) {
                    if (isCorrectOpt) {
                      // Feeka Green for correct option
                      optContainerClass = 'bg-emerald-500/12 border-emerald-500/40 text-emerald-200 font-medium';
                      optBadgeClass = 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40';
                    } else if (isChosen && !isCorrect) {
                      // Feeka Red for wrong choice
                      optContainerClass = 'bg-rose-500/12 border-rose-500/40 text-rose-200 font-medium';
                      optBadgeClass = 'bg-rose-500/25 text-rose-300 border border-rose-500/40';
                    }
                  }

                  return (
                    <div
                      key={opt.label + oIdx}
                      onClick={() => handleSelectOption(qIdx, opt.label)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-xs sm:text-sm cursor-pointer transition-all ${optContainerClass}`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[11px] shrink-0 ${optBadgeClass}`}>
                          {opt.label}
                        </span>
                        <span className="truncate">{opt.text}</span>
                      </div>

                      {/* Quiet icon indicators on the right without disturbing text */}
                      {isAnswered && (
                        <div className="shrink-0 pl-2">
                          {isCorrectOpt && (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                          {isChosen && !isCorrect && (
                            <span className="text-[11px] text-rose-400 font-mono">✗</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Explanations shown ONLY after submission (not during test giving!) */}
              {isSubmitted && (q.explanation || q.correct_answer_text) && (
                <div className="pt-1.5">
                  <button
                    onClick={() => toggleExplanation(qIdx)}
                    className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 text-[11px] font-medium transition-colors"
                  >
                    <HelpCircle className="w-3 h-3 text-emerald-400" />
                    <span>{expandedExplanations[qIdx] ? 'Hide Solution' : 'View Explanation'}</span>
                    {expandedExplanations[qIdx] ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>

                  {expandedExplanations[qIdx] && (
                    <div className="mt-1.5 p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300 space-y-1 animate-in fade-in">
                      <div className="font-semibold text-emerald-400 text-[11px]">
                        Correct Answer: Option {q.correct_answer_label || ''} {q.correct_answer_text ? `(${q.correct_answer_text})` : ''}
                      </div>
                      {q.explanation && (
                        <div className="text-slate-300 text-[11px] whitespace-pre-line leading-relaxed">
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. FIXED BOTTOM SUBMIT BAR (NO SCROLL NEEDED, CHHOTA & CLEAN) */}
      {/* ------------------------------------------------------------- */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 px-4 py-2 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-2.5 text-xs text-slate-300">
          <span className="font-mono text-[11px]">
            <strong className="text-emerald-400 font-bold">{stats.attempted}</strong> / {questions.length} Attempted
          </span>
          {stats.attempted > 0 && (
            <span className="hidden sm:inline text-slate-500 text-[11px]">
              ({questions.length - stats.attempted} remaining)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isSubmitted ? (
            <button
              onClick={handleSubmitTest}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Submit Test</span>
            </button>
          ) : (
            <button
              onClick={handleRestart}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reattempt Test</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
