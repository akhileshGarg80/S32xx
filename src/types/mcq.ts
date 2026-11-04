export type MCQInputSourceType = 'word_doc' | 'copy_paste' | 'html' | 'txt';

export type MCQQuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'true_false'
  | 'assertion_reason'
  | 'statement'
  | 'match_following'
  | 'passage';

export interface UniversalMCQOption {
  label: string; // 'A', 'B', '1', 'i', etc.
  text: string;
  is_correct?: boolean;
}

export interface UniversalMCQQuestion {
  id: string;
  question_number: number | string;
  question_text: string;
  passage?: string;
  options: UniversalMCQOption[];
  original_option_labels: string[]; // e.g. ['A', 'B', 'C', 'D']
  correct_answer_label: string; // e.g. 'C' or 'B, D'
  correct_answer_text?: string;
  explanation?: string;
  question_type: MCQQuestionType;
  subject?: string;
  topic?: string;
  subtopic?: string;
  has_error?: boolean;
  error_message?: string;
  is_verified?: boolean;
}

export interface UniversalMCQParseResult {
  source_type: MCQInputSourceType;
  filename?: string;
  raw_source: string;
  questions: UniversalMCQQuestion[];
  total_questions: number;
  mapped_answers_count: number;
  unmapped_answers_count: number;
  warnings: string[];
}
