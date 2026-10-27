const exprEl = document.getElementById('expr');
const valueEl = document.getElementById('value');
const listEl = document.getElementById('historyList');
const clearBtn = document.getElementById('clearHistory');

const symbols = { '+': '+', '-': '−', '*': '×', '/': '÷', '%': '%' };

let current = '0';
let previous = null;
let operator = null;
let justEvaluated = false;
let history = [];

const fmt = n => String(n).replace('.', ',');

function compute(a, b, op) {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return b === 0 ? null : a / b;
    case '%': return b === 0 ? null : a % b;
  }
}

function clean(n) {
  return parseFloat(n.toPrecision(12));
}

function updateDisplay() {
  valueEl.textContent = fmt(current);
  exprEl.textContent = operator !== null ? `${fmt(previous)} ${symbols[operator]}` : '';
}

function inputNumber(d) {
  if (justEvaluated) { current = '0'; justEvaluated = false; }
  if (current === 'Erro') current = '0';
  current = current === '0' ? d : current + d;
  updateDisplay();
}

function inputDot() {
  if (justEvaluated) { current = '0'; justEvaluated = false; }
  if (current === 'Erro') current = '0';
  if (!current.includes('.')) current += '.';
  updateDisplay();
}

function chooseOperator(op) {
  if (current === 'Erro') return;
  if (operator !== null && !justEvaluated) {
    evaluate(true);
    if (current === 'Erro') return;
  }
  previous = parseFloat(current);
  operator = op;
  current = '0';
  justEvaluated = false;
  updateDisplay();
}

function evaluate(chained = false) {
  if (operator === null || previous === null) return;
  const b = parseFloat(current);
  const result = compute(previous, b, operator);
  const text = `${fmt(previous)} ${symbols[operator]} ${fmt(b)}`;

  if (result === null) {
    current = 'Erro';
    previous = null;
    operator = null;
    exprEl.textContent = text + ' =';
    valueEl.textContent = 'Erro';
    justEvaluated = true;
    return;
  }

  const final = clean(result);
  addHistory(text, final);
  exprEl.textContent = text + ' =';
  current = String(final);
  previous = null;
  operator = null;
  justEvaluated = true;
  valueEl.textContent = fmt(current);
  if (chained) { exprEl.textContent = ''; justEvaluated = false; }
}

function clearAll() {
  current = '0'; previous = null; operator = null; justEvaluated = false;
  updateDisplay();
}

function backspace() {
  if (justEvaluated || current === 'Erro') return clearAll();
  current = current.length > 1 ? current.slice(0, -1) : '0';
  updateDisplay();
}

function addHistory(expression, result) {
  history.unshift({ expression, result });
  renderHistory();
}

function renderHistory() {
  listEl.innerHTML = '';
  if (history.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'Nenhum cálculo ainda.';
    listEl.appendChild(li);
  } else {
    history.forEach(item => {
      const li = document.createElement('li');
      li.title = 'Clique para reutilizar o resultado';
      li.innerHTML = `<span class="h-expr"></span><span class="h-res"></span>`;
      li.querySelector('.h-expr').textContent = item.expression + ' =';
      li.querySelector('.h-res').textContent = fmt(item.result);
      li.addEventListener('click', () => {
        current = String(item.result);
        previous = null; operator = null; justEvaluated = true;
        updateDisplay();
      });
      listEl.appendChild(li);
    });
  }
  clearBtn.disabled = history.length === 0;
}

clearBtn.addEventListener('click', () => {
  history = [];
  renderHistory();
});

document.querySelector('.keys').addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) return;
  if (btn.dataset.num !== undefined) inputNumber(btn.dataset.num);
  else if (btn.dataset.op) chooseOperator(btn.dataset.op);
  else if (btn.dataset.action === 'dot') inputDot();
  else if (btn.dataset.action === 'equal') evaluate();
  else if (btn.dataset.action === 'clear') clearAll();
  else if (btn.dataset.action === 'back') backspace();
});

document.addEventListener('keydown', e => {
  if (/^[0-9]$/.test(e.key)) inputNumber(e.key);
  else if (['+', '-', '*', '/', '%'].includes(e.key)) chooseOperator(e.key);
  else if (e.key === '.' || e.key === ',') inputDot();
  else if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); evaluate(); }
  else if (e.key === 'Backspace') backspace();
  else if (e.key === 'Escape') clearAll();
});

renderHistory();
updateDisplay();
