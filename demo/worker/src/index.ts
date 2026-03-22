/**
 * ton-x402 Demo Worker
 *
 * A Cloudflare Worker that demonstrates x402 payment flow on TON.
 * Serves a polished landing page + live API demo endpoints.
 */
import { Hono } from "hono";
import { cors } from "hono/cors";

const PROTOCOL = "x402-ton";
const DEMO_RECIPIENT = "UQDrjaLahLkMB-hMCmkzOyBuHJ186Kj3BzU3sHUecE2eEPz4";

const app = new Hono();

app.use("*", cors());

app.get("/", (c) => {
  return c.html(buildLandingPage());
});

app.get("/api/info", (c) => {
  return c.json({
    name: "ton-x402 Demo API",
    version: "1.0",
    protocol: "x402-ton",
    network: "testnet",
    endpoints: {
      "/api/info": { price: "free" },
      "/api/premium/joke": { price: "0.01 TON" },
      "/api/premium/data": { price: "0.05 TON" },
    },
  });
});

app.use("/api/premium/*", async (c, next) => {
  const proof = c.req.header("X-Payment-Proof");
  const paymentId = c.req.header("X-Payment-Id");
  const sender = c.req.header("X-Payment-Sender");

  if (proof && paymentId && sender) {
    await next();
    return;
  }

  const amount = c.req.path.includes("data") ? "50000000" : "10000000";
  const description = c.req.path.includes("data")
    ? "Access premium data feed"
    : "Access premium joke";

  return c.json(
    {
      version: "1.0",
      network: "testnet",
      recipient: DEMO_RECIPIENT,
      amount,
      token: "TON",
      description,
      paymentId: crypto.randomUUID(),
      expiresAt: Math.floor(Date.now() / 1000) + 300,
    },
    402,
    { "X-Payment-Protocol": PROTOCOL },
  );
});

app.get("/api/premium/joke", (c) => {
  const jokes = [
    "Why do programmers prefer dark mode? Because light attracts bugs.",
    "There are 10 types of people: those who understand binary and those who don't.",
    "A SQL query walks into a bar, sees two tables, and asks: 'Can I JOIN you?'",
    "Why did the developer go broke? Because he used up all his cache.",
    "!false - It's funny because it's true.",
  ];
  return c.json({
    joke: jokes[Math.floor(Math.random() * jokes.length)],
    paidWith: "TON via x402",
    amountPaid: "0.01 TON",
  });
});

app.get("/api/premium/data", (c) => {
  return c.json({
    data: {
      market: "TON/USDT",
      price: "3.42",
      volume24h: "142,567,890",
      change24h: "+5.2%",
      timestamp: new Date().toISOString(),
    },
    paidWith: "TON via x402",
    amountPaid: "0.05 TON",
  });
});

export default app;

// ---------------------------------------------------------------------------
// Landing Page Builder
// ---------------------------------------------------------------------------

function buildLandingPage(): string {
  return "<!DOCTYPE html><html lang=\"en\"><head>" +
    buildHead() +
    "</head><body>" +
    buildNav() +
    buildHero() +
    buildProblem() +
    buildAgentDemo() +
    buildUseCases() +
    buildWhyTon() +
    buildHowItWorks() +
    buildTechnicalHighlights() +
    buildArchitecture() +
    buildLiveDemo() +
    buildCodeExamples() +
    buildRoadmap() +
    buildCTA() +
    buildFooter() +
    "<script>" + buildScript() + "</script>" +
    "</body></html>";
}

function buildHead(): string {
  return `
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>ton-x402 | HTTP-native machine payments on TON</title>
  <meta name="description" content="The first x402 implementation on TON. AI agents pay for APIs automatically using HTTP 402. 5 composable npm packages, MCP server for Claude/GPT, 34 tests, zero-dependency core.">
  <meta property="og:title" content="ton-x402 — HTTP-native machine payments on TON">
  <meta property="og:description" content="AI agents pay for premium APIs as naturally as browsers follow redirects. 5 npm packages, MCP server, 34 tests, zero-dep core. Built for 1B+ Telegram users.">
  <meta property="og:type" content="website">
  <meta property="og:image" content="https://raw.githubusercontent.com/Arusasaki/ton-x402/main/assets/banner.svg">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <style>${buildStyles()}</style>`;
}

