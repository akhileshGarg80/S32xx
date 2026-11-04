export interface CodeTemplate {
  name: string;
  description: string;
  code: string;
}

export const CODE_TEMPLATES: CodeTemplate[] = [
  {
    name: 'Interactive MCQ Test',
    description: '3-question multiple choice test with options, scoring, and instant explanations.',
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b1329; color: #f1f5f9; padding: 20px; margin: 0; }
    .container { max-width: 650px; margin: 0 auto; background: #131f37; border: 1px solid #233554; border-radius: 12px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.4); }
    h2 { margin: 0 0 8px 0; color: #38bdf8; font-size: 1.3rem; }
    .subtitle { color: #94a3b8; font-size: 0.85rem; margin-bottom: 20px; }
    .q-card { background: #0c1527; border: 1px solid #1e2e4a; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
    .q-title { font-weight: 600; margin-bottom: 12px; font-size: 1rem; color: #e2e8f0; }
    .opt-btn { display: block; width: 100%; text-align: left; padding: 10px 14px; margin: 6px 0; background: #17243c; border: 1px solid #2a3e61; border-radius: 6px; color: #cbd5e1; font-size: 0.95rem; cursor: pointer; transition: all 0.2s; }
    .opt-btn:hover { background: #223759; border-color: #38bdf8; }
    .opt-btn.correct { background: #064e3b !important; border-color: #10b981 !important; color: #a7f3d0 !important; font-weight: 600; }
    .opt-btn.wrong { background: #7f1d1d !important; border-color: #ef4444 !important; color: #fecaca !important; }
    .explanation { display: none; margin-top: 10px; padding: 10px; background: #0f1c33; border-left: 3px solid #38bdf8; font-size: 0.85rem; color: #94a3b8; }
    .footer-bar { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 16px; border-top: 1px solid #233554; }
    .btn-action { background: #38bdf8; color: #0b1329; border: none; font-weight: 700; padding: 10px 18px; border-radius: 6px; cursor: pointer; font-size: 0.9rem; }
    .score-badge { font-weight: 600; color: #34d399; font-size: 0.95rem; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Subject Diagnostic Practice Test</h2>
    <div class="subtitle">Complete all questions and click Submit to review your score.</div>

    <!-- Question 1 -->
    <div class="q-card" id="card-1">
      <div class="q-title">Q1. Choose the most appropriate answer for this question:</div>
      <button class="opt-btn" onclick="selectAnswer(this, 1, false)">Option A: First proposal</button>
      <button class="opt-btn" onclick="selectAnswer(this, 1, true)">Option B: Verified correct solution</button>
      <button class="opt-btn" onclick="selectAnswer(this, 1, false)">Option C: Alternative hypothesis</button>
      <button class="opt-btn" onclick="selectAnswer(this, 1, false)">Option D: Secondary option</button>
      <div class="explanation" id="exp-1">Explanation: Option B correctly satisfies the fundamental condition.</div>
    </div>

    <!-- Question 2 -->
    <div class="q-card" id="card-2">
      <div class="q-title">Q2. Which principle applies when evaluating this system state?</div>
      <button class="opt-btn" onclick="selectAnswer(this, 2, true)">Option A: Primary conservation law</button>
      <button class="opt-btn" onclick="selectAnswer(this, 2, false)">Option B: Linear divergence rule</button>
      <button class="opt-btn" onclick="selectAnswer(this, 2, false)">Option C: Static equilibrium bias</button>
      <button class="opt-btn" onclick="selectAnswer(this, 2, false)">Option D: Residual drift factor</button>
      <div class="explanation" id="exp-2">Explanation: Conservation law is the dominant constraint in this problem.</div>
    </div>

    <div class="footer-bar">
      <div class="score-badge" id="score-display">Score: 0 / 2 answered</div>
      <button class="btn-action" onclick="resetQuiz()">Reset Test</button>
    </div>
  </div>

  <script>
    let scores = {};
    function selectAnswer(btn, qId, isCorrect) {
      if (scores[qId] !== undefined) return; // prevent multiple clicks
      scores[qId] = isCorrect ? 1 : 0;
      const parent = btn.parentElement;
      const allBtns = parent.querySelectorAll('.opt-btn');
      allBtns.forEach(b => b.style.pointerEvents = 'none');
      if (isCorrect) {
        btn.classList.add('correct');
      } else {
        btn.classList.add('wrong');
      }
      const exp = document.getElementById('exp-' + qId);
      if (exp) exp.style.display = 'block';
      updateTotal();
    }
    function updateTotal() {
      const correct = Object.values(scores).reduce((a, b) => a + b, 0);
      const total = Object.keys(scores).length;
      document.getElementById('score-display').innerText = 'Completed: ' + correct + ' correct out of ' + total;
    }
    function resetQuiz() {
      scores = {};
      document.querySelectorAll('.opt-btn').forEach(b => {
        b.className = 'opt-btn';
        b.style.pointerEvents = 'auto';
      });
      document.querySelectorAll('.explanation').forEach(e => e.style.display = 'none');
      document.getElementById('score-display').innerText = 'Score: 0 / 2 answered';
    }
  </script>
</body>
</html>`
  },
  {
    name: 'Formula & Numeric Calculator',
    description: 'Interactive computational sandbox with input parameters and real-time step solution.',
    code: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; padding: 20px; }
    .box { max-width: 550px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 20px; border: 1px solid #334155; }
    h3 { margin-top: 0; color: #38bdf8; }
    .field { margin-bottom: 14px; }
    label { display: block; font-size: 0.85rem; color: #94a3b8; margin-bottom: 4px; }
    input { width: 100%; box-sizing: border-box; padding: 8px 12px; background: #0f172a; border: 1px solid #475569; border-radius: 6px; color: #fff; font-size: 1rem; }
    button { width: 100%; padding: 10px; background: #0284c7; border: none; border-radius: 6px; color: #fff; font-weight: 600; cursor: pointer; margin-top: 8px; }
    .result { margin-top: 16px; padding: 14px; background: #0b1329; border-radius: 6px; border-left: 3px solid #10b981; display: none; }
  </style>
</head>
<body>
  <div class="box">
    <h3>Quantitative Step Solver</h3>
    <div class="field">
      <label>Initial Value / Cost Price:</label>
      <input type="number" id="v1" value="1000">
    </div>
    <div class="field">
      <label>Rate Percentage (%):</label>
      <input type="number" id="v2" value="18">
    </div>
    <button onclick="calculate()">Compute Values</button>
    <div class="result" id="res"></div>
  </div>
  <script>
    function calculate() {
      const v1 = parseFloat(document.getElementById('v1').value) || 0;
      const v2 = parseFloat(document.getElementById('v2').value) || 0;
      const delta = (v1 * v2) / 100;
      const finalVal = v1 + delta;
      const r = document.getElementById('res');
      r.style.display = 'block';
      r.innerHTML = '<strong>Calculation Steps:</strong><br>' +
        '• Rate Applied: ' + v2 + '% of ' + v1 + ' = ' + delta.toFixed(2) + '<br>' +
        '• Final Amount: <strong>' + finalVal.toFixed(2) + '</strong>';
    }
  </script>
</body>
</html>`
  },
  {
    name: 'Rapid Flashcards',
    description: 'Self-assessment revision cards with question on front, answer/notes on reveal.',
    code: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: system-ui, sans-serif; background: #020617; color: #f8fafc; padding: 20px; display: flex; justify-content: center; }
    .card-wrap { width: 100%; max-width: 500px; }
    .flashcard { background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 24px; min-height: 200px; display: flex; flex-direction: column; justify-content: space-between; }
    .title { font-size: 1.15rem; font-weight: 600; color: #f1f5f9; }
    .answer { display: none; margin-top: 16px; padding: 12px; background: #1e293b; border-radius: 8px; color: #34d399; font-size: 0.95rem; }
    .btn { background: #334155; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; margin-top: 14px; }
  </style>
</head>
<body>
  <div class="card-wrap">
    <div class="flashcard">
      <div class="title">Question: What is the primary difference between TCP and UDP?</div>
      <div class="answer" id="ans">
        <strong>Key Answer:</strong><br>
        TCP is connection-oriented, ordered, reliable with 3-way handshake.<br>
        UDP is connectionless, low latency, without transmission guarantee.
      </div>
      <button class="btn" onclick="toggleAns(this)">Show Answer</button>
    </div>
  </div>
  <script>
    function toggleAns(btn) {
      const a = document.getElementById('ans');
      if (a.style.display === 'block') {
        a.style.display = 'none';
        btn.innerText = 'Show Answer';
      } else {
        a.style.display = 'block';
        btn.innerText = 'Hide Answer';
      }
    }
  </script>
</body>
</html>`
  }
];
