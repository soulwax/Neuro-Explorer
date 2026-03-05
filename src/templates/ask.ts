export const ask = `
<h1>Neuro Tutor</h1>
<p class="subtitle">Socratic neuroscience tutor powered by Llama 3.1</p>

<div style="margin:1rem 0">
  <label for="topic">Topic (optional &mdash; improves accuracy)</label>
  <select id="topic">
    <option value="">General</option>
    {% for t in topics %}
      <option value="{{ t.id }}">{{ t.label }}</option>
    {% endfor %}
  </select>
</div>

<div style="margin:1rem 0">
  <label for="question">Your question</label>
  <textarea id="question" rows="3" placeholder="e.g., Why can't neurons fire during the refractory period?"></textarea>
</div>

<button onclick="askTutor()" id="ask-btn">Ask</button>
<span class="spinner" id="spinner"></span>

<div id="answer-box" class="hidden" style="margin-top:1.25rem">
  <h2>Response</h2>
  <div id="answer" class="result"></div>
</div>

<div style="margin-top:1.5rem">
  <h2>Try these</h2>
  <div class="grid" style="margin-top:.75rem">
  {% for ex in examples %}
    <div class="card" style="cursor:pointer" onclick="fillQuestion('{{ ex.topic }}', '{{ ex.question }}')">
      <h2>{{ ex.topicLabel }}</h2>
      <p>{{ ex.question }}</p>
    </div>
  {% endfor %}
  </div>
</div>

<script>
function fillQuestion(topic, question) {
  document.getElementById('topic').value = topic;
  document.getElementById('question').value = question;
  askTutor();
}

async function askTutor() {
  var btn = document.getElementById('ask-btn');
  var spinner = document.getElementById('spinner');
  var q = document.getElementById('question').value.trim();
  if (!q) return;

  btn.disabled = true;
  spinner.style.display = 'inline-block';

  var topic = document.getElementById('topic').value;
  var params = '?q=' + encodeURIComponent(q);
  if (topic) params += '&topic=' + encodeURIComponent(topic);

  try {
    var res = await fetch('/ask' + params);
    var data = await res.json();
    document.getElementById('answer').textContent = data.answer || JSON.stringify(data, null, 2);
    document.getElementById('answer-box').classList.remove('hidden');
  } catch(e) {
    document.getElementById('answer').textContent = 'Error: ' + e.message;
    document.getElementById('answer-box').classList.remove('hidden');
  }
  btn.disabled = false;
  spinner.style.display = 'none';
}
</script>`;

export const askData = {
	topics: [
		{ id: 'action-potential', label: 'Action Potentials' },
		{ id: 'synapse', label: 'Synaptic Transmission' },
		{ id: 'plasticity', label: 'Synaptic Plasticity' },
		{ id: 'visual-system', label: 'Visual System' },
		{ id: 'neural-coding', label: 'Neural Coding' },
		{ id: 'memory', label: 'Memory Systems' },
	],
	examples: [
		{ topic: 'action-potential', topicLabel: 'Action Potentials', question: 'Why is the action potential all-or-nothing?' },
		{ topic: 'plasticity', topicLabel: 'Plasticity', question: 'How does the NMDA receptor act as a coincidence detector?' },
		{ topic: 'memory', topicLabel: 'Memory', question: 'What did patient H.M. teach us about memory?' },
		{ topic: 'visual-system', topicLabel: 'Visual System', question: 'How is a convolutional neural network like the visual cortex?' },
	],
};
