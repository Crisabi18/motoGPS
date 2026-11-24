let orientacionDispositivo = 0;

let tallerSeleccionado = null;

let ultimaLat = 0;
let ultimaLng = 0;

let watchId = null;

let pantallaActual = "lista";

// ======================
// TALLERES
// ======================

const talleres = [
  {
    nombre: "Taller Jorge",
    lat: 19.8766952,
    lng: -98.9616700,
    telefono: "5512345678",
    direccion: "Haciendas de Tizayuca",
    horario: "08:00 - 18:00"
  },
  {
    nombre: "Taller Casa",
    lat: 19.8782307,
    lng: -98.9306489,
    telefono: "7713824121",
    direccion: "Casas Quma",
    horario: "08:00 - 18:00"
  }
];

// ======================
// GPS
// ======================

function findMe() {

  if (!navigator.geolocation) {
    alert("Tu navegador no soporta GPS");
    return;
  }

watchId = navigator.geolocation.watchPosition(
  mostrarTallerMasCercano,
  mostrarError,
  {
    enableHighAccuracy: false,
    timeout: 5000,
    maximumAge: 30000
  }
);
}

// ======================
// DISTANCIA
// ======================

function calcularDistancia(lat1, lon1, lat2, lon2) {

  const R = 6371;

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c =
    2 * Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
}

// ======================
// DIRECCION HACIA TALLER
// ======================

