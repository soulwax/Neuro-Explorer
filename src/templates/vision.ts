export const vision = `
<h1>Visual Cortex</h1>
<p class="subtitle">Image classification via ResNet-50, mapped to the ventral visual stream</p>

<div class="pipeline">
{% for s in stages %}
  <div class="stage" id="stage-{{ forloop.index0 }}">
    <div style="font-weight:600;color:var(--primary);font-size:.7rem">{{ s.cortical }}</div>
    <div style="color:var(--dim);font-size:.65rem;margin-top:.15rem">{{ s.resnet }}</div>
  </div>
  {% unless forloop.last %}
    <span class="arrow">&#9654;</span>
  {% endunless %}
{% endfor %}
</div>

<div class="flex-bar" style="margin:1.25rem 0">
  <div class="form-group">
    <label for="image-url">Image URL</label>
    <input type="url" id="image-url" placeholder="https://example.com/photo.jpg"
           value="https://darkfloor.org/_next/static/media/emily-the-strange.0685c7a0.png?dpl=dpl_HEfDjBvBhPRQdigyuUyVLxy6d9G8">
  </div>
  <button onclick="classify()" id="classify-btn">Classify</button>
  <span class="spinner" id="spinner"></span>
</div>

<div id="preview-area" class="hidden" style="margin:1rem 0">
  <img id="preview-img" style="max-width:300px;border-radius:8px;border:1px solid var(--border)">
</div>

<div id="results" class="hidden">
  <h2>Classifications</h2>
  <div id="classifications"></div>
</div>

<div class="explanation" style="margin-top:1.5rem">
  <h3>How this maps to your brain</h3>
  <ul>
  {% for s in stages %}
    <li><strong>{{ s.cortical }}:</strong> {{ s.biology }}</li>
  {% endfor %}
  </ul>
</div>

<div class="explanation">
  <h3>Skip connections = cortical feedback</h3>
  <p>ResNet's key innovation is residual (skip) connections that let signals bypass layers.
  Your brain does this too: V1 gets feedback from V2, V4, and even IT cortex.
  These top-down connections carry predictions and attention signals &mdash;
  central to predictive coding theory.</p>
</div>

<script>
async function classify() {
  var btn = document.getElementById('classify-btn');
  var spinner = document.getElementById('spinner');
  var url = document.getElementById('image-url').value.trim();
  if (!url) return;

  btn.disabled = true;
  spinner.style.display = 'inline-block';

  var preview = document.getElementById('preview-area');
  var img = document.getElementById('preview-img');
  img.src = url;
  preview.classList.remove('hidden');

  var stages = document.querySelectorAll('.stage');
  for (var i = 0; i < stages.length; i++) stages[i].classList.remove('active');
  var stageIdx = 0;
  var interval = setInterval(function() {
    if (stageIdx > 0) stages[stageIdx - 1].classList.remove('active');
    if (stageIdx < stages.length) { stages[stageIdx].classList.add('active'); stageIdx++; }
    else clearInterval(interval);
  }, 400);

  try {
    var res = await fetch('/vision?url=' + encodeURIComponent(url));
    var data = await res.json();
    clearInterval(interval);
    stages.forEach(function(s) { s.classList.add('active'); });

    if (data.error) {
      var errorHtml = '<div class="result" style="color:var(--danger)"><strong>Error:</strong> ' + data.error + '</div>';
      if (data.suggestion) {
        errorHtml += '<div style="margin-top:.5rem;padding:.75rem;background:rgba(255,100,100,0.1);border-radius:4px;font-size:.85rem;color:var(--text)">💡 ' + data.suggestion + '</div>';
      }
      if (data.details) {
        errorHtml += '<details style="margin-top:.5rem;font-size:.75rem;color:var(--dim)"><summary>Technical details</summary><pre>' + JSON.stringify(data.details, null, 2) + '</pre></details>';
      }
      document.getElementById('classifications').innerHTML = errorHtml;
    } else {
      var cls = data.classifications || [];
      var html = '<div style="margin:.75rem 0">';
      cls.forEach(function(c) {
        var pct = (c.score * 100).toFixed(1);
        html += '<div style="display:flex;align-items:center;margin:.4rem 0">';
        html += '<span style="width:160px;font-size:.85rem;color:var(--text)">' + c.label + '</span>';
        html += '<div style="flex:1;height:20px;background:var(--bg);border-radius:3px;overflow:hidden;margin:0 .75rem">';
        html += '<div style="height:100%;width:' + pct + '%;background:var(--primary);border-radius:3px;transition:width .3s"></div>';
        html += '</div>';
        html += '<span style="font-family:var(--mono);font-size:.8rem;color:var(--dim);min-width:45px">' + pct + '%</span>';
        html += '</div>';
      });
      html += '</div>';
      document.getElementById('classifications').innerHTML = html;
    }
    document.getElementById('results').classList.remove('hidden');
  } catch(e) {
    clearInterval(interval);
    document.getElementById('classifications').innerHTML =
      '<div class="result" style="color:var(--danger)">Error: ' + e.message + '</div>';
    document.getElementById('results').classList.remove('hidden');
  }
  btn.disabled = false;
  spinner.style.display = 'none';
}
</script>`;

export const visionStages = [
	{
		cortical: 'V1',
		resnet: 'Conv1',
		biology: 'Oriented edges, contrast. Hubel & Wiesel (1962) showed V1 neurons fire for specific edge orientations.',
	},
	{ cortical: 'V2', resnet: 'Block 1', biology: 'Corners, texture boundaries, illusory contours. V2 neurons detect border ownership.' },
	{
		cortical: 'V4',
		resnet: 'Block 2',
		biology: 'Color constancy, curvature. Damage to V4 causes achromatopsia (loss of color perception).',
	},
	{
		cortical: 'Post. IT',
		resnet: 'Block 3',
		biology: 'Object parts, face components. Posterior IT encodes complex features like eyes, mouths, limbs.',
	},
	{ cortical: 'Ant. IT', resnet: 'Block 4', biology: 'Whole objects, view-invariant. The fusiform face area (FFA) is here.' },
	{
		cortical: 'PFC',
		resnet: 'FC Layer',
		biology: 'Category decision. Prefrontal cortex maps object representations to task-relevant labels.',
	},
];
