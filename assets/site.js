/* Hydron website — shared behaviour. Small, optional enhancements only. */
(function(){
  "use strict";
  document.documentElement.classList.remove('no-js');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Official Hydron release download. */
  var DOWNLOAD = 'https://github.com/hydronai/hydron/releases/download/v0.6.0-alpha/Hydron-Setup-0.6.0-alpha-win-x64.exe';
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
