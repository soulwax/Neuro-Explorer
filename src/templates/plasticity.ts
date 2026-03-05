export const plasticity = `
<h1>Synaptic Plasticity</h1>
<p class="subtitle">Spike-Timing Dependent Plasticity (STDP) &mdash; how synapses learn causality</p>

<div class="form-grid">
{% for p in params %}
  <div>
    <label for="{{ p.key }}">{{ p.label }}{% if p.unit %} ({{ p.unit }}){% endif %}</label>
    <input type="number" id="{{ p.key }}" name="{{ p.key }}"
           value="{{ p.default }}" step="{{ p.step }}" class="param-input">
  </div>
{% endfor %}
</div>

<div style="margin:1rem 0">
  <button onclick="simulate()">Simulate</button>
  <span class="spinner" id="spinner"></span>
  <span id="direction" class="status hidden" style="margin-left:.75rem;display:inline-block"></span>
</div>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
  <div>
    <h2>STDP Curve</h2>
    <div class="chart-box">
      <svg id="stdp-curve" viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg">
        <text x="200" y="125" text-anchor="middle" fill="#6b7f99" font-size="12">Press Simulate</text>
      </svg>
    </div>
  </div>
  <div>
    <h2>Weight Evolution</h2>
    <div class="chart-box">
      <svg id="weight-chart" viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg">
        <text x="200" y="125" text-anchor="middle" fill="#6b7f99" font-size="12">Press Simulate</text>
      </svg>
    </div>
  </div>
</div>

<div id="explanation" class="hidden"></div>

<script>
async function simulate() {
  var btn = document.querySelector('button');
  var spinner = document.getElementById('spinner');
  btn.disabled = true;
  spinner.style.display = 'inline-block';

  var params = new URLSearchParams();
  document.querySelectorAll('.param-input').forEach(function(el) {
    params.set(el.name, el.value);
  });

  try {
    var res = await fetch('/plasticity?' + params.toString());
    var data = await res.json();
    drawSTDPCurve(data);
    drawWeightChart(data);
    showDirection(data);
    showExplanation(data);
  } catch(e) { console.error(e); }
  btn.disabled = false;
  spinner.style.display = 'none';
}

function drawSTDPCurve(data) {
  var svg = document.getElementById('stdp-curve');
  var W = 400, H = 250, pad = 40;
  var pts = data.stdpCurve;
  var maxDw = 0;
  pts.forEach(function(p) { maxDw = Math.max(maxDw, Math.abs(p.dw)); });
  if (maxDw === 0) maxDw = 0.01;

  var plotW = W - pad - 10;
  var plotH = H - 30;
  var midY = pad + plotH / 2;
  var xScale = plotW / 100;
  var yScale = (plotH / 2) / maxDw;

  var html = '';
  html += '<line x1="'+pad+'" y1="'+midY+'" x2="'+(W-10)+'" y2="'+midY+'" stroke="#1e2d4a"/>';
  var zeroX = pad + 50 * xScale;
  html += '<line x1="'+zeroX+'" y1="'+pad+'" x2="'+zeroX+'" y2="'+(H-20)+'" stroke="#1e2d4a" stroke-dasharray="4"/>';
  html += '<text x="'+zeroX+'" y="'+(H-5)+'" text-anchor="middle" fill="#6b7f99" font-size="9">dt = 0</text>';
  html += '<text x="'+(pad+10)+'" y="'+(H-5)+'" fill="#6b7f99" font-size="9">-50ms</text>';
  html += '<text x="'+(W-30)+'" y="'+(H-5)+'" fill="#6b7f99" font-size="9">+50ms</text>';
  html += '<text x="'+(pad-2)+'" y="'+(pad+10)+'" fill="#00e676" font-size="9" text-anchor="end">LTP</text>';
  html += '<text x="'+(pad-2)+'" y="'+(H-25)+'" fill="#ff5252" font-size="9" text-anchor="end">LTD</text>';

  var ltpPath = 'M' + zeroX + ' ' + midY;
  pts.forEach(function(p) {
    if (p.dt >= 0) {
      var x = pad + (p.dt + 50) * xScale;
      var y = midY - p.dw * yScale;
      ltpPath += ' L' + x.toFixed(1) + ' ' + y.toFixed(1);
    }
  });
  html += '<path d="'+ltpPath+'" fill="none" stroke="#00e676" stroke-width="2"/>';

  var ltdPath = '';
  pts.forEach(function(p) {
    if (p.dt <= 0) {
      var x = pad + (p.dt + 50) * xScale;
      var y = midY - p.dw * yScale;
      ltdPath += (ltdPath ? ' L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
  });
  html += '<path d="'+ltdPath+'" fill="none" stroke="#ff5252" stroke-width="2"/>';

  var dt = parseFloat(document.getElementById('deltaT').value);
  var markerX = pad + (dt + 50) * xScale;
  var markerDw = 0;
  pts.forEach(function(p) { if (p.dt === Math.round(dt)) markerDw = p.dw; });
  var markerY = midY - markerDw * yScale;
  html += '<circle cx="'+markerX+'" cy="'+markerY+'" r="4" fill="var(--primary)"/>';
  svg.innerHTML = html;
}

function drawWeightChart(data) {
  var svg = document.getElementById('weight-chart');
  var W = 400, H = 250, pad = 40;
  var pts = data.weightHistory;
  var count = pts.length;
  if (count === 0) return;

  var minW = 1, maxW = 0;
  pts.forEach(function(p) { if (p.weight < minW) minW = p.weight; if (p.weight > maxW) maxW = p.weight; });
  var range = maxW - minW || 0.1;
  minW -= range * 0.1; maxW += range * 0.1; range = maxW - minW;

  var plotW = W - pad - 10, plotH = H - 30;
  var xScale = plotW / count, yScale = plotH / range;

  var html = '';
  html += '<line x1="'+pad+'" y1="'+pad+'" x2="'+pad+'" y2="'+(H-20)+'" stroke="#1e2d4a"/>';
  html += '<line x1="'+pad+'" y1="'+(H-20)+'" x2="'+(W-10)+'" y2="'+(H-20)+'" stroke="#1e2d4a"/>';
  html += '<text x="'+((pad+W)/2)+'" y="'+(H-3)+'" text-anchor="middle" fill="#6b7f99" font-size="9">Spike Pair #</text>';

  var initY = H - 20 - (data.params.initialWeight - minW) * yScale;
  html += '<line x1="'+pad+'" y1="'+initY+'" x2="'+(W-10)+'" y2="'+initY+'" stroke="#1e2d4a" stroke-dasharray="4"/>';
  html += '<text x="'+(W-8)+'" y="'+(initY-3)+'" fill="#6b7f99" font-size="8" text-anchor="end">initial</text>';

  var color = data.direction === 'LTP' ? '#00e676' : '#ff5252';
  var pathD = pts.map(function(p, i) {
    var x = pad + (i + 0.5) * xScale;
    var y = H - 20 - (p.weight - minW) * yScale;
    return (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1);
  }).join(' ');
  html += '<path d="'+pathD+'" fill="none" stroke="'+color+'" stroke-width="2"/>';

  var lastPt = pts[pts.length - 1];
  var lastX = pad + (count - 0.5) * xScale;
  var lastY = H - 20 - (lastPt.weight - minW) * yScale;
  html += '<text x="'+lastX+'" y="'+(lastY-8)+'" text-anchor="end" fill="'+color+'" font-size="10" font-weight="600">' + lastPt.weight.toFixed(4) + '</text>';
  svg.innerHTML = html;
}

function showDirection(data) {
  var el = document.getElementById('direction');
  el.classList.remove('hidden', 'ltp', 'ltd');
  if (data.direction === 'LTP') {
    el.className = 'status ltp'; el.style.display = 'inline-block';
    el.textContent = 'LTP (strengthening) | Final: ' + data.finalWeight.toFixed(4);
  } else if (data.direction === 'LTD') {
    el.className = 'status ltd'; el.style.display = 'inline-block';
    el.textContent = 'LTD (weakening) | Final: ' + data.finalWeight.toFixed(4);
  } else {
    el.className = 'status'; el.style.display = 'inline-block';
    el.textContent = 'No change'; el.style.borderColor = 'var(--dim)';
  }
}

function showExplanation(data) {
  var el = document.getElementById('explanation');
  el.classList.remove('hidden');
  var exp = data.explanation;
  var html = '<div class="explanation"><h3>What happened</h3>';
  html += '<p>' + exp.stdpMechanism + '</p></div>';
  html += '<div class="explanation"><h3>Biological Basis</h3><ul>';
  exp.biologicalBasis.forEach(function(b) { html += '<li>' + b + '</li>'; });
  html += '</ul></div>';
  html += '<div class="explanation"><h3>Connection to AI</h3>';
  html += '<p>' + exp.connectionToAI + '</p></div>';
  el.innerHTML = html;
}

simulate();
</script>`;

export const plasticityParams = [
	{ key: 'deltaT', label: 'Spike Timing (dt)', unit: 'ms', default: 10, step: 1 },
	{ key: 'pairCount', label: 'Number of Pairs', unit: '', default: 60, step: 5 },
	{ key: 'initialWeight', label: 'Initial Weight', unit: '', default: 0.5, step: 0.05 },
	{ key: 'aPlus', label: 'A+ (LTP amplitude)', unit: '', default: 0.008, step: 0.001 },
	{ key: 'aMinus', label: 'A- (LTD amplitude)', unit: '', default: 0.0085, step: 0.001 },
	{ key: 'tauPlus', label: 'Tau+ (LTP window)', unit: 'ms', default: 20, step: 1 },
	{ key: 'tauMinus', label: 'Tau- (LTD window)', unit: 'ms', default: 20, step: 1 },
];
