// REFINANCOVÁNÍ
function calcRefi() {
  const dluh = getRaw("r_dluh");
  const sazSou = parseFloat(document.getElementById("r_sazba_sou").value) || 0;
  const roky = parseInt(document.getElementById("r_roky").value) || 1;
  const mes = roky * 12;
  const prev = document.getElementById("r_dluh_preview");
  if (prev) prev.textContent = dluh > 0 ? fmt(dluh) : "";
  if (dluh <= 0) return;
  const splatSou = monthlyPayment(dluh, sazSou, mes);
  const celkemSou = splatSou * mes;
  document.getElementById("r_sou_splatka").textContent = fmt(splatSou) + " / měs.";
  document.getElementById("r_sou_celkem").textContent = fmt(celkemSou);
  const container = document.getElementById("refi-offers");
  container.innerHTML = "";
  sazby.forEach((s, i) => {
    const novaSpl = monthlyPayment(dluh, s.sazba, mes);
    const novaCelk = novaSpl * mes;
    const uspMes = splatSou - novaSpl;
    const uspTotal = celkemSou - novaCelk;
    const isBest = i === 0;
    const div = document.createElement("div");
    div.className = "offer-card" + (isBest ? " best" : "");
    div.innerHTML =
      (isBest ? "<div class=\"badge-best\">Nejlepší nabídka</div>" : "") +
      "<div class=\"offer-head\">" +
        "<div><div class=\"offer-name\">" + s.nazev + "</div><div class=\"offer-partner\">" + s.partner + "</div></div>" +
        "<div class=\"offer-rate\">" + s.sazba.toFixed(2) + "<small> % p.a.</small></div>" +
      "</div>" +
      "<div class=\"offer-cols\">" +
        "<div><div class=\"offer-col-label\">Nová splátka</div><div class=\"offer-col-val\">" + fmt(novaSpl) + "/m</div></div>" +
        "<div><div class=\"offer-col-label\">" + (uspMes >= 0 ? "Měsíční úspora" : "Přeplatek") + "</div><div class=\"offer-col-val\">" + fmt(Math.abs(uspMes)) + "/m</div></div>" +
        "<div><div class=\"offer-col-label\">Celkem zaplatíte</div><div class=\"offer-col-val\">" + fmt(novaCelk) + "</div></div>" +
      "</div>" +
      "<div class=\"saving-tag" + (uspTotal < 0 ? " neg" : "") + "\">" +
        (uspTotal >= 0 ? "↓ Celková úspora: " + fmt(uspTotal) : "↑ Celkový přeplatek: " + fmt(Math.abs(uspTotal))) +
      "</div>";
    container.appendChild(div);
  });
}

// TABS
function showTab(id) {
  const ids = ["kalk", "hypo", "refi", "invest", "dluhopis", "penze", "rc"];
  document.querySelectorAll(".tab").forEach((t, i) => {
    t.classList.toggle("active", ids[i] === id);
  });
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  const pc = pageContent[id];
  if (pc) {
    const tag = document.getElementById("hero-tag");
    const title = document.getElementById("hero-title");
    const desc = document.getElementById("hero-desc");
    if (tag) tag.textContent = pc.tag;
    if (title) title.innerHTML = pc.title;
    if (desc) desc.textContent = pc.desc;
  }
  if (id === "invest") calcInvest();
  if (id === "hypo") renderHypoSazby();
}
