export const layout = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ title }} | Neuro Explorer</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    :root{
      --bg:#0a0e17;--surface:#131a2b;--border:#1e2d4a;
      --text:#c8d6e5;--dim:#6b7f99;
      --primary:#4fc3f7;--secondary:#7c4dff;--success:#00e676;--danger:#ff5252;
      --mono:'Cascadia Code','Fira Code','Consolas',monospace;
    }
    body{background:var(--bg);color:var(--text);font-family:'Segoe UI',system-ui,sans-serif;line-height:1.6;display:grid;grid-template-columns:250px 1fr;min-height:100vh}
    .sidebar{background:var(--surface);border-right:1px solid var(--border);padding:1.15rem .95rem}
    .brand{display:block;color:var(--primary);text-decoration:none;font-weight:700;letter-spacing:.02em;margin-bottom:.25rem}
    .sidebar-sub{color:var(--dim);font-size:.78rem;margin-bottom:1rem}
    .side-nav{display:flex;flex-direction:column;gap:.35rem}
    .side-nav a{color:var(--dim);text-decoration:none;font-size:.88rem;padding:.45rem .55rem;border:1px solid transparent;border-radius:6px;transition:all .2s}
    .side-nav a:hover,.side-nav a.active{color:var(--primary);border-color:var(--border);background:rgba(79,195,247,.08)}
    main{padding:1.75rem 2rem}
    .content{max-width:980px}
    h1{color:var(--primary);margin-bottom:.25rem;font-size:1.8rem}
    h2{font-size:1.15rem;margin-bottom:.5rem}
    h3{color:var(--secondary);margin-bottom:.4rem;font-size:1rem}
    .subtitle{color:var(--dim);margin-bottom:1.5rem}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.25rem;margin-top:1.5rem}
    .card{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:1.25rem;text-decoration:none;color:inherit;transition:border-color .2s}
    .card:hover{border-color:var(--primary)}
    .card h2{color:var(--primary);font-size:1.05rem}
    .card p{color:var(--dim);font-size:.85rem;margin-top:.35rem}
    .form-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:.75rem;margin:1rem 0}
    label{display:block;color:var(--dim);font-size:.8rem;margin-bottom:.2rem}
    input,select,textarea{background:var(--bg);color:var(--text);border:1px solid var(--border);border-radius:4px;padding:.45rem .6rem;width:100%;font-family:var(--mono);font-size:.85rem}
    input:focus,select:focus,textarea:focus{outline:none;border-color:var(--primary)}
    button{background:var(--primary);color:var(--bg);border:none;border-radius:4px;padding:.55rem 1.4rem;font-weight:600;cursor:pointer;font-size:.85rem;transition:opacity .2s}
    button:hover{opacity:.85}
    button:disabled{opacity:.4;cursor:not-allowed}
    .chart-box{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:1rem;margin:1rem 0;overflow-x:auto}
    .chart-box svg{width:100%;height:auto;display:block}
    .result{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:1.25rem;margin:1rem 0;white-space:pre-wrap;font-family:var(--mono);font-size:.82rem;max-height:500px;overflow-y:auto}
    .explanation{background:var(--surface);border-left:3px solid var(--secondary);border-radius:0 8px 8px 0;padding:1.25rem;margin:1rem 0}
    .explanation h3{margin-bottom:.4rem}
    .explanation p,.explanation li{color:var(--dim);font-size:.88rem}
    .explanation ul{margin:.5rem 0 0 1.2rem}
    .explanation li{margin-bottom:.3rem}
    .tag{display:inline-block;padding:.1rem .45rem;background:var(--border);border-radius:3px;font-size:.75rem;margin:.1rem;color:var(--text)}
    .status{padding:.4rem .8rem;border-radius:4px;margin:.5rem 0;font-weight:600;font-size:.9rem}
    .status.ltp{background:rgba(0,230,118,.1);border:1px solid var(--success);color:var(--success)}
    .status.ltd{background:rgba(255,82,82,.1);border:1px solid var(--danger);color:var(--danger)}
    .pipeline{display:flex;align-items:center;gap:.4rem;flex-wrap:wrap;margin:1rem 0}
    .pipeline .stage{background:var(--surface);border:1px solid var(--border);border-radius:4px;padding:.4rem .6rem;font-size:.75rem;text-align:center;min-width:80px}
    .pipeline .arrow{color:var(--dim);font-size:.7rem}
    .pipeline .stage.active{border-color:var(--primary);color:var(--primary)}
    .spinner{display:none;width:18px;height:18px;border:2px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:spin .6s linear infinite;margin-left:.5rem;vertical-align:middle}
    @keyframes spin{to{transform:rotate(360deg)}}
    .flex-bar{display:flex;gap:.75rem;align-items:end;flex-wrap:wrap}
    .flex-bar .form-group{flex:1;min-width:200px}
    .hidden{display:none}
    @media(max-width:900px){
      body{grid-template-columns:1fr}
      .sidebar{border-right:none;border-bottom:1px solid var(--border)}
      .side-nav{flex-direction:row;flex-wrap:wrap}
      .side-nav a{padding:.4rem .5rem}
      main{padding:1.2rem}
    }
    @media(max-width:600px){.form-grid{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <aside class="sidebar">
    <a class="brand" href="/">Neuro Explorer</a>
    <p class="sidebar-sub">Neuroscience + AI playground</p>
    <nav class="side-nav">
      <a href="/"{% if active == "home" %} class="active"{% endif %}>Home</a>
      <a href="/ui/neuron"{% if active == "neuron" %} class="active"{% endif %}>Neuron</a>
      <a href="/ui/vision"{% if active == "vision" %} class="active"{% endif %}>Vision</a>
      <a href="/ui/ask"{% if active == "ask" %} class="active"{% endif %}>Ask</a>
      <a href="/ui/plasticity"{% if active == "plasticity" %} class="active"{% endif %}>Plasticity</a>
      <a href="/ui/ecg"{% if active == "ecg" %} class="active"{% endif %}>12-Lead ECG</a>
    </nav>
  </aside>
  <main>
    <div class="content">{{ body }}</div>
  </main>
</body>
</html>`;
