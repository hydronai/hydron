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

  /* Gentle fade-in as sections enter the viewport. */
  var items = document.querySelectorAll('.fade');
  if(reducedMotion || !('IntersectionObserver' in window)){
    items.forEach(function(el){ el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){ entry.target.classList.add('in'); io.unobserve(entry.target); }
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
      shot.style.opacity = '0';
      setTimeout(function(){
        shot.src = tab.getAttribute('data-shot');
        shot.alt = tab.getAttribute('data-alt');
        if(caption) caption.textContent = tab.getAttribute('data-caption');
        shot.style.opacity = '1';
      }, reducedMotion ? 0 : 160);
    });
  });

  /* Command picker + copy. */
  var cmdOut = document.getElementById('cmd-output');
  document.querySelectorAll('.chip[data-command]').forEach(function(chip, _, all){
    chip.addEventListener('click', function(){
      all.forEach(function(c){ c.classList.toggle('active', c === chip); });
      cmdOut.textContent = chip.getAttribute('data-command');
    });
  });
  document.querySelectorAll('.copy-btn[data-copy]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var text = document.getElementById(btn.getAttribute('data-copy')).textContent;
      var done = function(){ btn.textContent = 'Copied'; setTimeout(function(){ btn.textContent = 'Copy'; }, 1400); };
      if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(text).then(done, done); } else { done(); }
    });
  });

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
