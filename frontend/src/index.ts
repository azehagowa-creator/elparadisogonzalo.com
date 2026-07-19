export default {
  async fetch(request: Request): Promise<Response> {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>El Paradiso Gonzalo</title>

<meta name="description" content="Welcome to El Paradiso Gonzalo">

<style>
*{
margin:0;
padding:0;
box-sizing:border-box;
font-family:Segoe UI,Arial,sans-serif;
}

body{
background:#0b1220;
color:#fff;
}

header{
display:flex;
justify-content:space-between;
align-items:center;
padding:25px 8%;
background:#111827;
position:sticky;
top:0;
z-index:100;
}

.logo{
font-size:28px;
font-weight:bold;
color:#38bdf8;
}

nav a{
color:white;
text-decoration:none;
margin-left:25px;
transition:.3s;
}

nav a:hover{
color:#38bdf8;
}

.hero{
display:flex;
flex-wrap:wrap;
justify-content:space-between;
align-items:center;
padding:90px 8%;
gap:40px;
}

.left{
max-width:620px;
}

.left h1{
font-size:60px;
margin-bottom:20px;
}

.left p{
font-size:20px;
line-height:1.7;
color:#d1d5db;
}

.buttons{
margin-top:40px;
}

.btn{
display:inline-block;
padding:15px 28px;
border-radius:12px;
text-decoration:none;
font-weight:bold;
margin-right:15px;
transition:.3s;
}

.primary{
background:#2563eb;
color:white;
}

.primary:hover{
background:#1d4ed8;
}

.secondary{
border:1px solid #4b5563;
color:white;
}

.secondary:hover{
background:#374151;
}

.card{
width:360px;
background:#1f2937;
border-radius:20px;
padding:30px;
box-shadow:0 20px 50px rgba(0,0,0,.35);
}

.card h2{
margin-bottom:20px;
}

.status{
display:flex;
justify-content:space-between;
padding:12px 0;
border-bottom:1px solid #374151;
}

section{
padding:80px 8%;
}

.title{
text-align:center;
font-size:38px;
margin-bottom:60px;
}

.grid{
display:grid;
grid-template-columns:repeat(auto-fit,minmax(250px,1fr));
gap:25px;
}

.box{
background:#1f2937;
padding:30px;
border-radius:18px;
transition:.3s;
}

.box:hover{
transform:translateY(-6px);
}

.box h3{
margin-bottom:15px;
color:#38bdf8;
}

.steps{
display:grid;
gap:20px;
}

.step{
background:#1f2937;
padding:20px;
border-left:5px solid #2563eb;
border-radius:10px;
}

.deploy{
text-align:center;
background:#111827;
}

.deploy a{
display:inline-block;
margin-top:25px;
padding:16px 28px;
background:#22c55e;
color:white;
text-decoration:none;
border-radius:12px;
}

.deploy a:hover{
background:#16a34a;
}

footer{
background:#111827;
padding:40px;
text-align:center;
color:#9ca3af;
}

@media(max-width:900px){

.hero{
flex-direction:column;
text-align:center;
}

.left h1{
font-size:42px;
}

.card{
width:100%;
}

}
</style>

</head>

<body>

<header>
<div class="logo">El Paradiso Gonzalo</div>

<nav>
<a href="#features">Features</a>
<a href="#walkthrough">Walkthrough</a>
<a href="#deploy">Hosting</a>
</nav>
</header>

<div class="hero">

<div class="left">

<h1>Welcome to El Paradiso Gonzalo</h1>

<p>
A modern web application powered by Cloudflare Workers and designed with performance, security, and responsive user experience in mind.
</p>

<div class="buttons">

<a class="btn primary"
href="http://elparadisogonzalo.genyoungclip-0ce.workers.dev/"
target="_site">
Open Website
</a>

<a class="btn secondary"
href="#walkthrough">
Getting Started
</a>

</div>

</div>

<div class="card">

<h2>System Status</h2>

<div class="status"><span>Hosting</span><span>Online</span></div>
<div class="status"><span>Cloudflare</span><span>Workers</span></div>
<div class="status"><span>Responsive UI</span><span>Enabled</span></div>
<div class="status"><span>HTTPS</span><span>Ready</span></div>
<div class="status"><span>Deployment</span><span>Operational</span></div>

</div>

</div>

<section id="features">

<h2 class="title">Features</h2>

<div class="grid">

<div class="box">
<h3>Responsive Design</h3>
<p>Optimized for desktop, tablet, and mobile devices.</p>
</div>

<div class="box">
<h3>Fast Performance</h3>
<p>Built for speed with Cloudflare's global edge network.</p>
</div>

<div class="box">
<h3>Secure Hosting</h3>
<p>HTTPS-ready with modern security practices.</p>
</div>

<div class="box">
<h3>Easy Customization</h3>
<p>Update branding, pages, and features with ease.</p>
</div>

</div>

</section>

<section id="walkthrough">

<h2 class="title">Walkthrough</h2>

<div class="steps">

<div class="step">
<strong>Step 1</strong>
<p>Deploy this Worker using Wrangler.</p>
</div>

<div class="step">
<strong>Step 2</strong>
<p>Attach your custom domain from the Cloudflare Dashboard.</p>
</div>

<div class="step">
<strong>Step 3</strong>
<p>Enable SSL/TLS.</p>
</div>

<div class="step">
<strong>Step 4</strong>
<p>Publish future updates using <code>wrangler deploy</code>.</p>
</div>

</div>

</section>

<section class="deploy" id="deploy">

<h2 class="title">Deployment</h2>
