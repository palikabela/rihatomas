// Barevný režim pro všechny stránky: ☀️ světlý (výchozí) → 🌥️ šedý → 🌙 tmavý (tlačítko .theme-btn → toggleTheme()).
// Načítá se v <head> (bez probliknutí); volba se pamatuje v prohlížeči (localStorage 'theme').
// Šedý = světlý režim s tlumenějšími odstíny (data-theme="light" + data-odstin="seda"), takže platí všechny světlé styly.
(function () {
  const root = document.documentElement;
  const REZIMY = { light: ['☀️', 'světlý'], seda: ['🌥️', 'šedý'], dark: ['🌙', 'tmavý'] }, PORADI = ['light', 'seda', 'dark'];
  let t = 'light';
  try { t = localStorage.getItem('theme') || 'light'; } catch (e) {}
  if (!REZIMY[t]) t = 'light';
  const nastav = r => {
    if (r === 'dark') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', 'light');
    if (r === 'seda') root.setAttribute('data-odstin', 'seda'); else root.removeAttribute('data-odstin');
  };
  nastav(t);
  const css = document.createElement('style');
  css.textContent = `
[data-theme="light"][data-odstin="seda"]{
  --bg:#C9CED6;--surface:#EDEFF2;--surface2:#E0E3E8;--surface3:#D2D6DD;
  --text:#11151C;--text2:#3A414D;--text3:#555D69;
  --border:rgba(0,0,0,0.13);--border2:rgba(0,0,0,0.22);
  --chart-grid:rgba(0,0,0,0.07);--chart-tooltip-bg:#EDEFF2;
  --nav-bg:rgba(222,225,230,0.95);
}
/* šedý režim: karty jasně oddělené od pozadí */
[data-odstin="seda"] .card,[data-odstin="seda"] .offer-card,[data-odstin="seda"] .cta-strip{border-color:rgba(0,0,0,0.13);box-shadow:0 1px 3px rgba(0,0,0,0.10)}
[data-odstin="seda"] nav{border-bottom-color:rgba(0,0,0,0.15)}`;
  document.head.appendChild(css);
  const ikona = () => document.querySelectorAll('.theme-btn').forEach(b => { b.textContent = REZIMY[t][0]; b.title = `Barevný režim: ${REZIMY[t][1]} – klepnutím přepnete (světlý → šedý → tmavý)`; });
  window.toggleTheme = function () {
    t = PORADI[(PORADI.indexOf(t) + 1) % PORADI.length];
    nastav(t);
    try { localStorage.setItem('theme', t); } catch (e) {}
    ikona();
    document.dispatchEvent(new CustomEvent('motiv', { detail: t }));
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ikona); else ikona();
})();
