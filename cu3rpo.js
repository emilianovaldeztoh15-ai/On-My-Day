var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
var DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
var DIAS_POR_MES = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

var personas = [];
var notas = [];
var hoy = new Date();
hoy.setHours(0, 0, 0, 0);
var mesVista = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
var seleccionAnio = 0;
var seleccionMes = 0;
var seleccionDia = 0;

function crearElemento(etiqueta, clase, texto) {
  var elemento = document.createElement(etiqueta);
  if (clase != "") {
    elemento.className = clase;
  }
  elemento.textContent = texto;
  return elemento;
}

function guardarPersonas() {
  localStorage.setItem("cumples_v1", JSON.stringify(personas));
}

function guardarNotas() {
  localStorage.setItem("cumples_notas_v2", JSON.stringify(notas));
}

function cargarDatos() {
  var textoPersonas = localStorage.getItem("cumples_v1");
  if (textoPersonas != null) {
    personas = JSON.parse(textoPersonas);
  }
  for (var i = 0; i < personas.length; i++) {
    if (personas[i].fecha) {
      var partes = personas[i].fecha.split("-");
      personas[i].mes = Number(partes[1]);
      personas[i].dia = Number(partes[2]);
      delete personas[i].fecha;
    }
  }
  var textoNotas = localStorage.getItem("cumples_notas_v2");
  if (textoNotas != null) {
    notas = JSON.parse(textoNotas);
  } else {
    var notaVieja = localStorage.getItem("cumples_notas_v1");
    if (notaVieja != null && notaVieja != "") {
      notas.push({ id: String(new Date().getTime()), titulo: "Mis ideas", texto: notaVieja });
    }
  }
}

function mostrarMensaje(texto) {
  var mensaje = document.getElementById("toast");
  mensaje.textContent = texto;
  mensaje.classList.add("show");
  setTimeout(function () {
    mensaje.classList.remove("show");
  }, 2400);
}

function diasQueFaltan(persona) {
  var anio = hoy.getFullYear();
  var fecha = new Date(anio, persona.mes - 1, persona.dia);
  if (fecha < hoy) {
    fecha = new Date(anio + 1, persona.mes - 1, persona.dia);
  }
  return Math.round((fecha - hoy) / 86400000);
}

function textoDias(numero) {
  if (numero == 0) {
    return "¡Es hoy! ";
  }
  if (numero == 1) {
    return "Falta 1 día";
  }
  return "Faltan " + numero + " días";
}

function textoFecha(persona) {
  return persona.dia + " de " + MESES[persona.mes - 1];
}

function hayCumpleanos(mes, dia) {
  for (var i = 0; i < personas.length; i++) {
    if (personas[i].mes == mes && personas[i].dia == dia) {
      return true;
    }
  }
  return false;
}

function irA(idSeccion) {
  var secciones = document.getElementsByClassName("view");
  for (var i = 0; i < secciones.length; i++) {
    if (secciones[i].id == idSeccion) {
      secciones[i].classList.add("active");
    } else {
      secciones[i].classList.remove("active");
    }
  }
  var botones = document.querySelectorAll("#menu button");
  for (var j = 0; j < botones.length; j++) {
    if (botones[j].getAttribute("data-go") == idSeccion) {
      botones[j].classList.add("active");
    } else {
      botones[j].classList.remove("active");
    }
  }
  window.scrollTo(0, 0);
}

var enlacesDeNavegacion = document.querySelectorAll("[data-go]");
for (var n = 0; n < enlacesDeNavegacion.length; n++) {
  enlacesDeNavegacion[n].addEventListener("click", function (evento) {
    evento.preventDefault();
    irA(this.getAttribute("data-go"));
  });
}

document.getElementById("btnAgregarRapido").onclick = function () {
  irA("cumpleanos");
  document.getElementById("nombre").focus();
};

