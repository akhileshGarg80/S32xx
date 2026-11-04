import * as mammoth from 'mammoth';
import { UniversalMCQQuestion, UniversalMCQParseResult, MCQInputSourceType, MCQQuestionType } from '../types/mcq';

/**
 * Universal MCQ Data Parser
 * Parses Word (.docx, .doc), HTML files/code, TXT files, and Copy-Paste text
 * into structured Universal MCQ database format.
 */

// Normalizes text by removing non-standard spaces and line breaks
function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\u00a0/g, ' ')
    .trim();
}

/**
 * Extracts Answer Key section if present at the end of the text.
 * Examples:
 * "Answer Key: 1-C, 2-B, 3-D"
 * "Answers: \n 1. A \n 2. C"
 * "उत्तर तालिका: 1-ग, 2-ख"
 */
function extractAnswerKeyBlock(rawText: string): { bodyText: string; answerKeyMap: Map<string, string> } {
  const answerKeyMap = new Map<string, string>();
  const patterns = [
    /(?:answer\s*key|answers|answer\s*sheet|उत्तर\s*(?:कुंजी|तालिका|माला))\s*[:\-\n]([\s\S]*)$/i,
    /(?:उत्तर\s*[:\-\n])([\s\S]*)$/i,
  ];

  let bodyText = rawText;
  let matchFound = false;

  for (const regex of patterns) {
    const match = bodyText.match(regex);
    if (match && match.index !== undefined && match.index > 50) {
      const keySection = match[1];
      // Parse entries in answer key, e.g. "1-C", "1. (b)", "Q1: C", "1 C", "1) D"
      const pairRegex = /(?:Q\.?|que\.?|प्र\.?)?\s*(\d+)[\.\s:\-\)]+\s*(?:\(?([A-Za-z0-9\u0900-\u097F]+)\)?)/g;
      let pMatch;
      while ((pMatch = pairRegex.exec(keySection)) !== null) {
        const qNum = pMatch[1].trim();
        const ansVal = pMatch[2].trim();
        if (qNum && ansVal) {
          answerKeyMap.set(qNum, ansVal);
        }
      }

      // If we parsed valid answers from the section, strip it from body
      if (answerKeyMap.size > 0) {
        bodyText = bodyText.slice(0, match.index).trim();
        matchFound = true;
        break;
      }
    }
  }

  // Also check if there's a compact sequence at the end like: "1-A, 2-C, 3-B, 4-D"
  if (!matchFound) {
    const tailLines = bodyText.split('\n');
    let tailStartIdx = -1;
    const tempMap = new Map<string, string>();

    for (let i = tailLines.length - 1; i >= Math.max(0, tailLines.length - 15); i--) {
      const line = tailLines[i].trim();
      const compactMatches = [...line.matchAll(/(?:Q\.?)?\s*(\d+)[\s:\.\-\)]+([A-Da-d1-4])/g)];
      if (compactMatches.length >= 2) {
        tailStartIdx = i;
        for (const m of compactMatches) {
          tempMap.set(m[1], m[2]);
        }
      }
    }

    if (tempMap.size >= 2 && tailStartIdx !== -1) {
      bodyText = tailLines.slice(0, tailStartIdx).join('\n').trim();
      for (const [k, v] of tempMap.entries()) {
        answerKeyMap.set(k, v);
      }
    }
  }

  return { bodyText, answerKeyMap };
}

/**
 * Normalizes answer label (e.g. Hindi 'क' -> 'A', 'ख' -> 'B', etc. or numbers '1' -> 'A' if matching)
 */
function normalizeAnswerLabel(rawLabel: string): string {
  const l = rawLabel.trim().toUpperCase();
  const hindiMap: Record<string, string> = {
    'क': 'A', 'ख': 'B', 'ग': 'C', 'घ': 'D', 'ङ': 'E',
    'अ': 'A', 'ब': 'B', 'स': 'C', 'द': 'D'
  };
  return hindiMap[rawLabel.trim()] || l;
}

/**
 * Detects Question Type
 */
