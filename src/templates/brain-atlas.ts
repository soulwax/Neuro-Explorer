export const brainAtlas = `
<style>
  .atlas-shell{display:grid;grid-template-columns:minmax(320px,1.05fr) minmax(300px,.95fr);gap:1rem}
  .atlas-summary{display:flex;gap:.7rem;flex-wrap:wrap;align-items:center;margin-bottom:1rem}
  .atlas-summary .chapter-btn{background:transparent;color:var(--dim);border:1px solid var(--border);padding:.55rem .8rem}
  .atlas-summary .chapter-btn.active{background:rgba(79,195,247,.12);color:var(--primary);border-color:rgba(79,195,247,.35)}
  .atlas-summary .chapter-copy{flex:1;min-width:220px;color:var(--dim);font-size:.88rem}
  .atlas-region-grid{display:flex;flex-wrap:wrap;gap:.45rem;margin-top:.85rem}
  .atlas-region-grid button{background:#0d1424;color:var(--text);border:1px solid var(--border);padding:.45rem .6rem;border-radius:999px}
  .atlas-region-grid button.active{border-color:var(--primary);color:var(--primary);background:rgba(79,195,247,.08)}
  .atlas-legend{display:flex;gap:.55rem;flex-wrap:wrap;margin-top:.8rem}
  .atlas-legend span{display:inline-flex;gap:.35rem;align-items:center;font-size:.78rem;color:var(--dim)}
  .atlas-legend i{display:inline-block;width:10px;height:10px;border-radius:999px}
  .atlas-detail-list,.atlas-note-list{margin:.55rem 0 0 1rem}
  .atlas-detail-list li,.atlas-note-list li{color:var(--dim);font-size:.88rem;margin-bottom:.28rem}
  .atlas-kicker{display:inline-block;padding:.18rem .5rem;border-radius:999px;border:1px solid var(--border);color:var(--primary);font-size:.73rem;margin-bottom:.7rem}
  .atlas-systems{display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.8rem}
  .atlas-systems span{padding:.22rem .5rem;border-radius:999px;background:#0d1424;border:1px solid var(--border);color:var(--text);font-size:.76rem}
  .atlas-interlinks{display:grid;gap:.6rem;margin-top:.9rem}
  .atlas-link-card{background:#0d1424;border:1px solid var(--border);border-radius:10px;padding:.8rem}
  .atlas-link-card strong{display:block;color:var(--primary);font-size:.85rem;margin-bottom:.18rem}
  .atlas-link-card p{color:var(--dim);font-size:.84rem}
  .atlas-note-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.75rem}
  @media(max-width:900px){.atlas-shell{grid-template-columns:1fr}}
</style>

<h1>Brain Atlas</h1>
<p class="subtitle">Chapter 1 maps major brain regions to their core functions. Chapter 2 shows how those same regions only make sense once you follow their loops, relays, and feedback paths.</p>

<div class="chart-box">
  <div class="atlas-summary">
    <button class="chapter-btn active" id="chapter-functions" onclick="setAtlasChapter('functions')">Chapter 1</button>
    <button class="chapter-btn" id="chapter-interlinks" onclick="setAtlasChapter('interlinks')">Chapter 2</button>
    <div class="chapter-copy" id="chapter-copy">Load the atlas to compare regional specialization with network integration.</div>
  </div>
  <div class="atlas-legend" id="atlas-legend"></div>
  <div class="atlas-region-grid" id="atlas-region-grid"></div>
</div>

<div class="atlas-shell">
  <div class="chart-box" style="margin:0">
    <h2 id="atlas-map-title">Functional Map</h2>
    <svg id="atlas-map" viewBox="0 0 360 280" xmlns="http://www.w3.org/2000/svg">
      <text x="180" y="140" text-anchor="middle" fill="#6b7f99" font-size="12">Loading brain atlas...</text>
    </svg>
  </div>

  <div class="chart-box" style="margin:0">
    <h2 id="atlas-detail-title">Region Detail</h2>
    <div id="atlas-detail">Loading regional detail...</div>
  </div>
</div>

<div class="chart-box">
  <h2 id="atlas-network-title">Circuit Context</h2>
  <div id="atlas-network">Loading systems view...</div>
</div>

<script>
var atlasState = {
  data: null,
  chapter: 'functions',
  regionId: 'prefrontal'
};

var BRAIN_OUTLINE = 'M58 136 C70 78 122 46 184 44 C258 42 320 78 332 128 C344 172 318 208 282 224 C248 240 214 242 188 244 C158 246 136 262 112 260 C94 258 80 244 78 222 C54 206 46 176 58 136Z';
var CEREBELLUM_OUTLINE = 'M262 196 C278 180 304 180 318 198 C326 210 326 228 312 238 C296 250 270 246 258 228 C250 216 252 204 262 196Z';
var BRAINSTEM_OUTLINE = 'M212 190 C228 188 238 198 240 212 C242 228 236 246 224 254 C214 260 200 256 198 242 C196 228 200 196 212 190Z';

function atlasCategory(region) {
  return atlasState.data.categories.find(function(category) { return category.id === region.category; });
}

function regionById(id) {
  return atlasState.data.regions.find(function(region) { return region.id === id; });
}

function selectedRegion() {
  return regionById(atlasState.regionId) || atlasState.data.regions[0];
}

function regionColor(region, active, linked) {
  var category = atlasCategory(region);
  if (active) return category.color;
  if (linked) return 'rgba(255, 209, 102, 0.95)';
  return 'rgba(200, 214, 229, 0.22)';
}

function buildLegend() {
  var el = document.getElementById('atlas-legend');
  var html = '';
  atlasState.data.categories.forEach(function(category) {
    html += '<span><i style="background:' + category.color + '"></i>' + category.name + '</span>';
  });
  el.innerHTML = html;
}

function buildRegionPicker() {
  var el = document.getElementById('atlas-region-grid');
  var html = '';
  atlasState.data.regions.forEach(function(region) {
    var active = region.id === atlasState.regionId ? ' active' : '';
    html += '<button class="' + active.trim() + '" onclick="setAtlasRegion(\\'' + region.id + '\\')">' + region.shortLabel + ' ' + region.name + '</button>';
  });
  el.innerHTML = html;
}

function drawAtlasMap() {
  var svg = document.getElementById('atlas-map');
  var region = selectedRegion();
  var linkedTargets = region.chapter2.interlinks.map(function(link) { return link.target; });
  var html = '';

  html += '<rect x="12" y="12" width="336" height="256" rx="16" fill="#0d1424" stroke="#1e2d4a"/>';
  html += '<path d="' + BRAIN_OUTLINE + '" fill="#141c30" stroke="#243755" stroke-width="1.2"/>';
  html += '<path d="' + CEREBELLUM_OUTLINE + '" fill="#182438" stroke="#274567" stroke-width="1"/>';
  html += '<path d="' + BRAINSTEM_OUTLINE + '" fill="#182438" stroke="#274567" stroke-width="1"/>';

  if (atlasState.chapter === 'interlinks') {
    region.chapter2.interlinks.forEach(function(link) {
      var target = regionById(link.target);
      if (!target) return;
      html += '<line x1="' + region.x + '" y1="' + region.y + '" x2="' + target.x + '" y2="' + target.y + '" stroke="rgba(255,209,102,0.5)" stroke-width="2" stroke-dasharray="5 4"/>';
    });
  }

  atlasState.data.regions.forEach(function(item) {
    var active = item.id === region.id;
    var linked = linkedTargets.indexOf(item.id) >= 0;
    var fill = regionColor(item, active, linked);
    var stroke = active ? '#ffffff' : linked ? '#ffd166' : '#274567';

    html += '<circle cx="' + item.x + '" cy="' + item.y + '" r="' + (active ? 19 : 15) + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + (active ? 2.4 : 1.2) + '"/>';
    html += '<text x="' + item.x + '" y="' + (item.y + 4) + '" text-anchor="middle" fill="#0a0e17" font-size="10" font-weight="700">' + item.shortLabel + '</text>';
    if (active) {
      html += '<text x="' + item.x + '" y="' + (item.y - 28) + '" text-anchor="middle" fill="#c8d6e5" font-size="11">' + item.name + '</text>';
    }
  });

  html += '<text x="28" y="30" fill="#6b7f99" font-size="11">' + (atlasState.chapter === 'functions' ? 'Regional specialization view' : 'Connection view for ' + region.shortLabel) + '</text>';
  svg.innerHTML = html;
}

function renderChapterSummary() {
  var chapter = atlasState.data.chapters.find(function(item) { return item.id === atlasState.chapter; });
  document.getElementById('chapter-copy').textContent = chapter.summary;
  document.getElementById('chapter-functions').classList.toggle('active', atlasState.chapter === 'functions');
  document.getElementById('chapter-interlinks').classList.toggle('active', atlasState.chapter === 'interlinks');
  document.getElementById('atlas-map-title').textContent = atlasState.chapter === 'functions' ? 'Functional Map' : 'Interlink Map';
  document.getElementById('atlas-network-title').textContent = atlasState.chapter === 'functions' ? 'How to Read Chapter 1' : 'Chapter 2 Interlinks';
}

function renderRegionDetail() {
  var region = selectedRegion();
  var detail = document.getElementById('atlas-detail');
  var title = document.getElementById('atlas-detail-title');
  var category = atlasCategory(region);
  var html = '';

  title.textContent = region.name;
  html += '<span class="atlas-kicker" style="border-color:' + category.color + '55;color:' + category.color + '">' + region.lobe + ' · ' + category.name + '</span>';

  if (atlasState.chapter === 'functions') {
    html += '<p class="subtitle" style="margin-bottom:.9rem">' + region.chapter1.summary + '</p>';
    html += '<h3>Core Functions</h3><ul class="atlas-detail-list">';
    region.chapter1.functions.forEach(function(item) { html += '<li>' + item + '</li>'; });
    html += '</ul>';
    html += '<h3 style="margin-top:.9rem">Signature Tasks</h3><ul class="atlas-detail-list">';
    region.chapter1.signatureTasks.forEach(function(item) { html += '<li>' + item + '</li>'; });
    html += '</ul>';
    html += '<div class="explanation" style="margin-top:1rem"><h3>Clinical Link</h3><p>' + region.chapter1.clinicalLink + '</p></div>';
  } else {
    html += '<p class="subtitle" style="margin-bottom:.9rem">' + region.chapter2.role + '</p>';
    html += '<h3>Systems</h3><div class="atlas-systems">';
    region.chapter2.systems.forEach(function(system) { html += '<span>' + system + '</span>'; });
    html += '</div>';
    html += '<div class="atlas-interlinks">';
    region.chapter2.interlinks.forEach(function(link) {
      var target = regionById(link.target);
      html += '<div class="atlas-link-card"><strong>' + link.label + ' → ' + target.name + '</strong><p>' + link.description + '</p></div>';
    });
    html += '</div>';
  }

  detail.innerHTML = html;
}

function renderNetworkPanel() {
  var el = document.getElementById('atlas-network');
  var region = selectedRegion();
  var html = '';

  if (atlasState.chapter === 'functions') {
    html += '<div class="atlas-note-grid">';
    atlasState.data.networkNotes.forEach(function(note, index) {
      html += '<div class="explanation" style="margin:0"><h3>Principle ' + (index + 1) + '</h3><p>' + note + '</p></div>';
    });
    html += '</div>';
  } else {
    html += '<p class="subtitle" style="margin-bottom:.9rem">Selected hub: ' + region.name + '. Chapter 2 emphasizes that behavior comes from loops, not isolated blobs on a diagram.</p>';
    html += '<ul class="atlas-note-list">';
    region.chapter2.interlinks.forEach(function(link) {
      var target = regionById(link.target);
      html += '<li><strong style="color:var(--text)">' + target.name + ':</strong> ' + link.description + '</li>';
    });
    html += '</ul>';
    html += '<div class="explanation" style="margin-top:1rem"><h3>Network Interpretation</h3><p>' + region.name + ' is best understood by following its recurrent loops with ' + region.chapter2.interlinks.map(function(link) { return regionById(link.target).shortLabel; }).join(', ') + '.</p></div>';
  }

  el.innerHTML = html;
}

function renderAtlas() {
  if (!atlasState.data) return;
  renderChapterSummary();
  buildLegend();
  buildRegionPicker();
  drawAtlasMap();
  renderRegionDetail();
  renderNetworkPanel();
}

function setAtlasChapter(chapter) {
  atlasState.chapter = chapter;
  renderAtlas();
}

function setAtlasRegion(regionId) {
  atlasState.regionId = regionId;
  renderAtlas();
}

async function loadBrainAtlas() {
  try {
    var res = await fetch('/brain-atlas');
    var data = await res.json();
    if (!res.ok) throw new Error(data.error || ('Request failed: ' + res.status));
    atlasState.data = data;
    atlasState.regionId = data.regions[0].id;
    renderAtlas();
  } catch (err) {
    document.getElementById('atlas-detail').innerHTML = '<p class="subtitle">Error: ' + err.message + '</p>';
    document.getElementById('atlas-network').innerHTML = '<p class="subtitle">Could not load atlas data.</p>';
  }
}

loadBrainAtlas();
</script>`;
