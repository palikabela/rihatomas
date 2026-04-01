// HYPOTÉKA
let hMode = 'hotovost'; // 'hotovost' nebo 'zastava'

function hGetN(id) {
  const el = document.getElementById(id);
  if (!el) return 0;
  return parseInt(el.value.replace(/[^0-9]/g,''))||0;
}

function hSetMode(mode) {
  hMode = mode;
  const btnH = document.getElementById('h_btn_hotovost');
  const btnZ = document.getElementById('h_btn_zastava');
  const panH = document.getElementById('h_panel_hotovost');
  const panZ = document.getElementById('h_panel_zastava');
  if (mode === 'hotovost') {
    btnH.style.background='var(--accent)'; btnH.style.color='#0E0F11'; btnH.style.borderColor='var(--accent)';
    btnZ.style.background='transparent'; btnZ.style.color='var(--text2)'; btnZ.style.borderColor='var(--border2)';
    panH.style.display='block'; panZ.style.display='none';
  } else {
    btnZ.style.background='var(--accent)'; btnZ.style.color='#0E0F11'; btnZ.style.borderColor='var(--accent)';
    btnH.style.background='transparent'; btnH.style.color='var(--text2)'; btnH.style.borderColor='var(--border2)';
    panZ.style.display='block'; panH.style.display='none';
  }
  hCalc();
}

function hCenaIn(el) {
  const v = parseInt(el.value.replace(/[^0-9]/g,''))||0;
  const sl = document.getElementById('h_cena_sl');
  if (sl) sl.value = Math.min(v, 30000000);
  const prev = document.getElementById('h_cena_prev');
  if (prev) prev.textContent = v > 0 ? fmt(v) : '';
  hCalc();
}

function hSliderCena(val) {
  const v = parseInt(val)||0;
  const el = document.getElementById('h_cena');
  if (el) el.value = v > 0 ? v.toLocaleString('cs-CZ') : '';
  const prev = document.getElementById('h_cena_prev');
  if (prev) prev.textContent = '';
  hCalc();
}

function hVlastniIn(el) { hCalc(); }
function hZastavaIn(el) {
  const v = parseInt(el.value.replace(/[^0-9]/g,''))||0;
  const sl = document.getElementById('h_cena_sl');
  const maxVal = sl ? parseInt(sl.max) : 30000000;
  if (v > maxVal) el.value = maxVal.toLocaleString('cs-CZ');
  hCalc();
}

function hSazbaSlider(val) {
  const v = Math.round(parseFloat(val)*10)/10;
  const el = document.getElementById('h_sazba');
  if (el) el.value = v;
  hCalc();
}

function hAdjSazba(delta) {
  const el = document.getElementById('h_sazba');
  const v = Math.round(Math.max(0, Math.min((parseFloat(el.value)||0)+delta, 15))*100)/100;
  el.value = v;
  const sl = document.getElementById('h_sazba_sl');
  if (sl) sl.value = v;
  hCalc();
}

function hRokySlider(val) {
  const v = parseInt(val);
  document.getElementById('h_roky').value = v;
  document.getElementById('h_roky_lbl').textContent = v;
  hCalc();
}

function hAdj(field, delta) {
  if (field === 'cena') {
    const cur = hGetN('h_cena');
    const v = Math.max(0, Math.min(cur+delta, 30000000));
    document.getElementById('h_cena').value = v > 0 ? v.toLocaleString('cs-CZ') : '';
    document.getElementById('h_cena_sl').value = v;
    const prev = document.getElementById('h_cena_prev');
    if (prev) prev.textContent = v > 0 ? fmt(v) : '';
  } else if (field === 'rok') {
    const el = document.getElementById('h_rok');
    el.value = Math.max(1940, Math.min((parseInt(el.value)||1985)+delta, 2005));
  } else if (field === 'roky') {
    const v = Math.max(1, Math.min((parseInt(document.getElementById('h_roky').value)||30)+delta, 35));
    document.getElementById('h_roky').value = v;
    document.getElementById('h_roky_lbl').textContent = v;
    document.getElementById('h_roky_sl').value = v;
  } else if (field === 'vlastni') {
    const cur = hGetN('h_vlastni');
    const v = Math.max(0, cur+delta);
    document.getElementById('h_vlastni').value = v > 0 ? v.toLocaleString('cs-CZ') : '';
  } else if (field === 'zastava') {
    const cur = hGetN('h_zastava');
    const v = Math.max(0, cur+delta);
    document.getElementById('h_zastava').value = v > 0 ? v.toLocaleString('cs-CZ') : '';
  }
  hCalc();
}

