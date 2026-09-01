/* ==========================================================
   MATHMODEL — SCRIPT PRINCIPAL
   ========================================================== */

/* ==========================================================
   1. UTILITÁRIOS
   ========================================================== */
function fmt(n, d = 2) {
  return Number(n).toFixed(d);
}
function fmtBR(n) {
  return Number(n).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/* ==========================================================
   2. SCROLL REVEAL
   ========================================================== */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el));

/* ==========================================================
   3. SIMULADOR 1º GRAU — CUSTO DE PRODUÇÃO
   ========================================================== */
const inputA1 = document.getElementById('inputA1');
const inputB1 = document.getElementById('inputB1');
const inputX1 = document.getElementById('inputX1');
const canvas1 = document.getElementById('canvas1');
const ctx1 = canvas1.getContext('2d');

function updateSim1() {
  const a = +inputA1.value;
  const b = +inputB1.value;
  const x = +inputX1.value;

  document.getElementById('valA1').textContent = a;
  document.getElementById('valB1').textContent = b;
  document.getElementById('valX1').textContent = x;
  document.getElementById('fA1').textContent = a;
  document.getElementById('fB1').textContent = b;
  document.getElementById('fX1').textContent = x;

  const total = a * x + b;
  document.getElementById('resultCost1').textContent = fmtBR(total);
  drawGraph1(a, b, x);
}
[inputA1, inputB1, inputX1].forEach((el) => el.addEventListener('input', updateSim1));

function drawGraph1(a, b, px) {
  const W = 480, H = 360;
  const dpr = window.devicePixelRatio || 1;
  canvas1.width = W * dpr;
  canvas1.height = H * dpr;
  canvas1.style.width = W + 'px';
  canvas1.style.height = H + 'px';
  const ctx = ctx1;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);

  const xMax = Math.max(px * 1.5, 10);
  const yMax = a * xMax + b;
  const yMin = b;
  const padL = 55, padR = 20, padT = 25, padB = 40;
  const gw = W - padL - padR;
  const gh = H - padT - padB;

  function toCanvas(x, y) {
    return [
      padL + (x / xMax) * gw,
      padT + gh - ((y - yMin) / (yMax - yMin || 1)) * gh,
    ];
  }

  ctx.strokeStyle = '#1e2740';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const yy = padT + (gh * i) / 5;
    ctx.beginPath();
    ctx.moveTo(padL, yy);
    ctx.lineTo(W - padR, yy);
    ctx.stroke();
    const val = yMax - ((yMax - yMin) * i) / 5;
    ctx.fillStyle = '#5a6480';
    ctx.font = '11px Inter,sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(fmt(val, 0), padL - 8, yy + 4);
  }
  for (let i = 0; i <= 5; i++) {
    const xx = padL + (gw * i) / 5;
    ctx.beginPath();
    ctx.moveTo(xx, padT);
    ctx.lineTo(xx, padT + gh);
    ctx.stroke();
    const val = (xMax * i) / 5;
    ctx.fillStyle = '#5a6480';
    ctx.textAlign = 'center';
    ctx.fillText(fmt(val, 0), xx, H - padB + 18);
  }

  ctx.fillStyle = '#8892a8';
  ctx.font = 'bold 11px Inter,sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Quantidade (x)', padL + gw / 2, H - 5);
  ctx.save();
  ctx.translate(14, padT + gh / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Custo (R$)', 0, 0);
  ctx.restore();

  const [x0, y0] = toCanvas(0, b);
  const [x1, y1] = toCanvas(xMax, a * xMax + b);

  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.strokeStyle = 'rgba(77,142,247,.15)';
  ctx.lineWidth = 12;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.strokeStyle = '#4d8ef7';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.stroke();

  const [ppx, ppy] = toCanvas(px, a * px + b);

  ctx.beginPath();
  ctx.arc(ppx, ppy, 12, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(77,142,247,.2)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(ppx, ppy, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#4d8ef7';
  ctx.fill();

  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = 'rgba(77,142,247,.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(ppx, ppy);
  ctx.lineTo(ppx, padT + gh);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ppx, ppy);
  ctx.lineTo(padL, ppy);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#e4e8f1';
  ctx.font = 'bold 12px JetBrains Mono,monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`(${px}, ${fmtBR(a * px + b)})`, ppx + 14, ppy - 10);
}
updateSim1();

/* ==========================================================
   4. NOVO: SIMULADOR CONTA DE LUZ + MRU (com ABAS)
   ========================================================== */
const canvasLuz = document.getElementById('canvasLuz');
const ctxLuz = canvasLuz.getContext('2d');
let activeTab = 'luz';

// Tabs
document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    document.getElementById('tab-' + tab).classList.add('active');
    activeTab = tab;
    if (tab === 'luz') updateLuz();
    else updateMRU();
  });
});