function buildStyles(): string {
  return `
  *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:       #06080F;
    --bg-s:     #0B0F1A;
    --bg-card:  #0F1322;
    --bg-elev:  #141830;
    --bg-code:  #090C17;
    --border:   #1A1F38;
    --border-l: #242A4A;
    --text:     #E8EAF0;
    --text-s:   #7880A0;
    --text-t:   #484E6C;
    --accent:   #0098EA;
    --accent-l: #00B8FF;
    --accent-g: rgba(0,152,234,0.12);
    --green:    #22C55E;
    --orange:   #F59E0B;
    --red:      #EF4444;
    --purple:   #A78BFA;
    --radius:   16px;
    --radius-s: 10px;
  }
  html{scroll-behavior:smooth}
  body{
    font-family:'Inter',system-ui,-apple-system,sans-serif;
    background:var(--bg);
    color:var(--text);
    line-height:1.6;
    -webkit-font-smoothing:antialiased;
    overflow-x:hidden;
  }

  /* Nav */
  .nav{
    position:fixed;top:0;left:0;right:0;z-index:100;
    padding:0 24px;height:64px;
    display:flex;align-items:center;justify-content:center;
    transition:background .3s,border .3s,backdrop-filter .3s;
    border-bottom:1px solid transparent;
  }
  .nav.scrolled{
    background:rgba(6,8,15,0.8);
    backdrop-filter:blur(20px) saturate(180%);
    -webkit-backdrop-filter:blur(20px) saturate(180%);
    border-bottom-color:var(--border);
  }
  .nav-inner{
    max-width:1100px;width:100%;
    display:flex;align-items:center;justify-content:space-between;
  }
  .nav-logo{
    font-weight:800;font-size:1.1rem;letter-spacing:-.02em;
    color:var(--text);text-decoration:none;
  }
  .nav-logo span{color:var(--accent)}
  .nav-links{display:flex;align-items:center;gap:32px}
  .nav-links a{
    color:var(--text-s);text-decoration:none;font-size:.875rem;font-weight:500;
    transition:color .2s;
  }
  .nav-links a:hover{color:var(--text)}
  .nav-gh{
    display:inline-flex;align-items:center;gap:6px;
    padding:8px 16px;border-radius:var(--radius-s);
    background:var(--bg-card);border:1px solid var(--border);
    color:var(--text)!important;font-size:.875rem;font-weight:500;
    transition:all .2s;
  }
  .nav-gh:hover{border-color:var(--border-l);background:var(--bg-elev)}
  .nav-gh svg{width:16px;height:16px;fill:currentColor}

  /* Hero */
  .hero{
    position:relative;
    min-height:100vh;
    display:flex;align-items:center;justify-content:center;
    text-align:center;
    padding:120px 24px 80px;
    overflow:hidden;
  }
  .hero-bg{
    position:absolute;inset:0;
    background:
      radial-gradient(ellipse 900px 700px at 30% 20%,rgba(0,152,234,0.07) 0%,transparent 70%),
      radial-gradient(ellipse 600px 500px at 70% 70%,rgba(0,184,255,0.05) 0%,transparent 70%),
      radial-gradient(ellipse 500px 400px at 50% 40%,rgba(0,152,234,0.03) 0%,transparent 60%);
    animation:heroFloat 15s ease-in-out infinite alternate;
  }
  @keyframes heroFloat{
    0%{transform:scale(1) translate(0,0)}
    100%{transform:scale(1.05) translate(-10px,10px)}
  }
  .hero-grid{
    position:absolute;inset:0;
    background-image:radial-gradient(circle,rgba(0,152,234,0.06) 1px,transparent 1px);
    background-size:48px 48px;
    mask-image:radial-gradient(ellipse 80% 70% at 50% 40%,black 20%,transparent 70%);
    -webkit-mask-image:radial-gradient(ellipse 80% 70% at 50% 40%,black 20%,transparent 70%);
  }
  .hero-content{position:relative;max-width:760px}
  .hero-track{
    display:inline-flex;align-items:center;gap:10px;
    padding:6px 18px;border-radius:100px;
    background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);
    font-size:.75rem;font-weight:700;color:var(--orange);
    margin-bottom:16px;letter-spacing:.04em;text-transform:uppercase;
  }
  .hero-track svg{width:14px;height:14px}
  .hero-badge{
    display:inline-flex;align-items:center;gap:8px;
    padding:8px 20px;border-radius:100px;
    background:var(--accent-g);border:1px solid rgba(0,152,234,0.2);
    font-size:.82rem;font-weight:600;color:var(--accent);
    margin-bottom:32px;
  }
  .hero-badge-dot{width:6px;height:6px;border-radius:50%;background:var(--green);animation:dotPulse 2s infinite}
  @keyframes dotPulse{0%,100%{opacity:1}50%{opacity:.4}}
  .hero-logo{margin:0 auto 32px;width:80px;height:80px;position:relative}
  .hero-logo svg{width:80px;height:80px;filter:drop-shadow(0 0 30px rgba(0,152,234,0.3))}
  .hero-logo::after{
    content:'';position:absolute;inset:-20px;border-radius:50%;
    background:radial-gradient(circle,rgba(0,152,234,0.12) 0%,transparent 70%);
    animation:logoPulse 3s ease-in-out infinite;
  }
  @keyframes logoPulse{
    0%,100%{transform:scale(1);opacity:1}
    50%{transform:scale(1.15);opacity:.6}
  }
  .hero h1{
    font-size:clamp(2.8rem,7vw,4.2rem);font-weight:900;
    letter-spacing:-.04em;line-height:1.1;margin-bottom:24px;
  }
  .hero h1 .gr{
    background:linear-gradient(135deg,#0098EA 0%,#00B8FF 50%,#38BDF8 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;
    background-clip:text;
  }
  .hero-sub{
    font-size:clamp(1.1rem,2.5vw,1.3rem);color:var(--text-s);
    max-width:600px;margin:0 auto 40px;font-weight:400;line-height:1.7;
  }
  .hero-cta{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:64px}
  .btn{
    display:inline-flex;align-items:center;gap:8px;
    padding:14px 28px;border-radius:var(--radius-s);
    font-size:.9rem;font-weight:600;text-decoration:none;
    transition:all .25s cubic-bezier(.4,0,.2,1);cursor:pointer;border:none;
  }
  .btn-p{
    background:linear-gradient(135deg,#0098EA,#00B8FF);color:#fff;
    box-shadow:0 4px 24px rgba(0,152,234,0.25),inset 0 1px 0 rgba(255,255,255,0.1);
  }
  .btn-p:hover{
    transform:translateY(-2px);
    box-shadow:0 8px 40px rgba(0,152,234,0.35),inset 0 1px 0 rgba(255,255,255,0.1);
  }
  .btn-s{
    background:var(--bg-card);color:var(--text);
    border:1px solid var(--border);
  }
  .btn-s:hover{border-color:var(--border-l);background:var(--bg-elev);transform:translateY(-2px)}
  .btn svg{width:16px;height:16px}

  .hero-stats{
    display:flex;justify-content:center;gap:40px;flex-wrap:wrap;
    padding-top:48px;border-top:1px solid var(--border);
  }
  .hero-stat{text-align:center}
  .hero-stat-val{
    font-size:1.75rem;font-weight:800;
    background:linear-gradient(135deg,var(--accent),var(--accent-l));
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;
    background-clip:text;
  }
  .hero-stat-lbl{font-size:.75rem;color:var(--text-t);text-transform:uppercase;letter-spacing:.1em;margin-top:4px}

  /* Sections */
  .section{padding:120px 24px;position:relative}
  .section:nth-child(odd){background:var(--bg-s)}
  .container{max-width:1100px;margin:0 auto}
  .section-label{
    font-size:.8rem;font-weight:600;color:var(--accent);
    text-transform:uppercase;letter-spacing:.12em;margin-bottom:12px;
  }
  .section-title{
    font-size:clamp(1.75rem,4vw,2.5rem);font-weight:800;
    letter-spacing:-.03em;line-height:1.2;margin-bottom:16px;
  }
  .section-desc{
    font-size:1.05rem;color:var(--text-s);max-width:560px;line-height:1.7;margin-bottom:48px;
  }
  .section-center{text-align:center}
  .section-center .section-desc{margin-left:auto;margin-right:auto}

  /* Problem section */
  .problem-grid{display:grid;grid-template-columns:1fr 60px 1fr;gap:0;align-items:stretch}
  .problem-col{
    background:var(--bg-card);border:1px solid var(--border);
    border-radius:var(--radius);padding:40px;
  }
  .problem-col h3{font-size:1.15rem;font-weight:700;margin-bottom:24px;display:flex;align-items:center;gap:10px}
  .problem-col h3 svg{width:24px;height:24px;flex-shrink:0}
  .problem-col ul{list-style:none;display:flex;flex-direction:column;gap:16px}
  .problem-col li{
    display:flex;align-items:flex-start;gap:12px;
    font-size:.9rem;color:var(--text-s);line-height:1.6;
  }
  .problem-col li svg{width:20px;height:20px;flex-shrink:0;margin-top:2px}
  .problem-before{border-color:rgba(239,68,68,0.2)}
  .problem-before h3{color:var(--red)}
  .problem-before li svg{color:var(--red)}
  .problem-after{border-color:rgba(34,197,94,0.2)}
  .problem-after h3{color:var(--green)}
  .problem-after li svg{color:var(--green)}
  .problem-arrow{
    display:flex;align-items:center;justify-content:center;
    color:var(--accent);font-size:1.5rem;font-weight:800;
  }
  @media(max-width:768px){
    .problem-grid{grid-template-columns:1fr;gap:16px}
    .problem-arrow{transform:rotate(90deg);padding:8px 0}
  }

  /* Use Cases */
  .uc-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
  @media(max-width:768px){.uc-grid{grid-template-columns:1fr}}
  .uc-card{
    background:var(--bg-card);border:1px solid var(--border);
    border-radius:var(--radius);padding:32px;
    transition:all .3s;position:relative;overflow:hidden;
  }
  .uc-card::before{
    content:'';position:absolute;top:0;left:0;right:0;height:3px;
    background:linear-gradient(90deg,var(--accent),var(--accent-l));
    opacity:0;transition:opacity .3s;
  }
  .uc-card:hover{border-color:var(--border-l);transform:translateY(-3px)}
  .uc-card:hover::before{opacity:1}
  .uc-icon{
    width:48px;height:48px;border-radius:12px;
    background:var(--accent-g);
    display:flex;align-items:center;justify-content:center;
    margin-bottom:20px;
  }
  .uc-icon svg{width:24px;height:24px;color:var(--accent)}
  .uc-card h3{font-size:1.05rem;font-weight:700;margin-bottom:10px}
  .uc-card p{font-size:.88rem;color:var(--text-s);line-height:1.6;margin-bottom:16px}
  .uc-market{
    display:inline-flex;align-items:center;gap:6px;
    font-size:.72rem;font-weight:600;color:var(--orange);
    background:rgba(245,158,11,0.08);
    padding:4px 10px;border-radius:100px;margin-bottom:16px;
  }
  .uc-example{
    font-family:'JetBrains Mono',monospace;font-size:.75rem;
    color:var(--text-t);background:var(--bg-code);
    padding:10px 14px;border-radius:8px;border:1px solid var(--border);
  }

  /* Why TON */
  .ton-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:48px}
  @media(max-width:768px){.ton-grid{grid-template-columns:1fr}}
  .ton-card{
    background:var(--bg-card);border:1px solid var(--border);
    border-radius:var(--radius);padding:28px;text-align:center;
    transition:all .3s;
  }
  .ton-card:hover{border-color:var(--border-l);transform:translateY(-2px)}
  .ton-val{
    font-size:2rem;font-weight:800;
    background:linear-gradient(135deg,var(--accent),var(--accent-l));
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;
    background-clip:text;margin-bottom:4px;
  }
  .ton-label{font-size:.85rem;color:var(--text-s);font-weight:500;margin-bottom:8px}
  .ton-detail{font-size:.78rem;color:var(--text-t);line-height:1.5}
  .compare-table{
    width:100%;border-collapse:collapse;
    background:var(--bg-card);border:1px solid var(--border);
    border-radius:var(--radius);overflow:hidden;
  }
  .compare-table th,.compare-table td{
    padding:14px 18px;text-align:center;
    border-bottom:1px solid var(--border);
    font-size:.85rem;
  }
  .compare-table th{
    background:var(--bg-elev);color:var(--text-s);
    font-weight:600;text-transform:uppercase;letter-spacing:.06em;font-size:.75rem;
  }
  .compare-table td:first-child{text-align:left;font-weight:600;color:var(--text)}
  .compare-table tr:last-child td{border-bottom:none}
  .compare-table .hl{background:rgba(0,152,234,0.05)}
  .compare-table .hl td:first-child{color:var(--accent)}
  .check{color:var(--green);font-weight:700}
  .cross{color:var(--text-t)}

  /* Terminal */
  .terminal-wrap{max-width:760px;margin:0 auto;position:relative}
  .terminal{
    background:var(--bg-code);
    border:1px solid var(--border);
    border-radius:var(--radius);
    overflow:hidden;
    box-shadow:
      0 40px 100px -20px rgba(0,0,0,0.6),
      0 0 60px -10px rgba(0,152,234,0.06),
      inset 0 1px 0 rgba(255,255,255,0.03);
  }
  .terminal-bar{
    background:var(--bg-card);
    padding:14px 20px;
    display:flex;align-items:center;gap:14px;
    border-bottom:1px solid var(--border);
  }
  .terminal-dots{display:flex;gap:8px}
  .terminal-dots i{width:12px;height:12px;border-radius:50%;display:block}
  .terminal-dots i:nth-child(1){background:#EF4444}
  .terminal-dots i:nth-child(2){background:#F59E0B}
  .terminal-dots i:nth-child(3){background:#22C55E}
  .terminal-ttl{font-size:.8rem;color:var(--text-t);font-weight:500;flex:1;text-align:center}
  .terminal-body{
    padding:24px;min-height:380px;
    font-family:'JetBrains Mono',monospace;font-size:.82rem;line-height:1.8;
    overflow-y:auto;max-height:480px;
  }
  .t-line{opacity:0;transform:translateY(4px);transition:all .3s ease}
  .t-line.visible{opacity:1;transform:translateY(0)}
  .t-prompt{color:var(--accent)}
  .t-prompt .cmd{color:var(--text)}
  .t-agent{color:#C3E88D}
  .t-log{color:var(--text-s)}
  .t-dim{color:var(--text-t)}
  .t-warn{color:var(--orange);font-weight:600}
  .t-ok{color:var(--green);font-weight:600}
  .t-json{color:var(--text-t);padding-left:16px}
  .t-data{color:var(--accent-l);padding-left:16px}
  .t-gap{height:12px}
  .terminal-ctrl{
    padding:12px 20px;
    border-top:1px solid var(--border);
    display:flex;justify-content:flex-end;
  }
  .btn-replay{
    display:inline-flex;align-items:center;gap:6px;
    padding:6px 14px;border-radius:8px;
    background:var(--bg-card);border:1px solid var(--border);
    color:var(--text-s);font-size:.78rem;font-weight:500;
    cursor:pointer;transition:all .2s;font-family:inherit;
  }
  .btn-replay:hover{border-color:var(--accent);color:var(--accent)}
  .btn-replay svg{width:14px;height:14px}

  /* Steps */
  .steps{display:grid;grid-template-columns:repeat(5,1fr);gap:0;position:relative}
  .steps::before{
    content:'';position:absolute;top:28px;left:10%;right:10%;
    height:2px;background:var(--border);
  }
  .step{text-align:center;position:relative;padding:0 8px}
  .step-num{
    width:56px;height:56px;border-radius:50%;
    background:var(--bg-card);border:2px solid var(--border);
    display:flex;align-items:center;justify-content:center;
    font-size:1.1rem;font-weight:700;color:var(--accent);
    margin:0 auto 20px;position:relative;z-index:1;
    transition:all .3s;
  }
  .step:hover .step-num{border-color:var(--accent);box-shadow:0 0 20px var(--accent-g)}
  .step h3{font-size:.9rem;font-weight:700;margin-bottom:8px}
  .step p{font-size:.8rem;color:var(--text-s);line-height:1.5}
  .step-code{
    margin-top:12px;font-family:'JetBrains Mono',monospace;
    font-size:.7rem;color:var(--text-t);
    background:var(--bg-code);padding:6px 10px;border-radius:6px;
    display:inline-block;
  }
  @media(max-width:768px){
    .steps{grid-template-columns:1fr;gap:24px}
    .steps::before{display:none}
    .step{text-align:left;display:grid;grid-template-columns:56px 1fr;gap:16px;align-items:start}
    .step-num{margin:0}
    .step h3,.step p,.step-code{grid-column:2}
  }

  /* Technical Highlights */
  .th-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
  @media(max-width:768px){.th-grid{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:480px){.th-grid{grid-template-columns:1fr}}
  .th-card{
    background:var(--bg-card);border:1px solid var(--border);
    border-radius:var(--radius);padding:28px;text-align:center;
    transition:all .3s;position:relative;overflow:hidden;
  }
  .th-card:hover{border-color:var(--accent);transform:translateY(-3px)}
  .th-card::before{
    content:'';position:absolute;top:0;left:0;right:0;height:2px;
    opacity:0;transition:opacity .3s;
  }
  .th-card:hover::before{opacity:1}
  .th-card:nth-child(1)::before{background:var(--green)}
  .th-card:nth-child(2)::before{background:var(--accent)}
  .th-card:nth-child(3)::before{background:var(--purple)}
  .th-card:nth-child(4)::before{background:var(--orange)}
  .th-icon{
    width:52px;height:52px;border-radius:14px;
    display:flex;align-items:center;justify-content:center;
    margin:0 auto 16px;
  }
  .th-icon svg{width:26px;height:26px}
  .th-card:nth-child(1) .th-icon{background:rgba(34,197,94,0.1);color:var(--green)}
  .th-card:nth-child(2) .th-icon{background:var(--accent-g);color:var(--accent)}
  .th-card:nth-child(3) .th-icon{background:rgba(167,139,250,0.1);color:var(--purple)}
  .th-card:nth-child(4) .th-icon{background:rgba(245,158,11,0.1);color:var(--orange)}
  .th-card h3{font-size:.95rem;font-weight:700;margin-bottom:8px}
  .th-card p{font-size:.82rem;color:var(--text-s);line-height:1.5;margin-bottom:12px}
  .th-metric{
    font-family:'JetBrains Mono',monospace;font-size:.75rem;
    color:var(--text-t);background:var(--bg-code);
    padding:6px 12px;border-radius:6px;display:inline-block;
    border:1px solid var(--border);
  }

  /* Architecture */
  .arch-layers{display:flex;flex-direction:column;gap:12px;max-width:750px;margin:0 auto}
  .arch-layer{
    display:flex;align-items:center;gap:16px;
    background:var(--bg-card);border:1px solid var(--border);
    border-radius:var(--radius-s);padding:20px 24px;
    transition:all .3s;
  }
  .arch-layer:hover{border-color:var(--accent);transform:translateX(4px)}
  .arch-layer-num{
    width:36px;height:36px;border-radius:8px;
    background:var(--accent-g);color:var(--accent);
    display:flex;align-items:center;justify-content:center;
    font-weight:700;font-size:.85rem;flex-shrink:0;
  }
  .arch-layer-name{
    font-family:'JetBrains Mono',monospace;font-size:.85rem;
    font-weight:700;color:var(--accent-l);min-width:140px;
  }
  .arch-layer-desc{font-size:.85rem;color:var(--text-s);flex:1}
  .arch-layer-meta{
    display:flex;gap:8px;flex-shrink:0;
  }
  .arch-layer-badge{
    font-family:'JetBrains Mono',monospace;font-size:.68rem;
    padding:3px 8px;border-radius:6px;white-space:nowrap;font-weight:600;
  }
  .arch-layer-loc{background:rgba(0,152,234,0.08);color:var(--accent)}
  .arch-layer-test{background:rgba(34,197,94,0.08);color:var(--green)}
  .arch-layer-deps{
    font-family:'JetBrains Mono',monospace;font-size:.7rem;
    color:var(--text-t);white-space:nowrap;
  }
  @media(max-width:640px){
    .arch-layer{flex-wrap:wrap}
    .arch-layer-name{min-width:auto}
    .arch-layer-meta{width:100%;justify-content:flex-start;margin-top:8px}
  }

  /* Live Demo */
  .demo-grid{display:grid;grid-template-columns:340px 1fr;gap:20px}
  @media(max-width:768px){.demo-grid{grid-template-columns:1fr}}
  .panel{
    background:var(--bg-card);border:1px solid var(--border);
    border-radius:var(--radius);overflow:hidden;
  }
  .panel-hd{
    padding:16px 20px;border-bottom:1px solid var(--border);
    font-weight:600;font-size:.85rem;color:var(--text-s);
    display:flex;align-items:center;gap:8px;
    text-transform:uppercase;letter-spacing:.06em;
  }
  .panel-hd svg{width:16px;height:16px;color:var(--accent)}
  .panel-bd{padding:16px}
  .ep-btn{
    display:flex;justify-content:space-between;align-items:center;
    padding:14px 16px;
    background:var(--bg-code);border:1px solid var(--border);
    border-radius:var(--radius-s);
    margin-bottom:8px;cursor:pointer;
    transition:all .2s;color:var(--text);
    font-family:'JetBrains Mono',monospace;font-size:.82rem;
    width:100%;text-align:left;
  }
  .ep-btn:last-child{margin-bottom:0}
  .ep-btn:hover{border-color:rgba(0,152,234,0.4);background:rgba(0,152,234,0.04)}
  .ep-btn.active{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent),0 0 20px var(--accent-g)}
  .ep-method{font-weight:700;color:var(--green);margin-right:6px}
  .ep-price{
    font-size:.72rem;padding:4px 10px;border-radius:100px;font-weight:600;
    white-space:nowrap;
  }
  .ep-free{background:rgba(34,197,94,0.08);color:var(--green)}
  .ep-paid{background:var(--accent-g);color:var(--accent)}
  .resp-area{
    background:var(--bg-code);border:1px solid var(--border);
    border-radius:var(--radius-s);padding:20px;
    font-family:'JetBrains Mono',monospace;font-size:.8rem;
    line-height:1.7;min-height:280px;
    overflow-x:auto;white-space:pre-wrap;color:var(--text-s);
  }
  .resp-badge{
    display:inline-block;padding:4px 10px;border-radius:6px;
    font-weight:700;font-size:.75rem;margin-bottom:12px;
  }
  .resp-200{background:rgba(34,197,94,0.1);color:var(--green)}
  .resp-402{background:rgba(245,158,11,0.1);color:var(--orange)}

  /* Code */
  .code-tabs{display:flex;gap:0;overflow-x:auto}
  .code-tab{
    padding:10px 20px;background:var(--bg-card);
    border:1px solid var(--border);border-bottom:none;
    cursor:pointer;font-size:.82rem;color:var(--text-s);
    border-radius:var(--radius-s) var(--radius-s) 0 0;
    transition:all .2s;white-space:nowrap;font-weight:500;
    font-family:inherit;
  }
  .code-tab.active{
    background:var(--bg-code);color:var(--text);
    border-color:var(--accent);border-bottom:1px solid var(--bg-code);
    margin-bottom:-1px;z-index:1;
  }
  .code-block{
    background:var(--bg-code);border:1px solid var(--border);
    border-radius:0 var(--radius-s) var(--radius-s) var(--radius-s);
    padding:28px;position:relative;
    font-family:'JetBrains Mono',monospace;font-size:.82rem;line-height:1.8;
    overflow-x:auto;display:none;
  }
  .code-block.active{display:block}
  .kw{color:#C792EA}.str{color:#C3E88D}.fn{color:#82AAFF}
  .cm{color:#546E7A}.num{color:#F78C6C}.op{color:var(--text-s)}
  .code-copy{
    position:absolute;top:12px;right:12px;
    padding:6px 12px;border-radius:6px;
    background:var(--bg-card);border:1px solid var(--border);
    color:var(--text-s);font-size:.72rem;font-weight:500;
    cursor:pointer;transition:all .2s;font-family:inherit;
  }
  .code-copy:hover{border-color:var(--accent);color:var(--accent)}

  /* Roadmap */
  .rm-timeline{max-width:700px;margin:0 auto;position:relative;padding-left:40px}
  .rm-timeline::before{
    content:'';position:absolute;left:15px;top:8px;bottom:8px;
    width:2px;background:var(--border);
  }
  .rm-item{position:relative;margin-bottom:32px}
  .rm-item:last-child{margin-bottom:0}
  .rm-dot{
    position:absolute;left:-33px;top:4px;
    width:14px;height:14px;border-radius:50%;
    border:2px solid var(--border);
    background:var(--bg);z-index:1;
  }
  .rm-item.shipped .rm-dot{border-color:var(--green);background:var(--green)}
  .rm-item.current .rm-dot{border-color:var(--accent);background:var(--accent);box-shadow:0 0 12px var(--accent-g)}
  .rm-item.planned .rm-dot{border-color:var(--text-t)}
  .rm-ver{
    font-family:'JetBrains Mono',monospace;font-size:.82rem;
    font-weight:700;margin-bottom:4px;
  }
  .rm-item.shipped .rm-ver{color:var(--green)}
  .rm-item.current .rm-ver{color:var(--accent)}
  .rm-item.planned .rm-ver{color:var(--text-t)}
  .rm-title{font-size:1rem;font-weight:700;margin-bottom:6px}
  .rm-desc{font-size:.85rem;color:var(--text-s);line-height:1.6}
  .rm-tag{
    display:inline-block;font-size:.7rem;font-weight:600;
    padding:2px 8px;border-radius:4px;margin-top:8px;
  }
  .rm-shipped{background:rgba(34,197,94,0.1);color:var(--green)}
  .rm-wip{background:var(--accent-g);color:var(--accent)}
  .rm-plan{background:rgba(72,78,108,0.2);color:var(--text-t)}

  /* CTA */
  .cta-section{
    padding:120px 24px;text-align:center;position:relative;
    background:linear-gradient(180deg,var(--bg-s) 0%,var(--bg) 100%);
  }
  .cta-section::before{
    content:'';position:absolute;inset:0;
    background:radial-gradient(ellipse 800px 400px at 50% 50%,rgba(0,152,234,0.08) 0%,transparent 70%);
  }
  .cta-content{position:relative;max-width:600px;margin:0 auto}
  .cta-content h2{
    font-size:clamp(2rem,5vw,3rem);font-weight:900;
    letter-spacing:-.03em;margin-bottom:16px;
  }
  .cta-content p{font-size:1.05rem;color:var(--text-s);margin-bottom:40px;line-height:1.7}
  .cta-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:32px}
  .cta-note{font-size:.82rem;color:var(--text-t)}
  .cta-note code{
    font-family:'JetBrains Mono',monospace;
    background:var(--bg-card);padding:2px 8px;border-radius:4px;
    border:1px solid var(--border);color:var(--text-s);
  }

  /* Footer */
  .footer{
    text-align:center;padding:48px 24px;
    border-top:1px solid var(--border);
  }
  .footer-links{display:flex;justify-content:center;gap:32px;margin-bottom:16px;flex-wrap:wrap}
  .footer-links a{color:var(--text-s);text-decoration:none;font-size:.85rem;font-weight:500;transition:color .2s}
  .footer-links a:hover{color:var(--accent)}
  .footer-copy{font-size:.8rem;color:var(--text-t)}
  .footer-copy a{color:var(--text-s);text-decoration:none}
  .footer-copy a:hover{color:var(--accent)}

  /* Cursor blink */
  .cursor{display:inline-block;width:8px;height:16px;background:var(--accent);animation:blink 1s step-end infinite;vertical-align:text-bottom;margin-left:2px}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}

  /* Smooth reveal */
  .reveal{opacity:0;transform:translateY(20px);transition:all .6s cubic-bezier(.4,0,.2,1)}
  .reveal.visible{opacity:1;transform:translateY(0)}

  @media(max-width:640px){
    .hero{padding:100px 20px 60px}
    .hero h1{font-size:2.5rem}
    .hero-stats{gap:24px}
    .section{padding:80px 20px}
    .nav-links a:not(.nav-gh){display:none}
  }
  `;
}

