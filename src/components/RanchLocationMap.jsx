import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const centroPredeterminado = { lat: 20.6736, lng: -103.344 };

function obtenerCoordenadasValidas(valor) {
  if (valor?.lat === '' || valor?.lng === '' || valor?.lat == null || valor?.lng == null) return centroPredeterminado;
  const lat = Number(valor?.lat);
  const lng = Number(valor?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return centroPredeterminado;
  return { lat, lng };
}

function MapaUbicacionRancho({ accuracy: precision, value: valor, onChange: alCambiar }) {
  const referenciaContenedor = useRef(null);
  const referenciaMapa = useRef(null);
  const referenciaMarcador = useRef(null);
  const referenciaCirculoPrecision = useRef(null);
  const referenciaAlCambiar = useRef(alCambiar);
  const referenciaCoordenadasIniciales = useRef(obtenerCoordenadasValidas(valor));
  const referenciaTieneCoordenadasIniciales = useRef(Boolean(valor?.lat && valor?.lng));
  const coordenadas = obtenerCoordenadasValidas(valor);

  useEffect(() => {
    referenciaAlCambiar.current = alCambiar;
  }, [alCambiar]);

  useEffect(() => {
    if (!referenciaContenedor.current || referenciaMapa.current) return undefined;
    const initialCoordinates = referenciaCoordenadasIniciales.current;

    const icono = L.divIcon({
      className: '',
      html: '<span style="display:block;width:24px;height:24px;transform:translate(-50%,-50%);border-radius:9999px;border:4px solid white;background:#D32F2F;box-shadow:0 8px 18px rgba(0,0,0,0.28);"></span>',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const mapa = L.map(referenciaContenedor.current, {
      center: [initialCoordinates.lat, initialCoordinates.lng],
      zoom: referenciaTieneCoordenadasIniciales.current ? 14 : 6,
      scrollWheelZoom: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(mapa);

    const marcador = L.marker([initialCoordinates.lat, initialCoordinates.lng], { draggable: true, icon: icono }).addTo(mapa);

    function actualizarCoordenadas(latlng) {
      const coordenadasSiguientes = {
        lat: Number(latlng.lat.toFixed(6)),
        lng: Number(latlng.lng.toFixed(6))
      };
      marcador.setLatLng(coordenadasSiguientes);
      referenciaAlCambiar.current(coordenadasSiguientes);
    }

    marcador.on('dragend', () => actualizarCoordenadas(marcador.getLatLng()));
    mapa.on('click', (evento) => actualizarCoordenadas(evento.latlng));

    referenciaMapa.current = mapa;
    referenciaMarcador.current = marcador;

    return () => {
      mapa.remove();
      referenciaMapa.current = null;
      referenciaMarcador.current = null;
    };
  }, []);

  useEffect(() => {
    if (!referenciaMapa.current || !referenciaMarcador.current) return;
    referenciaMarcador.current.setLatLng([coordenadas.lat, coordenadas.lng]);
    referenciaMapa.current.setView([coordenadas.lat, coordenadas.lng], valor?.lat && valor?.lng ? Math.max(referenciaMapa.current.getZoom(), 13) : referenciaMapa.current.getZoom());

    if (precision && Number.isFinite(Number(precision))) {
      if (!referenciaCirculoPrecision.current) {
        referenciaCirculoPrecision.current = L.circle([coordenadas.lat, coordenadas.lng], {
          color: '#1f7a8c',
          fillColor: '#1f7a8c',
          fillOpacity: 0.12,
          radius: Number(precision),
          weight: 1
        }).addTo(referenciaMapa.current);
      } else {
        referenciaCirculoPrecision.current.setLatLng([coordenadas.lat, coordenadas.lng]);
        referenciaCirculoPrecision.current.setRadius(Number(precision));
      }
    } else if (referenciaCirculoPrecision.current) {
      referenciaCirculoPrecision.current.remove();
      referenciaCirculoPrecision.current = null;
    }
  }, [precision, coordenadas.lat, coordenadas.lng, valor?.lat, valor?.lng]);

  return (
    <div className="relative z-0 overflow-hidden rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4]">
      <div className="relative z-0 h-80 w-full" ref={referenciaContenedor} />
      <div className="flex flex-col gap-1 border-t border-[#98a287]/18 bg-white px-4 py-3 text-xs font-bold text-[#1d1d1b]/70 sm:flex-row sm:items-center sm:justify-between">
        <span>Haz click en el mapa o arrastra el marcador.</span>
        <span className="text-[#07612d]">
          {valor?.lat && valor?.lng ? `${Number(valor.lat).toFixed(6)}, ${Number(valor.lng).toFixed(6)}` : 'Ubicación pendiente'}
          {precision ? ` · precisión aprox. ${Math.round(Number(precision))} m` : ''}
        </span>
      </div>
    </div>);

}

export default MapaUbicacionRancho;
