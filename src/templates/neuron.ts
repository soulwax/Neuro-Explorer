export const neuron = `
<h1>Neuron Simulation</h1>
<p class="subtitle">Leaky Integrate-and-Fire model &mdash; the simplest biophysically-motivated spiking neuron</p>

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
  <span id="firing-rate" style="margin-left:1rem;color:var(--success);font-family:var(--mono)"></span>
</div>

<div class="chart-box">
  <svg id="voltage-chart" viewBox="0 0 800 280" xmlns="http://www.w3.org/2000/svg">
    <text x="400" y="140" text-anchor="middle" fill="#6b7f99" font-size="14">
      Press Simulate to see the voltage trace
    </text>
  </svg>
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
    var res = await fetch('/neuron?' + params.toString());
    var data = await res.json();
    drawChart(data);
    showExplanation(data);
    document.getElementById('firing-rate').textContent =
      data.spikeTimes.length + ' spikes | ' + data.firingRate.toFixed(1) + ' Hz';
  } catch(e) {
    document.getElementById('firing-rate').textContent = 'Error: ' + e.message;
  }
  btn.disabled = false;
  spinner.style.display = 'none';
}

function drawChart(data) {
  var svg = document.getElementById('voltage-chart');
  var W = 800, H = 280, pad = 35;
  var pW = W - pad, pH = H - 20;
  var pts = data.timeSeries;
  var dur = data.params.duration;
  var yMin = -85, yMax = 50;
  var xScale = pW / dur;
  var yScale = pH / (yMax - yMin);

  var restY = H - 10 - (data.params.restingPotential - yMin) * yScale;
  var thrY = H - 10 - (data.params.threshold - yMin) * yScale;

  var pathD = pts.map(function(p, i) {
    var x = pad + p.t * xScale;
    var y = H - 10 - (p.voltage - yMin) * yScale;
    return (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1);
  }).join(' ');

  var html = '';
  html += '<line x1="'+pad+'" y1="10" x2="'+pad+'" y2="'+(H-10)+'" stroke="#1e2d4a" stroke-width="1"/>';
  html += '<line x1="'+pad+'" y1="'+(H-10)+'" x2="'+W+'" y2="'+(H-10)+'" stroke="#1e2d4a" stroke-width="1"/>';
  html += '<line x1="'+pad+'" y1="'+restY+'" x2="'+W+'" y2="'+restY+'" stroke="#1e2d4a" stroke-dasharray="4"/>';
  html += '<text x="'+(pad+4)+'" y="'+(restY-4)+'" fill="#6b7f99" font-size="10">-70mV rest</text>';
  html += '<line x1="'+pad+'" y1="'+thrY+'" x2="'+W+'" y2="'+thrY+'" stroke="#ff5252" stroke-dasharray="4" opacity=".5"/>';
  html += '<text x="'+(pad+4)+'" y="'+(thrY-4)+'" fill="#ff5252" font-size="10">-55mV threshold</text>';
  data.spikeTimes.forEach(function(t) {
    var x = pad + t * xScale;
    html += '<line x1="'+x+'" y1="10" x2="'+x+'" y2="'+(H-10)+'" stroke="#00e676" opacity=".15"/>';
  });
  html += '<path d="'+pathD+'" fill="none" stroke="#4fc3f7" stroke-width="1.5"/>';
  html += '<text x="'+((pad+W)/2)+'" y="'+(H)+'" text-anchor="middle" fill="#6b7f99" font-size="10">Time (ms)</text>';
  html += '<text x="12" y="'+((H)/2)+'" fill="#6b7f99" font-size="10" transform="rotate(-90,12,'+((H)/2)+')">mV</text>';
  svg.innerHTML = html;
}

function showExplanation(data) {
  var el = document.getElementById('explanation');
  el.classList.remove('hidden');
  var exp = data.explanation;
  var html = '<div class="explanation"><h3>' + exp.model + '</h3><ul>';
  exp.whatToNotice.forEach(function(note) { html += '<li>' + note + '</li>'; });
  html += '</ul></div>';
  html += '<div class="explanation"><h3>Biological Analogies</h3><ul>';
  Object.keys(exp.biologicalAnalogies).forEach(function(key) {
    html += '<li><strong>' + key + ':</strong> ' + exp.biologicalAnalogies[key] + '</li>';
  });
  html += '</ul></div>';
  el.innerHTML = html;
}

simulate();
</script>`;

export const neuronParams = [
	{ key: 'inputCurrent', label: 'Input Current', unit: 'nA', default: 2.0, step: 0.1 },
	{ key: 'tau', label: 'Membrane Time Constant', unit: 'ms', default: 20, step: 1 },
	{ key: 'threshold', label: 'Spike Threshold', unit: 'mV', default: -55, step: 1 },
	{ key: 'restingPotential', label: 'Resting Potential', unit: 'mV', default: -70, step: 1 },
	{ key: 'resetPotential', label: 'Reset Potential', unit: 'mV', default: -75, step: 1 },
	{ key: 'duration', label: 'Duration', unit: 'ms', default: 100, step: 10 },
	{ key: 'refractoryPeriod', label: 'Refractory Period', unit: 'ms', default: 2, step: 0.5 },
	{ key: 'dt', label: 'Timestep', unit: 'ms', default: 0.1, step: 0.05 },
];