function buildNav(): string {
  return `
  <nav class="nav" id="nav">
    <div class="nav-inner">
      <a href="#" class="nav-logo">ton-<span>x402</span></a>
      <div class="nav-links">
        <a href="#agent">Demo</a>
        <a href="#use-cases">Use Cases</a>
        <a href="#how">Protocol</a>
        <a href="#code">Quick Start</a>
        <a href="https://github.com/Arusasaki/ton-x402" target="_blank" class="nav-gh">
          <svg viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
          GitHub
        </a>
      </div>
    </div>
  </nav>`;
}

function buildHero(): string {
  return `
  <section class="hero">
    <div class="hero-bg"></div>
    <div class="hero-grid"></div>
    <div class="hero-content">
      <div class="hero-track">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        TON AI Agent Hackathon &mdash; Agent Infrastructure Track
      </div>
      <div class="hero-badge">
        <span class="hero-badge-dot"></span>
        First x402 implementation on TON
      </div>
      <div class="hero-logo">
        <svg viewBox="0 0 56 56" fill="none">
          <path d="M28 56C43.464 56 56 43.464 56 28C56 12.536 43.464 0 28 0C12.536 0 0 12.536 0 28C0 43.464 12.536 56 28 56Z" fill="#0098EA"/>
          <path d="M37.5603 15.6277H18.4386C14.9228 15.6277 12.6944 19.4202 14.4632 22.4861L26.2644 42.9409C27.0345 44.2765 28.9644 44.2765 29.7345 42.9409L41.5381 22.4861C43.3045 19.4251 41.0761 15.6277 37.5627 15.6277H37.5603ZM26.2548 36.8068L23.6847 31.8327L17.4833 20.7414C17.0742 20.0315 17.5795 19.1218 18.4362 19.1218H26.2524V36.8092L26.2548 36.8068ZM38.5108 20.739L32.3118 31.8351L29.7417 36.8068V19.1194H37.5579C38.4146 19.1194 38.9199 20.0291 38.5108 20.739Z" fill="white"/>
        </svg>
      </div>
      <h1>AI agents can browse the web.<br/>Now they can <span class="gr">pay for it</span>.</h1>
      <p class="hero-sub">The x402 protocol brings HTTP 402 Payment Required to life on TON &mdash; enabling autonomous machine-to-machine payments for the 1B+ Telegram user ecosystem.</p>
      <div class="hero-cta">
        <a href="#agent" class="btn btn-p">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Watch Demo
        </a>
        <a href="#code" class="btn btn-s">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          Quick Start
        </a>
      </div>
      <div class="hero-stats">
        <div class="hero-stat">
          <div class="hero-stat-val">1B+</div>
          <div class="hero-stat-lbl">Telegram Users</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-val">~5s</div>
          <div class="hero-stat-lbl">Finality</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-val">~$0.01</div>
          <div class="hero-stat-lbl">Per Transaction</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-val">34</div>
          <div class="hero-stat-lbl">Tests Passing</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-val">5</div>
          <div class="hero-stat-lbl">NPM Packages</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-val">0</div>
          <div class="hero-stat-lbl">Core Deps</div>
        </div>
      </div>
    </div>
  </section>`;
}

