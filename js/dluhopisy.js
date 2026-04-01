// DLUHOPISY
let dlEmise = 'xv';
const dlData = {
  xv:  { sazba: 6.80, roky: 3, splatnost: '1. 12. 2028', isin: 'CZ0003578684' },
  xvi: { sazba: 7.80, roky: 5, splatnost: '1. 12. 2030', isin: 'CZ0003578692' }
};

function dlSetEmise(emise) {
  dlEmise = emise;
  const d = dlData[emise];
  ['xv','xvi'].forEach(k => {
    const btn = document.getElementById('dl_btn_' + k);
    if (!btn) return;
    const active = k === emise;
    btn.style.borderColor = active ? 'var(--accent)' : 'var(--border2)';
    btn.style.background  = active ? 'var(--accent)' : 'transparent';
    btn.style.color       = active ? '#0E0F11' : 'var(--text2)';
  });
  const isin  = document.getElementById('dl_isin');
  const splat = document.getElementById('dl_splatnost_datum');
  if (isin)  isin.textContent  = d.isin;
  if (splat) splat.textContent = d.splatnost;
  dlCalc();
}

function dlCastkaIn(el) {
  const v = parseInt(el.value.replace(/[^0-9]/g,''))||0;
  const sl = document.getElementById('dl_slider');
  if (sl) sl.value = Math.min(v, 5000000);
  const prev = document.getElementById('dl_prev');
  if (prev) prev.textContent = v > 0 ? fmt(v) : '';
  dlCalc();
}

function dlSlider(val) {
  const v = parseInt(val)||0;
  const el = document.getElementById('dl_castka');
  if (el) el.value = v > 0 ? v.toLocaleString('cs-CZ') : '';
  const prev = document.getElementById('dl_prev');
  if (prev) prev.textContent = '';
  dlCalc();
}

function dlAdj(delta) {
  const cur = parseInt((document.getElementById('dl_castka').value||'').replace(/[^0-9]/g,''))||0;
  const v = Math.max(50000, Math.min(cur + delta, 5000000));
  document.getElementById('dl_castka').value = v.toLocaleString('cs-CZ');
  document.getElementById('dl_slider').value = v;
  const prev = document.getElementById('dl_prev');
  if (prev) prev.textContent = '';
  dlCalc();
}

function dlCalc() {
  const castka = parseInt((document.getElementById('dl_castka').value||'').replace(/[^0-9]/g,''))||0;
  const d = dlData[dlEmise];
  const setT = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };

  if (castka <= 0) {
    ['dl_pocet','dl_skutecna','dl_kvartal_hruby','dl_kvartal_cisty','dl_celkem_hruby','dl_celkem_cisty'].forEach(id => setT(id, '—'));
    const tbody = document.getElementById('dl_tbody');
    if (tbody) tbody.innerHTML = '';
    return;
  }

  const pocet       = Math.floor(castka / 50000);
  const skutecna    = pocet * 50000;
  const kvHruby     = skutecna * (d.sazba / 100) / 4;
  const kvDan       = kvHruby * 0.15;
  const kvCisty     = kvHruby - kvDan;
  const pocetKv     = d.roky * 4;
  const celkHruby   = kvHruby * pocetKv;
  const celkCisty   = kvCisty * pocetKv;

  setT('dl_pocet',         pocet + ' ks');
  setT('dl_skutecna',      fmt(skutecna));
  setT('dl_kvartal_hruby', fmt(Math.round(kvHruby)));
  setT('dl_kvartal_cisty', fmt(Math.round(kvCisty)));
  setT('dl_celkem_hruby',  fmt(Math.round(celkHruby)));
  setT('dl_celkem_cisty',  fmt(Math.round(celkCisty)));

  const tbody = document.getElementById('dl_tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  for (let q = 1; q <= pocetKv; q++) {
    const tr = document.createElement('tr');
    tr.style.cssText = 'border-bottom:1px solid var(--border)';
    tr.innerHTML =
      "<td style='padding:5px 8px;color:var(--text2)'>" + q + ". kvartál</td>" +
      "<td style='text-align:right;padding:5px 8px;font-variant-numeric:tabular-nums'>" + fmt(Math.round(kvHruby)) + "</td>" +
      "<td style='text-align:right;padding:5px 8px;font-variant-numeric:tabular-nums;color:var(--red)'>−" + fmt(Math.round(kvDan)) + "</td>" +
      "<td style='text-align:right;padding:5px 8px;font-variant-numeric:tabular-nums;color:var(--green)'>" + fmt(Math.round(kvCisty)) + "</td>";
    tbody.appendChild(tr);
  }
  const trSum = document.createElement('tr');
  trSum.style.cssText = 'border-top:2px solid var(--border);background:var(--surface2);font-weight:700';
  trSum.innerHTML =
    "<td style='padding:6px 8px'>Celkem</td>" +
    "<td style='text-align:right;padding:6px 8px;font-variant-numeric:tabular-nums'>" + fmt(Math.round(celkHruby)) + "</td>" +
    "<td style='text-align:right;padding:6px 8px;font-variant-numeric:tabular-nums;color:var(--red)'>−" + fmt(Math.round(celkHruby * 0.15)) + "</td>" +
    "<td style='text-align:right;padding:6px 8px;font-variant-numeric:tabular-nums;color:var(--green)'>" + fmt(Math.round(celkCisty)) + "</td>";
  tbody.appendChild(trSum);
}