// Inputs CONTA DE LUZ
const inputTarifa = document.getElementById('inputTarifa');
const inputFixo = document.getElementById('inputFixo');
const inputConsumo = document.getElementById('inputConsumo');

// Inputs MRU
const inputVel = document.getElementById('inputVel');
const inputTempo = document.getElementById('inputTempo');

function updateLuz() {
  const a = +inputTarifa.value;
  const b = +inputFixo.value;
  const x = +inputConsumo.value;

  document.getElementById('valTarifa').textContent = fmt(a, 2);
  document.getElementById('valFixo').textContent = b;
  document.getElementById('valConsumo').textContent = x;
  document.getElementById('fTarifa').textContent = fmt(a, 2);
  document.getElementById('fFixo').textContent = b;
  document.getElementById('fConsumo').textContent = x;

  const total = a * x + b;
  document.getElementById('resultLuz').textContent = fmtBR(total);
  drawLuzGraph(a, b, x);
}
[inputTarifa, inputFixo, inputConsumo].forEach((el) =>
  el.addEventListener('input', () => { if (activeTab === 'luz') updateLuz(); })
);

function updateMRU() {
  const v = +inputVel.value;
  const t = +inputTempo.value;
  const s0 = 0;

  document.getElementById('valVel').textContent = v;
  document.getElementById('valTempo').textContent = fmt(t, 1);
  document.getElementById('fVel').textContent = v;
  document.getElementById('fS0').textContent = s0;

  const ds = v * t;
  document.getElementById('resultMRU').textContent = fmt(ds, 2) + ' km';
  drawMRUGraph(v, t);
}
[inputVel, inputTempo].forEach((el) =>
  el.addEventListener('input', () => { if (activeTab === 'mru') updateMRU(); })
);