function crearTarjetaPersona(persona) {
  var tarjeta = crearElemento("div", "persona", "");
  var avatar = crearElemento("div", "avatar", persona.nombre.charAt(0).toUpperCase());
  var info = document.createElement("div");
  info.appendChild(crearElemento("b", "", persona.nombre));
  info.appendChild(crearElemento("small", "", textoFecha(persona)));
  info.appendChild(crearElemento("small", "", textoDias(diasQueFaltan(persona))));
  tarjeta.appendChild(avatar);
  tarjeta.appendChild(info);
  return tarjeta;
}

function mostrarProximos() {
  var contenedor = document.getElementById("proximos");
  contenedor.innerHTML = "";
  if (personas.length == 0) {
    contenedor.appendChild(crearElemento("p", "vacio", "Aún no hay cumpleaños. Agrega el primero."));
    return;
  }
  var copia = personas.slice();
  copia.sort(function (a, b) {
    return diasQueFaltan(a) - diasQueFaltan(b);
  });
  var cantidad = 4;
  if (copia.length < 4) {
    cantidad = copia.length;
  }
  for (var i = 0; i < cantidad; i++) {
    contenedor.appendChild(crearTarjetaPersona(copia[i]));
  }
}

function crearAccionDia(dia) {
  return function () {
    seleccionAnio = mesVista.getFullYear();
    seleccionMes = mesVista.getMonth();
    seleccionDia = dia;
    dibujarCalendario();
    mostrarDetalleDia();
  };
}

function dibujarCalendario() {
  var contenedorSemana = document.getElementById("diasSemana");
  contenedorSemana.innerHTML = "";
  for (var i = 0; i < DIAS_SEMANA.length; i++) {
    contenedorSemana.appendChild(crearElemento("div", "", DIAS_SEMANA[i]));
  }

  var anio = mesVista.getFullYear();
  var mes = mesVista.getMonth();
  document.getElementById("tituloMes").textContent = MESES[mes] + " " + anio;

  var contenedor = document.getElementById("diasMes");
  contenedor.innerHTML = "";

  var espacios = new Date(anio, mes, 1).getDay() - 1;
  if (espacios < 0) {
    espacios = 6;
  }
  var totalDias = new Date(anio, mes + 1, 0).getDate();
  var totalMesAnterior = new Date(anio, mes, 0).getDate();

  for (var k = espacios; k > 0; k--) {
    contenedor.appendChild(crearElemento("div", "dia fuera", totalMesAnterior - k + 1));
  }

  for (var dia = 1; dia <= totalDias; dia++) {
    var clase = "dia";
    if (anio == hoy.getFullYear() && mes == hoy.getMonth() && dia == hoy.getDate()) {
      clase = clase + " hoy";
    }
    if (anio == seleccionAnio && mes == seleccionMes && dia == seleccionDia) {
      clase = clase + " sel";
    }
    var boton = crearElemento("button", clase, dia);
    if (hayCumpleanos(mes + 1, dia)) {
      boton.appendChild(crearElemento("span", "punto", ""));
      boton.setAttribute("aria-label", dia + " de " + MESES[mes] + ", hay cumpleaños");
    }
    boton.onclick = crearAccionDia(dia);
    contenedor.appendChild(boton);
  }

  var sobran = (7 - (espacios + totalDias) % 7) % 7;
  for (var s = 1; s <= sobran; s++) {
    contenedor.appendChild(crearElemento("div", "dia fuera", s));
  }
}