function detectQuestionType(qText: string, optionsCount: number): MCQQuestionType {
  const lower = qText.toLowerCase();
  if (lower.includes('assertion') && lower.includes('reason')) return 'assertion_reason';
  if (lower.includes('statement i') || lower.includes('statement 1') || lower.includes('कथन 1')) return 'statement';
  if (lower.includes('match the following') || lower.includes('सुमेलित कीजिए')) return 'match_following';
  if (lower.includes('read the following passage') || lower.includes('गद्यांश')) return 'passage';
  if (optionsCount === 2) {
    const hasTrueFalse = lower.includes('true') || lower.includes('false') || lower.includes('सत्य') || lower.includes('असत्य');
    if (hasTrueFalse) return 'true_false';
  }
  return 'single_choice';
}

/**
 * Splits plain text into question chunks.
 * Handles:
 * "Q1.", "1.", "Question 1:", "प्रश्न 1:", "1)", "(1)"
 */
function splitIntoQuestionBlocks(text: string): Array<{ qNumStr: string; block: string }> {
  const lines = text.split('\n');
  const blocks: Array<{ qNumStr: string; block: string }> = [];

  // Regex to detect start of a question
  const qStartRegex = /^\s*(?:(?:Q(?:uestion|\.|\:)?|Que\.?|प्र\.?|प्रश्न)\s*)?(\d+)[\.\:\)\-\s]+(.*)$/i;

  let currentNum = '';
  let currentLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(qStartRegex);

    // To prevent false positives like option "1. First option" if we are already inside a question with letters,
    // we verify if this looks like a new question.
    const isLikelyQuestion = match && (
      currentLines.length === 0 ||
      line.toLowerCase().includes('?') ||
      line.includes('?') ||
      line.includes('क्या') ||
      line.includes('which') ||
      line.includes('who') ||
      line.includes('what') ||
      line.includes('when') ||
      line.includes('where') ||
      line.includes('how') ||
      line.toLowerCase().startsWith('q') ||
      line.toLowerCase().startsWith('que') ||
      line.toLowerCase().startsWith('प्र') ||
      parseInt(match[1], 10) === (parseInt(currentNum, 10) || 0) + 1 ||
      lines[i - 1]?.trim() === ''
    );

    if (isLikelyQuestion && match) {
      if (currentLines.length > 0) {
        blocks.push({
          qNumStr: currentNum || String(blocks.length + 1),
          block: currentLines.join('\n').trim()
        });
      }
      currentNum = match[1];
      currentLines = [line];
    } else {
      currentLines.push(line);
    }
  }

  if (currentLines.length > 0) {
    blocks.push({
      qNumStr: currentNum || String(blocks.length + 1),
      block: currentLines.join('\n').trim()
    });
  }

  return blocks;
}

/**
 * Parses individual question block into Question, Options, Answer, and Explanation.
 */
