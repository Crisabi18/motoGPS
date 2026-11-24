// ======================
// TALLERES
// ======================

const talleres = [
  {
    nombre: "Taller Jorge",
    lat: 19.8766952,
    lng: -98.9616700,
    telefono: "5512345678"
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

navigator.geolocation.watchPosition(
    mostrarTallerMasCercano,
    mostrarError,
    {
        enableHighAccuracy:true,
        maximumAge:0
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

function obtenerIndicacion(angulo) {

  if (angulo >= 337.5 || angulo < 22.5)
    return "⬆ Sigue recto";

  if (angulo < 67.5)
    return "↗ Derecha leve";

  if (angulo < 112.5)
    return "➡ Gira a la derecha";

  if (angulo < 157.5)
    return "↘ Derecha fuerte";

  if (angulo < 202.5)
    return "↩ Da vuelta en U";

  if (angulo < 247.5)
    return "↙ Izquierda fuerte";

  if (angulo < 292.5)
    return "⬅ Gira a la izquierda";

  return "↖ Izquierda leve";
}

// ======================
// RESULTADO
// ======================

function mostrarTallerMasCercano(posicion) {

  const miLat = posicion.coords.latitude;
  const miLng = posicion.coords.longitude;

  let tallerMasCercano = null;
  let distanciaMinima = Infinity;

  talleres.forEach(taller => {

    const distancia = calcularDistancia(
      miLat,
      miLng,
      taller.lat,
      taller.lng
    );

    if (distancia < distanciaMinima) {
      distanciaMinima = distancia;
      tallerMasCercano = taller;
    }

  });

  const rumbo = calcularRumbo(
    miLat,
    miLng,
    tallerMasCercano.lat,
    tallerMasCercano.lng
  );

  const indicacion = obtenerIndicacion(rumbo);

  let distanciaTexto;

if (distanciaMinima < 1) {
    distanciaTexto =
        Math.round(distanciaMinima * 1000) + " m";
} else {
    distanciaTexto =
        distanciaMinima.toFixed(2) + " km";
}

  const icono =
    indicacion.split(" ")[0];

  const radioRadar = 90;

  const radianes = rumbo * Math.PI / 180;

  const x = Math.sin(radianes) * radioRadar;

  const y = -Math.cos(radianes) * radioRadar;

  document.getElementById("resultado").innerHTML = `
  
    <div style="
      text-align:center;
      margin-top:20px;
      font-family:Arial;
    ">

      <div style="
        width:250px;
        height:250px;
        border:3px solid #00ff66;
        border-radius:50%;
        margin:auto;
        position:relative;
        background:#07160d;
      ">

        <div style="
          position:absolute;
          left:50%;
          top:50%;
          transform:translate(-50%,-50%);
          font-size:40px;
        ">
          🏍️
        </div>

       <div style="
        position:absolute;
        left:${125 + x}px;
        top:${125 + y}px;
        transform:translate(-50%, -50%);
        font-size:35px;
        ">
        🔧
      </div>

      </div>

      <div style="
        font-size:80px;
        margin-top:20px;
      ">
        ${icono}
      </div>

      <h2>${indicacion}</h2>

      <p>
        🔧 ${tallerMasCercano.nombre}
      </p>

      <p>📏 ${distanciaTexto}</p>

      <p>
        📞 ${tallerMasCercano.telefono}
      </p>

      <p>
        🧭 ${Math.round(rumbo)}°
      </p>

    </div>

  `;
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