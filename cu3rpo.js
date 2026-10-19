"use strict";
const $ = (s) => document.querySelector(s);
const MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const DIAS = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
const KEY = "cumples_v1", KEY_NOTAS = "cumples_notas_v1";

let personas = JSON.parse(localStorage.getItem(KEY) || "[]");
let hoy = new Date(); hoy.setHours(0,0,0,0);
let mesVista = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
let diaSel = null;

const guardar = () => localStorage.setItem(KEY, JSON.stringify(personas));
const pad = (n) => String(n).padStart(2, "0");
const partes = (f) => { const [y,m,d] = f.split("-").map(Number); return {y,m,d}; };
const esc = (t) => t.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const inicial = (n) => esc(n.trim().charAt(0).toUpperCase());

function proximaFecha(f){
  const {m,d} = partes(f);
  let y = hoy.getFullYear();
  let fecha = new Date(y, m-1, d);
  if (fecha < hoy) fecha = new Date(y+1, m-1, d);
  return fecha;
}
const diasFaltan = (f) => Math.round((proximaFecha(f) - hoy) / 864e5);
const textoDias = (n) => n === 0 ? "¡Es hoy! 🎉" : n === 1 ? "Falta 1 día" : `Faltan ${n} días`;
const textoFecha = (f) => { const {m,d} = partes(f); return `${d} de ${MESES[m-1]}`; };
function toast(msg){ const t=$("#toast"); t.textContent=msg; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"),2400); }

/* ---------- Navegación ---------- */
function ir(id){
  document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === id));
  document.querySelectorAll("#menu button").forEach(b => b.classList.toggle("active", b.dataset.go === id));
  window.scrollTo({top:0});
}
document.querySelectorAll("[data-go]").forEach(el => el.addEventListener("click", e => { e.preventDefault(); ir(el.dataset.go); }));
$("#btnAgregarRapido").onclick = () => { ir("cumpleanos"); $("#nombre").focus(); };

/* ---------- Inicio ---------- */
function tarjeta(p){
  return `<div class="persona"><div class="avatar">${inicial(p.nombre)}</div>
    <div><b>${esc(p.nombre)}</b><small>${textoFecha(p.fecha)}</small><small>${textoDias(diasFaltan(p.fecha))}</small></div></div>`;
}
function renderInicio(){
  const prox = [...personas].sort((a,b) => diasFaltan(a.fecha) - diasFaltan(b.fecha)).slice(0,4);
  $("#proximos").innerHTML = prox.length ? prox.map(tarjeta).join("") : `<p class="vacio">Aún no hay cumpleaños. Agrega el primero.</p>`;
}

/* ---------- Calendario ---------- */
function renderCalendario(){
  $("#diasSemana").innerHTML = DIAS.map(d => `<div>${d}</div>`).join("");
  const y = mesVista.getFullYear(), m = mesVista.getMonth();
  $("#tituloMes").textContent = `${MESES[m]} ${y}`;
  const offset = (new Date(y, m, 1).getDay() + 6) % 7;      // semana inicia en lunes
  const total = new Date(y, m+1, 0).getDate();
  const prevTotal = new Date(y, m, 0).getDate();
  let html = "";
  for (let i = offset; i > 0; i--) html += `<div class="dia fuera" aria-hidden="true">${prevTotal - i + 1}</div>`;
  for (let d = 1; d <= total; d++){
    const esHoy = y===hoy.getFullYear() && m===hoy.getMonth() && d===hoy.getDate();
    const hay = personas.some(p => { const f=partes(p.fecha); return f.m===m+1 && f.d===d; });
    const sel = diaSel && diaSel.y===y && diaSel.m===m && diaSel.d===d;
    html += `<button class="dia${esHoy?" hoy":""}${sel?" sel":""}" data-d="${d}" aria-label="${d} de ${MESES[m]}${hay?", hay cumpleaños":""}">${d}${hay?'<span class="punto"></span>':""}</button>`;
  }
  const resto = (7 - (offset + total) % 7) % 7;
  for (let i = 1; i <= resto; i++) html += `<div class="dia fuera" aria-hidden="true">${i}</div>`;
  $("#diasMes").innerHTML = html;
}
$("#diasMes").addEventListener("click", e => {
  const b = e.target.closest("[data-d]"); if (!b) return;
  diaSel = { y: mesVista.getFullYear(), m: mesVista.getMonth(), d: +b.dataset.d };
  renderCalendario(); mostrarDia();
});
function mostrarDia(){
  if (!diaSel) return;
  const lista = personas.filter(p => { const f=partes(p.fecha); return f.m===diaSel.m+1 && f.d===diaSel.d; });
  $("#detalleDia").innerHTML = `<p><b>${diaSel.d} de ${MESES[diaSel.m]}</b></p>` + (lista.length
    ? lista.map(p => `<div class="persona" style="margin-bottom:8px"><div class="avatar">${inicial(p.nombre)}</div>
        <div><b>${esc(p.nombre)}</b>${p.regalo ? `<small>🎁 ${esc(p.regalo)}</small>` : ""}</div></div>`).join("")
    : `<p class="vacio">Nadie cumple años este día.</p>`);
}
$("#prevMes").onclick = () => { mesVista.setMonth(mesVista.getMonth()-1); renderCalendario(); };
$("#nextMes").onclick = () => { mesVista.setMonth(mesVista.getMonth()+1); renderCalendario(); };
$("#hoyBtn").onclick = () => { mesVista = new Date(hoy.getFullYear(), hoy.getMonth(), 1); renderCalendario(); };