function parseQuestionBlock(
  block: string,
  index: number,
  answerKeyMap: Map<string, string>,
  subject?: string,
  topic?: string,
  subtopic?: string
): UniversalMCQQuestion {
  const lines = block.split('\n').map(l => l.trim()).filter(Boolean);

  let qText = '';
  const options: Array<{ label: string; text: string; is_correct?: boolean }> = [];
  let inlineAnswer = '';
  let explanation = '';
  let detectedQNum = String(index + 1);

  // Extract Question Number from line 1
  if (lines.length > 0) {
    const qNumMatch = lines[0].match(/^(?:(?:Q(?:uestion|\.|\:)?|Que\.?|प्र\.?|प्रश्न)\s*)?(\d+)[\.\:\)\-\s]+(.*)$/i);
    if (qNumMatch) {
      detectedQNum = qNumMatch[1];
      lines[0] = qNumMatch[2].trim();
    }
  }

  // Look for Explanation / व्याख्या in lines
  const cleanLines: string[] = [];
  for (const line of lines) {
    const expMatch = line.match(/^(?:explanation|व्याख्या|solution|हल|note|विवरण)\s*[:\-\.](.*)$/i);
    if (expMatch) {
      explanation = expMatch[1].trim();
    } else {
      cleanLines.push(line);
    }
  }

  // Look for Inline Answer (e.g. "Ans: C", "Correct: (B)", "उत्तर: C", "Answer: Delhi")
  const filteredLines: string[] = [];
  for (const line of cleanLines) {
    const ansMatch = line.match(/^(?:ans(?:wer)?|उत्तर|correct\s*(?:option|answer)?)\s*[:\-\.=\s]+(.*)$/i);
    if (ansMatch) {
      inlineAnswer = ansMatch[1].trim();
    } else {
      filteredLines.push(line);
    }
  }

  // Pattern for Option prefixes:
  // e.g. "A.", "(A)", "A)", "1.", "(1)", "1)", "a.", "(a)", "क.", "(क)"
  const optionRegex = /^\s*(?:\(([A-Ea-e1-5\u0900-\u097F])\)|([A-Ea-e1-5\u0900-\u097F])[\.\)\-])\s*(.*)$/;

  let collectingQuestion = true;
  const questionTextParts: string[] = [];

  for (const line of filteredLines) {
    // Check if line contains inline multiple options, e.g. "(A) 10  (B) 20  (C) 30  (D) 40"
    const inlineOptions = [...line.matchAll(/(?:\(([A-Ea-e1-5\u0900-\u097F])\)|([A-Ea-e1-5\u0900-\u097F])[\.\)\-])\s*([^(\n]+?)(?=(?:\([A-Ea-e1-5\u0900-\u097F]\)|[A-Ea-e1-5\u0900-\u097F][\.\)\-])|$)/g)];

    if (inlineOptions.length >= 2) {
      collectingQuestion = false;
      for (const opt of inlineOptions) {
        const label = (opt[1] || opt[2]).toUpperCase();
        let optText = opt[3].trim();
        let isCorrect = false;

        if (optText.includes('(Correct)') || optText.includes('[Ans]') || optText.endsWith('*')) {
          isCorrect = true;
          optText = optText.replace(/\(Correct\)|\*|\[Ans\]/gi, '').trim();
        }

        options.push({ label, text: optText, is_correct: isCorrect });
      }
      continue;
    }

    // Single line option match
    const optMatch = line.match(optionRegex);
    if (optMatch) {
      collectingQuestion = false;
      const label = (optMatch[1] || optMatch[2]).toUpperCase();
      let optText = optMatch[3].trim();
      let isCorrect = false;

      // Check for inline correctness marker, e.g. "Delhi (Correct)" or "*Delhi" or "Delhi ✓"
      if (
        optText.includes('(Correct)') ||
        optText.includes('[Ans]') ||
        optText.endsWith('*') ||
        optText.includes('✓') ||
        optText.includes('✔')
      ) {
        isCorrect = true;
        optText = optText.replace(/\(Correct\)|\*|\[Ans\]|✓|✔/gi, '').trim();
      }

      options.push({ label, text: optText, is_correct: isCorrect });
    } else {
      if (collectingQuestion) {
        questionTextParts.push(line);
      } else {
        // Line continuation of previous option or extra notes
        if (options.length > 0) {
          options[options.length - 1].text += ' ' + line;
        } else {
          questionTextParts.push(line);
        }
      }
    }
  }

  qText = questionTextParts.join('\n').trim();

  // If options were not found via line prefix, check if options are comma separated or True/False
  if (options.length === 0) {
    const tfMatch = qText.match(/(?:True\/False|सत्य\/असत्य|Yes\/No|हाँ\/नहीं)/i);
    if (tfMatch) {
      options.push({ label: 'A', text: 'True / सत्य' });
      options.push({ label: 'B', text: 'False / असत्य' });
    }
  }

  // Determine Correct Answer
  let finalAnsLabel = '';
  let finalAnsText = '';

  // 1. From options with is_correct marker
  const markedCorrect = options.find(o => o.is_correct);
  if (markedCorrect) {
    finalAnsLabel = markedCorrect.label;
    finalAnsText = markedCorrect.text;
  }

  // 2. From inline answer (e.g. "Ans: C" or "Ans: Delhi")
  if (!finalAnsLabel && inlineAnswer) {
    // Check if inline answer is just a letter / number, e.g. "C" or "(C)" or "3"
    const letterMatch = inlineAnswer.match(/^(?:\(?([A-Ea-e1-5\u0900-\u097F])\)?)$/);
    if (letterMatch) {
      finalAnsLabel = normalizeAnswerLabel(letterMatch[1]);
    } else {
      // Check if inlineAnswer matches any option label directly
      const cleanInline = inlineAnswer.replace(/[\(\)\.\:]/g, '').trim().toUpperCase();
      const matchOptByLabel = options.find(o => o.label.toUpperCase() === cleanInline);
      if (matchOptByLabel) {
        finalAnsLabel = matchOptByLabel.label;
        finalAnsText = matchOptByLabel.text;
      } else {
        // Maybe inline answer is the text of the answer, e.g. "दिल्ली"
        const matchedOpt = options.find(o => o.text.toLowerCase().includes(inlineAnswer.toLowerCase()) || inlineAnswer.toLowerCase().includes(o.text.toLowerCase()));
        if (matchedOpt) {
          finalAnsLabel = matchedOpt.label;
          finalAnsText = matchedOpt.text;
        } else {
          finalAnsText = inlineAnswer;
        }
      }
    }
  }

  // 3. From Answer Key Map at end of document
  if (!finalAnsLabel && answerKeyMap.has(detectedQNum)) {
    const rawVal = answerKeyMap.get(detectedQNum)!;
    finalAnsLabel = normalizeAnswerLabel(rawVal);
  }

  // Map label to option text if not yet resolved
  if (finalAnsLabel) {
    const matchingOption = options.find(o =>
      o.label.toUpperCase() === finalAnsLabel.toUpperCase() ||
      (finalAnsLabel === '1' && o.label === 'A') ||
      (finalAnsLabel === '2' && o.label === 'B') ||
      (finalAnsLabel === '3' && o.label === 'C') ||
      (finalAnsLabel === '4' && o.label === 'D')
    );
    if (matchingOption) {
      matchingOption.is_correct = true;
      finalAnsText = matchingOption.text;
    }
  }

  const hasError = !finalAnsLabel && !finalAnsText;
  const qType = detectQuestionType(qText, options.length);

  return {
    id: `q-${detectedQNum}-${Date.now().toString().slice(-4)}-${Math.random().toString(36).substring(2, 6)}`,
    question_number: detectedQNum,
    question_text: qText || `Question ${detectedQNum}`,
    options: options.map(o => ({
      label: o.label,
      text: o.text,
      is_correct: o.is_correct || o.label === finalAnsLabel
    })),
    original_option_labels: options.map(o => o.label),
    correct_answer_label: finalAnsLabel,
    correct_answer_text: finalAnsText,
    explanation: explanation || undefined,
    question_type: qType,
    subject,
    topic,
    subtopic,
    has_error: hasError,
    error_message: hasError ? 'Answer not detected. Please verify or pick correct answer.' : undefined,
    is_verified: !hasError
  };
}

