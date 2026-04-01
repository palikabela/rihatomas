// INVESTICE
function toggleISazby() {
  const c = document.getElementById("i-sazby-content");
  const icon = document.getElementById("i-sazby-icon");
  if (!c) return;
  const open = c.style.display !== "none";
  c.style.display = open ? "none" : "block";
  if (icon) icon.textContent = open ? "▼" : "▲";
}

function calcFV(mesicni, sazbaRocni, roky) {
  if (roky <= 0) return 0;
  if (sazbaRocni <= 0) return mesicni * 12 * roky;
  const r = sazbaRocni / 100 / 12;
  const n = roky * 12;
  return mesicni * ((Math.pow(1+r, n) - 1) / r) * (1+r);
}

function syncIJednoraz(val, fromSlider) {
  const parsed = parseInt(String(val).replace(/[^0-9]/g,''));
  if (!parsed || parsed <= 0) {
    const el = document.getElementById("i_jednoraz");
    if (el) { el.value = ""; }
    document.getElementById("i_jednoraz_slider").value = 0;
    calcInvest(); return;
  }
  const v = Math.min(Math.max(parsed, 0), 5000000);
  document.getElementById("i_jednoraz").value = v;
  document.getElementById("i_jednoraz_slider").value = v;
  calcInvest();
}

function syncIVklad(val, fromSlider) {
  const parsed = parseInt(val);
  if (!parsed || parsed <= 0) {
    const el = document.getElementById("i_vklad");
    if (!fromSlider && el) { el.value = ""; el.dataset.raw = ""; }
    document.getElementById("i_vklad_slider").value = 0;
    calcInvest(); return;
  }
  const v = Math.min(Math.max(parsed, 0), 15000);
  setFmtValue("i_vklad", v);
  document.getElementById("i_vklad_slider").value = v;
  calcInvest();
}

function syncIRoky(val) {
  const v = Math.min(Math.max(parseInt(val) || 1, 1), 50);
  document.getElementById("i_roky").value = v;
  document.getElementById("i_roky_slider").value = v;
  document.getElementById("i_roky_label").textContent = v;
  calcInvest();
}

