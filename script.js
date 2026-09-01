/* ==========================================================
   MATHMODEL — SCRIPT PRINCIPAL
   Site Educativo de Modelagem Matemática
   Funções de 1º e 2º Graus
   ========================================================== */

/* ==========================================================
   1. UTILITÁRIOS GERAIS
   ========================================================== */

/** Formata número com N casas decimais */
function fmt(n, d = 2) {
  return Number(n).toFixed(d);
}

/** Formata número no padrão brasileiro (R$ 1.234,56) */
function fmtBR(n) {
  return Number(n).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/* ==========================================================
   2. SCROLL REVEAL (animação ao rolar a página)
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
   3. SIMULADOR 1º GRAU — Custo de Produção
   ========================================================== */

// Referências aos elementos
const inputA1 = document.getElementById('inputA1');
const inputB1 = document.getElementById('inputB1');
const inputX1 = document.getElementById('inputX1');
const canvas1 = document.getElementById('canvas1');
const ctx1 = canvas1.getContext('2d');

/** Atualiza valores e redesenha o gráfico do simulador 1 */
function updateSim1() {
  const a = +inputA1.value;
  const b = +inputB1.value;
  const x = +inputX1.value;

  // Atualiza displays dos sliders
  document.getElementById('valA1').textContent = a;
  document.getElementById('valB1').textContent = b;
  document.getElementById('valX1').textContent = x;

  // Atualiza fórmula
  document.getElementById('fA1').textContent = a;
  document.getElementById('fB1').textContent = b;
  document.getElementById('fX1').textContent = x;

  // Calcula e exibe custo total
  const total = a * x + b;
  document.getElementById('resultCost1').textContent = fmtBR(total);

  // Redesenha o gráfico
  drawGraph1(a, b, x);
}

// Listeners dos sliders
[inputA1, inputB1, inputX1].forEach((el) =>
  el.addEventListener('input', updateSim1)
);

/** Desenha o gráfico da função afim no canvas 1 */
function drawGraph1(a, b, px) {
  // Ajuste para telas HiDPI (Retina)
  const W = 480, H = 360;
  const dpr = window.devicePixelRatio || 1;
  canvas1.width = W * dpr;
  canvas1.height = H * dpr;
  canvas1.style.width = W + 'px';
  canvas1.style.height = H + 'px';
  const ctx = ctx1;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);

  // Define escalas
  const xMax = Math.max(px * 1.5, 10);
  const yMax = a * xMax + b;
  const yMin = b;
  const padL = 55, padR = 20, padT = 25, padB = 40;
  const gw = W - padL - padR;
  const gh = H - padT - padB;

  // Converte coordenadas matemáticas para pixels
  function toCanvas(x, y) {
    return [
      padL + (x / xMax) * gw,
      padT + gh - ((y - yMin) / (yMax - yMin || 1)) * gh,
    ];
  }

  // Grade horizontal
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

  // Grade vertical
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

  // Rótulos dos eixos
  ctx.fillStyle = '#8892a8';
  ctx.font = 'bold 11px Inter,sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Quantidade (x)', padL + gw / 2, H - 5);
  ctx.save();
  ctx.translate(14, padT + gh / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Custo (R$)', 0, 0);
  ctx.restore();

  // Desenha a reta (com glow)
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

  // Ponto destacado (x atual)
  const [ppx, ppy] = toCanvas(px, a * px + b);

  ctx.beginPath();
  ctx.arc(ppx, ppy, 12, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(77,142,247,.2)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(ppx, ppy, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#4d8ef7';
  ctx.fill();

  // Linhas tracejadas até os eixos
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

  // Label do ponto
  ctx.fillStyle = '#e4e8f1';
  ctx.font = 'bold 12px JetBrains Mono,monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`(${px}, ${fmtBR(a * px + b)})`, ppx + 14, ppy - 10);
}

/* ==========================================================
   4. SIMULADOR 2º GRAU — Trajetória de Lançamento
   ========================================================== */

// Referências aos elementos
const inputA2 = document.getElementById('inputA2');
const inputB2 = document.getElementById('inputB2');
const inputC2 = document.getElementById('inputC2');
const canvas2 = document.getElementById('canvas2');
const ctx2 = canvas2.getContext('2d');

/** Atualiza valores, cálculos e redesenha o gráfico do simulador 2 */
function updateSim2() {
  let a = +inputA2.value;
  let b = +inputB2.value;
  let c = +inputC2.value;

  // Evita a = 0 (não seria mais função quadrática)
  if (a === 0) {
    a = 0.1;
    inputA2.value = 0.1;
  }

  // Atualiza displays dos sliders
  document.getElementById('valA2').textContent = fmt(a, 1);
  document.getElementById('valB2').textContent = fmt(b, 1);
  document.getElementById('valC2').textContent = fmt(c, 1);

  // Atualiza fórmula
  document.getElementById('fA2').textContent = fmt(a, 1);
  document.getElementById('fB2').textContent = fmt(b, 1);
  document.getElementById('fC2').textContent = fmt(c, 1);

  // Cálculos matemáticos
  const xv = -b / (2 * a);
  const yv = a * xv * xv + b * xv + c;
  const delta = b * b - 4 * a * c;

  // Exibe resultados
  document.getElementById('vx').textContent = fmt(xv);
  document.getElementById('vy').textContent = fmt(yv);
  document.getElementById('delta').textContent = fmt(delta);

  // Concavidade
  if (a < 0) {
    document.getElementById('concavidade').innerHTML =
      'Para baixo (∩) — <strong>Máximo</strong>';
  } else {
    document.getElementById('concavidade').innerHTML =
      'Para cima (∪) — <strong>Mínimo</strong>';
  }

  // Raízes
  let rText = '';
  if (delta > 0) {
    const r1 = (-b - Math.sqrt(delta)) / (2 * a);
    const r2 = (-b + Math.sqrt(delta)) / (2 * a);
    rText = `x₁ = ${fmt(Math.min(r1, r2))}  |  x₂ = ${fmt(Math.max(r1, r2))}`;
  } else if (delta === 0) {
    rText = `x = ${fmt(xv)} (raiz dupla)`;
  } else {
    rText = 'Não possui raízes reais (Δ < 0)';
  }
  document.getElementById('raizes').textContent = rText;

  // Redesenha o gráfico
  drawGraph2(a, b, c, xv, yv, delta);
}

// Listeners dos sliders
[inputA2, inputB2, inputC2].forEach((el) =>
  el.addEventListener('input', updateSim2)
);

/** Desenha a parábola no canvas 2 */
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

  // Calcula raízes (se existirem)
  let roots = [];
  if (delta >= 0) {
    roots.push((-b - Math.sqrt(delta)) / (2 * a));
    roots.push((-b + Math.sqrt(delta)) / (2 * a));
  }

  // Define intervalo de X com base nos pontos importantes
  let xPoints = [xv, 0, ...roots];
  let xMinV = Math.min(...xPoints) - 3;
  let xMaxV = Math.max(...xPoints) + 3;
  if (xMaxV - xMinV < 6) {
    const mid = (xMaxV + xMinV) / 2;
    xMinV = mid - 3;
    xMaxV = mid + 3;
  }

  // Amostra valores de Y para definir a escala
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

  // Padding e área útil
  const padL = 50, padR = 15, padT = 20, padB = 35;
  const gw = W - padL - padR;
  const gh = H - padT - padB;

  // Conversão de coordenadas
  function toC(x, y) {
    return [
      padL + ((x - xMinV) / (xMaxV - xMinV)) * gw,
      padT + gh - ((y - yMinV) / (yMaxV - yMinV)) * gh,
    ];
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

  // Eixos x=0 e y=0 (quando visíveis)
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

  // Parábola (com glow)
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

  // Vértice
  const [vcx, vcy] = toC(xv, yv);

  ctx.beginPath();
  ctx.arc(vcx, vcy, 13, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(52,211,153,.18)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(vcx, vcy, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#34d399';
  ctx.fill();

  // Linhas tracejadas do vértice
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = 'rgba(52,211,153,.3)';
  ctx.lineWidth = 1;
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
  ctx.fillStyle = '#e4e8f1';
  ctx.font = 'bold 11px JetBrains Mono,monospace';
  ctx.textAlign = 'left';
  const vLabel = a < 0 ? 'Máx' : 'Mín';
  ctx.fillText(
    `${vLabel} (${fmt(xv)}, ${fmt(yv)})`,
    vcx + 14,
    vcy + (a < 0 ? -12 : 18)
  );

  // Raízes
  if (delta >= 0) {
    roots.forEach((r) => {
      const [rx, ry] = toC(r, 0);
      ctx.beginPath();
      ctx.arc(rx, ry, 9, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(251,146,60,.15)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(rx, ry, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#fb923c';
      ctx.fill();
    });
  }

  // Labels dos eixos
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

/* ==========================================================
   5. INICIALIZAÇÃO
   ========================================================== */

// Renderiza os gráficos pela primeira vez
updateSim1();
updateSim2();

// Redesenha ao redimensionar a janela (para manter qualidade)
window.addEventListener('resize', () => {
  updateSim1();
  updateSim2();
});
