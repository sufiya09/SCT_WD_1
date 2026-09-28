const nav    = document.getElementById('nav');
const bar    = document.getElementById('bar');
const pill   = document.getElementById('pill');
const ul     = document.getElementById('links');
const burger = document.getElementById('burger');
const hero   = document.getElementById('home');
const links  = [...document.querySelectorAll('.links a')];

/* 1. On scroll: change the nav style and fill the progress bar */
function onScroll(){
  nav.classList.toggle('scrolled', scrollY > 40);
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = 'scaleX(' + (max > 0 ? scrollY / max : 0) + ')';
}
addEventListener('scroll', onScroll, { passive:true });
onScroll();

/* 2. On hover: slide the pill to the hovered link */
function movePill(a){
  if(!a) return;
  pill.style.opacity   = 1;
  pill.style.width     = a.offsetWidth + 'px';
  pill.style.transform = 'translateX(' + a.parentElement.offsetLeft + 'px)';
}
const activeLink = () => links.find(l => l.classList.contains('active'));

links.forEach(a => {
  a.addEventListener('mouseenter', () => movePill(a));
  a.addEventListener('focus',      () => movePill(a));
});
ul.addEventListener('mouseleave', () => movePill(activeLink()));
addEventListener('resize', () => movePill(activeLink()));

/* 3. Highlight the link for the section currently on screen */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(e.isIntersecting){
      links.forEach(l =>
        l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id)
      );
      movePill(activeLink());
    }
  });
}, { rootMargin:'-45% 0px -50% 0px' });

document.querySelectorAll('header[id], section[id]').forEach(s => observer.observe(s));

/* 4. Mobile hamburger menu */
burger.addEventListener('click', () => ul.classList.toggle('open'));
links.forEach(a => a.addEventListener('click', () => ul.classList.remove('open')));

/* 5. Glow follows the mouse in the hero */
hero.addEventListener('mousemove', e => {
  const r = hero.getBoundingClientRect();
  hero.style.setProperty('--mx', (e.clientX - r.left) + 'px');
  hero.style.setProperty('--my', (e.clientY - r.top)  + 'px');
});
/* ---------- LIVE BACKGROUND: STARS + FIREFLIES ---------- */
const canvas = document.getElementById('sky');
const ctx = canvas.getContext('2d');
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

let W, H, stars = [], flies = [];
const mouse = { x: -999, y: -999 };
const FIRE_COLORS = ['255,209,102', '255,138,92', '94,234,212'];   // gold, sunset, aqua

function resize(){
  const dpr = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth;  H = innerHeight;
  canvas.width = W * dpr;  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  stars = Array.from({ length: Math.round(W * H / 9000) }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.3 + 0.3,
    depth: Math.random() * 0.9 + 0.1,
    phase: Math.random() * 6.28,
    speed: Math.random() * 0.02 + 0.005
  }));

  flies = Array.from({ length: Math.min(28, Math.max(12, Math.round(W / 60))) }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 2 + 2,
    phase: Math.random() * 6.28,
    color: FIRE_COLORS[Math.floor(Math.random() * FIRE_COLORS.length)]
  }));
}
resize();
addEventListener('resize', resize);
addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

let t = 0;
function draw(){
  t++;
  ctx.clearRect(0, 0, W, H);

  // Stars: twinkle and drift slowly while scrolling
  for (const s of stars){
    const a = 0.5 + 0.5 * Math.sin(t * s.speed + s.phase);
    const y = ((s.y - scrollY * 0.12 * s.depth) % H + H) % H;
    ctx.beginPath();
    ctx.arc(s.x, y, s.r, 0, 6.28);
    ctx.fillStyle = 'rgba(245,241,234,' + a.toFixed(2) + ')';
    ctx.fill();
  }

  // Fireflies: wander, glow, and lean toward the cursor
  for (const f of flies){
    f.vx += (Math.random() - 0.5) * 0.03;
    f.vy += (Math.random() - 0.5) * 0.03;

    const dx = mouse.x - f.x, dy = mouse.y - f.y;
    if (dx * dx + dy * dy < 200 * 200){
      f.vx += dx * 0.00006;
      f.vy += dy * 0.00006;
    }

    f.vx *= 0.985;  f.vy *= 0.985;
    f.x += f.vx;    f.y += f.vy;
    if (f.x < -20) f.x = W + 20;   if (f.x > W + 20) f.x = -20;
    if (f.y < -20) f.y = H + 20;   if (f.y > H + 20) f.y = -20;

    const glow = 0.45 + 0.45 * Math.sin(t * 0.03 + f.phase);
    const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 6);
    g.addColorStop(0, 'rgba(' + f.color + ',' + glow.toFixed(2) + ')');
    g.addColorStop(1, 'rgba(' + f.color + ',0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.r * 6, 0, 6.28);
    ctx.fill();
  }

  if (!calm) requestAnimationFrame(draw);
}
draw();