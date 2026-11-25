
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

let ultimaLat = 0;
let ultimaLng = 0;

// ======================
// BUSCAR TALLERES
// ======================

function buscarTalleres() {

  document.getElementById("resultado").innerHTML =
    "<p>📍 Obteniendo ubicación...</p>";

  navigator.geolocation.getCurrentPosition(
    mostrarTalleres,
    mostrarError,
    {
      enableHighAccuracy: false,
      timeout: 5000
    }
  );

}

// ======================
// DISTANCIA
// ======================

function calcularDistancia(lat1, lon1, lat2, lon2) {

  const R = 6371;

  const dLat =
    (lat2 - lat1) * Math.PI / 180;

  const dLon =
    (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) *
    Math.sin(dLat / 2) +

    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *

    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c =
    2 * Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
}

// ======================
// MOSTRAR TALLERES
// ======================

function mostrarTalleres(posicion) {

  ultimaLat =
    posicion.coords.latitude;

  ultimaLng =
    posicion.coords.longitude;

  const lista = talleres.map(taller => {

    const distancia =
      calcularDistancia(
        ultimaLat,
        ultimaLng,
        taller.lat,
        taller.lng
      );

    return {
      ...taller,
      distancia
    };

  });

  lista.sort(
    (a, b) =>
      a.distancia - b.distancia
  );

  let html = "";

  lista.forEach(taller => {

    const distanciaTexto =
      taller.distancia < 1
      ? Math.round(
          taller.distancia * 1000
        ) + " m"
      : taller.distancia.toFixed(2) +
        " km";

    html += `

      <div style="
        border:1px solid #ccc;
        border-radius:10px;
        padding:12px;
        margin:10px 0;
      ">

        <h3>${taller.nombre}</h3>

        <p>📏 ${distanciaTexto}</p>

        <button
          onclick="verTaller(${taller.id})"
        >
          Ver más
        </button>

      </div>

    `;
  });

  document.getElementById("resultado").innerHTML =
    html;
}

// ======================
// VER TALLER
// ======================

function verTaller(id) {

  const taller =
    talleres.find(
      t => t.id === id
    );

  document.getElementById("resultado").innerHTML = `

    <h2>${taller.nombre}</h2>

    <p>
      📍 ${taller.direccion}
    </p>

    <p>
      📞 ${taller.telefono}
    </p>

    <p>
      ⏰ ${taller.horario}
    </p>

    <br>

    <button onclick="navegar(${id})">
      🧭 Navegar
    </button>

    <button onclick="auxilio(${id})">
      🚚 Auxilio
    </button>

    <button onclick="buscarTalleres()">
      ← Volver
    </button>

  `;
}

// ======================
// NAVEGAR
// ======================

function navegar(id) {

  const taller =
    talleres.find(
      t => t.id === id
    );

  if (navigator.onLine) {

    document.getElementById("resultado").innerHTML = `

      <h2>🟢 Modo Ruta</h2>

      <h3>${taller.nombre}</h3>

      <p>
        Aquí irá la ruta real.
      </p>

      <button onclick="verTaller(${id})">
        ← Volver
      </button>

    `;

  } else {

    document.getElementById("resultado").innerHTML = `

      <h2>🔴 Modo Emergencia</h2>

      <h3>${taller.nombre}</h3>

      <p>
        Sin internet.
      </p>

      <p>
        Utiliza el modo rescate.
      </p>

      <button onclick="verTaller(${id})">
        ← Volver
      </button>

    `;

  }
}

// ======================
// AUXILIO
// ======================

function auxilio(id) {

  const taller =
    talleres.find(
      t => t.id === id
    );

  const mensaje =
    encodeURIComponent(
      "🏍️ AUXILIO\n\n" +
      "Necesito asistencia.\n\n" +
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

  alert(
    "No se pudo obtener la ubicación.\n\n" +
    error.message
  );

}