function drawLuzGraph(a, b, x) {
  const W = 480, H = 360;
  const dpr = window.devicePixelRatio || 1;
  canvasLuz.width = W * dpr;
  canvasLuz.height = H * dpr;
  canvasLuz.style.width = W + 'px';
  canvasLuz.style.height = H + 'px';
  const ctx = ctxLuz;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);

  const xMax = Math.max(x * 1.5, 100);
  const yMax = a * xMax + b;
  const yMin = b;
  const padL = 55, padR = 20, padT = 25, padB = 40;
  const gw = W - padL - padR;
  const gh = H - padT - padB;

  function toC(x, y) {
    return [
      padL + (x / xMax) * gw,
      padT + gh - ((y - yMin) / (yMax - yMin || 1)) * gh,
    ];
  }

  ctx.strokeStyle = '#1e2740';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const yy = padT + (gh * i) / 5;
    ctx.beginPath();
    ctx.moveTo(padL, yy);
    ctx.lineTo(W - padR, yy);
    ctx.stroke();
    const val = yMax - ((yMax - yMin) * i) / 5;
    ctx.fillStyle = '#5a6480';
    ctx.font = '11px Inter,sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('R$ ' + fmt(val, 0), padL - 8, yy + 4);
  }
  for (let i = 0; i <= 5; i++) {
    const xx = padL + (gw * i) / 5;
    ctx.beginPath();
    ctx.moveTo(xx, padT);
    ctx.lineTo(xx, padT + gh);
    ctx.stroke();
    const val = (xMax * i) / 5;
    ctx.fillStyle = '#5a6480';
    ctx.textAlign = 'center';
    ctx.fillText(fmt(val, 0), xx, H - padB + 18);
  }

  ctx.fillStyle = '#8892a8';
  ctx.font = 'bold 11px Inter,sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Consumo (kWh)', padL + gw / 2, H - 5);
  ctx.save();
  ctx.translate(14, padT + gh / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Conta (R$)', 0, 0);
  ctx.restore();

  const [x0, y0] = toC(0, b);
  const [x1, y1] = toC(xMax, a * xMax + b);

  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.strokeStyle = 'rgba(251,146,60,.15)';
  ctx.lineWidth = 12;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.strokeStyle = '#fb923c';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.stroke();

  const [ppx, ppy] = toC(x, a * x + b);

  ctx.beginPath();
  ctx.arc(ppx, ppy, 12, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(251,146,60,.2)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(ppx, ppy, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#fb923c';
  ctx.fill();

  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = 'rgba(251,146,60,.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(ppx, ppy);
  ctx.lineTo(ppx, padT + gh);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ppx, ppy);
  ctx.lineTo(padL, ppy);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#e4e8f1';
  ctx.font = 'bold 12px JetBrains Mono,monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`(${x} kWh, R$ ${fmtBR(a * x + b)})`, ppx + 14, ppy - 10);
}

function drawMRUGraph(v, t) {
  const W = 480, H = 360;
  const dpr = window.devicePixelRatio || 1;
  canvasLuz.width = W * dpr;
  canvasLuz.height = H * dpr;
  canvasLuz.style.width = W + 'px';
  canvasLuz.style.height = H + 'px';
  const ctx = ctxLuz;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);

  const tMax = Math.max(t * 1.4, 2);
  const vMax = v * 1.3;
  const padL = 55, padR = 20, padT = 25, padB = 40;
  const gw = W - padL - padR;
  const gh = H - padT - padB;

  function toC(tt, vv) {
    return [padL + (tt / tMax) * gw, padT + gh - (vv / vMax) * gh];
  }

  // Grade
  ctx.strokeStyle = '#1e2740';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const yy = padT + (gh * i) / 5;
    ctx.beginPath();
    ctx.moveTo(padL, yy);
    ctx.lineTo(W - padR, yy);
    ctx.stroke();
    const val = vMax - (vMax * i) / 5;
    ctx.fillStyle = '#5a6480';
    ctx.font = '11px Inter,sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(fmt(val, 0), padL - 8, yy + 4);
  }
  for (let i = 0; i <= 5; i++) {
    const xx = padL + (gw * i) / 5;
    ctx.beginPath();
    ctx.moveTo(xx, padT);
    ctx.lineTo(xx, padT + gh);
    ctx.stroke();
    const val = (tMax * i) / 5;
    ctx.fillStyle = '#5a6480';
    ctx.textAlign = 'center';
    ctx.fillText(fmt(val, 1), xx, H - padB + 18);
  }

  // Rótulos
  ctx.fillStyle = '#8892a8';
  ctx.font = 'bold 11px Inter,sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Tempo t (h)', padL + gw / 2, H - 5);
  ctx.save();
  ctx.translate(14, padT + gh / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Velocidade v (km/h)', 0, 0);
  ctx.restore();

  // ÁREA DO RETÂNGULO (Δs = v · t)
  const [rx0, ry0] = toC(0, 0);
  const [rx1, ry1] = toC(t, v);
  ctx.fillStyle = 'rgba(251,146,60,.18)';
  ctx.fillRect(rx0, ry1, rx1 - rx0, ry0 - ry1);

  // Borda da área
  ctx.strokeStyle = 'rgba(251,146,60,.5)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(rx0, ry1, rx1 - rx0, ry0 - ry1);

  // Label da área
  ctx.fillStyle = '#fb923c';
  ctx.font = 'bold 13px JetBrains Mono,monospace';
  ctx.textAlign = 'center';
  const areaLabel = `Δs = ${fmt(v * t, 1)} km`;
  ctx.fillText(areaLabel, (rx0 + rx1) / 2, (ry0 + ry1) / 2 + 5);

  // Reta v(t) = v (horizontal)
  const [x0, y0] = toC(0, v);
  const [x1, y1] = toC(tMax, v);
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.strokeStyle = '#fb923c';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Ponto em t
  const [ptx, pty] = toC(t, v);
  ctx.beginPath();
  ctx.arc(ptx, pty, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#fb923c';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(ptx, pty, 12, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(251,146,60,.2)';
  ctx.fill();

  // Linhas tracejadas
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = 'rgba(251,146,60,.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(ptx, pty);
  ctx.lineTo(ptx, padT + gh);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ptx, pty);
  ctx.lineTo(padL, pty);
  ctx.stroke();
  ctx.setLineDash([]);

  // Label do ponto
  ctx.fillStyle = '#e4e8f1';
  ctx.font = 'bold 11px JetBrains Mono,monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`(${fmt(t, 1)}h, ${v} km/h)`, ptx + 14, pty - 10);
}

