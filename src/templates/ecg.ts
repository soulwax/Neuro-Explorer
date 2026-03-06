export const ecg = `
<h1>12-Lead ECG Explorer</h1>
<p class="subtitle">Tweak rhythm, conduction, axis, and morphology to see how all 12 leads respond.</p>

<div class="form-grid">
{% for p in params %}
  <div>
    <label for="{{ p.key }}">{{ p.label }}{% if p.unit %} ({{ p.unit }}){% endif %}</label>
    <input
      type="number"
      id="{{ p.key }}"
      name="{{ p.key }}"
      value="{{ p.default }}"
      step="{{ p.step }}"
      min="{{ p.min }}"
      max="{{ p.max }}"
      class="param-input">
  </div>
{% endfor %}
</div>

<div style="margin:.9rem 0 1.1rem 0">
  <button id="ecg-btn" onclick="simulateECG()">Generate ECG</button>
  <span class="spinner" id="spinner"></span>
  <span id="meta" style="margin-left:.85rem;color:var(--dim);font-size:.85rem"></span>
</div>

<div id="lead-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(245px,1fr));gap:.75rem">
{% for lead in leads %}
  <div class="chart-box" style="margin:0">
    <h3 style="margin-bottom:.45rem">{{ lead }}</h3>
    <svg id="lead-{{ lead }}" viewBox="0 0 320 130" xmlns="http://www.w3.org/2000/svg">
      <text x="160" y="68" text-anchor="middle" fill="#6b7f99" font-size="11">Press Generate ECG</text>
    </svg>
  </div>
{% endfor %}
</div>

<div id="explanation" class="hidden"></div>

<script>
var LEADS = [{% for lead in leads %}'{{ lead }}'{% unless forloop.last %}, {% endunless %}{% endfor %}];

function collectParams() {
  var params = new URLSearchParams();
  document.querySelectorAll('.param-input').forEach(function(el) {
    params.set(el.name, el.value);
  });
  return params;
}

function drawLead(svg, points, durationMs) {
  var W = 320, H = 130, pad = 12;
  var zeroY = H / 2;
  var yMax = 2.0;
  var yMin = -2.0;
  var xScale = (W - pad * 2) / durationMs;
  var yScale = (H - 20) / (yMax - yMin);

  var html = '';

  for (var t = 0; t <= durationMs; t += 200) {
    var gx = pad + t * xScale;
    html += '<line x1="' + gx.toFixed(2) + '" y1="10" x2="' + gx.toFixed(2) + '" y2="' + (H - 10) + '" stroke="#1e2d4a" stroke-width="0.7"/>';
  }

  for (var mv = -1.5; mv <= 1.5; mv += 0.5) {
    var gy = H - 10 - (mv - yMin) * yScale;
    html += '<line x1="' + pad + '" y1="' + gy.toFixed(2) + '" x2="' + (W - pad) + '" y2="' + gy.toFixed(2) + '" stroke="#1a243b" stroke-width="0.6"/>';
  }

  html += '<line x1="' + pad + '" y1="' + zeroY.toFixed(2) + '" x2="' + (W - pad) + '" y2="' + zeroY.toFixed(2) + '" stroke="#2f4f78" stroke-width="1"/>';

  var path = '';
  for (var i = 0; i < points.length; i++) {
    var p = points[i];
    var x = pad + p.t * xScale;
    var y = H - 10 - (p.mv - yMin) * yScale;
    path += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2);
  }
  html += '<path d="' + path + '" fill="none" stroke="#4fc3f7" stroke-width="1.3"/>';
  svg.innerHTML = html;
}

function renderExplanation(data) {
  var el = document.getElementById('explanation');
  el.classList.remove('hidden');

  var s = data.summary;
  var e = data.explanation;

  var html = '';
  html += '<div class="explanation"><h3>Rhythm Summary</h3>';
  html += '<p>' + s.dominantRhythm + '. Estimated beats: ' + s.beatsEstimated + '. RR: ' + s.rrMsNominal.toFixed(1) + ' ms. QTc (Bazett): ' + s.qtcBazettMs.toFixed(1) + ' ms. Axis: ' + s.electricalAxis + '.</p>';
  html += '</div>';
  html += '<div class="explanation"><h3>Model Notes</h3><ul>';
  e.notes.forEach(function(note) { html += '<li>' + note + '</li>'; });
  html += '</ul></div>';
  el.innerHTML = html;
}

async function simulateECG() {
  var btn = document.getElementById('ecg-btn');
  var spinner = document.getElementById('spinner');
  var meta = document.getElementById('meta');
  btn.disabled = true;
  spinner.style.display = 'inline-block';
  meta.textContent = 'Computing 12-lead trace...';

  try {
    var params = collectParams();
    var res = await fetch('/ecg?' + params.toString());
    var data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(data.error || ('Request failed: ' + res.status));
    }

    LEADS.forEach(function(lead) {
      var svg = document.getElementById('lead-' + lead);
      drawLead(svg, data.leads[lead], data.params.duration);
    });

    meta.textContent = 'Axis: ' + data.summary.electricalAxis + ' | QTc: ' + data.summary.qtcBazettMs.toFixed(1) + ' ms';
    renderExplanation(data);
  } catch (err) {
    meta.textContent = 'Error: ' + err.message;
  }

  btn.disabled = false;
  spinner.style.display = 'none';
}

simulateECG();
</script>`;

