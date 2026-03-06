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

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:1rem;margin-bottom:1rem">
  <div class="chart-box">
    <h2>3D Cardiac Activation</h2>
    <svg id="heart-activation" viewBox="0 0 360 280" xmlns="http://www.w3.org/2000/svg">
      <text x="180" y="140" text-anchor="middle" fill="#6b7f99" font-size="12">Press Generate ECG</text>
    </svg>
  </div>
  <div class="chart-box">
    <h2>Lead Constellation</h2>
    <svg id="lead-constellation" viewBox="0 0 360 280" xmlns="http://www.w3.org/2000/svg">
      <text x="180" y="140" text-anchor="middle" fill="#6b7f99" font-size="12">Press Generate ECG</text>
    </svg>
  </div>
</div>

<div class="chart-box">
  <div class="flex-bar" style="align-items:center">
    <div class="form-group" style="min-width:260px">
      <label for="frame-scrubber">Representative Beat Phase</label>
      <input id="frame-scrubber" type="range" min="0" max="120" value="0" step="1">
    </div>
    <div id="frame-label" style="color:var(--dim);font-size:.85rem">Generate ECG to animate a beat through all 12 leads.</div>
  </div>
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
var ecgAnimation = { frames: [], leadAxes: [], beatMs: 0, index: 0 };
var ecgTimer = null;

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

function project3D(point, cx, cy, scale) {
  return {
    x: cx + point.x * scale + point.z * scale * 0.42,
    y: cy - point.y * scale - point.z * scale * 0.24
  };
}

function lerpColor(c1, c2, amount) {
  var a = Math.max(0, Math.min(1, amount));
  var r = Math.round(c1[0] + (c2[0] - c1[0]) * a);
  var g = Math.round(c1[1] + (c2[1] - c1[1]) * a);
  var b = Math.round(c1[2] + (c2[2] - c1[2]) * a);
  return 'rgb(' + r + ',' + g + ',' + b + ')';
}

function activationFill(intensity, palette) {
  return lerpColor([19, 26, 43], palette, intensity);
}

function drawHeartActivation(frame, allFrames) {
  var svg = document.getElementById('heart-activation');
  var W = 360, H = 280;
  var cx = 182, cy = 146, scale = 84;
  var heartLoop = '';
  var html = '';

  var chambers = [
    { key: 'atria', x: -0.46, y: 0.78, z: 0.14, rx: 28, ry: 22, color: [79, 195, 247], label: 'RA/LA' },
    { key: 'septum', x: 0.02, y: 0.18, z: 0.04, rx: 18, ry: 44, color: [255, 209, 102], label: 'Septum' },
    { key: 'rightVentricle', x: -0.34, y: -0.26, z: 0.34, rx: 30, ry: 48, color: [255, 107, 107], label: 'RV' },
    { key: 'leftVentricle', x: 0.4, y: -0.22, z: -0.14, rx: 34, ry: 56, color: [0, 230, 118], label: 'LV' },
    { key: 'repolarization', x: 0.12, y: -0.58, z: -0.08, rx: 56, ry: 24, color: [124, 77, 255], label: 'T' }
  ];

  html += '<rect x="12" y="12" width="336" height="256" rx="16" fill="#0d1424" stroke="#1e2d4a"/>';

  allFrames.forEach(function(sample, index) {
    var p = project3D(sample.vector, cx, cy, scale * 0.5);
    heartLoop += (index === 0 ? 'M' : 'L') + p.x.toFixed(2) + ' ' + p.y.toFixed(2);
  });
  html += '<path d="' + heartLoop + '" fill="none" stroke="rgba(79,195,247,0.26)" stroke-width="1.2"/>';

  html += '<path d="M180 76 C138 34 88 58 88 116 C88 154 118 178 145 200 C162 214 172 228 180 246 C188 228 198 214 215 200 C242 178 272 154 272 116 C272 58 222 34 180 76Z" fill="#141f35" stroke="#233557" stroke-width="1.2"/>';
  html += '<path d="M198 82 C228 58 258 70 266 104 C272 132 252 162 221 184 C205 195 194 206 186 219 C198 190 204 162 206 130 C207 111 205 96 198 82Z" fill="rgba(255,255,255,0.03)"/>';

  chambers.forEach(function(chamber) {
    var projected = project3D({ x: chamber.x, y: chamber.y, z: chamber.z }, cx, cy, scale);
    var intensity = frame.regions[chamber.key];
    html += '<ellipse cx="' + projected.x.toFixed(2) + '" cy="' + projected.y.toFixed(2) + '" rx="' + chamber.rx + '" ry="' + chamber.ry + '" fill="' + activationFill(intensity, chamber.color) + '" stroke="rgba(200,214,229,0.18)" stroke-width="1"/>';
    html += '<text x="' + projected.x.toFixed(2) + '" y="' + (projected.y + 4).toFixed(2) + '" text-anchor="middle" fill="#c8d6e5" font-size="10">' + chamber.label + '</text>';
  });

  var origin = project3D({ x: 0, y: 0, z: 0 }, cx, cy, scale * 0.55);
  var tip = project3D(frame.vector, cx, cy, scale * 0.55);
  html += '<line x1="' + origin.x.toFixed(2) + '" y1="' + origin.y.toFixed(2) + '" x2="' + tip.x.toFixed(2) + '" y2="' + tip.y.toFixed(2) + '" stroke="#ffd166" stroke-width="3" stroke-linecap="round"/>';
  html += '<circle cx="' + tip.x.toFixed(2) + '" cy="' + tip.y.toFixed(2) + '" r="4.5" fill="#ffd166"/>';
  html += '<text x="28" y="28" fill="#6b7f99" font-size="11">Phase: ' + frame.phase + '</text>';
  html += '<text x="28" y="44" fill="#6b7f99" font-size="11">Dominant lead: ' + frame.dominantLead + '</text>';
  html += '<text x="28" y="60" fill="#6b7f99" font-size="11">Vector magnitude: ' + frame.vector.magnitude.toFixed(3) + '</text>';
  svg.innerHTML = html;
}

