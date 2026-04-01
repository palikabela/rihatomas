// KALKULAČKA
let kalkMode = "uver";

function syncRDluh(val, fromSlider) {
  const parsed = parseInt(String(val).replace(/\s/g, '').replace(/,/g, ''));
  if (!parsed || parsed <= 0) {
    if (!fromSlider) document.getElementById("r_dluh").value = "";
    document.getElementById("r_dluh_slider").value = 0;
    calcRefi(); return;
  }
  const v = Math.min(parsed, 100000000);
  document.getElementById("r_dluh").value = v;
  document.getElementById("r_dluh_slider").value = v;
  calcRefi();
}

function syncRRoky(val, fromSlider) {
  const slider = document.getElementById("r_roky_slider");
  const input = document.getElementById("r_roky");
  const parsed = parseInt(val);
  if (!parsed || parsed < 1) {
    if (input) input.value = 1;
    if (slider) slider.value = 1;
    calcRefi(); return;
  }
  const v = Math.min(Math.max(parsed, 1), 65);
  if (input) input.value = v;
  if (slider) slider.value = v;
  calcRefi();
}

function syncRSazba(val, fromSlider) {
  const slider = document.getElementById("r_sazba_sou_slider");
  const input = document.getElementById("r_sazba_sou");
  const parsed = parseFloat(val);
  if (val === "" || val === null || isNaN(parsed)) {
    if (slider) slider.value = 0;
    calcRefi(); return;
  }
  const v = Math.min(Math.max(parsed, 0), 15);
  if (slider) slider.value = v;
  if (input) input.value = Math.round(v * 100) / 100;
  calcRefi();
}

function syncKSazba(val, fromSlider) {
  const slider = document.getElementById("k_sazba_slider");
  const input = document.getElementById("k_sazba");
  const parsed = parseFloat(val);
  if (val === "" || val === null || isNaN(parsed)) {
    if (slider) slider.value = 0;
    calcKalk(); return;
  }
  const v = Math.min(Math.max(parsed, 0), 15);
  if (slider) slider.value = v;
  if (input) input.value = Math.round(v * 100) / 100;
  calcKalk();
}

function syncJistina(val, fromSlider) {
  const parsed = parseInt(String(val).replace(/\s/g, '').replace(/,/g, ''));
  if (!parsed || parsed <= 0) {
    if (!fromSlider) document.getElementById("k_jistina").value = "";
    document.getElementById("k_jistina_slider").value = 0;
    calcKalk(); return;
  }
  const v = Math.min(parsed, 100000000);
  document.getElementById("k_jistina").value = v;
  document.getElementById("k_jistina_slider").value = v;
  calcKalk();
}

function syncSplatkaInput(val, fromSlider) {
  const parsed = parseInt(val);
  if (!parsed || parsed <= 0) {
    if (!fromSlider) document.getElementById("k_splatka_input").value = "";
    document.getElementById("k_splatka_slider").value = 0;
    calcKalk();
    return;
  }
  const v = Math.min(parsed, 100000);
  setFmtValue("k_splatka_input", v);
  document.getElementById("k_splatka_slider").value = v;
  calcKalk();
}

function syncRoky(val, fromSlider) {
  const parsed = parseInt(val);
  if (isNaN(parsed)) return;
  const v = Math.min(Math.max(parsed, 1), 65);
  document.getElementById("k_roky").value = v;
  document.getElementById("k_roky_slider").value = v;
  document.getElementById("k_roky_label").textContent = v;
  calcKalk();
}

