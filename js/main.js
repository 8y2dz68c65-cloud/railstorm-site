// Railstorm web page: reveal-on-scroll and a simple lightbox. No libraries.
(function () {
  // ?still = fixed hero height and everything visible (used for page screenshots)
  if (location.search.indexOf('still') >= 0) { document.documentElement.style.setProperty('--hero', '900px'); document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); }); }
  // fade sections in as they scroll into view
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // lightbox: click any image with data-full (or inside .map) to see it big
  var box = document.getElementById('lightbox');
  var big = box.querySelector('img');
  var cap = box.querySelector('p');
  function open(src, text) { big.src = src; cap.textContent = text || ''; box.hidden = false; }
  function close() { box.hidden = true; big.src = ''; }
  document.addEventListener('click', function (e) {
    var img = e.target.closest('.map img, .shots img');
    if (img) { open(img.dataset.full || img.src, img.alt); return; }
    if (!box.hidden) { close(); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !box.hidden) { close(); } });

  // pictures that are missing (for example a map screenshot not taken yet) simply disappear
  document.querySelectorAll('.map img, .shots img').forEach(function (img) {
    img.addEventListener('error', function () { var p = img.closest('.map') || img; p.style.display = 'none'; });
  });
})();

// ---- Donate buttons: pay in the visitor's own currency ----
// PayPal.me takes the currency after the amount (paypal.me/cluexiuz/10EUR); without it PayPal uses NOK.
// The region is guessed from the browser language (de-DE -> DE) or the time zone; the visitor can change it.
// Same table as SRailstormMenus.cpp (RailstormDonate). Scale: 5/10/25/50/100 times this.
(function () {
  var regions = [
    { name: 'Europe', code: 'EUR', sym: '€', scale: 1, countries: 'AT BE CY DE EE ES FI FR GR HR IE IT LT LU LV MT NL PT SI SK NO SE DK IS CH PL CZ HU RO BG GB UA RS BA AL MK ME TR' },
    { name: 'North America', code: 'USD', sym: '$', scale: 1, countries: 'US CA MX' },
    { name: 'South America', code: 'BRL', sym: 'R$', scale: 5, countries: 'BR AR CL CO PE VE EC BO PY UY' },
    { name: 'Africa', code: 'USD', sym: '$', scale: 1, countries: 'ZA NG EG KE MA DZ TN GH ET TZ UG CM CI SN AO ZW ZM MZ NA BW RW MU LY SD' },
    { name: 'Asia', code: 'JPY', sym: '¥', scale: 100, countries: 'JP KR CN HK TW SG PH TH MY ID VN IN' },
    { name: 'Australia', code: 'AUD', sym: 'A$', scale: 1, countries: 'AU NZ' },
    { name: 'Mars', code: 'USD', sym: 'MC ', scale: 1, countries: '' }   // joke: Mars Credits, paid in US dollars
  ];
  var box = document.getElementById('donate-regions');
  if (!box) return;

  function guess() {
    var langs = navigator.languages || [navigator.language || ''];
    for (var i = 0; i < langs.length; i++) {
      var m = /[-_]([A-Za-z]{2})/.exec(langs[i] || '');
      if (m) {
        var cc = m[1].toUpperCase();
        for (var r = 0; r < regions.length; r++) if ((' ' + regions[r].countries + ' ').indexOf(' ' + cc + ' ') >= 0) return r;
      }
    }
    // No region in the language (e.g. plain "en"): use the time zone, e.g. Europe/Oslo, Africa/Lagos.
    var tz = ''; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    var zone = tz.split('/')[0];
    if (zone === 'Europe') return 0;
    if (zone === 'Africa') return 3;
    if (zone === 'Asia') return 4;
    if (zone === 'Australia' || tz === 'Pacific/Auckland') return 5;
    if (/^America\/(Sao_Paulo|Argentina|Santiago|Bogota|Lima|Caracas|Montevideo|La_Paz|Asuncion|Guayaquil)/.test(tz)) return 2;
    return 1;
  }

  function show(index) {
    var reg = regions[index];
    box.querySelectorAll('button').forEach(function (b, i) { b.classList.toggle('on', i === index); });
    document.getElementById('mars-note').hidden = reg.name !== 'Mars';
    document.querySelectorAll('a.donate').forEach(function (a) {
      var amount = parseInt(a.getAttribute('data-amount'), 10) * reg.scale;
      a.href = 'https://paypal.me/cluexiuz/' + amount + reg.code;
      a.textContent = reg.sym + amount;
    });
  }

  regions.forEach(function (reg, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'region'; b.textContent = reg.name;
    b.addEventListener('click', function () { show(i); });
    box.appendChild(b);
  });
  show(guess());
})();