updateLuz();

/* ==========================================================
   5. SIMULADOR 2º GRAU — MELHORADO
   ========================================================== */
const inputA2 = document.getElementById('inputA2');
const inputB2 = document.getElementById('inputB2');
const inputC2 = document.getElementById('inputC2');
const canvas2 = document.getElementById('canvas2');
const ctx2 = canvas2.getContext('2d');

function updateSim2() {
  let a = +inputA2.value;
  let b = +inputB2.value;
  let c = +inputC2.value;

  if (a === 0) {
    a = 0.1;
    inputA2.value = 0.1;
  }

  document.getElementById('valA2').textContent = fmt(a, 1);
  document.getElementById('valB2').textContent = fmt(b, 1);
  document.getElementById('valC2').textContent = fmt(c, 1);
  document.getElementById('fA2').textContent = fmt(a, 1);
  document.getElementById('fB2').textContent = fmt(b, 1);
  document.getElementById('fC2').textContent = fmt(c, 1);

  const xv = -b / (2 * a);
  const yv = a * xv * xv + b * xv + c;
  const delta = b * b - 4 * a * c;

  document.getElementById('vx').textContent = fmt(xv);
  document.getElementById('vy').textContent = fmt(yv);
  document.getElementById('delta').textContent = fmt(delta);

  if (a < 0) {
    document.getElementById('concavidade').innerHTML =
      'Para baixo (∩) — <strong style="color:var(--accent-green)">Máximo</strong>';
  } else {
    document.getElementById('concavidade').innerHTML =
      'Para cima (∪) — <strong style="color:var(--accent-green)">Mínimo</strong>';
  }

  let rText = '';
  let r1 = null, r2 = null;
  if (delta > 0) {
    r1 = (-b - Math.sqrt(delta)) / (2 * a);
    r2 = (-b + Math.sqrt(delta)) / (2 * a);
    rText = `x₁ = ${fmt(Math.min(r1, r2))}  |  x₂ = ${fmt(Math.max(r1, r2))}`;
  } else if (delta === 0) {
    r1 = xv;
    rText = `x = ${fmt(xv)} (raiz dupla)`;
  } else {
    rText = 'Não possui raízes reais (Δ < 0)';
  }
  document.getElementById('raizes').textContent = rText;

  // NOVO: Interpretação contextual
  updateContexto(a, xv, yv, r1, r2, delta);

  drawGraph2(a, b, c, xv, yv, delta);
}