function mostrarDetalleDia() {
  if (seleccionDia == 0) {
    return;
  }
  var contenedor = document.getElementById("detalleDia");
  contenedor.innerHTML = "";
  var titulo = document.createElement("p");
  titulo.appendChild(crearElemento("b", "", seleccionDia + " de " + MESES[seleccionMes]));
  contenedor.appendChild(titulo);

  var encontrados = 0;
  for (var i = 0; i < personas.length; i++) {
    if (personas[i].mes == seleccionMes + 1 && personas[i].dia == seleccionDia) {
      var tarjeta = crearElemento("div", "persona", "");
      tarjeta.style.marginBottom = "8px";
      var avatar = crearElemento("div", "avatar", personas[i].nombre.charAt(0).toUpperCase());
      var info = document.createElement("div");
      info.appendChild(crearElemento("b", "", personas[i].nombre));
      if (personas[i].regalo != "") {
        info.appendChild(crearElemento("small", "", " " + personas[i].regalo));
      }
      tarjeta.appendChild(avatar);
      tarjeta.appendChild(info);
      contenedor.appendChild(tarjeta);
      encontrados = encontrados + 1;
    }
  }
  if (encontrados == 0) {
    contenedor.appendChild(crearElemento("p", "vacio", "Nadie cumple años este día."));
  }
}

document.getElementById("prevMes").onclick = function () {
  mesVista.setMonth(mesVista.getMonth() - 1);
  dibujarCalendario();
};

document.getElementById("nextMes").onclick = function () {
  mesVista.setMonth(mesVista.getMonth() + 1);
  dibujarCalendario();
};

document.getElementById("hoyBtn").onclick = function () {
  mesVista = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  dibujarCalendario();
};

function llenarDias() {
  var selectorMes = document.getElementById("mes");
  var selectorDia = document.getElementById("dia");
  var diaActual = selectorDia.value;
  var cantidad = 31;
  if (selectorMes.value != "") {
    cantidad = DIAS_POR_MES[Number(selectorMes.value) - 1];
  }
  selectorDia.innerHTML = "";
  var opcionVacia = document.createElement("option");
  opcionVacia.value = "";
  opcionVacia.textContent = "Día";
  selectorDia.appendChild(opcionVacia);
  for (var i = 1; i <= cantidad; i++) {
    var opcion = document.createElement("option");
    opcion.value = i;
    opcion.textContent = i;
    selectorDia.appendChild(opcion);
  }
  if (diaActual != "" && Number(diaActual) <= cantidad) {
    selectorDia.value = diaActual;
  }
}

document.getElementById("mes").onchange = llenarDias;

function limpiarFormulario() {
  document.getElementById("form").reset();
  document.getElementById("editId").value = "";
  document.getElementById("tituloForm").textContent = "Agregar cumpleaños";
  document.getElementById("btnGuardar").textContent = "Guardar cumpleaños";
  document.getElementById("btnCancelar").hidden = true;
  llenarDias();
}

document.getElementById("btnCancelar").onclick = limpiarFormulario;

document.getElementById("form").addEventListener("submit", function (evento) {
  evento.preventDefault();
  var nombre = document.getElementById("nombre").value.trim();
  var mes = Number(document.getElementById("mes").value);
  var dia = Number(document.getElementById("dia").value);
  var regalo = document.getElementById("regalo").value.trim();
  var idEdicion = document.getElementById("editId").value;

  if (nombre == "" || mes == 0 || dia == 0) {
    mostrarMensaje("Completa el nombre, el mes y el día");
    return;
  }

  if (idEdicion != "") {
    for (var i = 0; i < personas.length; i++) {
      if (personas[i].id == idEdicion) {
        personas[i].nombre = nombre;
        personas[i].mes = mes;
        personas[i].dia = dia;
        personas[i].regalo = regalo;
      }
    }
    mostrarMensaje("Cambios guardados");
  } else {
    var nueva = {
      id: String(new Date().getTime()),
      nombre: nombre,
      mes: mes,
      dia: dia,
      regalo: regalo
    };
    personas.push(nueva);
    mostrarMensaje("Cumpleaños guardado");
  }

  guardarPersonas();
  limpiarFormulario();
  dibujarTodo();
  mostrarAvisos(false);
});

