/* Hydron website — shared behaviour. Small, optional enhancements only. */
(function(){
  "use strict";
  document.documentElement.classList.remove('no-js');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Official Hydron release download. */
  var DOWNLOAD = 'https://github.com/hydronai/hydron/releases/download/v0.8.1/Hydron-Setup-0.8.1-alpha-win-x64.exe';
  document.querySelectorAll('a[href="downloads/Hydron-Setup.exe"], .js-download').forEach(function(link){ link.href = DOWNLOAD; });

  /* Navigation: border on scroll, mobile toggle. */
  var header = document.getElementById('nav');
  var toggle = document.getElementById('nav-toggle');
  var links = document.getElementById('nav-links');
  function onScroll(){ header.classList.toggle('scrolled', window.scrollY > 4); }
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();
  toggle.addEventListener('click', function(){
    var open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  links.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){ links.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); });
  });

  /* Light / dark theme toggle. The <head> script has already applied the
     saved or system theme; this keeps the button and system changes in sync. */
  var root = document.documentElement;
  var themeBtn = document.getElementById('theme-toggle');
  function applyTheme(t){
    root.setAttribute('data-theme', t);
    if(themeBtn) themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }
  applyTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
  if(themeBtn) themeBtn.addEventListener('click', function(){
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    themeBtn.classList.toggle('spin');
    try{ localStorage.setItem('hydron-theme', next); }catch(e){}
  });
  var systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  var onSystemChange = function(e){
    var saved = null;
    try{ saved = localStorage.getItem('hydron-theme'); }catch(err){}
    if(saved !== 'light' && saved !== 'dark') applyTheme(e.matches ? 'dark' : 'light');
  };
  if(systemDark.addEventListener) systemDark.addEventListener('change', onSystemChange);

  /* Gentle fade-in as sections enter the viewport; grid items cascade. */
  document.querySelectorAll('.grid').forEach(function(grid){
    Array.prototype.forEach.call(grid.children, function(el, i){
      if(el.classList.contains('fade')) el.style.setProperty('--d', (i * 0.08) + 's');
    });
  });
  var items = document.querySelectorAll('.fade');
  if(reducedMotion || !('IntersectionObserver' in window)){
    items.forEach(function(el){ el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          var el = entry.target;
          el.classList.add('in'); io.unobserve(el);
          setTimeout(function(){ el.style.removeProperty('--d'); }, 1200);
        }
      });
    }, { threshold:.12, rootMargin:'0px 0px -40px 0px' });
    items.forEach(function(el){ io.observe(el); });
  }

  /* Product screenshot tabs. */
  var shot = document.getElementById('product-shot');
  var caption = document.getElementById('product-caption');
  var tabs = document.querySelectorAll('.tab[data-shot]');
  tabs.forEach(function(tab){
    tab.addEventListener('click', function(){
      tabs.forEach(function(t){ var on = t === tab; t.classList.toggle('active', on); t.setAttribute('aria-selected', on ? 'true' : 'false'); });
      shot.classList.add('swapping');
      setTimeout(function(){
        shot.src = tab.getAttribute('data-shot');
        shot.alt = tab.getAttribute('data-alt');
        if(caption) caption.textContent = tab.getAttribute('data-caption');
        var show = function(){ shot.classList.remove('swapping'); };
        if(shot.complete) requestAnimationFrame(show); else shot.addEventListener('load', show, { once:true });
      }, reducedMotion ? 0 : 200);
    });
  });

  /* Command picker + copy. */
  var cmdOut = document.getElementById('cmd-output');
  document.querySelectorAll('.chip[data-command]').forEach(function(chip, _, all){
    chip.addEventListener('click', function(){
      all.forEach(function(c){ c.classList.toggle('active', c === chip); });
      typeCommand(chip.getAttribute('data-command'));
    });
  });
  var typing;
  function typeCommand(text){
    clearTimeout(typing);
    if(reducedMotion){ cmdOut.textContent = text; return; }
    var i = 0;
    (function step(){
      cmdOut.textContent = text.slice(0, i);
      if(i++ < text.length) typing = setTimeout(step, 28 + Math.random() * 30);
    })();
  }
  document.querySelectorAll('.copy-btn[data-copy]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var text = document.getElementById(btn.getAttribute('data-copy')).textContent;
      var done = function(){ btn.textContent = 'Copied'; setTimeout(function(){ btn.textContent = 'Copy'; }, 1400); };
      if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(text).then(done, done); } else { done(); }
    });
  });

  /* Cards: a soft light follows the pointer. */
  if(!reducedMotion){
    document.querySelectorAll('.card').forEach(function(card){
      card.addEventListener('pointermove', function(e){
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* Showcase: the screenshot tilts back slightly and straightens as it scrolls into view. */
  var stage = document.querySelector('.showcase .frame');
  if(stage && !reducedMotion){
    var ticking = false;
    var update = function(){
      ticking = false;
      var r = stage.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.75)));
      stage.style.setProperty('--tilt', (1 - p).toFixed(3));
    };
    var onScrollTilt = function(){ if(!ticking){ ticking = true; requestAnimationFrame(update); } };
    var startTilt = function(){
      stage.classList.add('tilting');
      update();
      window.addEventListener('scroll', onScrollTilt, { passive:true });
      window.addEventListener('resize', onScrollTilt);
    };
    startTilt();
  }

  /* Typed text: [data-typed] elements type themselves out once visible.
     Characters are pre-wrapped (and hidden) so line breaks never shift while typing;
     a visually hidden copy keeps the full sentence available to screen readers. */
  document.querySelectorAll('[data-typed]').forEach(function(el){
    var copy = el.cloneNode(true);
    copy.querySelectorAll('br').forEach(function(br){ br.parentNode.replaceChild(document.createTextNode(' '), br); });
    var full = copy.textContent.replace(/\s+/g, ' ').trim();
    var chars = [];
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    var texts = [];
    while(walker.nextNode()) texts.push(walker.currentNode);
    texts.forEach(function(node){
      var wrap = document.createElement('span');
      wrap.setAttribute('aria-hidden', 'true');
      node.nodeValue.split('').forEach(function(c){
        var ch = document.createElement('span');
        ch.className = 'ch';
        ch.textContent = c;
        wrap.appendChild(ch);
        if(c.trim()) chars.push(ch); else ch.classList.add('on');
      });
      node.parentNode.replaceChild(wrap, node);
    });
    var sr = document.createElement('span');
    sr.className = 'visually-hidden';
    sr.textContent = full;
    el.insertBefore(sr, el.firstChild);
    el.classList.add('armed');
    var caret = document.createElement('span');
    caret.className = 'caret';
    caret.setAttribute('aria-hidden', 'true');
    var speed = Number(el.getAttribute('data-speed')) || 45;
    var play = function(){
      if(reducedMotion){ chars.forEach(function(c){ c.classList.add('on'); }); return; }
      var i = 0;
      (function step(){
        if(i >= chars.length){
          if(!el.hasAttribute('data-caret-keep')) setTimeout(function(){ if(caret.parentNode) caret.parentNode.removeChild(caret); }, 1200);
          return;
        }
        var ch = chars[i++];
        ch.classList.add('on');
        ch.parentNode.insertBefore(caret, ch.nextSibling);
        setTimeout(step, speed * (0.6 + Math.random() * 0.8));
      })();
    };
    if(reducedMotion){ play(); return; }
    if(el.hasAttribute('data-typed-now') || !('IntersectionObserver' in window)){ setTimeout(play, 250); return; }
    var io = new IntersectionObserver(function(entries){
      if(entries[0].isIntersecting){ io.disconnect(); play(); }
    }, { threshold:.5 });
    io.observe(el);
  });

  /* Particle ring: short dashes orbit a soft ring, ripple slowly and part around the pointer. */
  function ParticleRing(canvas){
    var ctx = canvas.getContext('2d');
    var host = canvas.parentElement;
    var density = Number(canvas.getAttribute('data-density')) || 1;
    var w = 0, h = 0, dpr = 1, parts = [], colors = [], last = 0, t = 0, running = false, visible = false;
    var mx = 0, my = 0, pmx = 0, pmy = 0, inside = false, pull = 0;
    function readColors(){
      var cs = getComputedStyle(canvas);
      colors = ['--p1', '--p2', '--p3'].map(function(v){ return cs.getPropertyValue(v).trim() || '#888'; });
    }
    function gauss(){ return Math.sqrt(-2 * Math.log(Math.random() || 1e-6)) * Math.cos(2 * Math.PI * Math.random()); }
    function build(){
      var r = host.getBoundingClientRect();
      w = r.width; h = r.height; dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(1300, Math.max(260, w * h / 700)) * density);
      parts = [];
      for(var i = 0; i < n; i++){
        var roll = Math.random();
        parts.push({
          a: Math.random() * Math.PI * 2,
          off: gauss() * 0.11,
          len: 1.5 + Math.random() * 3.5,
          sp: (0.025 + Math.random() * 0.04) * (Math.random() < 0.5 ? 1 : 0.6),
          ph: Math.random() * Math.PI * 2,
          c: roll < 0.74 ? 0 : roll < 0.88 ? 1 : 2,
          k: Math.floor(Math.random() * 3)
        });
      }
    }
    function draw(dt){
      t += dt;
      if(pull < 0.01){ pmx = mx; pmy = my; }
      pmx += (mx - pmx) * 0.15; pmy += (my - pmy) * 0.15;
      pull += ((inside ? 1 : 0) - pull) * 0.08;
      ctx.clearRect(0, 0, w, h);
      var small = w < 700;
      var cx = w / 2, cy = h / 2, R = small ? Math.max(w * 0.62, h * 0.4) : Math.min(w * 0.42, h * 0.62, 520);
      ctx.lineCap = 'round';
      for(var c = 0; c < 3; c++){
        ctx.strokeStyle = colors[c];
        for(var k = 0; k < 3; k++){
          ctx.globalAlpha = (0.28 + k * 0.25) * (small ? 0.65 : 1);
          ctx.lineWidth = 1.1 + k * 0.25;
          ctx.beginPath();
          for(var i = 0; i < parts.length; i++){
            var p = parts[i];
            if(p.c !== c || p.k !== k) continue;
            p.a += p.sp * dt;
            var wave = Math.sin(p.a * 3 + t * 0.6) * 0.035 + Math.sin(t * 0.9 + p.ph) * 0.012;
            var r = R * (1 + p.off + wave);
            var x = cx + Math.cos(p.a) * r, y = cy + Math.sin(p.a) * r * 0.92;
            var dx = x - pmx, dy = y - pmy, d = Math.sqrt(dx * dx + dy * dy);
            if(pull > 0.01 && d < 150 && d > 0.01){ var f = (1 - d / 150); f = f * f * 34 * pull; x += dx / d * f; y += dy / d * f; }
            var tx = -Math.sin(p.a) * p.len, ty = Math.cos(p.a) * p.len;
            ctx.moveTo(x - tx, y - ty); ctx.lineTo(x + tx, y + ty);
          }
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }
    function loop(now){
      if(!running) return;
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now; draw(dt);
      requestAnimationFrame(loop);
    }
    function start(){ if(running || reducedMotion) return; running = true; last = 0; requestAnimationFrame(loop); }
    function stop(){ running = false; }
    readColors(); build(); draw(0);
    new MutationObserver(function(){ readColors(); if(!running) draw(0); }).observe(document.documentElement, { attributes:true, attributeFilter:['data-theme'] });
    if('ResizeObserver' in window) new ResizeObserver(function(){ build(); if(!running) draw(0); }).observe(host);
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(e){ visible = e[0].isIntersecting; visible ? start() : stop(); }).observe(canvas);
    } else start();
    host.addEventListener('pointermove', function(e){ var r = canvas.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; inside = true; });
    host.addEventListener('pointerleave', function(){ inside = false; });
    document.addEventListener('visibilitychange', function(){ document.hidden ? stop() : (visible && start()); });
  }
  document.querySelectorAll('canvas.ring').forEach(function(c){ ParticleRing(c); });

  /* Feature explorer: whichever item sits mid-screen drives the pinned screenshot. */
  var explorer = document.querySelector('.explorer');
  if(explorer){
    var exItems = explorer.querySelectorAll('.explorer-item');
    var exShots = explorer.querySelectorAll('.explorer-stage img');
    var setActive = function(idx){
      exItems.forEach(function(it, i){ it.classList.toggle('active', i === idx); });
      exShots.forEach(function(im, i){ im.classList.toggle('active', i === idx); });
    };
    setActive(0);
    exItems.forEach(function(it, i){
      it.addEventListener('click', function(e){
        if(e.target.closest('a')) return;
        setActive(i);
        it.scrollIntoView({ behavior:reducedMotion ? 'auto' : 'smooth', block:'center' });
      });
    });
    if('IntersectionObserver' in window){
      var exIo = new IntersectionObserver(function(entries){
        entries.forEach(function(en){ if(en.isIntersecting) setActive(Array.prototype.indexOf.call(exItems, en.target)); });
      }, { rootMargin:'-45% 0px -45% 0px' });
      exItems.forEach(function(it){ exIo.observe(it); });
    }
  }

  /* Synapse: show how the phone falls back to Bluetooth when a network blocks devices. */
  var diagram = document.getElementById('route-diagram');
  if(diagram){
    var status = document.getElementById('route-status');
    var routeBtns = document.querySelectorAll('[data-route]');
    routeBtns.forEach(function(btn){
      btn.addEventListener('click', function(){
        var blocked = btn.getAttribute('data-route') === 'blocked';
        routeBtns.forEach(function(b){ var on = b === btn; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
        diagram.classList.toggle('blocked', blocked);
        status.textContent = btn.getAttribute('data-status');
      });
    });
  }

  /* Synapse: a small phone that previews the app's appearance settings. */
  var mini = document.getElementById('mini-phone');
  if(mini){
    document.querySelectorAll('.swatch').forEach(function(sw, _, all){
      sw.addEventListener('click', function(){
        all.forEach(function(x){ var on = x === sw; x.classList.toggle('active', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
        mini.style.setProperty('--accent', sw.style.getPropertyValue('--c'));
      });
    });
    var themeSel = document.getElementById('pref-theme');
    themeSel.addEventListener('change', function(){ mini.classList.toggle('light', themeSel.value === 'light'); });
    var round = document.getElementById('pref-round'), size = document.getElementById('pref-size');
    round.addEventListener('input', function(){ mini.style.setProperty('--radius', round.value + 'px'); document.getElementById('pref-round-out').textContent = round.value < 8 ? 'Square' : round.value < 18 ? 'Soft' : 'Round'; });
    size.addEventListener('input', function(){ mini.style.setProperty('--fs', size.value + 'px'); document.getElementById('pref-size-out').textContent = size.value < 14 ? 'Small' : size.value < 17 ? 'Default' : 'Large'; });
  }

  /* Appearance preview (features page). */
  var frame = document.getElementById('appearance-frame');
  if(frame){
    var presets = document.querySelectorAll('.chip[data-preset]');
    presets.forEach(function(chip){
      chip.addEventListener('click', function(){
        presets.forEach(function(c){ c.classList.toggle('active', c === chip); });
        frame.dataset.preset = chip.dataset.preset;
      });
    });
    var nav = document.getElementById('nav-control');
    var radius = document.getElementById('radius-control');
    var density = document.getElementById('density-control');
    nav.addEventListener('change', function(){ frame.classList.toggle('nav-right', nav.value === 'Right'); document.getElementById('nav-output').textContent = nav.value; });
    radius.addEventListener('input', function(){ frame.style.borderRadius = radius.value + 'px'; document.getElementById('radius-output').textContent = radius.value + 'px'; });
    density.addEventListener('input', function(){
      var i = Number(density.value);
      frame.querySelector('.demo-chat').style.fontSize = [.88, 1, 1.08][i] + 'em';
      document.getElementById('density-output').textContent = ['Compact', 'Comfortable', 'Spacious'][i];
    });
  }

  var year = document.getElementById('year');
  if(year) year.textContent = new Date().getFullYear();
})();