function calcInvest() {
  const vklad = getRaw("i_vklad");
  const jednoraz = parseInt((document.getElementById("i_jednoraz").value||"").replace(/[^0-9]/g,""))||0;
  const roky = parseInt(document.getElementById("i_roky").value) || 1;
  const inflace = parseFloat(document.getElementById("i_inflace").value) || 0;
  const sEtf = parseFloat(document.getElementById("s_etf").value) || 0;
  const sDip = parseFloat(document.getElementById("s_dip").value) || 0;
  const sStavebko = parseFloat(document.getElementById("s_stavebko").value) || 0;
  const sPenzijko = parseFloat(document.getElementById("s_penzijko").value) || 0;
  const sSporici = parseFloat(document.getElementById("s_sporici").value) || 0;
  const sBezny = parseFloat(document.getElementById("s_bezny").value) || 0;
  const prev = document.getElementById("i_vklad_preview");
  if (prev) prev.textContent = vklad > 0 ? fmt(vklad) : "";
  const jednorazPrev = document.getElementById("i_jednoraz_preview");
  if (jednorazPrev) jednorazPrev.textContent = jednoraz > 0 ? fmt(jednoraz) : "";
  const celkem = vklad * 12 * roky + jednoraz;
  const el_celkem = document.getElementById("i_celkem");
  const el_realna = document.getElementById("i_realna");
  if (el_celkem) el_celkem.textContent = (vklad > 0 || jednoraz > 0) ? fmt(celkem) : "—";
  const realna = celkem / Math.pow(1 + inflace / 100, roky);
  if (el_realna) el_realna.textContent = (vklad > 0 || jednoraz > 0) ? fmt(realna) : "—";

  // ETF koláč v přehledu
  const etfHodnota = calcFV(vklad + jednoraz / (roky * 12), sEtf, roky) + jednoraz * Math.pow(1 + sEtf/100/12, roky*12) - jednoraz / (roky*12) * roky * 12;
  const etfFV = (vklad > 0 || jednoraz > 0) ? (calcFV(vklad, sEtf, roky) + jednoraz * Math.pow(1 + sEtf/100/12, roky*12)) : 0;
  const etfZisk = Math.max(etfFV - celkem, 0);
  const elEtfZ = document.getElementById("i_etf_zisk"); if (elEtfZ) elEtfZ.textContent = (vklad > 0 || jednoraz > 0) ? fmt(etfZisk) : "—";
  const elEtfC = document.getElementById("i_etf_celkem"); if (elEtfC) elEtfC.textContent = (vklad > 0 || jednoraz > 0) ? fmt(etfFV) : "—";

  // Průměrný měsíční a roční výnos
  const totalMesice = roky * 12;
  const mesicniVynos = (vklad > 0 || jednoraz > 0) && totalMesice > 0 ? etfZisk / totalMesice : 0;
  const rocniVynos = mesicniVynos * 12;
  const elMV = document.getElementById("i_mesicni_vynos");
  const elRV = document.getElementById("i_rocni_vynos");
  if (elMV) elMV.textContent = (vklad > 0 || jednoraz > 0) ? fmt(mesicniVynos) : "—";
  if (elRV) elRV.textContent = (vklad > 0 || jednoraz > 0) ? fmt(rocniVynos) : "—";

  // Tabulka rok po roku
  const tableWrap = document.getElementById("i_rocni_table_wrap");
  const tbody = document.getElementById("i_rocni_tbody");
  if (tableWrap && tbody && (vklad > 0 || jednoraz > 0)) {
    tableWrap.style.display = "block";
    tbody.innerHTML = "";
    for (let y = 1; y <= roky; y++) {
      const hodnota = calcFV(vklad, sEtf, y) + jednoraz * Math.pow(1 + sEtf/100/12, y*12);
      const vlozeno = vklad * 12 * y + jednoraz;
      const vynos = Math.max(hodnota - vlozeno, 0);
      const vynosMesic = vynos / (y * 12);
      const isDark = document.documentElement.getAttribute("data-theme") !== "light";
      const isLast = y === roky;
      const tr = document.createElement("tr");
      tr.style.cssText = "border-bottom:1px solid var(--border)" + (isLast ? ";background:var(--accent-dim)" : "");
      tr.innerHTML =
        "<td style='padding:5px 8px;color:" + (isLast ? "var(--accent)" : "var(--text2)") + ";font-weight:" + (isLast ? "600" : "400") + "'>" + y + ". rok</td>" +
        "<td style='text-align:right;padding:5px 8px;color:var(--text2);font-variant-numeric:tabular-nums'>" + fmt(vlozeno) + "</td>" +
        "<td style='text-align:right;padding:5px 8px;color:" + (isLast ? "var(--accent)" : "var(--text)") + ";font-weight:" + (isLast ? "600" : "500") + ";font-variant-numeric:tabular-nums'>" + fmt(hodnota) + "</td>" +
        "<td style='text-align:right;padding:5px 8px;color:var(--green);font-variant-numeric:tabular-nums'>+" + fmt(vynos) + "</td>" +
        "<td style='text-align:right;padding:5px 8px;color:var(--text2);font-variant-numeric:tabular-nums'>" + new Intl.NumberFormat("cs-CZ",{style:"currency",currency:"CZK",maximumFractionDigits:0}).format(Math.round(vynosMesic)) + "</td>";
      tbody.appendChild(tr);
    }
  } else if (tableWrap) {
    tableWrap.style.display = "none";
  }

  if (typeof investKolacChart !== "undefined" && investKolacChart) investKolacChart.destroy();
  const kolacEl = document.getElementById("investKolacChart");
  if (kolacEl && (vklad > 0 || jednoraz > 0)) {
    const isDarkK = document.documentElement.getAttribute("data-theme") !== "light";
    investKolacChart = new Chart(kolacEl.getContext("2d"), {
      type: "doughnut",
      data: {
        labels: ["Vaše vklady", "Zhodnocení ETF"],
        datasets: [{ data: [celkem, etfZisk], backgroundColor: ["#3B82F6", "#C8F04A"], borderColor: isDarkK ? "#1C1F26" : "#fff", borderWidth: 2, hoverOffset: 4 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: "62%",
        plugins: {
          legend: { display: true, position: "bottom", labels: { color: isDarkK ? "#8A9099" : "#555", font: {family:"Inter",size:11}, boxWidth:12, padding:8 } },
          tooltip: {
            backgroundColor: isDarkK ? "#1E2126" : "#fff", titleColor: isDarkK ? "#F0F2F5" : "#111",
            bodyColor: isDarkK ? "#8A9099" : "#555", borderColor: isDarkK ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", borderWidth:1, padding:10,
            callbacks: { label: ctx => " " + ctx.label + ": " + new Intl.NumberFormat("cs-CZ",{style:"currency",currency:"CZK",maximumFractionDigits:0}).format(ctx.raw) }
          }
        }
      }
    });
  }
  const produkty = [
    {id:"etf", name:"ETF / Akciový index", desc:"Světové akcie (S&P 500, MSCI World)", sazba:sEtf},
    {id:"dip", name:"DIP", desc:"Dlouhodobý investiční produkt + daň. úleva", sazba:sDip},
    {id:"penzijko", name:"Penzijní spoření", desc:"Transformované / účastnické fondy (nedoporučujeme jednorázový vklad bez pravidelné úložky)", sazba:sPenzijko},
    {id:"stavebko", name:"Stavební spoření", desc:"Garantovaný výnos + státní podpora (nedoporučujeme jednorázový vklad bez pravidelné úložky)", sazba:sStavebko},
    {id:"sporici", name:"Spořicí účet", desc:"Bankovní spořicí produkty", sazba:sSporici},
    {id:"izp", name:"Životní pojištění", desc:"Poplatkově nevýhodné — vysoká provize zprostředkovatele", sazba:1.0, isIZP:true},
    {id:"bezny", name:"Běžný účet (inflace)", desc:"Peníze ztrácejí reálnou hodnotu", sazba:sBezny - inflace},
  ];
  produkty.forEach(p => {
    const fvJednoraz = jednoraz * Math.pow(1 + Math.max(p.sazba, 0) / 100 / 12, roky * 12);
    p.hodnota = calcFV(vklad, Math.max(p.sazba, 0), roky) + fvJednoraz;
    if (p.isIZP) {
      let z = vklad * 0.97;
      for (let m = 1; m <= roky * 12; m++) {
        z = z * (1 + 0.01/12);
        if (m > 24) z += vklad;
        z -= 150;
      }
      p.hodnota = Math.max(z, 0) + fvJednoraz;
    }
    p.zisk = p.hodnota - celkem;
    p.isNeg = p.zisk < 0;
  });
  const sorted = [...produkty].sort((a, b) => b.hodnota - a.hodnota);
  const grid = document.getElementById("products-grid");
  if (grid) {
    grid.innerHTML = "";
    sorted.forEach((p, i) => {
      const isBest = i === 0;
      const div = document.createElement("div");
      div.className = "product-card" + (isBest ? " best" : "");
      div.innerHTML =
        (isBest ? "<div class=\"i-badge-best\">Nejlepší výnos</div>" : "") +
        "<div class=\"product-top\">" +
          "<div class=\"product-name\">" + p.name + "</div>" +
          "<div class=\"product-amount " + (isBest ? "pos" : p.isNeg ? "neg" : "") + "\">" + fmt(p.hodnota) + "</div>" +
        "</div>" +
        "<div style=\"display:flex;justify-content:space-between;align-items:center\">" +
          "<div class=\"product-desc\">" + p.desc + "</div>" +
          "<div class=\"product-gain " + (p.isNeg ? "neg" : "pos") + "\">" + (p.isNeg ? "−" : "+") + fmt(Math.abs(p.zisk)) + "</div>" +
        "</div>";
      grid.appendChild(div);
    });
  }
  // GRAF
  const isDark = document.documentElement.getAttribute("data-theme") !== "light";
  const textColor = isDark ? "#8A9099" : "#555C66";
  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const tooltipBg = isDark ? "#1E2126" : "#ffffff";
  const tooltipText = isDark ? "#F0F2F5" : "#1A1A1A";
  const colors = {etf:"#C8F04A",dip:"#4ADE80",penzijko:"#60A5FA",stavebko:"#F59E0B",sporici:"#A78BFA",izp:"#FB923C",bezny:"#F87171"};
  const labels = [];
  for (let y = 0; y <= roky; y++) labels.push(y === 0 ? "Start" : y + "r");
  const datasets = produkty.map(p => ({
    label: p.name,
    data: labels.map((l, idx) => Math.round(calcFV(vklad, Math.max(p.sazba, 0), idx) + jednoraz * Math.pow(1 + Math.max(p.sazba, 0) / 100 / 12, idx * 12))),
    borderColor: colors[p.id] || "#888",
    backgroundColor: "transparent",
    borderWidth: p.id === "etf" ? 3.5 : 1,
    pointRadius: 0,
    tension: 0.4,
  }));
  // Custom legend
  const legendEl = document.getElementById("invest-chart-legend");
  if (legendEl) {
    legendEl.innerHTML = "";
    datasets.forEach(ds => {
      const isEtf = ds.label === "ETF / Akciový index";
      const row = document.createElement("div");
      row.style.cssText = "display:flex;align-items:center;gap:6px;font-size:11px;color:" + textColor;
      row.innerHTML = "<div style='width:24px;height:" + (isEtf ? "3px" : "2px") + ";background:" + ds.borderColor + ";border-radius:2px;flex-shrink:0'></div>" +
        "<span style='font-weight:" + (isEtf ? "600" : "400") + ";color:" + (isEtf ? ds.borderColor : textColor) + "'>" + ds.label + "</span>";
      legendEl.appendChild(row);
    });
  }

  if (investChart) investChart.destroy();
  const canvas = document.getElementById("investChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  investChart = new Chart(ctx, {
    type: "line",
    data: {labels, datasets},
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {mode:"index", intersect:false},
      plugins: {
        legend: {display: false},
        tooltip: {
          backgroundColor:tooltipBg, borderColor:gridColor, borderWidth:1,
          titleColor:tooltipText, bodyColor:textColor, padding:12,
          callbacks: {
            label: ctx => " " + ctx.dataset.label + ": " + new Intl.NumberFormat("cs-CZ",{style:"currency",currency:"CZK",maximumFractionDigits:0}).format(ctx.raw)
          }
        }
      },
      scales: {
        x: {ticks:{color:textColor,font:{size:11},maxTicksLimit:10}, grid:{color:gridColor}},
        y: {
          ticks: {color:textColor, font:{size:11}, callback: v => new Intl.NumberFormat("cs-CZ",{notation:"compact"}).format(v) + " Kč"},
          grid: {color:gridColor}
        }
      }
    }
  });
}