/* ---------- Cumpleaños (formulario + lista) ---------- */
$("#form").addEventListener("submit", e => {
  e.preventDefault();
  const nombre = $("#nombre").value.trim(), fecha = $("#fecha").value, regalo = $("#regalo").value.trim();
  if (!nombre || !fecha) return;
  const id = $("#editId").value;
  if (id){ Object.assign(personas.find(p => p.id === id), {nombre, fecha, regalo}); toast("Cambios guardados"); }
  else { personas.push({ id: Date.now().toString(36), nombre, fecha, regalo }); toast("Cumpleaños guardado"); }
  guardar(); resetForm(); renderTodo(); avisar();
});
function resetForm(){
  $("#form").reset(); $("#editId").value = "";
  $("#tituloForm").textContent = "Agregar cumpleaños"; $("#btnGuardar").textContent = "Guardar cumpleaños";
  $("#btnCancelar").hidden = true;
}
$("#btnCancelar").onclick = resetForm;
function renderLista(){
  const o = $("#orden").value;
  const ord = [...personas].sort((a,b) => {
    if (o === "nombre") return a.nombre.localeCompare(b.nombre, "es");
    if (o === "mes"){ const x=partes(a.fecha), y=partes(b.fecha); return x.m-y.m || x.d-y.d; }
    return diasFaltan(a.fecha) - diasFaltan(b.fecha);
  });
  $("#lista").innerHTML = ord.length ? ord.map(p => `<li>
      <div class="avatar">${inicial(p.nombre)}</div>
      <div class="info"><b>${esc(p.nombre)}</b><small>${textoFecha(p.fecha)} · ${textoDias(diasFaltan(p.fecha))}</small></div>
      <button data-edit="${p.id}">Editar</button><button class="borrar" data-del="${p.id}">Borrar</button></li>`).join("")
    : `<p class="vacio">Todavía no hay cumpleaños guardados.</p>`;
}
$("#orden").onchange = renderLista;
$("#lista").addEventListener("click", e => {
  const ed = e.target.dataset.edit, del = e.target.dataset.del;
  if (ed){
    const p = personas.find(x => x.id === ed);
    $("#editId").value = p.id; $("#nombre").value = p.nombre; $("#fecha").value = p.fecha; $("#regalo").value = p.regalo || "";
    $("#tituloForm").textContent = "Editar cumpleaños"; $("#btnGuardar").textContent = "Guardar cambios";
    $("#btnCancelar").hidden = false; window.scrollTo({top:0, behavior:"smooth"}); $("#nombre").focus();
  }
  if (del && confirm("¿Borrar este cumpleaños?")){
    personas = personas.filter(p => p.id !== del); guardar(); renderTodo(); toast("Cumpleaños borrado");
  }
});

/* ---------- Regalos ---------- */
function renderRegalos(){
  $("#guiaRegalos").innerHTML = personas.length ? [...personas].sort((a,b) => a.nombre.localeCompare(b.nombre,"es")).map(p => `
    <div class="card regalo-card"><h3><span class="avatar">${inicial(p.nombre)}</span>${esc(p.nombre)}</h3>
    <small>${textoFecha(p.fecha)}</small>
    <p>${p.regalo ? esc(p.regalo) : '<span class="vacio">Sin ideas todavía. Edítalo en Cumpleaños.</span>'}</p></div>`).join("")
    : `<p class="vacio">Agrega personas para guardar sus ideas de regalo.</p>`;
}

/* ---------- Notas ---------- */
const notas = $("#notasGenerales"); notas.value = localStorage.getItem(KEY_NOTAS) || "";
let tNotas;
notas.addEventListener("input", () => {
  clearTimeout(tNotas);
  tNotas = setTimeout(() => { localStorage.setItem(KEY_NOTAS, notas.value); $("#estadoNotas").textContent = "Notas guardadas"; }, 400);
});

/* ---------- Notificaciones (solo permiso de avisos) ---------- */
function actualizarBtnNotif(){
  const b = $("#btnNotif");
  if (!("Notification" in window)){ b.hidden = true; return; }
  b.textContent = Notification.permission === "granted" ? "🔔 Avisos activados" : "🔔 Activar avisos";
  b.disabled = Notification.permission === "granted";
}
$("#btnNotif").onclick = async () => {
  const r = await Notification.requestPermission();
  actualizarBtnNotif();
  if (r === "granted"){ toast("Avisos activados"); avisar(true); } else toast("No se activaron los avisos");
};
function avisar(forzar){
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const dia = hoy.toDateString();
  personas.forEach(p => {
    const n = diasFaltan(p.fecha);
    if (n > 1) return;
    const clave = `aviso_${p.id}_${dia}_${n}`;
    if (!forzar && localStorage.getItem(clave)) return;
    localStorage.setItem(clave, "1");
    new Notification(n === 0 ? `🎉 Hoy cumple años ${p.nombre}` : `Mañana cumple años ${p.nombre}`,
      { body: p.regalo ? `Idea de regalo: ${p.regalo}` : "No olvides felicitarle." });
  });
}

/* ---------- Arranque ---------- */
function renderTodo(){ renderInicio(); renderCalendario(); mostrarDia(); renderLista(); renderRegalos(); }
renderTodo(); actualizarBtnNotif(); avisar();
setInterval(() => { const h = new Date(); h.setHours(0,0,0,0); if (+h !== +hoy){ hoy = h; renderTodo(); } avisar(); }, 60000);