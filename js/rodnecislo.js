// RODNÉ ČÍSLO
function calcRC() {
  const raw = document.getElementById("rc_input").value.replace("/", "").replace(/\s/g, "");
  const err = document.getElementById("rc_error");
  const allFields = ["rc_datum","rc_vek","rc_pohlavi","rc_narozeniny","rc_hodiny","rc_minuty","rc_duchod"];
  if (raw.length < 9) {
    if (err) err.style.display = "none";
    allFields.forEach(f => { const el = document.getElementById(f); if(el) el.textContent = "—"; });
    return;
  }
  let rok = parseInt(raw.substring(0, 2));
  let mesic = parseInt(raw.substring(2, 4));
  let den = parseInt(raw.substring(4, 6));
  let pohlavi = "Muž";
  if (mesic > 50) { mesic -= 50; pohlavi = "Žena"; }
  if (mesic > 20) { mesic -= 20; }
  const dnesRok = new Date().getFullYear() % 100;
  rok = raw.length >= 10 ? (rok <= dnesRok ? 2000 + rok : 1900 + rok) : 1900 + rok;
  if (mesic < 1 || mesic > 12 || den < 1 || den > 31) {
    if (err) err.style.display = "block";
    allFields.forEach(f => { const el = document.getElementById(f); if(el) el.textContent = "—"; });
    return;
  }
  if (err) err.style.display = "none";
  const narozen = new Date(rok, mesic - 1, den);
  const dnes = new Date();
  let vek = dnes.getFullYear() - narozen.getFullYear();
  const mDiff = dnes.getMonth() - narozen.getMonth();
  if (mDiff < 0 || (mDiff === 0 && dnes.getDate() < narozen.getDate())) vek--;
  const pristi = new Date(dnes.getFullYear(), mesic - 1, den);
  if (pristi < dnes) pristi.setFullYear(dnes.getFullYear() + 1);
  const dniDo = Math.ceil((pristi - dnes) / (1000 * 60 * 60 * 24));
  const narozeniinyText = dniDo === 0 ? "Dnes! 🎂" : dniDo === 1 ? "Zítra! 🎂" : "za " + dniDo + " dní";
  const el_datum = document.getElementById("rc_datum");
  const el_vek = document.getElementById("rc_vek");
  const el_pohl = document.getElementById("rc_pohlavi");
  const el_nar = document.getElementById("rc_narozeniny");
  if (el_datum) el_datum.textContent = den + ". " + mesic + ". " + rok;
  if (el_vek) el_vek.textContent = vek + " let";
  if (el_pohl) el_pohl.textContent = pohlavi;
  if (el_nar) el_nar.textContent = narozeniinyText;
  // Hodiny a minuty
  const msZivo = dnes - narozen;
  const hodiny = Math.floor(msZivo / (1000 * 60 * 60));
  const minuty = Math.floor(msZivo / (1000 * 60));
  const elHod = document.getElementById("rc_hodiny");
  const elMin = document.getElementById("rc_minuty");
  if (elHod) elHod.textContent = hodiny.toLocaleString("cs-CZ");
  if (elMin) elMin.textContent = minuty.toLocaleString("cs-CZ");
  // Do důchodu
  const duchodDate = new Date(narozen);
  duchodDate.setFullYear(duchodDate.getFullYear() + 65);
  const elDuchod = document.getElementById("rc_duchod");
  if (elDuchod) {
    if (dnes >= duchodDate) {
      elDuchod.textContent = "V důchodovém věku";
    } else {
      const msDD = duchodDate - dnes;
      const ddRoky = Math.floor(msDD / (1000 * 60 * 60 * 24 * 365.25));
      const ddMesice = Math.floor((msDD % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44));
      elDuchod.textContent = ddRoky + " let " + ddMesice + " měs.";
    }
  }
}

function calcVekZRoku() {
  const rokInput = parseInt(document.getElementById("rc_rok_input").value) || 0;
  const elVek2 = document.getElementById("rc_vek2");
  const elDuchod2 = document.getElementById("rc_duchod2");
  if (!rokInput || rokInput < 1900 || rokInput > new Date().getFullYear()) {
    if (elVek2) elVek2.textContent = "—";
    if (elDuchod2) elDuchod2.textContent = "—";
    return;
  }
  const dnes = new Date();
  const vek = dnes.getFullYear() - rokInput;
  const zbyvaDoDuchodu = Math.max(65 - vek, 0);
  if (elVek2) elVek2.textContent = vek + " let";
  if (elDuchod2) elDuchod2.textContent = zbyvaDoDuchodu > 0 ? zbyvaDoDuchodu + " let (v " + (rokInput + 65) + ")" : "V důchodovém věku";
}