/**
 * Parses HTML text (from HTML files or pasted HTML markup)
 */
function parseHtmlContent(
  html: string,
  subject?: string,
  topic?: string,
  subtopic?: string
): UniversalMCQParseResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // First, check if HTML contains an HTML Table with questions and answers
  const tables = doc.querySelectorAll('table');
  const tableQuestions: UniversalMCQQuestion[] = [];

  tables.forEach((table, tIdx) => {
    const rows = Array.from(table.querySelectorAll('tr'));
    if (rows.length < 2) return;

    // Check header row for column mapping
    const headerCells = Array.from(rows[0].querySelectorAll('th, td')).map(c => c.textContent?.trim().toLowerCase() || '');
    const qCol = headerCells.findIndex(h => h.includes('question') || h.includes('प्रश्न'));
    const ansCol = headerCells.findIndex(h => h.includes('answer') || h.includes('ans') || h.includes('उत्तर') || h.includes('correct'));

    if (qCol !== -1 && rows.length > 1) {
      for (let r = 1; r < rows.length; r++) {
        const cells = Array.from(rows[r].querySelectorAll('td'));
        if (cells.length > qCol) {
          const qCellText = cells[qCol]?.textContent?.trim() || '';
          if (!qCellText) continue;

          let ansText = '';
          if (ansCol !== -1 && cells.length > ansCol) {
            ansText = cells[ansCol]?.textContent?.trim() || '';
          }

          // Options may be in other columns or inside the question cell
          const options: Array<{ label: string; text: string }> = [];
          ['a', 'b', 'c', 'd'].forEach((lbl, oIdx) => {
            const col = headerCells.findIndex(h => h === lbl || h === `option ${lbl}` || h === `(${lbl})`);
            if (col !== -1 && cells.length > col) {
              options.push({ label: lbl.toUpperCase(), text: cells[col].textContent?.trim() || '' });
            }
          });

          tableQuestions.push({
            id: `tbl-q-${tIdx}-${r}`,
            question_number: r,
            question_text: qCellText,
            options: options.length > 0 ? options : [
              { label: 'A', text: 'Option A' },
              { label: 'B', text: 'Option B' },
              { label: 'C', text: 'Option C' },
              { label: 'D', text: 'Option D' }
            ],
            original_option_labels: options.map(o => o.label),
            correct_answer_label: ansText,
            correct_answer_text: ansText,
            question_type: 'single_choice',
            subject,
            topic,
            subtopic,
            has_error: !ansText,
            is_verified: !!ansText
          });
        }
      }
    }
  });

  if (tableQuestions.length > 0) {
    return {
      source_type: 'html',
      raw_source: html,
      questions: tableQuestions,
      total_questions: tableQuestions.length,
      mapped_answers_count: tableQuestions.filter(q => !q.has_error).length,
      unmapped_answers_count: tableQuestions.filter(q => q.has_error).length,
      warnings: []
    };
  }

  // If not in table format, extract clean text preserving linebreaks and parse as text
  const cleanBodyText = doc.body.innerText || doc.body.textContent || '';
  return parsePlainText(cleanBodyText, 'html', subject, topic, subtopic);
}