function drawLeadConstellation(frame, activation) {
  var svg = document.getElementById('lead-constellation');
  var W = 360, H = 280;
  var cx = 182, cy = 146, scale = 86;
  var html = '';
  var loopPath = '';

  html += '<rect x="12" y="12" width="336" height="256" rx="16" fill="#0d1424" stroke="#1e2d4a"/>';

  activation.frames.forEach(function(sample, index) {
    var p = project3D(sample.vector, cx, cy, scale * 0.42);
    loopPath += (index === 0 ? 'M' : 'L') + p.x.toFixed(2) + ' ' + p.y.toFixed(2);
  });
  html += '<path d="' + loopPath + '" fill="none" stroke="rgba(0,230,118,0.34)" stroke-width="1.4"/>';

  activation.leadAxes.forEach(function(axis) {
    var end = project3D(axis, cx, cy, scale);
    var stroke = axis.group === 'limb' ? '#4fc3f7' : '#ff8a65';
    html += '<line x1="' + cx + '" y1="' + cy + '" x2="' + end.x.toFixed(2) + '" y2="' + end.y.toFixed(2) + '" stroke="' + stroke + '" stroke-width="1.2" opacity="0.75"/>';
    html += '<circle cx="' + end.x.toFixed(2) + '" cy="' + end.y.toFixed(2) + '" r="4" fill="' + stroke + '"/>';
    html += '<text x="' + (end.x + 7).toFixed(2) + '" y="' + (end.y - 5).toFixed(2) + '" fill="#c8d6e5" font-size="10">' + axis.name + '</text>';
  });

  var tip = project3D(frame.vector, cx, cy, scale * 0.55);
  html += '<circle cx="' + cx + '" cy="' + cy + '" r="5" fill="#c8d6e5"/>';
  html += '<line x1="' + cx + '" y1="' + cy + '" x2="' + tip.x.toFixed(2) + '" y2="' + tip.y.toFixed(2) + '" stroke="#ffd166" stroke-width="3" stroke-linecap="round"/>';
  html += '<circle cx="' + tip.x.toFixed(2) + '" cy="' + tip.y.toFixed(2) + '" r="5" fill="#ffd166"/>';
  html += '<text x="24" y="28" fill="#6b7f99" font-size="11">Limb leads: cyan</text>';
  html += '<text x="24" y="44" fill="#6b7f99" font-size="11">Chest leads: orange</text>';
  html += '<text x="24" y="60" fill="#6b7f99" font-size="11">Projection on ' + frame.dominantLead + ': ' + frame.dominantProjection.toFixed(3) + '</text>';
  svg.innerHTML = html;
}

function renderActivationFrame(index) {
  if (!ecgAnimation.frames.length) return;
  var frame = ecgAnimation.frames[index];
  drawHeartActivation(frame, ecgAnimation.frames);
  drawLeadConstellation(frame, ecgAnimation);

  var label = document.getElementById('frame-label');
  label.textContent = 't=' + frame.t.toFixed(1) + ' ms | ' + frame.phase + ' | strongest view ' + frame.dominantLead + ' (' + frame.dominantProjection.toFixed(3) + ')';
}

function startActivationAnimation(activation) {
  ecgAnimation = activation;
  ecgAnimation.index = 0;

  var scrubber = document.getElementById('frame-scrubber');
  scrubber.max = String(Math.max(activation.frames.length - 1, 0));
  scrubber.value = '0';
  renderActivationFrame(0);

  if (ecgTimer) {
    clearInterval(ecgTimer);
  }

  ecgTimer = setInterval(function() {
    if (!ecgAnimation.frames.length) return;
    ecgAnimation.index = (ecgAnimation.index + 1) % ecgAnimation.frames.length;
    scrubber.value = String(ecgAnimation.index);
    renderActivationFrame(ecgAnimation.index);
  }, Math.max(35, Math.round(activation.beatMs / Math.max(activation.frames.length, 1))));
}

document.getElementById('frame-scrubber').addEventListener('input', function(event) {
  if (!ecgAnimation.frames.length) return;
  ecgAnimation.index = parseInt(event.target.value, 10) || 0;
  renderActivationFrame(ecgAnimation.index);
});

function renderExplanation(data) {
  var el = document.getElementById('explanation');
  el.classList.remove('hidden');

  var s = data.summary;
  var e = data.explanation;

  var html = '';
  html += '<div class="explanation"><h3>Rhythm Summary</h3>';
  html += '<p>' + s.dominantRhythm + '. Estimated beats: ' + s.beatsEstimated + '. RR: ' + s.rrMsNominal.toFixed(1) + ' ms. QTc (Bazett): ' + s.qtcBazettMs.toFixed(1) + ' ms. Axis: ' + s.electricalAxis + '.</p>';
  html += '</div>';
  html += '<div class="explanation"><h3>3D View</h3>';
  html += '<p>The animated heart view is not a separate toy model. It replays the same dipole that generated the 12 traces and shows which lead is most aligned with the instantaneous cardiac vector.</p>';
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

      startActivationAnimation(data.activation);
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