function calcularRumbo(lat1, lon1, lat2, lon2) {

  const dLon = (lon2 - lon1) * Math.PI / 180;

  const y =
    Math.sin(dLon) *
    Math.cos(lat2 * Math.PI / 180);

  const x =
    Math.cos(lat1 * Math.PI / 180) *
    Math.sin(lat2 * Math.PI / 180) -
    Math.sin(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.cos(dLon);

  let rumbo =
    Math.atan2(y, x) * 180 / Math.PI;

  return (rumbo + 360) % 360;
}

// ======================
// INDICACIONES
// ======================

function obtenerIndicacion(angulo){

  if (angulo <= 45 || angulo >= 315)
    return "⬆ Sigue recto";

  if (angulo < 180)
    return "➡ Gira derecha";

  if (angulo >= 180 && angulo <= 225)
    return "↩ Retorno";

  return "⬅ Gira izquierda";
}
// ======================
// RESULTADO
// ======================

function mostrarTallerMasCercano(posicion) {

  if (pantallaActual !== "lista") {
  return;
}

  ultimaLat = posicion.coords.latitude;
  ultimaLng = posicion.coords.longitude;

  let html = "";

  talleres.forEach((taller, index) => {

    const distancia = calcularDistancia(
      ultimaLat,
      ultimaLng,
      taller.lat,
      taller.lng
    );

    let distanciaTexto;

    if (distancia < 1) {
      distanciaTexto =
        Math.round(distancia * 1000) + " m";
    } else {
      distanciaTexto =
        distancia.toFixed(2) + " km";
    }

    html += `
      <div style="
        border:1px solid #ccc;
        border-radius:10px;
        margin:10px;
        padding:10px;
      ">
      
        <h3>${taller.nombre}</h3>

        <p>📏 ${distanciaTexto}</p>

        <button onclick="verTaller(${index})">
          Ver más
        </button>

      </div>
    `;

  });

  document.getElementById("resultado").innerHTML = html;
}

function verTaller(index){

  pantallaActual = "detalle";

  const taller = talleres[index];

  document.getElementById("resultado").innerHTML = `
  
    <h2>${taller.nombre}</h2>

    <p>📍 ${taller.direccion}</p>

    <p>📞 ${taller.telefono}</p>

    <p>⏰ ${taller.horario}</p>

    <br>

    <button onclick="iniciarRadar(${index})">
      🧭 Navegar
    </button>

    <button onclick="auxilio(${index})">
      🚚 Auxilio
    </button>

  `;
}

function iniciarRadar(index){

  tallerSeleccionado = talleres[index];

  document.getElementById("resultado").innerHTML = `
    <div style="
      text-align:center;
      margin-top:40px;
    ">

      <h2>🛰️ Obteniendo ubicación...</h2>

      <p>
        Espera unos segundos
      </p>

    </div>
  `;

  watchId = navigator.geolocation.watchPosition(
  mostrarRadar,
  mostrarError,
  {
    enableHighAccuracy: false,
    timeout: 5000,
    maximumAge: 30000
  }
);
}

function mostrarRadar(posicion){

  const miLat = posicion.coords.latitude;
  const miLng = posicion.coords.longitude;

  const distanciaMinima = calcularDistancia(
    miLat,
    miLng,
    tallerSeleccionado.lat,
    tallerSeleccionado.lng
  );

  const rumbo = calcularRumbo(
    miLat,
    miLng,
    tallerSeleccionado.lat,
    tallerSeleccionado.lng
  );

  const rumboRelativo =
    (rumbo - orientacionDispositivo + 360) % 360;

    let indicacion = "⬆ Sigue recto";

if (
  rumboRelativo > 45 &&
  rumboRelativo <= 135
) {
  indicacion = "➡ Gira a la derecha";
}
else if (
  rumboRelativo > 135 &&
  rumboRelativo <= 225
) {
  indicacion = "↩ Da vuelta";
}
else if (
  rumboRelativo > 225 &&
  rumboRelativo < 315
) {
  indicacion = "⬅ Gira a la izquierda";
}

if (distanciaMinima < 0.05) {
  indicacion = "🏁 DESTINO CERCANO";
}

 

  let distanciaTexto;

  if(distanciaMinima < 1){

    distanciaTexto =
      Math.round(distanciaMinima * 1000) + " m";

  }else{

    distanciaTexto =
      distanciaMinima.toFixed(2) + " km";

  }

  const radioRadar = 90;

  const radianes =
    rumboRelativo * Math.PI / 180;

  const x =
    Math.sin(radianes) * radioRadar;

  const y =
    -Math.cos(radianes) * radioRadar;

  document.getElementById("resultado").innerHTML = `

    <div style="text-align:center">

      <div style="
        width:250px;
        height:250px;
        border-radius:50%;
        border:3px solid #00ff66;
        background:#07160d;
        position:relative;
        margin:auto;
      ">

        <div style="
          position:absolute;
          left:50%;
          top:50%;
          transform:
          translate(-50%,-50%);
          font-size:40px;
        ">
          🏍️
        </div>

        <div style="
          position:absolute;
          left:${125+x}px;
          top:${125+y}px;
          transform:
          translate(-50%,-50%);
          font-size:35px;
        ">
          🔧
        </div>

      </div>

    <h2 style="
      color:#00ff66;
      margin-top:15px;
    ">
      ${indicacion}
    </h2>


      <h2>${tallerSeleccionado.nombre}</h2>

      <p>📏 ${distanciaTexto}</p>

      <button onclick="volverLista()">
        ← Volver
      </button>

    </div>

  `;
}

function auxilio(index){

  const taller = talleres[index];

  const mensaje =
    encodeURIComponent(
      "🏍️ AUXILIO\n" +
      "Ubicación:\n" +
      ultimaLat +
      "," +
      ultimaLng
    );

  location.href =
    `sms:${taller.telefono}?body=${mensaje}`;
}

// ======================
// ERROR GPS
// ======================

function mostrarError(error) {

  console.error(error);

  alert(`
Código: ${error.code}
Mensaje: ${error.message}
  `);

}

// brujula
function iniciarBrujula() {

  if (
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof DeviceOrientationEvent.requestPermission === "function"
  ) {

    // iPhone

    DeviceOrientationEvent.requestPermission()
      .then(permission => {

        if (permission === "granted") {

          window.addEventListener(
            "deviceorientation",
            actualizarBrujula,
            true
          );

        }

      });

  } else {

    // Android

    window.addEventListener(
      "deviceorientationabsolute",
      actualizarBrujula,
      true
    );

    window.addEventListener(
      "deviceorientation",
      actualizarBrujula,
      true
    );

  }

}

function actualizarBrujula(event) {

  if (event.alpha !== null) {

    orientacionDispositivo = event.alpha;

  }

}

function findMe() {

  iniciarBrujula();

  navigator.geolocation.watchPosition(
    mostrarTallerMasCercano,
    mostrarError,
    {
      enableHighAccuracy: true,
      maximumAge: 0
    }
  );

}

function volverLista() {

  pantallaActual = "lista";

  navigator.geolocation.getCurrentPosition(
    mostrarTallerMasCercano,
    mostrarError
  );

}