function editarPersona(id) {
  for (var i = 0; i < personas.length; i++) {
    if (personas[i].id == id) {
      document.getElementById("editId").value = personas[i].id;
      document.getElementById("nombre").value = personas[i].nombre;
      document.getElementById("mes").value = personas[i].mes;
      llenarDias();
      document.getElementById("dia").value = personas[i].dia;
      document.getElementById("regalo").value = personas[i].regalo;
      document.getElementById("tituloForm").textContent = "Editar cumpleaños";
      document.getElementById("btnGuardar").textContent = "Guardar cambios";
      document.getElementById("btnCancelar").hidden = false;
      window.scrollTo(0, 0);
      document.getElementById("nombre").focus();
    }
  }
}

function borrarPersona(id) {
  var respuesta = confirm("¿Borrar este cumpleaños?");
  if (respuesta == false) {
    return;
  }
  var restantes = [];
  for (var i = 0; i < personas.length; i++) {
    if (personas[i].id != id) {
      restantes.push(personas[i]);
    }
  }
  personas = restantes;
  guardarPersonas();
  dibujarTodo();
  mostrarMensaje("Cumpleaños borrado");
}

function crearBotonEditar(id) {
  var boton = crearElemento("button", "", "Editar");
  boton.onclick = function () {
    editarPersona(id);
  };
  return boton;
}

function crearBotonBorrar(id) {
  var boton = crearElemento("button", "borrar", "Borrar");
  boton.onclick = function () {
    borrarPersona(id);
  };
  return boton;
}

function mostrarLista() {
  var lista = document.getElementById("lista");
  lista.innerHTML = "";
  if (personas.length == 0) {
    lista.appendChild(crearElemento("p", "vacio", "Todavía no hay cumpleaños guardados."));
    return;
  }

  var orden = document.getElementById("orden").value;
  var copia = personas.slice();
  if (orden == "nombre") {
    copia.sort(function (a, b) {
      return a.nombre.localeCompare(b.nombre, "es");
    });
  } else if (orden == "mes") {
    copia.sort(function (a, b) {
      if (a.mes != b.mes) {
        return a.mes - b.mes;
      }
      return a.dia - b.dia;
    });
  } else {
    copia.sort(function (a, b) {
      return diasQueFaltan(a) - diasQueFaltan(b);
    });
  }

  for (var i = 0; i < copia.length; i++) {
    var persona = copia[i];
    var fila = document.createElement("li");
    var avatar = crearElemento("div", "avatar", persona.nombre.charAt(0).toUpperCase());
    var info = crearElemento("div", "info", "");
    info.appendChild(crearElemento("b", "", persona.nombre));
    info.appendChild(crearElemento("small", "", textoFecha(persona) + " · " + textoDias(diasQueFaltan(persona))));
    fila.appendChild(avatar);
    fila.appendChild(info);
    fila.appendChild(crearBotonEditar(persona.id));
    fila.appendChild(crearBotonBorrar(persona.id));
    lista.appendChild(fila);
  }
}

document.getElementById("orden").onchange = mostrarLista;

function crearNota(nota) {
  var articulo = document.createElement("article");
  articulo.className = "nota";

  var titulo = document.createElement("input");
  titulo.className = "nota-titulo";
  titulo.maxLength = 40;
  titulo.placeholder = "Título de la nota";
  titulo.value = nota.titulo;

  var texto = document.createElement("textarea");
  texto.className = "nota-texto";
  texto.rows = 6;
  texto.placeholder = "Escribe aquí tus ideas…";
  texto.value = nota.texto;
  texto.style.resize = "none";

  var acciones = crearElemento("div", "acciones", "");
  var botonGuardar = crearElemento("button", "btn small", "Guardar nota");
  botonGuardar.type = "button";
  var botonBorrar = crearElemento("button", "btn ghost small", "Eliminar");
  botonBorrar.type = "button";
  var estado = crearElemento("span", "estado", "");
  estado.style.margin = "0";

  titulo.oninput = function () {
    estado.textContent = "Cambios sin guardar";
  };
  texto.oninput = function () {
    estado.textContent = "Cambios sin guardar";
  };

  botonGuardar.onclick = function () {
    nota.titulo = titulo.value.trim();
    nota.texto = texto.value;
    guardarNotas();
    estado.textContent = "✓ Nota guardada";
    mostrarMensaje("Nota guardada");
  };

  botonBorrar.onclick = function () {
    var respuesta = confirm("¿Eliminar esta nota?");
    if (respuesta == false) {
      return;
    }
    var restantes = [];
    for (var i = 0; i < notas.length; i++) {
      if (notas[i].id != nota.id) {
        restantes.push(notas[i]);
      }
    }
    notas = restantes;
    guardarNotas();
    articulo.parentNode.removeChild(articulo);
    if (notas.length == 0) {
      dibujarNotas();
    }
    mostrarMensaje("Nota eliminada");
  };

  acciones.appendChild(botonGuardar);
  acciones.appendChild(botonBorrar);
  acciones.appendChild(estado);
  articulo.appendChild(titulo);
  articulo.appendChild(texto);
  articulo.appendChild(acciones);
  return articulo;
}