// INVEST SUB-TABS
function showInvestTab(tab) {
  ["srovnani","cil"].forEach(t => {
    const el = document.getElementById("invest-" + t);
    if (el) el.style.display = t === tab ? "block" : "none";
    const btn = document.getElementById("itab-" + t);
    if (btn) {
      btn.classList.toggle("active", t === tab);
    }
  });
  if (tab === "cil") calcCil();
}

// CÍLOVÁ INVESTICE
let cilChart = null;

function syncCiCil(val, fromSlider) {
  const parsed = parseInt(String(val).replace(/\s/g, ''));
  const slider = document.getElementById("ci_cil_slider");
  const input = document.getElementById("ci_cil");
  if (!parsed || parsed <= 0) {
    if (!fromSlider && input) input.value = "";
    if (slider) slider.value = 0;
    calcCil(); return;
  }
  const v = Math.min(parsed, 20000000);
  if (input) input.value = v;
  if (slider) slider.value = v;
  calcCil();
}

function syncCiRoky(val) {
  const v = Math.min(Math.max(parseInt(val) || 1, 1), 50);
  document.getElementById("ci_roky").value = v;
  document.getElementById("ci_roky_slider").value = v;
  document.getElementById("ci_roky_label").textContent = v;
  calcCil();
}

function calcCil() {
  const cil = parseFloat(document.getElementById("ci_cil").value) || 0;
  const jednoraz = parseFloat(document.getElementById("ci_jednoraz").value) || 0;
  const roky = parseInt(document.getElementById("ci_roky").value) || 1;
  const vynos = parseFloat(document.getElementById("ci_vynos").value) || 0;
  const setP = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val > 0 ? fmt(val) : ""; };
  setP("ci_cil_preview", cil);
  setP("ci_jednoraz_preview", jednoraz);
  if (cil <= 0) {
    ["ci_mesicni","ci_vlozeno","ci_zhodnoceni"].forEach(id => { const el = document.getElementById(id); if(el) el.textContent = "—"; });
    return;
  }
  const mesice = roky * 12;
  const r = vynos / 100 / 12;
  const fvJednoraz = jednoraz * Math.pow(1 + r, mesice);
  const zbyvaCil = Math.max(cil - fvJednoraz, 0);
  let mesicni;
  if (r <= 0) { mesicni = zbyvaCil / mesice; }
  else { mesicni = zbyvaCil * r / (Math.pow(1 + r, mesice) - 1); }
  const vlozeno = mesicni * mesice + jednoraz;
  const zhodnoceni = Math.max(cil - vlozeno, 0);
  const elM = document.getElementById("ci_mesicni");
  if (elM) elM.textContent = mesicni > 0 ? fmt(mesicni) + " / měs." : "0 Kč / měs.";
  const elV = document.getElementById("ci_vlozeno"); if (elV) elV.textContent = fmt(vlozeno);
  const elZ = document.getElementById("ci_zhodnoceni"); if (elZ) elZ.textContent = fmt(zhodnoceni);

  // Product breakdown
  const sEtf = parseFloat(document.getElementById("s_etf").value) || 8;
  const sDip = parseFloat(document.getElementById("s_dip").value) || 6;
  const sStavebko = parseFloat(document.getElementById("s_stavebko").value) || 3.5;
  const sPenzijko = parseFloat(document.getElementById("s_penzijko").value) || 4.5;
  const sSporici = parseFloat(document.getElementById("s_sporici").value) || 3;
  const sBezny = parseFloat(document.getElementById("s_bezny").value) || 0.1;

  const ciProdukty = [
    {name:"ETF / Akciový index", sazba:sEtf, color:"#C8F04A"},
    {name:"DIP", sazba:sDip, color:"#4ADE80"},
    {name:"Penzijní spoření", sazba:sPenzijko, color:"#60A5FA"},
    {name:"Stavební spoření", sazba:sStavebko, color:"#F59E0B"},
    {name:"Spořicí účet", sazba:sSporici, color:"#A78BFA"},
    {name:"Běžný účet", sazba:sBezny, color:"#F87171"},
  ];

  const ciGrid = document.getElementById("ci-products-grid");
  if (ciGrid && cil > 0) {
    ciGrid.innerHTML = "";
    ciProdukty.forEach(p => {
      const pr = p.sazba / 100 / 12;
      const fvJ = jednoraz * Math.pow(1 + pr, mesice);
      const zbyva = Math.max(cil - fvJ, 0);
      let mes;
      if (pr <= 0) mes = zbyva / mesice;
      else mes = zbyva * pr / (Math.pow(1 + pr, mesice) - 1);
      const row = document.createElement("div");
      row.style.cssText = "display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--surface2);border-radius:8px;border:1px solid var(--border)";
      row.innerHTML =
        "<div style='display:flex;align-items:center;gap:8px'>" +
          "<div style='width:8px;height:8px;border-radius:50%;background:" + p.color + ";flex-shrink:0'></div>" +
          "<div style='font-size:13px;color:var(--text)'>" + p.name + "</div>" +
          "<div style='font-size:11px;color:var(--text3);margin-left:4px'>" + p.sazba + " % p.a.</div>" +
        "</div>" +
        "<div style='font-family:Inter,sans-serif;font-size:15px;font-weight:700;color:var(--text);font-variant-numeric:tabular-nums'>" + fmt(mes) + "/měs.</div>";
      ciGrid.appendChild(row);
    });
  } else if (ciGrid) {
    ciGrid.innerHTML = "";
  }
  const isDark = document.documentElement.getAttribute("data-theme") !== "light";
  if (cilChart) cilChart.destroy();
  const canvas = document.getElementById("cilChart");
  if (!canvas) return;
  cilChart = new Chart(canvas.getContext("2d"), {
    type: "doughnut",
    data: {
      labels: ["Vaše vklady", "Zhodnocení"],
      datasets: [{
        data: [Math.max(vlozeno, 0), zhodnoceni],
        backgroundColor: [isDark ? "#2C3038" : "#E5E7EB", "#C8F04A"],
        borderColor: [isDark ? "#3C4148" : "#D1D5DB", "#A8D03A"],
        borderWidth: 1, hoverOffset: 4
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: "65%",
      plugins: {
        legend: { display: true, position: "bottom", labels: { color: isDark ? "#8A9099" : "#555", font: {family:"Inter",size:12}, boxWidth:12, padding:12 } },
        tooltip: {
          backgroundColor: isDark ? "#1E2126" : "#fff",
          titleColor: isDark ? "#F0F2F5" : "#111",
          bodyColor: isDark ? "#8A9099" : "#555",
          borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
          borderWidth: 1, padding: 10,
          callbacks: { label: ctx => " " + ctx.label + ": " + new Intl.NumberFormat("cs-CZ",{style:"currency",currency:"CZK",maximumFractionDigits:0}).for.format(ctx.raw)
          }
        }
      },
      scales: {
        x: {ticks:{color:textColor,font:{size:11},maxTicksLimit:12},grid:{color:gridColor}},
        y: {ticks:{color:textColor,font:{size:11},callback:v=>new Intl.NumberFormat("cs-CZ",{notation:"compact"}).format(v)+" Kč"},grid:{color:gridColor}}
      }
    }
  });
}