export const ecgParams = [
	{ key: 'heartRate', label: 'Heart Rate', unit: 'bpm', default: 72, step: 1, min: 30, max: 220 },
	{ key: 'axisDegrees', label: 'Electrical Axis', unit: 'deg', default: 45, step: 1, min: -180, max: 180 },
	{ key: 'prInterval', label: 'PR Interval', unit: 'ms', default: 160, step: 5, min: 80, max: 320 },
	{ key: 'qrsDuration', label: 'QRS Duration', unit: 'ms', default: 95, step: 1, min: 50, max: 220 },
	{ key: 'qtInterval', label: 'QT Interval', unit: 'ms', default: 380, step: 5, min: 220, max: 700 },
	{ key: 'pAmp', label: 'P Amplitude', unit: 'mV', default: 0.14, step: 0.01, min: 0, max: 0.5 },
	{ key: 'qrsAmp', label: 'QRS Amplitude', unit: 'mV', default: 1.1, step: 0.05, min: 0.2, max: 3 },
	{ key: 'tAmp', label: 'T Amplitude', unit: 'mV', default: 0.34, step: 0.01, min: 0, max: 1.2 },
	{ key: 'stShift', label: 'ST Shift', unit: 'mV', default: 0, step: 0.01, min: -0.5, max: 0.5 },
	{ key: 'rhythmIrregularity', label: 'Rhythm Variability', unit: '', default: 0.04, step: 0.01, min: 0, max: 0.25 },
	{ key: 'precordialRotation', label: 'Precordial Rotation', unit: 'deg', default: 0, step: 1, min: -45, max: 45 },
	{ key: 'baselineWander', label: 'Baseline Wander', unit: 'mV', default: 0.045, step: 0.005, min: 0, max: 0.25 },
	{ key: 'noise', label: 'Noise', unit: 'mV', default: 0.015, step: 0.005, min: 0, max: 0.15 },
	{ key: 'gain', label: 'Gain', unit: 'x', default: 1, step: 0.05, min: 0.25, max: 3 },
	{ key: 'duration', label: 'Duration', unit: 'ms', default: 6000, step: 250, min: 1500, max: 12000 },
	{ key: 'dt', label: 'Sample Step', unit: 'ms', default: 4, step: 1, min: 1, max: 10 },
];

export const ecgLeads = ['I', 'II', 'III', 'aVR', 'aVL', 'aVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6'];