// NOVO: Atualiza texto interpretativo
function updateContexto(a, xv, yv, r1, r2, delta) {
  const ctx = document.getElementById('contextoFisico');
  if (a < 0) {
    // Cenário de projétil / máximo
    if (delta >= 0 && r1 !== null && r2 !== null) {
      const inicio = Math.min(r1, r2);
      const fim = Math.max(r1, r2);
      const duracao = fim - inicio;
      ctx.innerHTML = `Um projétil atinge <strong>${fmt(yv, 2)} m</strong> de altura máxima após <strong>${fmt(xv, 2)} s</strong>. Ele permanece no ar por <strong>${fmt(duracao, 2)} s</strong> (de t=${fmt(inicio,2)} a t=${fmt(fim,2)}).`;
    } else {
      ctx.innerHTML = `O valor máximo da função é <strong>${fmt(yv, 2)}</strong>, atingido em x = <strong>${fmt(xv, 2)}</strong>.`;
    }
  } else {
    // Cenário de custo mínimo / mínimo
    ctx.innerHTML = `O valor mínimo da função é <strong>${fmt(yv, 2)}</strong>, atingido em x = <strong>${fmt(xv, 2)}</strong>. Em problemas de custo, este seria o <strong>ponto de custo mínimo</strong>.`;
  }
}

[inputA2, inputB2, inputC2].forEach((el) => el.addEventListener('input', updateSim2));