function setMode(mode) {
  kalkMode = mode;
  const fieldJistina = document.getElementById("k_jistina").closest(".field");
  const fieldSplatka = document.getElementById("field-splatka");
  const prevJistina = document.getElementById("k_jistina_preview");
  const btnUver = document.getElementById("mode-uver");
  const btnSplatka = document.getElementById("mode-splatka");
  if (mode === "uver") {
    const wrapJ = document.getElementById("field-jistina-wrap");
    if (wrapJ) wrapJ.style.display = "";
    fieldSplatka.style.display = "none";
    const rb = document.getElementById("result-uver-vypocten");
    if (rb) rb.style.display = "none";
    const lbl2 = document.getElementById("k_celkem_label");
    if (lbl2) lbl2.textContent = "Celkem zaplatíte";
    btnUver.style.background = "var(--accent)";
    btnUver.style.color = "#0E0F11";
    btnUver.style.borderColor = "var(--accent)";
    btnSplatka.style.background = "transparent";
    btnSplatka.style.color = "var(--text2)";
    btnSplatka.style.borderColor = "var(--border2)";
  } else {
    const wrapJ2 = document.getElementById("field-jistina-wrap");
    if (wrapJ2) wrapJ2.style.display = "none";
    fieldSplatka.style.display = "";
    btnSplatka.style.background = "var(--accent)";
    btnSplatka.style.color = "#0E0F11";
    btnSplatka.style.borderColor = "var(--accent)";
    btnUver.style.background = "transparent";
    btnUver.style.color = "var(--text2)";
    btnUver.style.borderColor = "var(--border2)";
  }
  calcKalk();
}

function calcKalk() {
  const s = parseFloat(document.getElementById("k_sazba").value) || 0;
  const r = parseInt(document.getElementById("k_roky").value) || 1;
  const m = r * 12;

  if (kalkMode === "splatka") {
    // Reverse calculation - from monthly payment to loan amount
    const splatkaInput = getRaw("k_splatka_input");
    const prevS = document.getElementById("k_splatka_input_preview");
    if (prevS) prevS.textContent = splatkaInput > 0 ? fmt(splatkaInput) : "";
    if (splatkaInput <= 0) return;
    let j;
    if (s <= 0) {
      j = splatkaInput * m;
    } else {
      const rate = s / 100 / 12;
      j = splatkaInput * (Math.pow(1+rate, m) - 1) / (rate * Math.pow(1+rate, m));
    }
    const celkem = splatkaInput * m;
    const uroky = celkem - j;
    const pctJ = (j / celkem) * 100;
    document.getElementById("k_splatka").textContent = fmt(splatkaInput) + " / měs.";
    document.getElementById("k_celkem").textContent = fmt(j);
    const lbl = document.getElementById("k_celkem_label");
    if (lbl) lbl.textContent = "Výše úvěru";
    document.getElementById("k_uroky").textContent = fmt(uroky);
    document.getElementById("k_pocet").textContent = m;
    document.getElementById("k_bar").style.width = Math.min(pctJ, 100).toFixed(1) + "%";
    document.getElementById("k_pct_j").textContent = pctJ.toFixed(0) + " %";
    document.getElementById("k_pct_u").textContent = (100-pctJ).toFixed(0) + " %";
    // Show loan amount in result
    const elSplatka = document.getElementById("k_splatka");
    elSplatka.textContent = fmt(splatkaInput) + " / měs.";
    // Show calculated loan in celkem label area
    const jistinaResult = document.getElementById("k_jistina_result");
    if (jistinaResult) jistinaResult.textContent = fmt(j);
    const resultBox = document.getElementById("result-uver-vypocten");
    if (resultBox) resultBox.style.display = "block";
    const spEl = document.getElementById("k_splatka_zobrazena");
    const rokyEl = document.getElementById("k_roky_zobrazena");
    if (spEl) spEl.textContent = fmt(splatkaInput) + "/měs.";
    if (rokyEl) rokyEl.textContent = r + " let";
    return;
  }

  const j = getRaw("k_jistina");
  const prev = document.getElementById("k_jistina_preview");
  if (prev) prev.textContent = "";
  if (j <= 0) return;
  const splatka = monthlyPayment(j, s, m);
  const celkem = splatka * m;
  const uroky = celkem - j;
  const pctJ = (j / celkem) * 100;
  document.getElementById("k_splatka").textContent = fmt(splatka) + " / měs.";
  document.getElementById("k_celkem").textContent = fmt(celkem);
  document.getElementById("k_uroky").textContent = fmt(uroky);
  document.getElementById("k_pocet").textContent = m;
  document.getElementById("k_bar").style.width = Math.min(pctJ, 100).toFixed(1) + "%";
  document.getElementById("k_pct_j").textContent = pctJ.toFixed(0) + " %";
  document.getElementById("k_pct_u").textContent = (100-pctJ).toFixed(0) + " %";
}
