export const layout = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ title }} | Neuro Explorer</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    :root{
      --bg:#08111d;--bg-soft:#10213a;--surface:rgba(17,29,48,.84);--surface-strong:rgba(21,36,58,.96);
      --border:rgba(151,184,215,.14);--border-strong:rgba(151,184,215,.24);
      --text:#ecf5ff;--dim:#9cb3cb;--muted:#7f95ad;
      --primary:#67d3ff;--secondary:#ffd58a;--success:#44d39a;--danger:#ff7c76;
      --shadow:0 18px 50px rgba(3,10,20,.28);--shadow-soft:0 10px 28px rgba(3,10,20,.18);
      --mono:'Cascadia Code','Consolas','SFMono-Regular',monospace;
    }
    html{background:
      radial-gradient(circle at top left, rgba(103,211,255,.12), transparent 28%),
      radial-gradient(circle at top right, rgba(255,213,138,.10), transparent 24%),
      linear-gradient(180deg, #0c1729 0%, #08111d 55%, #07101a 100%)}
    body{
      position:relative;overflow-x:hidden;background:transparent;color:var(--text);
      font-family:'Aptos','Trebuchet MS','Segoe UI',sans-serif;line-height:1.6;
      display:grid;grid-template-columns:260px 1fr;min-height:100vh;letter-spacing:.01em
    }
    body::before,body::after{
      content:'';position:fixed;z-index:0;pointer-events:none;filter:blur(8px);opacity:.65
    }
    body::before{
      inset:auto auto 8% 8%;width:240px;height:240px;border-radius:50%;
      background:radial-gradient(circle, rgba(103,211,255,.18), transparent 68%)
    }
    body::after{
      inset:10% 6% auto auto;width:260px;height:260px;border-radius:50%;
      background:radial-gradient(circle, rgba(255,213,138,.14), transparent 70%)
    }
    .sidebar,.content{position:relative;z-index:1}
    .sidebar{
      background:linear-gradient(180deg, rgba(15,26,43,.9), rgba(11,20,33,.82));
      border-right:1px solid var(--border);padding:1.25rem 1rem 1rem 1rem;backdrop-filter:blur(14px)
    }
    .brand{
      display:block;color:var(--text);text-decoration:none;font-weight:700;font-size:1.02rem;
      letter-spacing:.04em;margin-bottom:.35rem
    }
    .sidebar-sub{color:var(--dim);font-size:.79rem;margin-bottom:1.15rem;max-width:170px}
    .side-nav{display:flex;flex-direction:column;gap:.4rem}
    .side-nav a{
      color:var(--dim);text-decoration:none;font-size:.88rem;padding:.56rem .72rem;
      border:1px solid transparent;border-radius:10px;transition:all .22s ease;
      background:rgba(255,255,255,.015)
    }
    .side-nav a:hover{
      color:var(--text);border-color:var(--border);background:rgba(255,255,255,.045);transform:translateX(2px)
    }
    .side-nav a.active{
      color:#07101a;border-color:transparent;
      background:linear-gradient(135deg, var(--primary), #90e0ff);
      box-shadow:0 10px 22px rgba(103,211,255,.22)
    }
    main{padding:2rem 2.2rem 2.4rem}
    .content{max-width:1040px}
    h1{color:var(--text);margin-bottom:.3rem;font-size:2rem;letter-spacing:.01em}
    h2{font-size:1.16rem;margin-bottom:.55rem;color:var(--text)}
    h3{color:var(--secondary);margin-bottom:.42rem;font-size:1rem}
    .subtitle{color:var(--dim);margin-bottom:1.55rem;max-width:760px}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.25rem;margin-top:1.5rem}
    .card{
      background:linear-gradient(180deg, rgba(25,40,63,.8), rgba(15,25,41,.82));
      border:1px solid var(--border);border-radius:16px;padding:1.25rem;text-decoration:none;color:inherit;
      transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease;box-shadow:var(--shadow-soft)
    }
    .card:hover{border-color:var(--border-strong);transform:translateY(-2px);box-shadow:var(--shadow)}
    .card h2{color:var(--text);font-size:1.06rem}
    .card p{color:var(--dim);font-size:.87rem;margin-top:.42rem}
    .form-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:.82rem;margin:1rem 0}
    label{display:block;color:var(--dim);font-size:.79rem;margin-bottom:.28rem;letter-spacing:.02em}
    input,select,textarea{
      background:rgba(6,14,24,.72);color:var(--text);border:1px solid var(--border);
      border-radius:10px;padding:.55rem .7rem;width:100%;font-family:var(--mono);font-size:.85rem;
      transition:border-color .18s ease,background .18s ease,box-shadow .18s ease
    }
    input:hover,select:hover,textarea:hover{border-color:var(--border-strong)}
    input:focus,select:focus,textarea:focus{
      outline:none;border-color:rgba(103,211,255,.55);background:rgba(8,18,31,.92);
      box-shadow:0 0 0 3px rgba(103,211,255,.14)
    }
    button{
      background:linear-gradient(135deg, var(--primary), #92e4ff);color:#08111d;border:none;
      border-radius:999px;padding:.65rem 1.45rem;font-weight:700;cursor:pointer;font-size:.84rem;
      letter-spacing:.02em;transition:transform .16s ease,box-shadow .16s ease,opacity .16s ease;
      box-shadow:0 10px 26px rgba(103,211,255,.24)
    }
    button:hover{opacity:.96;transform:translateY(-1px)}
    button:disabled{opacity:.4;cursor:not-allowed}
    .chart-box{
      background:linear-gradient(180deg, var(--surface-strong), var(--surface));
      border:1px solid var(--border);border-radius:18px;padding:1.05rem 1.08rem;
      margin:1rem 0;overflow-x:auto;box-shadow:var(--shadow-soft);backdrop-filter:blur(12px)
    }
    .chart-box svg{width:100%;height:auto;display:block}
    .result{
      background:linear-gradient(180deg, rgba(17,28,46,.92), rgba(11,19,31,.9));
      border:1px solid var(--border);border-radius:16px;padding:1.25rem;margin:1rem 0;
      white-space:pre-wrap;font-family:var(--mono);font-size:.82rem;max-height:500px;overflow-y:auto;
      box-shadow:var(--shadow-soft)
    }
    .explanation{
      background:linear-gradient(180deg, rgba(20,33,53,.9), rgba(13,22,37,.88));
      border:1px solid var(--border);border-left:4px solid var(--secondary);
      border-radius:16px;padding:1.2rem 1.25rem;margin:1rem 0;box-shadow:var(--shadow-soft)
    }
    .explanation h3{margin-bottom:.4rem}
    .explanation p,.explanation li{color:var(--dim);font-size:.88rem}
    .explanation ul{margin:.5rem 0 0 1.2rem}
    .explanation li{margin-bottom:.3rem}
    .tag{
      display:inline-block;padding:.18rem .52rem;background:rgba(255,255,255,.05);
      border:1px solid var(--border);border-radius:999px;font-size:.73rem;margin:.12rem;color:var(--text)
    }
    .status{padding:.4rem .8rem;border-radius:4px;margin:.5rem 0;font-weight:600;font-size:.9rem}
    .status.ltp{background:rgba(0,230,118,.1);border:1px solid var(--success);color:var(--success)}
    .status.ltd{background:rgba(255,82,82,.1);border:1px solid var(--danger);color:var(--danger)}
    .pipeline{display:flex;align-items:center;gap:.4rem;flex-wrap:wrap;margin:1rem 0}
    .pipeline .stage{
      background:rgba(255,255,255,.035);border:1px solid var(--border);
      border-radius:999px;padding:.42rem .7rem;font-size:.75rem;text-align:center;min-width:80px
    }
    .pipeline .arrow{color:var(--dim);font-size:.7rem}
    .pipeline .stage.active{border-color:var(--primary);color:var(--primary)}
    .spinner{display:none;width:18px;height:18px;border:2px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:spin .6s linear infinite;margin-left:.5rem;vertical-align:middle}
    @keyframes spin{to{transform:rotate(360deg)}}
    .flex-bar{display:flex;gap:.75rem;align-items:end;flex-wrap:wrap}
    .flex-bar .form-group{flex:1;min-width:200px}
    .hidden{display:none}
    @media(max-width:900px){
      body{grid-template-columns:1fr}
      .sidebar{border-right:none;border-bottom:1px solid var(--border);padding-bottom:.9rem}
      .side-nav{flex-direction:row;flex-wrap:wrap}
      .side-nav a{padding:.44rem .6rem}
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
      <a href="/ui/brain-atlas"{% if active == "brain-atlas" %} class="active"{% endif %}>Brain Atlas</a>
      <a href="/ui/retina"{% if active == "retina" %} class="active"{% endif %}>Retina</a>
      <a href="/ui/grid-cell"{% if active == "grid-cell" %} class="active"{% endif %}>Grid Cells</a>
      <a href="/ui/dopamine"{% if active == "dopamine" %} class="active"{% endif %}>Dopamine</a>
      <a href="/ui/plasticity"{% if active == "plasticity" %} class="active"{% endif %}>Plasticity</a>
      <a href="/ui/ecg"{% if active == "ecg" %} class="active"{% endif %}>12-Lead ECG</a>
      <a href="/ui/ask"{% if active == "ask" %} class="active"{% endif %}>Ask</a>
    </nav>
  </aside>
  <main>
    <div class="content">{{ body }}</div>
  </main>
</body>
</html>`;