function drawGraph2(a, b, c, xv, yv, delta) {
  const W = 480, H = 360;
  const dpr = window.devicePixelRatio || 1;
  canvas2.width = W * dpr;
  canvas2.height = H * dpr;
  canvas2.style.width = W + 'px';
  canvas2.style.height = H + 'px';
  const ctx = ctx2;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);

  let roots = [];
  if (delta >= 0) {
    roots.push((-b - Math.sqrt(delta)) / (2 * a));
    roots.push((-b + Math.sqrt(delta)) / (2 * a));
  }

  let xPoints = [xv, 0, ...roots];
  let xMinV = Math.min(...xPoints) - 3;
  let xMaxV = Math.max(...xPoints) + 3;
  if (xMaxV - xMinV < 6) {
    const mid = (xMaxV + xMinV) / 2;
    xMinV = mid - 3;
    xMaxV = mid + 3;
  }

  let yVals = [];
  for (let i = 0; i <= 200; i++) {
    const xx = xMinV + ((xMaxV - xMinV) * i) / 200;
    yVals.push(a * xx * xx + b * xx + c);
  }
  let yMinV = Math.min(...yVals, 0);
  let yMaxV = Math.max(...yVals, 0);
  const yPad = (yMaxV - yMinV) * 0.15 || 5;
  yMinV -= yPad;
  yMaxV += yPad;

  const padL = 50, padR = 15, padT = 20, padB = 35;
  const gw = W - padL - padR;
  const gh = H - padT - padB;

  function toC(x, y) {
    return [
      padL + ((x - xMinV) / (xMaxV - xMinV)) * gw,
      padT + gh - ((y - yMinV) / (yMaxV - yMinV)) * gh,
    ];
  }

  ctx.strokeStyle = '#1e2740';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const yy = padT + (gh * i) / 5;
    ctx.beginPath();
    ctx.moveTo(padL, yy);
    ctx.lineTo(W - padR, yy);
    ctx.stroke();
    const val = yMaxV - ((yMaxV - yMinV) * i) / 5;
    ctx.fillStyle = '#5a6480';
    ctx.font = '10px Inter,sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(fmt(val, 1), padL - 6, yy + 3);
  }
  for (let i = 0; i <= 5; i++) {
    const xx = padL + (gw * i) / 5;
    ctx.beginPath();
    ctx.moveTo(xx, padT);
    ctx.lineTo(xx, padT + gh);
    ctx.stroke();
    const val = xMinV + ((xMaxV - xMinV) * i) / 5;
    ctx.fillStyle = '#5a6480';
    ctx.textAlign = 'center';
    ctx.fillText(fmt(val, 1), xx, H - padB + 15);
  }

  const [zx, zy] = toC(0, 0);
  if (zy >= padT && zy <= padT + gh) {
    ctx.strokeStyle = '#2a3555';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padL, zy);
    ctx.lineTo(W - padR, zy);
    ctx.stroke();
  }
  if (zx >= padL && zx <= W - padR) {
    ctx.strokeStyle = '#2a3555';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(zx, padT);
    ctx.lineTo(zx, padT + gh);
    ctx.stroke();
  }

  // NOVO: Linha do vértice (eixo de simetria)
  const [vcx, vcy] = toC(xv, yv);
  ctx.setLineDash([3, 5]);
  ctx.strokeStyle = 'rgba(52,211,153,.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(vcx, padT);
  ctx.lineTo(vcx, padT + gh);
  ctx.stroke();
  ctx.setLineDash([]);

  // Parábola
  ctx.beginPath();
  for (let i = 0; i <= 300; i++) {
    const xx = xMinV + ((xMaxV - xMinV) * i) / 300;
    const yy = a * xx * xx + b * xx + c;
    const [cx, cy] = toC(xx, yy);
    if (i === 0) ctx.moveTo(cx, cy);
    else ctx.lineTo(cx, cy);
  }
  ctx.strokeStyle = 'rgba(52,211,153,.12)';
  ctx.lineWidth = 14;
  ctx.stroke();

  ctx.beginPath();
  for (let i = 0; i <= 300; i++) {
    const xx = xMinV + ((xMaxV - xMinV) * i) / 300;
    const yy = a * xx * xx + b * xx + c;
    const [cx, cy] = toC(xx, yy);
    if (i === 0) ctx.moveTo(cx, cy);
    else ctx.lineTo(cx, cy);
  }
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Vértice (DESTACADO)
  ctx.beginPath();
  ctx.arc(vcx, vcy, 18, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(52,211,153,.12)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(vcx, vcy, 12, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(52,211,153,.25)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(vcx, vcy, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#34d399';
  ctx.fill();

  // Linhas tracejadas do vértice
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = 'rgba(52,211,153,.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(vcx, vcy);
  ctx.lineTo(vcx, padT + gh);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(vcx, vcy);
  ctx.lineTo(padL, vcy);
  ctx.stroke();
  ctx.setLineDash([]);

  // Label do vértice
  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 12px JetBrains Mono,monospace';
  ctx.textAlign = 'left';
  const vLabel = a < 0 ? '🎯 MÁX' : '🎯 MÍN';
  const labelY = vcy + (a < 0 ? -20 : 25);
  ctx.fillText(`${vLabel} (${fmt(xv)}, ${fmt(yv)})`, vcx + 14, labelY);

  // Raízes
  if (delta >= 0) {
    roots.forEach((r) => {
      const [rx, ry] = toC(r, 0);
      ctx.beginPath();
      ctx.arc(rx, ry, 10, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(251,146,60,.15)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(rx, ry, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#fb923c';
      ctx.fill();
    });
  }

  ctx.fillStyle = '#8892a8';
  ctx.font = 'bold 10px Inter,sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    'x',
    W - padR + 8,
    zy >= padT && zy <= padT + gh ? zy + 3 : padT + gh + 14
  );
  ctx.fillText('y', zx >= padL && zx <= W - padR ? zx : padL, padT - 6);
}
updateSim2();

/* ==========================================================
   6. INICIALIZAÇÃO
   ========================================================== */
window.addEventListener('resize', () => {
  updateSim1();
  updateSim2();
  if (activeTab === 'luz') updateLuz();
  else updateMRU();
});
