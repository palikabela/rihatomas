// PENZE
let penzeChart = null;
let penzeKolacChartInstance = null;

function getStatniPrispevek(mesicni) {
  if (mesicni < 500) return 0;
  if (mesicni >= 1700) return 340;
  return Math.floor(mesicni * 0.20);
}

function getDanUspora(mesicni) {
  if (mesicni <= 1700) return 0;
  const odpocetRocni = Math.min((mesicni - 1700) * 12, 48000);
  return odpocetRocni * 0.15;
}

function calcFVPenze(mesicniVklad, sazbaRocni, mesice) {
  if (mesice <= 0) return 0;
  if (sazbaRocni <= 0) return mesicniVklad * mesice;
  const r = sazbaRocni / 100 / 12;
  return mesicniVklad * ((Math.pow(1+r, mesice) - 1) / r) * (1+r);
}

function pAdjRok(delta) {
  const el = document.getElementById("p_rok");
  const cur = parseInt(el.value) || 1985;
  el.value = Math.max(1950, Math.min(cur + delta, 2005));
  calcPenze();
}

function calcPenze() {
  const vklad = parseFloat(document.getElementById("p_vklad").value) || 0;
  const rokNarozeni = parseInt(document.getElementById("p_rok").value) || 0;
  const vek = rokNarozeni > 0 ? new Date().getFullYear() - rokNarozeni : 0;
  const zamest = parseFloat(document.getElementById("p_zamest").value) || 0;
  const prevod = parseFloat(document.getElementById("p_prevod").value) || 0;
  const setP = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val > 0 ? fmt(val) : ""; };
  setP("p_vklad_preview", vklad); setP("p_zamest_preview", zamest); setP("p_prevod_preview", prevod);
  const setT = (id, text) => { const el = document.getElementById(id); if(el) el.textContent = text; };

  // Require both vklad and rok to be filled
  const rokRaw = document.getElementById("p_rok").value;
  if (!rokRaw || vek <= 0 || vek >= 65) {
    ["tf_celkem","tf_vynos","tf_renta","dps_celkem","dps_vynos","dps_renta","p_rozdil_celkem","p_rozdil_renta","p_stat","p_stat_rok","p_dan_uspora","p_rocni_vyhoda","p_roky_do","p_vlozeno"].forEach(id => { const el = document.getElementById(id); if(el) el.textContent = "—"; });
    const dop = document.getElementById("p_doporuceni"); if (dop) dop.style.display = "none";
    const di = document.getElementById("p_dan_info"); if (di) di.style.display = "none";
    const vi = document.getElementById("p_vek_info"); if (vi) vi.textContent = "";
    return;
  }

  const roky = Math.max(65 - vek, 1);
  const mesice = roky * 12;
  const stat = getStatniPrispevek(vklad);
  const statRok = stat * 12;
  const danUspora = getDanUspora(vklad);
  const rocniVyhoda = statRok + danUspora;
  const celkMesicni = vklad + zamest + stat;
  setT("p_stat", fmt(stat) + "/m");
  setT("p_stat_rok", fmt(statRok) + "/rok");
  setT("p_dan_uspora", danUspora > 0 ? fmt(danUspora) + "/rok" : "—");
  setT("p_rocni_vyhoda", fmt(rocniVyhoda) + "/rok");
  setT("p_roky_do", roky + " let");
  const vekInfo = document.getElementById("p_vek_info");
  if (vekInfo) vekInfo.textContent = "Věk: " + vek + " let — do důchodu (65 let) zbývá " + roky + " let";
  setT("p_vlozeno", vklad > 0 ? fmt(celkMesicni * mesice) : "—");
  const danInfo = document.getElementById("p_dan_info");
  if (danInfo) {
    if (vklad > 1700) {
      const odpocet = Math.min((vklad - 1700) * 12, 48000);
      danInfo.style.display = "block";
      danInfo.innerHTML = "Spoříte nad 1 700 Kč/měs. — daňový odpočet <strong>" + fmt(odpocet) + " Kč/rok</strong>, úspora na dani <strong>" + fmt(danUspora) + " Kč/rok</strong>.";
    } else if (vklad >= 500) {
      danInfo.style.display = "block";
      danInfo.innerHTML = "Pro daňový odpočet navyšte příspěvek nad <strong>1 700 Kč/měs.</strong> Za každých 100 Kč navíc ušetříte <strong>180 Kč na daních ročně</strong>.";
    } else { danInfo.style.display = "none"; }
  }
  if (vklad <= 0) {
    ["tf_celkem","tf_vynos","tf_renta","dps_celkem","dps_vynos","dps_renta","p_rozdil_celkem","p_rozdil_renta"].forEach(id => setT(id, "—"));
    const dop = document.getElementById("p_doporuceni"); if (dop) dop.style.display = "none";
    return;
  }
  const tfNove = calcFVPenze(celkMesicni, 1.5, mesice);
  const tfPrevodZh = prevod * Math.pow(1 + 0.015/12, mesice);
  const tfCelkem = tfNove + tfPrevodZh;
  const tfVlozeno = celkMesicni * mesice;
  const tfVynos = Math.max(tfCelkem - tfVlozeno - prevod, 0);
  const tfRenta = tfCelkem / (20 * 12);
  const dpsNove = calcFVPenze(celkMesicni, 7, mesice);
  const dpsPrevodZh = prevod * Math.pow(1 + 0.07/12, mesice);
  const dpsCelkem = dpsNove + dpsPrevodZh;
  const dpsVynos = dpsCelkem - tfVlozeno - prevod;
  const dpsRenta = dpsCelkem / (20 * 12);

  const rozdilCelkem = dpsCelkem - tfCelkem;
  const rozdilRenta = dpsRenta - tfRenta;
  setT("tf_celkem", fmt(tfCelkem)); setT("tf_vynos", fmt(tfVynos)); setT("tf_renta", fmt(tfRenta) + "/m");
  setT("dps_celkem", fmt(dpsCelkem)); setT("dps_vynos", fmt(dpsVynos)); setT("dps_renta", fmt(dpsRenta) + "/m");
  setT("p_rozdil_celkem", fmt(rozdilCelkem)); setT("p_rozdil_renta", fmt(rozdilRenta) + "/m");

  const dop = document.getElementById("p_doporuceni");
  if (dop) {
    dop.style.display = "block";
    let text = "Převodem do DPS získáte při odchodu do důchodu o <strong>" + fmt(rozdilCelkem) + " více</strong>, měsíční renta bude vyšší o <strong>" + fmt(rozdilRenta) + " měsíčně</strong>.";
    if (prevod > 0) text += " Převedených <strong>" + fmt(prevod) + " Kč</strong> se v DPS zhodnotí výrazně lépe.";
    dop.innerHTML = text;
  }
  const isDark = document.documentElement.getAttribute("data-theme") !== "light";
  const textColor = isDark ? "#8A9099" : "#555C66";
  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const tooltipBg = isDark ? "#1E2126" : "#ffffff";
  const tooltipText = isDark ? "#F0F2F5" : "#1A1A1A";
  const labels = []; const tfData = []; const dpsData = [];
  for (let y = 0; y <= roky; y++) {
    labels.push(y === 0 ? "Dnes" : y + "r");
    const m = y * 12;
    tfData.push(Math.round(calcFVPenze(celkMesicni, 1.5, m) + prevod * Math.pow(1 + 0.015/12, m)));
    dpsData.push(Math.round(calcFVPenze(celkMesicni, 7, m) + prevod * Math.pow(1 + 0.10/12, m)));
  }
  // KOLÁČ — celkové příspěvky za celé období
  const vkladCelkem = vklad * mesice;
  const statCelkem = stat * mesice;
  const zamestCelkem = zamest * mesice;
  const dpszhodnoceni = Math.max(dpsCelkem - (celkMesicni * mesice) - prevod, 0);

  const pkKlient = document.getElementById("pk_klient");
  const pkStat = document.getElementById("pk_stat");
  const pkZamest = document.getElementById("pk_zamest");
  const pkZhodnoceni = document.getElementById("pk_zhodnoceni");

  if (pkKlient) pkKlient.textContent = vklad > 0 ? fmt(vkladCelkem) : "—";
  if (pkStat) pkStat.textContent = stat > 0 ? fmt(statCelkem) : "—";
  if (pkZamest) pkZamest.textContent = zamest > 0 ? fmt(zamestCelkem) : "—";
  if (pkZhodnoceni) pkZhodnoceni.textContent = vklad > 0 ? fmt(dpszhodnoceni) : "—";

  if (typeof penzeKolacChartInstance !== "undefined" && penzeKolacChartInstance) penzeKolacChartInstance.destroy();
  const kolacCanvas = document.getElementById("penzeKolacChart");
  if (kolacCanvas && vklad > 0) {
    const isDarkK = document.documentElement.getAttribute("data-theme") !== "light";
    const data = [vkladCelkem, statCelkem];
    const labels = ["Vaše vklady", "Stát"];
    const colors = ["#3B82F6", "#EAB308"];
    if (zamest > 0) { data.push(zamestCelkem); labels.push("Zaměstnavatel"); colors.push("#F97316"); }
    data.push(dpszhodnoceni); labels.push("Zhodnocení"); colors.push("#22C55E");
    penzeKolacChartInstance = new Chart(kolacCanvas.getContext("2d"), {
      type: "doughnut",
      data: { labels, datasets: [{ data, backgroundColor: colors, borderColor: isDarkK ? "#1C1F26" : "#fff", borderWidth: 2, hoverOffset: 4 }] },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: "65%",
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isDarkK ? "#1E2126" : "#fff",
            titleColor: isDarkK ? "#F0F2F5" : "#111",
            bodyColor: isDarkK ? "#8A9099" : "#555",
            borderColor: isDarkK ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
            borderWidth: 1, padding: 10,
            callbacks: { label: ctx => " " + ctx.label + ": " + new Intl.NumberFormat("cs-CZ",{style:"currency",currency:"CZK",maximumFractionDigits:0}).format(ctx.raw) }
          }
        }
      }
    });
  }

  if (penzeChart) penzeChart.destroy();
  const canvas = document.getElementById("penzeChart");
  if (!canvas) return;
  penzeChart = new Chart(canvas.getContext("2d"), {
    type: "line",
    data: {labels, datasets: [
      {label:"DPS", data:dpsData, borderColor:"#C8F04A", backgroundColor:"rgba(200,240,74,0.05)", borderWidth:2.5, pointRadius:0, tension:0.4, fill:true},
      {label:"Transformovaný fond", data:tfData, borderColor:"#F87171", backgroundColor:"transparent", borderWidth:1.5, pointRadius:0, tension:0.4}
    ]},
    options: {
      responsive:true, maintainAspectRatio:false,
      interaction:{mode:"index", intersect:false},
      plugins:{
        legend:{labels:{color:textColor, font:{family:"Inter",size:12}, boxWidth:14, padding:14}},
        tooltip:{backgroundColor:tooltipBg, borderColor:gridColor, borderWidth:1, titleColor:tooltipText, bodyColor:textColor, padding:12,
          callbacks:{label:ctx=>" "+ctx.dataset.label+": "+new Intl.NumberFormat("cs-CZ",{style:"currency",currency:"CZK",maximumFractionDigits:0}).format(ctx.raw)}}
      },
      scales:{
        x:{ticks:{color:textColor,font:{size:11},maxTicksLimit:12},grid:{color:gridColor}},
        y:{ticks:{color:textColor,font:{size:11},callback:v=>new Intl.NumberFormat("cs-CZ",{notation:"compact"}).format(v)+" Kč"},grid:{color:gridColor}}
      }
    }
  });
}
