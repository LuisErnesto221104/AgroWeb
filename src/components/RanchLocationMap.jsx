import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const defaultCenter = { lat: 20.6736, lng: -103.344 }

function getValidCoordinates(value) {
  if (value?.lat === '' || value?.lng === '' || value?.lat == null || value?.lng == null) return defaultCenter
  const lat = Number(value?.lat)
  const lng = Number(value?.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return defaultCenter
  return { lat, lng }
}

function RanchLocationMap({ accuracy, value, onChange }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const accuracyCircleRef = useRef(null)
  const onChangeRef = useRef(onChange)
  const initialCoordinatesRef = useRef(getValidCoordinates(value))
  const initialHasCoordinatesRef = useRef(Boolean(value?.lat && value?.lng))
  const coordinates = getValidCoordinates(value)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined
    const initialCoordinates = initialCoordinatesRef.current

    const icon = L.divIcon({
      className: '',
      html: '<span style="display:block;width:24px;height:24px;transform:translate(-50%,-50%);border-radius:9999px;border:4px solid white;background:#D32F2F;box-shadow:0 8px 18px rgba(0,0,0,0.28);"></span>',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })

    const map = L.map(containerRef.current, {
      center: [initialCoordinates.lat, initialCoordinates.lng],
      zoom: initialHasCoordinatesRef.current ? 14 : 6,
      scrollWheelZoom: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map)

    const marker = L.marker([initialCoordinates.lat, initialCoordinates.lng], { draggable: true, icon }).addTo(map)

    function updateCoordinates(latlng) {
      const nextCoordinates = {
        lat: Number(latlng.lat.toFixed(6)),
        lng: Number(latlng.lng.toFixed(6)),
      }
      marker.setLatLng(nextCoordinates)
      onChangeRef.current(nextCoordinates)
    }

    marker.on('dragend', () => updateCoordinates(marker.getLatLng()))
    map.on('click', (event) => updateCoordinates(event.latlng))

    mapRef.current = map
    markerRef.current = marker

    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return
    markerRef.current.setLatLng([coordinates.lat, coordinates.lng])
    mapRef.current.setView([coordinates.lat, coordinates.lng], value?.lat && value?.lng ? Math.max(mapRef.current.getZoom(), 13) : mapRef.current.getZoom())

    if (accuracy && Number.isFinite(Number(accuracy))) {
      if (!accuracyCircleRef.current) {
        accuracyCircleRef.current = L.circle([coordinates.lat, coordinates.lng], {
          color: '#1f7a8c',
          fillColor: '#1f7a8c',
          fillOpacity: 0.12,
          radius: Number(accuracy),
          weight: 1,
        }).addTo(mapRef.current)
      } else {
        accuracyCircleRef.current.setLatLng([coordinates.lat, coordinates.lng])
        accuracyCircleRef.current.setRadius(Number(accuracy))
      }
    } else if (accuracyCircleRef.current) {
      accuracyCircleRef.current.remove()
      accuracyCircleRef.current = null
    }
  }, [accuracy, coordinates.lat, coordinates.lng, value?.lat, value?.lng])

  return (
    <div className="overflow-hidden rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4]">
      <div className="h-80 w-full" ref={containerRef} />
      <div className="flex flex-col gap-1 border-t border-[#98a287]/18 bg-white px-4 py-3 text-xs font-bold text-[#1d1d1b]/70 sm:flex-row sm:items-center sm:justify-between">
        <span>Haz click en el mapa o arrastra el marcador.</span>
        <span className="text-[#07612d]">
          {value?.lat && value?.lng ? `${Number(value.lat).toFixed(6)}, ${Number(value.lng).toFixed(6)}` : 'Ubicación pendiente'}
          {accuracy ? ` · precisión aprox. ${Math.round(Number(accuracy))} m` : ''}
        </span>
      </div>
    </div>
  )
}

export default RanchLocationMap