function hCalc() {
  const cena = hGetN('h_cena');
  const rok = parseInt(document.getElementById('h_rok').value)||0;
  const sazba = parseFloat(document.getElementById('h_sazba').value)||0;
  const roky = parseInt(document.getElementById('h_roky').value)||30;
  const setT = (id,v) => { const el=document.getElementById(id); if(el) el.textContent=v; };

  // Věk + ČNB limit
  let minPct = 10, maxSpl = 35, vek = 0;
  const vekBox = document.getElementById('h_vek_box');
  const volbaWrap = document.getElementById('h_volba_wrap');

  if (rok > 0) {
    vek = new Date().getFullYear() - rok;
    minPct = vek >= 36 ? 20 : 10;
    maxSpl = Math.max(1, Math.min(70-vek, 35));
    const minCastka = cena > 0 ? Math.ceil(cena * minPct / 100) : 0;

    if (vekBox) {
      vekBox.style.display = 'block';
      vekBox.innerHTML =
        'Věk: <strong>' + vek + ' let</strong> &nbsp;·&nbsp; Max. splatnost: <strong>' + maxSpl + ' let</strong><br>' +
        'Dle ČNB musí mít klient min. <strong style="color:var(--accent)">' + minPct + ' % = ' +
        (cena > 0 ? fmt(minCastka) : '—') + '</strong> vlastních zdrojů nebo zástavy';
    }
    if (volbaWrap) volbaWrap.style.display = 'block';
    setT('h_res_maxroky', maxSpl + ' let');

    const rokyWarn = document.getElementById('h_roky_warn');
    if (rokyWarn) rokyWarn.textContent = roky > maxSpl ? '⚠️ Přesahuje max. ' + maxSpl + ' let dle věku' : '';
  } else {
    if (vekBox) vekBox.style.display = 'none';
    if (volbaWrap) volbaWrap.style.display = 'none';
    setT('h_res_maxroky', '—');
  }

  if (cena <= 0) {
    ['h_res_hypo','h_res_vlastni','h_res_splatka','h_res_celkem','h_res_uroky'].forEach(id=>setT(id,'—'));
    const t=document.getElementById('h_ltv_tbl'); if(t) t.style.display='none';
    return;
  }

  // Výpočet dle módu
  let hypo, vlastni = 0;
  const minCastka = Math.ceil(cena * minPct / 100);

  if (hMode === 'hotovost') {
    vlastni = hGetN('h_vlastni');
    hypo = Math.max(cena - vlastni, 0);

    // Warning vlastni
    const warn = document.getElementById('h_vlastni_warn');
    if (warn && rok > 0) {
      if (vlastni < minCastka) {
        warn.style.color = 'var(--red)';
        warn.innerHTML = '⚠️ Min. ' + minPct + ' % = <strong>' + fmt(minCastka) + '</strong> — chybí ' + fmt(minCastka - vlastni);
      } else {
        warn.textContent = '✓ Vlastní zdroje jsou dostatečné';
        warn.style.color = 'var(--green)';
      }
    } else if (warn) { warn.textContent = ''; }

    const vlEl = document.getElementById('h_res_vlastni');
    if (vlEl) {
      vlEl.textContent = vlastni > 0 ? fmt(vlastni) : '—';
      vlEl.style.color = (rok > 0 && vlastni < minCastka) ? 'var(--red)' : 'var(--green)';
    }

  } else {
    // Zástava
    const zastava = hGetN('h_zastava');
    hypo = cena; // celá cena jako hypotéka
    const potreba = Math.ceil(cena / (1 - minPct/100) - cena);
    const celkZajisteni = cena + zastava;
    const ltvCelk = zastava > 0 ? Math.round(hypo / celkZajisteni * 100) : 100;
    const ok = zastava >= potreba;

    const zInfo = document.getElementById('h_zastava_info');
    if (zInfo) {
      zInfo.innerHTML =
        'Potřebná zástava: <strong style="color:var(--accent)">' + fmt(potreba) + '</strong><br>' +
        (zastava > 0 ?
          'Zadaná zástava: <strong>' + fmt(zastava) + '</strong> &nbsp;·&nbsp; LTV ' + ltvCelk + ' % &nbsp;·&nbsp; ' +
          '<strong style="color:' + (ok?'var(--green)':'var(--red)') + '">' + (ok?'✓ Dostatečná':'⚠️ Nedostatečná') + '</strong>'
          : '<span style="color:var(--text3)">Zadejte hodnotu zástavy</span>');
    }

    const vlEl = document.getElementById('h_res_vlastni');
    if (vlEl) {
      vlEl.textContent = zastava > 0 ? fmt(zastava) : 'Zástava nem.';
      vlEl.style.color = ok ? 'var(--green)' : 'var(--red)';
    }
  }

  setT('h_res_hypo', fmt(hypo));
  const mes = roky * 12;
  const splatka = monthlyPayment(hypo, sazba, mes);
  setT('h_res_splatka', fmt(splatka) + ' / měs.');
  setT('h_res_celkem', fmt(splatka * mes));
  setT('h_res_uroky', fmt(splatka * mes - hypo));

  // LTV tabulka
  const tbl = document.getElementById('h_ltv_tbl');
  const tbody = document.getElementById('h_ltv_tbody');
  if (tbl && tbody) {
    tbl.style.display = 'block';
    tbody.innerHTML = '';
    [10,15,20,25].filter(p => p >= minPct).forEach(p => {
      const vl = Math.round(cena * p / 100);
      const hp = cena - vl;
      const sp = monthlyPayment(hp, sazba, mes);
      const isActive = hMode==='hotovost' && Math.abs(vlastni - vl) < 5000;
      const tr = document.createElement('tr');
      tr.style.cssText = 'border-bottom:1px solid var(--border)' + (isActive?';background:var(--accent-dim)':'');
      tr.innerHTML =
        "<td style='padding:6px 8px;font-weight:"+(isActive?'600':'400')+";color:"+(isActive?'var(--accent)':'var(--text2)')+"'>"+p+" % <span style='font-size:11px;color:var(--text3)'>(LTV "+(100-p)+" %)</span></td>"+
        "<td style='text-align:right;padding:6px 8px;font-variant-numeric:tabular-nums'>"+fmt(vl)+"</td>"+
        "<td style='text-align:right;padding:6px 8px;font-variant-numeric:tabular-nums;color:var(--green)'>"+fmt(hp)+"</td>"+
        "<td style='text-align:right;padding:6px 8px;font-variant-numeric:tabular-nums'>"+fmt(sp)+"/m</td>";
      tbody.appendChild(tr);
    });
  }
}

function hToggleSazby() {
  const panel = document.getElementById('h_sazby_panel');
  const arrow = document.getElementById('h_sazby_arrow');
  if (panel.style.display==='none') { panel.style.display='block'; arrow.textContent='▲'; hRenderSazby(); }
  else { panel.style.display='none'; arrow.textContent='▼'; }
}

function hRenderSazby() {
  const list = document.getElementById('h_sazby_list');
  if (!list || !sazby || sazby.length===0) {
    if (list) list.innerHTML="<div style='color:var(--text3);font-size:13px'>Otevřete nejprve záložku Refinancování.</div>";
    return;
  }
  list.innerHTML='';
  [...sazby].sort((a,b)=>a.sazba-b.sazba).forEach((s,i)=>{
    const div=document.createElement('div');
    div.style.cssText='display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)';
    div.innerHTML="<div><div style='font-size:13px;font-weight:500;color:var(--text)'>"+s.nazev+"</div><div style='font-size:11px;color:var(--text3)'>"+s.partner+"</div></div><div style='font-family:Syne,sans-serif;font-size:20px;font-weight:700;color:"+(i===0?'var(--accent)':'var(--text)')+"'>"+s.sazba.toFixed(2)+" %</div>";
    list.appendChild(div);
  });
}