/**
 * Parses Plain Text / Copy-Paste Text / TXT file
 */
export function parsePlainText(
  rawText: string,
  sourceType: MCQInputSourceType = 'copy_paste',
  subject?: string,
  topic?: string,
  subtopic?: string
): UniversalMCQParseResult {
  const normalized = normalizeText(rawText);
  const { bodyText, answerKeyMap } = extractAnswerKeyBlock(normalized);
  const blocks = splitIntoQuestionBlocks(bodyText);

  const questions: UniversalMCQQuestion[] = [];
  const warnings: string[] = [];

  blocks.forEach((item, idx) => {
    const q = parseQuestionBlock(item.block, idx, answerKeyMap, subject, topic, subtopic);
    if (item.qNumStr && !isNaN(Number(item.qNumStr))) {
      q.question_number = Number(item.qNumStr);
    }
    questions.push(q);
  });

  const unmapped = questions.filter(q => q.has_error).length;
  if (unmapped > 0) {
    warnings.push(`${unmapped} questions have unverified answers. Please check them in the preview.`);
  }

  return {
    source_type: sourceType,
    raw_source: rawText,
    questions,
    total_questions: questions.length,
    mapped_answers_count: questions.length - unmapped,
    unmapped_answers_count: unmapped,
    warnings
  };
}

/**
 * Parses Word Document (.docx / .doc) via Mammoth
 */
export async function parseWordDocument(
  file: File,
  subject?: string,
  topic?: string,
  subtopic?: string
): Promise<UniversalMCQParseResult> {
  const arrayBuffer = await file.arrayBuffer();

  try {
    // 1. Try extracting raw text with paragraph preservation
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value;

    if (text && text.trim().length > 20) {
      const parsed = parsePlainText(text, 'word_doc', subject, topic, subtopic);
      parsed.filename = file.name;
      return parsed;
    }
  } catch (err) {
    console.warn('Mammoth text extraction warning, trying HTML parser:', err);
  }

  // 2. Fallback to HTML conversion
  try {
    const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
    const parsed = parseHtmlContent(htmlResult.value, subject, topic, subtopic);
    parsed.source_type = 'word_doc';
    parsed.filename = file.name;
    return parsed;
  } catch (err) {
    console.error('Mammoth failed:', err);
    throw new Error('Word document read nahi ho saka. Kripya file check karein ya content copy-paste karein.');
  }
}

/**
 * Universal File Reader: routes .docx, .html, .txt to appropriate parser
 */
export async function parseUniversalFile(
  file: File,
  subject?: string,
  topic?: string,
  subtopic?: string
): Promise<UniversalMCQParseResult> {
  const name = file.name.toLowerCase();

  if (name.endsWith('.docx') || name.endsWith('.doc')) {
    return parseWordDocument(file, subject, topic, subtopic);
  } else if (name.endsWith('.html') || name.endsWith('.htm')) {
    const html = await file.text();
    const res = parseHtmlContent(html, subject, topic, subtopic);
    res.filename = file.name;
    return res;
  } else if (name.endsWith('.txt')) {
    const text = await file.text();
    const res = parsePlainText(text, 'txt', subject, topic, subtopic);
    res.filename = file.name;
    return res;
  } else {
    throw new Error(`File format "${file.name}" supported nahi hai. Kripya Word (.doc/.docx), HTML, ya TXT file upload karein.`);
  }
}