function dibujarNotas() {
  var contenedor = document.getElementById("listaNotas");
  contenedor.innerHTML = "";
  if (notas.length == 0) {
    contenedor.appendChild(crearElemento("p", "vacio", "No tienes notas. Crea una con \"Nueva nota\"."));
    return;
  }
  for (var i = 0; i < notas.length; i++) {
    contenedor.appendChild(crearNota(notas[i]));
  }
}

document.getElementById("nuevaNota").onclick = function () {
  var nota = { id: String(new Date().getTime()), titulo: "", texto: "" };
  notas.push(nota);
  guardarNotas();
  dibujarNotas();
  var articulos = document.getElementsByClassName("nota");
  var ultima = articulos[articulos.length - 1];
  ultima.scrollIntoView({ behavior: "smooth", block: "center" });
  ultima.getElementsByClassName("nota-titulo")[0].focus();
};

function actualizarBotonAvisos() {
  var boton = document.getElementById("btnNotif");
  if (!("Notification" in window)) {
    boton.hidden = true;
    return;
  }
  if (Notification.permission == "granted") {
    boton.textContent = "Avisos activados";
    boton.disabled = true;
  } else {
    boton.textContent = "Activar avisos";
    boton.disabled = false;
  }
}

document.getElementById("btnNotif").onclick = function () {
  Notification.requestPermission().then(function (respuesta) {
    actualizarBotonAvisos();
    if (respuesta == "granted") {
      mostrarMensaje("Avisos activados");
      mostrarAvisos(true);
    } else {
      mostrarMensaje("No se activaron los avisos");
    }
  });
};

function mostrarAvisos(siempre) {
  if (!("Notification" in window)) {
    return;
  }
  if (Notification.permission != "granted") {
    return;
  }
  for (var i = 0; i < personas.length; i++) {
    var dias = diasQueFaltan(personas[i]);
    if (dias <= 1) {
      var clave = "aviso_" + personas[i].id + "_" + hoy.toDateString() + "_" + dias;
      if (siempre == true || localStorage.getItem(clave) == null) {
        localStorage.setItem(clave, "si");
        var titulo = "Mañana cumple años " + personas[i].nombre;
        if (dias == 0) {
          titulo = " ¡¡¡Hoy cumple años!!! " + personas[i].nombre;
        }
        var mensaje = "No olvides felicitarle.";
        if (personas[i].regalo != "") {
          mensaje = "Idea de regalo: " + personas[i].regalo;
        }
        new Notification(titulo, { body: mensaje });
      }
    }
  }
}

function dibujarTodo() {
  mostrarProximos();
  dibujarCalendario();
  mostrarDetalleDia();
  mostrarLista();
}

setInterval(function () {
  var ahora = new Date();
  ahora.setHours(0, 0, 0, 0);
  if (ahora.getTime() != hoy.getTime()) {
    hoy = ahora;
    dibujarTodo();
  }
  mostrarAvisos(false);
}, 60000);

cargarDatos();
llenarDias();
dibujarTodo();
dibujarNotas();
actualizarBotonAvisos();
mostrarAvisos(false);
