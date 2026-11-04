import { UniversalMCQQuestion } from '../types/mcq';

/**
 * Generates standalone, self-contained HTML/CSS/JS interactive test
 * from parsed Universal MCQ questions.
 * Supports:
 * - Green for correct, Red for incorrect
 * - Instant feedback or test submission
 * - Score card with summary: total, correct, wrong, skipped, accuracy %
 * - Solution / Explanation toggle
 */
export function generateHtmlFromMCQ(
  title: string,
  subject: string,
  topic: string,
  subtopic: string | undefined,
  questions: UniversalMCQQuestion[]
): string {
  const safeTitle = title.replace(/"/g, '&quot;');
  const safeSubject = subject.replace(/"/g, '&quot;');
  const safeTopic = topic.replace(/"/g, '&quot;');
  const safeSubtopic = (subtopic || '').replace(/"/g, '&quot;');
  const questionsJson = JSON.stringify(questions).replace(/<\/script>/gi, '<\\/script>');

  return `<!DOCTYPE html>
<html lang="hi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${safeTitle} - Universal MCQ Test</title>
<style>
  :root {
    --bg: #090d16;
    --card: #131b2e;
    --border: #23314e;
    --text: #f1f5f9;
    --muted: #94a3b8;
    --accent: #10b981;
    --wrong: #ef4444;
    --opt-bg: #1a243b;
    --opt-hover: #223150;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    background: var(--bg);
    color: var(--text);
    padding: 16px;
    line-height: 1.5;
  }
  .container {
    max-width: 820px;
    margin: 0 auto;
  }
  header {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 18px 20px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
  }
  .header-left h1 {
    font-size: 1.25rem;
    color: #38bdf8;
    margin-bottom: 4px;
  }
  .header-left .meta {
    font-size: 0.8rem;
    color: var(--muted);
  }
  .header-left .badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    background: #0f2d25;
    color: #34d399;
    font-size: 0.75rem;
    font-weight: 600;
    margin-right: 6px;
    border: 1px solid #059669;
  }
  .header-right {
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .btn {
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
  }
  .btn-primary { background: #10b981; color: #022c22; }
  .btn-primary:hover { background: #34d399; }
  .btn-secondary { background: #1e293b; color: #cbd5e1; border: 1px solid var(--border); }
  .btn-secondary:hover { background: #334155; }

  /* SCORE SUMMARY CARD */
  #score-card {
    display: none;
    background: linear-gradient(135deg, #064e3b 0%, #0f172a 100%);
    border: 1px solid #10b981;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
    text-align: center;
    animation: fadeIn 0.3s ease;
  }
  #score-card h2 { font-size: 1.4rem; color: #6ee7b7; margin-bottom: 12px; }
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
    gap: 10px;
    margin: 16px 0;
  }
  .stat-box {
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 10px;
    border-radius: 8px;
  }
  .stat-num { font-size: 1.4rem; font-weight: bold; }
  .stat-label { font-size: 0.75rem; color: var(--muted); }

  /* QUESTION CARD */
  .q-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 18px;
    transition: border-color 0.2s;
  }
  .q-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 14px;
  }
  .q-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #1e293b;
    border: 1px solid var(--border);
    font-size: 0.8rem;
    font-weight: bold;
    color: #38bdf8;
    flex-shrink: 0;
  }
  .q-text {
    flex: 1;
    font-size: 1rem;
    font-weight: 500;
    color: var(--text);
  }
  .options-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .opt-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    text-align: left;
    padding: 12px 16px;
    background: var(--opt-bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: #e2e8f0;
    font-size: 0.92rem;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .opt-btn:hover:not(:disabled) {
    background: var(--opt-hover);
    border-color: #38bdf8;
  }
  .opt-lbl {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    font-weight: 600;
    font-size: 0.75rem;
    flex-shrink: 0;
  }
  .opt-btn.correct {
    background: rgba(16, 185, 129, 0.15) !important;
    border-color: rgba(16, 185, 129, 0.45) !important;
    color: #6ee7b7 !important;
  }
  .opt-btn.wrong {
    background: rgba(239, 68, 68, 0.15) !important;
    border-color: rgba(239, 68, 68, 0.45) !important;
    color: #fca5a5 !important;
  }
  .opt-btn:disabled {
    cursor: default;
  }
  .exp-box {
    margin-top: 14px;
    padding: 12px 14px;
    background: #0d2818;
    border-left: 3px solid #10b981;
    border-radius: 4px;
    font-size: 0.85rem;
    color: #a7f3d0;
    display: none;
  }
  .exp-title {
    font-weight: bold;
    color: #6ee7b7;
    margin-bottom: 4px;
  }
  .fixed-bottom-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(9, 13, 22, 0.95);
    backdrop-filter: blur(8px);
    border-top: 1px solid var(--border);
    padding: 10px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 100;
  }
  body {
    padding-bottom: 70px;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
</head>
<body>
<div class="container">
  <header>
    <div class="header-left">
      <h1>${safeTitle}</h1>
      <div class="meta">
        <span class="badge">${safeSubject}</span>
        <span>${safeTopic}${safeSubtopic ? ' · ' + safeSubtopic : ''}</span>
      </div>
    </div>
    <div class="header-right">
      <button class="btn btn-secondary" onclick="restartTest()">Restart</button>
      <button class="btn btn-primary" id="btn-submit" onclick="submitTest()">Submit Test</button>
    </div>
  </header>

  <div id="score-card">
    <h2>Test Summary & Score Card</h2>
    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-num" id="s-total">0</div>
        <div class="stat-label">Total Questions</div>
      </div>
      <div class="stat-box">
        <div class="stat-num" id="s-attempted">0</div>
        <div class="stat-label">Attempted</div>
      </div>
      <div class="stat-box">
        <div class="stat-num" id="s-correct" style="color: #34d399">0</div>
        <div class="stat-label">Correct</div>
      </div>
      <div class="stat-box">
        <div class="stat-num" id="s-wrong" style="color: #f87171">0</div>
        <div class="stat-label">Wrong</div>
      </div>
      <div class="stat-box">
        <div class="stat-num" id="s-accuracy" style="color: #38bdf8">0%</div>
        <div class="stat-label">Accuracy</div>
      </div>
    </div>
    <p style="font-size: 0.85rem; color: #a7f3d0;">Scroll down to review correct answers and solutions.</p>
  </div>

  <div id="questions-container"></div>
</div>

<div class="fixed-bottom-bar" id="fixed-bar">
  <div id="bottom-attempt-status" style="font-size: 0.8rem; color: #94a3b8; font-family: monospace;">
    0 Attempted
  </div>
  <button class="btn btn-primary" onclick="submitTest()" style="padding: 6px 14px; font-size: 0.8rem; font-weight: 700;">
    Submit Test
  </button>
</div>

<script>
const questions = ${questionsJson};
const userAnswers = {};
let isSubmitted = false;

function renderQuestions() {
  const container = document.getElementById('questions-container');
  container.innerHTML = '';

  questions.forEach((q, idx) => {
    const qDiv = document.createElement('div');
    qDiv.className = 'q-card';
    qDiv.id = 'q-card-' + idx;

    const optHtml = q.options.map((opt, oIdx) => {
      const isSelected = userAnswers[idx] === opt.label;
      return \`<button class="opt-btn" id="opt-\${idx}-\${oIdx}" onclick="selectOption(\${idx}, '\${opt.label}', \${oIdx})">
        <span class="opt-lbl">\${opt.label}</span>
        <span>\${opt.text}</span>
      </button>\`;
    }).join('');

    const expHtml = q.explanation ? \`
      <div class="exp-box" id="exp-\${idx}">
        <div class="exp-title">व्याख्या / Explanation:</div>
        <div>\${q.explanation}</div>
      </div>
    \` : \`
      <div class="exp-box" id="exp-\${idx}">
        <div class="exp-title">Correct Answer:</div>
        <div>\${q.correct_answer_label ? 'Option ' + q.correct_answer_label : ''} \${q.correct_answer_text || ''}</div>
      </div>
    \`;

    qDiv.innerHTML = \`
      <div class="q-top">
        <div class="q-num">\${idx + 1}</div>
        <div class="q-text">\${q.question_text}</div>
      </div>
      <div class="options-list">
        \${optHtml}
      </div>
      \${expHtml}
    \`;

    container.appendChild(qDiv);
  });
}

function selectOption(qIdx, optLabel, optIdx) {
  if (isSubmitted) return;
  userAnswers[qIdx] = optLabel;

  // Immediate visual feedback: mark correct in green, wrong in red
  const q = questions[qIdx];
  const isCorrect = (q.correct_answer_label && q.correct_answer_label.toUpperCase() === optLabel.toUpperCase()) ||
                    (q.correct_answer_text && q.options[optIdx]?.text.trim() === q.correct_answer_text.trim());

  // Update button styles in this card
  q.options.forEach((opt, oIdx) => {
    const btn = document.getElementById(\`opt-\${qIdx}-\${oIdx}\`);
    if (!btn) return;
    btn.classList.remove('correct', 'wrong');
    if (opt.label.toUpperCase() === optLabel.toUpperCase()) {
      btn.classList.add(isCorrect ? 'correct' : 'wrong');
    }
    // Also highlight correct answer in green
    if (!isCorrect && q.correct_answer_label && opt.label.toUpperCase() === q.correct_answer_label.toUpperCase()) {
      btn.classList.add('correct');
    }
  });

  const attemptedCount = Object.keys(userAnswers).length;
  const statusEl = document.getElementById('bottom-attempt-status');
  if (statusEl) statusEl.innerText = attemptedCount + ' of ' + questions.length + ' Attempted';
}

function submitTest() {
  isSubmitted = true;
  let correct = 0;
  let wrong = 0;
  let attempted = 0;

  questions.forEach((q, idx) => {
    const userAns = userAnswers[idx];
    if (userAns !== undefined) {
      attempted++;
      const isCorrect = q.correct_answer_label && q.correct_answer_label.toUpperCase() === userAns.toUpperCase();
      if (isCorrect) correct++;
      else wrong++;
    }

    // Ensure all correct answers and explanations are shown
    q.options.forEach((opt, oIdx) => {
      const btn = document.getElementById(\`opt-\${idx}-\${oIdx}\`);
      if (btn) {
        btn.disabled = true;
        if (q.correct_answer_label && opt.label.toUpperCase() === q.correct_answer_label.toUpperCase()) {
          btn.classList.add('correct');
        } else if (userAns === opt.label) {
          btn.classList.add('wrong');
        }
      }
    });

    const expBox = document.getElementById('exp-' + idx);
    if (expBox) expBox.style.display = 'block';
  });

  const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

  document.getElementById('s-total').innerText = questions.length;
  document.getElementById('s-attempted').innerText = attempted;
  document.getElementById('s-correct').innerText = correct;
  document.getElementById('s-wrong').innerText = wrong;
  document.getElementById('s-accuracy').innerText = accuracy + '%';

  const scoreCard = document.getElementById('score-card');
  scoreCard.style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });

  const btnSubmit = document.getElementById('btn-submit');
  if (btnSubmit) btnSubmit.style.display = 'none';
  const fixedBar = document.getElementById('fixed-bar');
  if (fixedBar) fixedBar.style.display = 'none';
}

function restartTest() {
  for (let key in userAnswers) delete userAnswers[key];
  isSubmitted = false;
  document.getElementById('score-card').style.display = 'none';
  const btnSubmit = document.getElementById('btn-submit');
  if (btnSubmit) btnSubmit.style.display = 'inline-block';
  const fixedBar = document.getElementById('fixed-bar');
  if (fixedBar) fixedBar.style.display = 'flex';
  const statusEl = document.getElementById('bottom-attempt-status');
  if (statusEl) statusEl.innerText = '0 of ' + questions.length + ' Attempted';
  renderQuestions();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

renderQuestions();
</script>
</body>
</html>`;
}