function buildProblem(): string {
  return `
  <section class="section">
    <div class="container section-center">
      <div class="reveal">
        <div class="section-label">The Problem</div>
        <h2 class="section-title">API monetization is broken for the AI era</h2>
        <p class="section-desc">AI agents need to access hundreds of APIs autonomously. Today's authentication model was designed for humans, not machines.</p>
      </div>
      <div class="problem-grid reveal">
        <div class="problem-col problem-before">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            Today
          </h3>
          <ul>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              Sign up on a website, verify email, add credit card
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              Manage API keys, handle rate limits, track quotas
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              Monthly subscriptions for services used once
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              AI agents cannot autonomously discover and pay for new APIs
            </li>
          </ul>
        </div>
        <div class="problem-arrow">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </div>
        <div class="problem-col problem-after">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            With x402
          </h3>
          <ul>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              No signup. No API keys. Just HTTP requests.
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              Pay-per-request. Only pay for what you actually use.
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              Micropayments as low as $0.01 per request via TON
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              AI agents discover, negotiate, and pay automatically
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>`;
}

function buildAgentDemo(): string {
  return `
  <section class="section" id="agent">
    <div class="container section-center">
      <div class="reveal">
        <div class="section-label">Live Simulation</div>
        <h2 class="section-title">Watch an AI Agent Pay for Data</h2>
        <p class="section-desc">A Claude agent receives a task, discovers a paid API, sends TON automatically via x402, and retrieves premium data &mdash; zero human intervention.</p>
      </div>
      <div class="terminal-wrap reveal">
        <div class="terminal">
          <div class="terminal-bar">
            <div class="terminal-dots"><i></i><i></i><i></i></div>
            <span class="terminal-ttl">claude-code &mdash; x402 agent (MCP: ton-x402)</span>
          </div>
          <div class="terminal-body" id="terminal"></div>
          <div class="terminal-ctrl">
            <button class="btn-replay" id="replay-btn" onclick="replayTerminal()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
              Replay
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

function buildUseCases(): string {
  return `
  <section class="section" id="use-cases">
    <div class="container">
      <div class="reveal section-center">
        <div class="section-label">Use Cases</div>
        <h2 class="section-title">What can you build with x402 on TON?</h2>
        <p class="section-desc">From AI research agents to Telegram bot economies &mdash; x402 enables entirely new business models where machines transact autonomously.</p>
      </div>
      <div class="uc-grid reveal">
        <div class="uc-card">
          <div class="uc-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a4 4 0 0 0-4 4c0 2 2 3 2 6H14c0-3 2-4 2-6a4 4 0 0 0-4-4z"/><line x1="10" y1="16" x2="14" y2="16"/><line x1="10" y1="19" x2="14" y2="19"/><line x1="11" y1="22" x2="13" y2="22"/></svg>
          </div>
          <h3>AI Research Agents</h3>
          <div class="uc-market">$50B+ AI agent market by 2028</div>
          <p>Agents autonomously access premium data sources &mdash; financial feeds, scientific databases, proprietary datasets &mdash; paying per-request without pre-registration.</p>
          <div class="uc-example">agent.fetch("https://api.example.com/research") // auto-pays 0.05 TON</div>
        </div>
        <div class="uc-card">
          <div class="uc-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          </div>
          <h3>API Monetization</h3>
          <div class="uc-market">$6B+ API economy</div>
          <p>Monetize any API endpoint with a single middleware line. No Stripe, no billing dashboard, no invoices. Revenue flows directly to your TON wallet in real-time.</p>
          <div class="uc-example">app.use("/api/*", x402({ amount: "0.01", recipient: wallet }))</div>
        </div>
        <div class="uc-card">
          <div class="uc-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><path d="M11 18H8a2 2 0 0 1-2-2V9"/></svg>
          </div>
          <h3>Agent-to-Agent Commerce</h3>
          <div class="uc-market">Multi-agent orchestration</div>
          <p>Agents compose services from other agents. An orchestrator agent pays specialist agents for translation, summarization, image generation &mdash; all via x402.</p>
          <div class="uc-example">orchestrator -&gt; [translator, summarizer, renderer] // each 402</div>
        </div>
        <div class="uc-card">
          <div class="uc-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <h3>Telegram Bot Economy</h3>
          <div class="uc-market">1B+ users with built-in wallets</div>
          <p>Build Telegram bots that offer premium features with instant TON payments. 1B+ users already have TON wallets in Telegram &mdash; zero friction to pay.</p>
          <div class="uc-example">bot.command("/premium", () =&gt; x402Gate(0.01)) // 1B+ potential users</div>
        </div>
      </div>
    </div>
  </section>`;
}

function buildWhyTon(): string {
  return `
  <section class="section" id="why-ton">
    <div class="container section-center">
      <div class="reveal">
        <div class="section-label">Why TON</div>
        <h2 class="section-title">The ideal chain for machine payments</h2>
        <p class="section-desc">TON combines the speed, cost, and reach needed for autonomous agent infrastructure at global scale.</p>
      </div>
      <div class="ton-grid reveal">
        <div class="ton-card">
          <div class="ton-val">1B+</div>
          <div class="ton-label">Built-in User Base</div>
          <div class="ton-detail">Every Telegram user has a TON wallet. No onboarding, no wallet install, no seed phrase friction.</div>
        </div>
        <div class="ton-card">
          <div class="ton-val">~$0.01</div>
          <div class="ton-label">Per Transaction</div>
          <div class="ton-detail">True micropayments are viable. Pay $0.01 per API call without the fee eating the payment.</div>
        </div>
        <div class="ton-card">
          <div class="ton-val">~5s</div>
          <div class="ton-label">Finality</div>
          <div class="ton-detail">Fast enough for synchronous HTTP flows. Pay, verify, and receive data in a single user-perceived request.</div>
        </div>
      </div>
      <div class="reveal" style="overflow-x:auto">
        <table class="compare-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th>TON (this project)</th>
              <th>Base</th>
              <th>Solana</th>
              <th>Aptos</th>
              <th>Ethereum</th>
            </tr>
          </thead>
          <tbody>
            <tr class="hl">
              <td>x402 Protocol</td>
              <td class="check">Yes</td>
              <td class="check">Yes</td>
              <td class="check">Yes</td>
              <td class="check">Yes</td>
              <td class="check">Yes</td>
            </tr>
            <tr>
              <td>Tx Finality</td>
              <td>~5s</td>
              <td>~2s</td>
              <td>~0.4s</td>
              <td>~1s</td>
              <td>~12s</td>
            </tr>
            <tr>
              <td>Tx Fee</td>
              <td>~$0.01</td>
              <td>~$0.01</td>
              <td>~$0.001</td>
              <td>~$0.005</td>
              <td>$1-10</td>
            </tr>
            <tr>
              <td>Micropayments</td>
              <td class="check">Excellent</td>
              <td>Good</td>
              <td class="check">Excellent</td>
              <td>Good</td>
              <td class="cross">Poor</td>
            </tr>
            <tr class="hl">
              <td>Built-in User Base</td>
              <td class="check">1B+ (Telegram)</td>
              <td>Growing</td>
              <td>Growing</td>
              <td>Growing</td>
              <td>Large</td>
            </tr>
            <tr class="hl">
              <td>MCP Server for AI</td>
              <td class="check">Included</td>
              <td class="cross">No</td>
              <td class="cross">No</td>
              <td class="cross">No</td>
              <td class="cross">No</td>
            </tr>
            <tr>
              <td>Composable Packages</td>
              <td class="check">5 npm packages</td>
              <td>1 SDK</td>
              <td>1 SDK</td>
              <td>1 SDK</td>
              <td>1 SDK</td>
            </tr>
            <tr>
              <td>Test Coverage</td>
              <td class="check">34 tests</td>
              <td class="cross">N/A</td>
              <td class="cross">N/A</td>
              <td class="cross">N/A</td>
              <td class="cross">N/A</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>`;
}

function buildHowItWorks(): string {
  return `
  <section class="section" id="how">
    <div class="container section-center">
      <div class="reveal">
        <div class="section-label">Protocol</div>
        <h2 class="section-title">How x402 Works</h2>
        <p class="section-desc">Standard HTTP semantics. No new protocols to learn. If your agent can make HTTP requests, it can pay for APIs.</p>
      </div>
      <div class="steps reveal">
        <div class="step">
          <div class="step-num">1</div>
          <div>
            <h3>HTTP Request</h3>
            <p>Agent sends a standard GET/POST to any API endpoint.</p>
            <div class="step-code">GET /api/data</div>
          </div>
        </div>
        <div class="step">
          <div class="step-num">2</div>
          <div>
            <h3>402 Response</h3>
            <p>Server responds with payment details: recipient wallet, amount, and network.</p>
            <div class="step-code">402 + payload</div>
          </div>
        </div>
        <div class="step">
          <div class="step-num">3</div>
          <div>
            <h3>TON Payment</h3>
            <p>Client auto-sends TON to the specified recipient. ~5s confirmation.</p>
            <div class="step-code">transfer()</div>
          </div>
        </div>
        <div class="step">
          <div class="step-num">4</div>
          <div>
            <h3>Retry + Proof</h3>
            <p>Request is retried with the payment proof in headers (base64 BOC).</p>
            <div class="step-code">X-Payment-Proof</div>
          </div>
        </div>
        <div class="step">
          <div class="step-num">5</div>
          <div>
            <h3>200 OK</h3>
            <p>Server verifies the transaction on-chain and returns premium data.</p>
            <div class="step-code">200 + data</div>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

function buildTechnicalHighlights(): string {
  return `
  <section class="section" id="tech">
    <div class="container section-center">
      <div class="reveal">
        <div class="section-label">Engineering</div>
        <h2 class="section-title">Built for production, not just demos</h2>
        <p class="section-desc">Every design decision optimizes for real-world deployment. Zero dependencies in the core, comprehensive tests, and safety-first architecture.</p>
      </div>
      <div class="th-grid reveal">
        <div class="th-card">
          <div class="th-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h3>On-Chain Verification</h3>
          <p>Every payment is verified directly against the TON blockchain. Not trusted headers &mdash; cryptographic proof via BOC deserialization.</p>
          <div class="th-metric">5 verification checks</div>
        </div>
        <div class="th-card">
          <div class="th-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h3>Safety Limits</h3>
          <p>Configurable maxAutoPayAmount prevents accidental overspending. Agents can estimate costs before paying via x402_estimate.</p>
          <div class="th-metric">maxAutoPayAmount guard</div>
        </div>
        <div class="th-card">
          <div class="th-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
          </div>
          <h3>Idempotency</h3>
          <p>Unique paymentId per 402 response prevents double payments. Clients and servers can safely retry without duplicate charges.</p>
          <div class="th-metric">paymentId per request</div>
        </div>
        <div class="th-card">
          <div class="th-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
          </div>
          <h3>Zero-Dep Core</h3>
          <p>@ton-x402/core has zero external dependencies. Shared types and utilities with no supply-chain risk. Tree-shakeable ESM + CJS builds.</p>
          <div class="th-metric">0 dependencies</div>
        </div>
      </div>
    </div>
  </section>`;
}

function buildArchitecture(): string {
  return `
  <section class="section" id="arch">
    <div class="container section-center">
      <div class="reveal">
        <div class="section-label">Architecture</div>
        <h2 class="section-title">5 composable packages, zero lock-in</h2>
        <p class="section-desc">Production-ready, fully typed TypeScript packages. Use the full stack or pick individual layers. Each package has a single responsibility.</p>
      </div>
      <div class="arch-layers reveal">
        <div class="arch-layer">
          <div class="arch-layer-num">5</div>
          <div class="arch-layer-name">@ton-x402/mcp</div>
          <div class="arch-layer-desc">MCP server giving AI agents (Claude, GPT) 4 tools: fetch, balance, estimate, history</div>
          <div class="arch-layer-meta">
            <span class="arch-layer-badge arch-layer-loc">223 LoC</span>
            <span class="arch-layer-badge arch-layer-test">3 tests</span>
          </div>
        </div>
        <div class="arch-layer">
          <div class="arch-layer-num">4</div>
          <div class="arch-layer-name">@ton-x402/client</div>
          <div class="arch-layer-desc">Auto-paying HTTP client. Detects 402, sends TON, retries with proof</div>
          <div class="arch-layer-meta">
            <span class="arch-layer-badge arch-layer-loc">218 LoC</span>
            <span class="arch-layer-badge arch-layer-test">8 tests</span>
          </div>
        </div>
        <div class="arch-layer">
          <div class="arch-layer-num">3</div>
          <div class="arch-layer-name">@ton-x402/server</div>
          <div class="arch-layer-desc">Hono middleware that payment-gates any endpoint with a single line</div>
          <div class="arch-layer-meta">
            <span class="arch-layer-badge arch-layer-loc">89 LoC</span>
            <span class="arch-layer-badge arch-layer-test">4 tests</span>
          </div>
        </div>
        <div class="arch-layer">
          <div class="arch-layer-num">2</div>
          <div class="arch-layer-name">@ton-x402/verify</div>
          <div class="arch-layer-desc">On-chain payment verification via TON API. Confirms tx matches expected params</div>
          <div class="arch-layer-meta">
            <span class="arch-layer-badge arch-layer-loc">124 LoC</span>
            <span class="arch-layer-badge arch-layer-test">5 tests</span>
          </div>
        </div>
        <div class="arch-layer">
          <div class="arch-layer-num">1</div>
          <div class="arch-layer-name">@ton-x402/core</div>
          <div class="arch-layer-desc">Shared types, header constants, utility functions. Zero external dependencies</div>
          <div class="arch-layer-meta">
            <span class="arch-layer-badge arch-layer-loc">125 LoC</span>
            <span class="arch-layer-badge arch-layer-test">14 tests</span>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

function buildLiveDemo(): string {
  return `
  <section class="section" id="demo">
    <div class="container">
      <div class="reveal">
        <div class="section-label">Try It Now</div>
        <h2 class="section-title">Interactive API Explorer</h2>
        <p class="section-desc">Hit the live endpoints below. Free endpoints return 200 OK. Premium endpoints return 402 with TON payment details &mdash; exactly what an x402 client would see.</p>
      </div>
      <div class="demo-grid reveal">
        <div class="panel">
          <div class="panel-hd">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
            Endpoints
          </div>
          <div class="panel-bd">
            <button class="ep-btn" onclick="tryEndpoint('/api/info',this)">
              <span><span class="ep-method">GET</span>/api/info</span>
              <span class="ep-price ep-free">Free</span>
            </button>
            <button class="ep-btn" onclick="tryEndpoint('/api/premium/joke',this)">
              <span><span class="ep-method">GET</span>/api/premium/joke</span>
              <span class="ep-price ep-paid">0.01 TON</span>
            </button>
            <button class="ep-btn" onclick="tryEndpoint('/api/premium/data',this)">
              <span><span class="ep-method">GET</span>/api/premium/data</span>
              <span class="ep-price ep-paid">0.05 TON</span>
            </button>
          </div>
        </div>
        <div class="panel">
          <div class="panel-hd">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
            Response
          </div>
          <div class="panel-bd">
            <div class="resp-area" id="output">Select an endpoint to see the live response...</div>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

function buildCodeExamples(): string {
  return `
  <section class="section" id="code">
    <div class="container">
      <div class="reveal">
        <div class="section-label">Quick Start</div>
        <h2 class="section-title">Production-ready in 5 minutes</h2>
        <p class="section-desc">Protect your API with payment gates, build auto-paying clients, or give your AI agent a TON wallet via MCP.</p>
      </div>
      <div class="reveal">
        <div class="code-tabs">
          <button class="code-tab active" onclick="showTab('server',this)">Server</button>
          <button class="code-tab" onclick="showTab('client',this)">Client</button>
          <button class="code-tab" onclick="showTab('mcp',this)">MCP Agent</button>
          <button class="code-tab" onclick="showTab('curl',this)">curl</button>
        </div>
        <pre class="code-block active" id="tab-server"><span class="cm">// npm install @ton-x402/server hono</span>

<span class="kw">import</span> { Hono } <span class="kw">from</span> <span class="str">"hono"</span>;
<span class="kw">import</span> { x402 } <span class="kw">from</span> <span class="str">"@ton-x402/server"</span>;

<span class="kw">const</span> app = <span class="kw">new</span> <span class="fn">Hono</span>();

<span class="cm">// One line to payment-gate any endpoint</span>
app.<span class="fn">use</span>(<span class="str">"/api/premium/*"</span>, <span class="fn">x402</span>({
  recipient: <span class="str">"UQB...your-wallet"</span>,
  amount:    <span class="str">"0.05"</span>,     <span class="cm">// 0.05 TON per request</span>
  network:   <span class="str">"testnet"</span>,
}));

app.<span class="fn">get</span>(<span class="str">"/api/premium/data"</span>, (c) =&gt; {
  <span class="kw">return</span> c.<span class="fn">json</span>({ data: <span class="str">"premium content"</span> });
});</pre>
        <pre class="code-block" id="tab-client"><span class="cm">// npm install @ton-x402/client</span>

<span class="kw">import</span> { X402Client } <span class="kw">from</span> <span class="str">"@ton-x402/client"</span>;

<span class="kw">const</span> client = <span class="kw">new</span> <span class="fn">X402Client</span>({
  mnemonic:         process.env.TON_MNEMONIC.<span class="fn">split</span>(<span class="str">" "</span>),
  network:          <span class="str">"testnet"</span>,
  maxAutoPayAmount: <span class="str">"0.1"</span>,  <span class="cm">// Safety cap</span>
});

<span class="cm">// Fetch like normal - payment is invisible</span>
<span class="kw">const</span> res  = <span class="kw">await</span> client.<span class="fn">fetch</span>(<span class="str">"https://api.example.com/premium/data"</span>);
<span class="kw">const</span> data = <span class="kw">await</span> res.<span class="fn">json</span>();
<span class="cm">// That's it. 402 -> pay -> retry happened automatically.</span></pre>
        <pre class="code-block" id="tab-mcp"><span class="cm">// Add to your AI agent's MCP config (Claude, GPT, etc.)</span>
<span class="cm">// npm install @ton-x402/mcp</span>

{
  <span class="str">"mcpServers"</span>: {
    <span class="str">"ton-x402"</span>: {
      <span class="str">"command"</span>: <span class="str">"npx"</span>,
      <span class="str">"args"</span>:    [<span class="str">"ton-x402-mcp"</span>],
      <span class="str">"env"</span>: {
        <span class="str">"TON_MNEMONIC"</span>: <span class="str">"word1 word2 ... word24"</span>,
        <span class="str">"TON_NETWORK"</span>: <span class="str">"testnet"</span>
      }
    }
  }
}

<span class="cm">// Your AI agent now has these tools:</span>
<span class="cm">//</span>
<span class="cm">//   x402_fetch    - Fetch any URL, auto-pay if 402</span>
<span class="cm">//   x402_balance  - Check TON wallet balance</span>
<span class="cm">//   x402_estimate - Preview cost without paying</span>
<span class="cm">//   x402_history  - View recent payments</span></pre>
        <pre class="code-block" id="tab-curl"><span class="cm"># 1. Free endpoint - returns 200 OK</span>
curl <span id="curl-base-free"></span>/api/info

<span class="cm"># 2. Premium endpoint - returns 402 Payment Required</span>
curl -i <span id="curl-base-premium"></span>/api/premium/joke

<span class="cm"># Response headers:</span>
<span class="cm">#   HTTP/2 402</span>
<span class="cm">#   X-Payment-Protocol: x402-ton</span>
<span class="cm">#</span>
<span class="cm"># Response body:</span>
<span class="cm">#   { "recipient": "UQDr...EPz4",</span>
<span class="cm">#     "amount": "10000000",</span>
<span class="cm">#     "token": "TON",</span>
<span class="cm">#     "network": "testnet" }</span>

<span class="cm"># 3. After paying on TON, retry with proof:</span>
curl -H <span class="str">"X-Payment-Proof: &lt;base64-boc&gt;"</span> \\
     -H <span class="str">"X-Payment-Id: &lt;payment-id&gt;"</span> \\
     -H <span class="str">"X-Payment-Sender: &lt;your-wallet&gt;"</span> \\
     <span id="curl-base-retry"></span>/api/premium/joke</pre>
      </div>
    </div>
  </section>`;
}

function buildRoadmap(): string {
  return `
  <section class="section" id="roadmap">
    <div class="container">
      <div class="reveal section-center">
        <div class="section-label">Roadmap</div>
        <h2 class="section-title">From hackathon to production</h2>
        <p class="section-desc">ton-x402 is shipping today with a clear path to production deployment. Each milestone is scoped and achievable.</p>
      </div>
      <div class="rm-timeline reveal">
        <div class="rm-item shipped">
          <div class="rm-dot"></div>
          <div class="rm-ver">v0.1 Foundation</div>
          <div class="rm-title">Core protocol + 5 packages + MCP server</div>
          <div class="rm-desc">Full x402 implementation: core types (0 deps), payment verification, Hono middleware, auto-paying client, and MCP server with 4 tools. 34 tests passing across all packages.</div>
          <span class="rm-tag rm-shipped">Shipped</span>
        </div>
        <div class="rm-item current">
          <div class="rm-dot"></div>
          <div class="rm-ver">v0.2 Demo &amp; Docs</div>
          <div class="rm-title">Live demo, landing page, hackathon submission</div>
          <div class="rm-desc">Interactive Cloudflare Worker demo with live 402 endpoints. Comprehensive documentation, getting-started guides, and this landing page.</div>
          <span class="rm-tag rm-wip">Current</span>
        </div>
        <div class="rm-item planned">
          <div class="rm-dot"></div>
          <div class="rm-ver">v0.3 Token Support</div>
          <div class="rm-title">Jetton payments (USDT, NOT, custom tokens)</div>
          <div class="rm-desc">Extend x402 to support Jetton (TRC-20) payments. Stablecoin support enables predictable pricing for API providers. Protocol version negotiation.</div>
          <span class="rm-tag rm-plan">Planned</span>
        </div>
        <div class="rm-item planned">
          <div class="rm-dot"></div>
          <div class="rm-ver">v0.4 Mainnet</div>
          <div class="rm-title">Production deployment + Express/Fastify adapters</div>
          <div class="rm-desc">Mainnet-ready verification with hardened security. Additional server framework adapters beyond Hono. Rate limiting, analytics, and monitoring hooks.</div>
          <span class="rm-tag rm-plan">Planned</span>
        </div>
        <div class="rm-item planned">
          <div class="rm-dot"></div>
          <div class="rm-ver">v0.5 Ecosystem</div>
          <div class="rm-title">Payment channels, marketplace, Telegram Mini App SDK</div>
          <div class="rm-desc">State channels for high-frequency micropayments. API marketplace where agents discover and pay for services. Telegram Mini App integration for consumer-facing x402 flows.</div>
          <span class="rm-tag rm-plan">Planned</span>
        </div>
      </div>
    </div>
  </section>`;
}

function buildCTA(): string {
  return `
  <section class="cta-section">
    <div class="cta-content">
      <h2>Start building the<br/><span class="gr">agent economy</span> on TON</h2>
      <p>5 packages. 34 tests. Full TypeScript. Zero-dep core. Whether you're monetizing APIs or building autonomous agents, ton-x402 gets you there in minutes.</p>
      <div class="cta-actions">
        <a href="https://github.com/Arusasaki/ton-x402" target="_blank" class="btn btn-p">
          <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
          View on GitHub
        </a>
        <a href="https://www.x402.org/" target="_blank" class="btn btn-s">
          Learn about x402
        </a>
      </div>
      <p class="cta-note">Install now: <code>npm install @ton-x402/client @ton-x402/server</code></p>
    </div>
  </section>`;
}

function buildFooter(): string {
  return `
  <footer class="footer">
    <div class="footer-links">
      <a href="https://github.com/Arusasaki/ton-x402" target="_blank">GitHub</a>
      <a href="https://www.npmjs.com/org/ton-x402" target="_blank">npm</a>
      <a href="https://www.x402.org/" target="_blank">x402 Protocol</a>
      <a href="https://ton.org" target="_blank">TON</a>
    </div>
    <div class="footer-copy">
      Built for the <a href="https://ton.org" target="_blank">TON Ecosystem</a> &mdash; Powering the agent economy
    </div>
  </footer>`;
}

function buildScript(): string {
  return `
    // Nav scroll effect
    var nav = document.getElementById('nav');
    window.addEventListener('scroll', function() {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    });

    // Reveal on scroll
    var reveals = document.querySelectorAll('.reveal');
    var revealObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          revealObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    reveals.forEach(function(el) { revealObs.observe(el); });

    // Curl URLs
    document.getElementById('curl-base-free').textContent = location.origin;
    document.getElementById('curl-base-premium').textContent = location.origin;
    document.getElementById('curl-base-retry').textContent = location.origin;

    // Terminal animation
    var termSteps = [
      { d:400, cls:'t-prompt', html:'<span class="cmd">$ claude "Get the latest TON/USDT market data from the premium API"</span>' },
      { d:900, cls:'t-gap' },
      { d:200, cls:'t-agent', html:'I\\'ll fetch the market data using the x402 payment protocol.' },
      { d:600, cls:'t-gap' },
      { d:150, cls:'t-log',  html:'> Using MCP tool: x402_estimate("' + location.origin + '/api/premium/data")' },
      { d:500, cls:'t-dim',  html:'  Estimated cost: 0.05 TON (~$0.17)' },
      { d:400, cls:'t-gap' },
      { d:150, cls:'t-log',  html:'> Using MCP tool: x402_balance()' },
      { d:300, cls:'t-dim',  html:'  Wallet: UQBx...4kQp | Balance: 0.94 TON (~$3.22)' },
      { d:400, cls:'t-gap' },
      { d:150, cls:'t-agent',html:'Cost is 0.05 TON. Balance is sufficient. Proceeding with payment.' },
      { d:500, cls:'t-gap' },
      { d:150, cls:'t-log',  html:'> Using MCP tool: x402_fetch("' + location.origin + '/api/premium/data")' },
      { d:600, cls:'t-gap' },
      { d:200, cls:'t-warn', html:'< HTTP 402 Payment Required' },
      { d:80,  cls:'t-dim',  html:'  X-Payment-Protocol: x402-ton' },
      { d:80,  cls:'t-json', html:'  { "recipient": "UQDr...EPz4", "amount": "50000000", "token": "TON" }' },
      { d:400, cls:'t-gap' },
      { d:200, cls:'t-log',  html:'> Sending TON transaction on testnet...' },
      { d:1200,cls:'t-ok',   html:'  [OK] Transaction confirmed (Ef8xK...3kQp) in 4.7s' },
      { d:250, cls:'t-log',  html:'> Retrying with X-Payment-Proof header...' },
      { d:500, cls:'t-ok',   html:'< HTTP 200 OK' },
      { d:400, cls:'t-gap' },
      { d:150, cls:'t-agent',html:'Here is the latest TON/USDT market data:' },
      { d:80,  cls:'t-gap' },
      { d:60,  cls:'t-data', html:'  Market:     TON/USDT' },
      { d:60,  cls:'t-data', html:'  Price:      $3.42' },
      { d:60,  cls:'t-data', html:'  24h Volume: $142,567,890' },
      { d:60,  cls:'t-data', html:'  24h Change: +5.2%' },
      { d:400, cls:'t-gap' },
      { d:150, cls:'t-dim',  html:'  Total cost: 0.05 TON (~$0.17) | Remaining balance: 0.89 TON' },
    ];

    var termEl = document.getElementById('terminal');
    var termTimers = [];
    var termStarted = false;

    function runTerminal() {
      termEl.innerHTML = '';
      termTimers.forEach(clearTimeout);
      termTimers = [];
      var total = 0;
      termSteps.forEach(function(s, i) {
        total += s.d;
        var t = setTimeout(function() {
          var div = document.createElement('div');
          div.className = 't-line ' + s.cls;
          if (s.html) div.innerHTML = s.html;
          termEl.appendChild(div);
          requestAnimationFrame(function() {
            div.classList.add('visible');
          });
          termEl.scrollTop = termEl.scrollHeight;
        }, total);
        termTimers.push(t);
      });
      // Add cursor at end
      var ct = setTimeout(function() {
        var cur = document.createElement('span');
        cur.className = 'cursor';
        termEl.appendChild(cur);
      }, total + 200);
      termTimers.push(ct);
    }

    function replayTerminal() { runTerminal(); }

    // Auto-play terminal when visible
    var termObs = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting && !termStarted) {
        termStarted = true;
        runTerminal();
      }
    }, { threshold: 0.3 });
    termObs.observe(document.getElementById('terminal'));

    // Interactive API demo
    function tryEndpoint(path, btn) {
      document.querySelectorAll('.ep-btn').forEach(function(b) { b.classList.remove('active'); });
      if (btn) btn.classList.add('active');
      var out = document.getElementById('output');
      out.innerHTML = '<span style="color:var(--text-t)">Loading...</span>';
      fetch(path).then(function(res) {
        return res.json().then(function(data) {
          var json = JSON.stringify(data, null, 2);
          json = json.replace(/(".*?")(\\s*:)?/g, function(m, k, c) {
            if (c) return '<span style="color:#82AAFF">' + k + '</span>' + c;
            return '<span style="color:#C3E88D">' + m + '</span>';
          }).replace(/\\b(\\d+)\\b/g, '<span style="color:#F78C6C">$1</span>')
            .replace(/\\b(true|false|null)\\b/g, '<span style="color:#C792EA">$1</span>');
          if (res.status === 402) {
            out.innerHTML = '<span class="resp-badge resp-402">HTTP 402 Payment Required</span>\\n' +
              '<span style="color:var(--orange)">X-Payment-Protocol: x402-ton</span>\\n\\n' +
              '<span style="color:var(--text-t)">// An x402 client would auto-pay and retry</span>\\n\\n' + json;
          } else {
            out.innerHTML = '<span class="resp-badge resp-200">HTTP 200 OK</span>\\n\\n' + json;
          }
        });
      }).catch(function(err) {
        out.innerHTML = '<span style="color:var(--red)">Error: ' + err.message + '</span>';
      });
    }

    // Code tabs
    function showTab(name, tab) {
      document.querySelectorAll('.code-block').forEach(function(b) { b.classList.remove('active'); });
      document.querySelectorAll('.code-tab').forEach(function(t) { t.classList.remove('active'); });
      document.getElementById('tab-' + name).classList.add('active');
      tab.classList.add('active');
    }
  `;
}
