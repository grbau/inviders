import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useEffect, useState, useMemo } from 'react';
import L from 'leaflet';
import { usePoints } from '../contexts/PointsContext';

// Couleurs des markers (correspondant aux variables CSS)
const MARKER_COLORS = {
  success: '#22C55E', // var(--color-success-500)
  warning: '#F59E0B', // var(--color-warning-500)
};

// Créer des icônes personnalisées pour les markers
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          background-color: white;
          width: 8px;
          height: 8px;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

export default function MapView({ filter }) {
  const { allPoints } = usePoints();
  const [points, setPoints] = useState([]);

  const greenIcon = useMemo(() => createCustomIcon(MARKER_COLORS.success), []);
  const orangeIcon = useMemo(() => createCustomIcon(MARKER_COLORS.warning), []);

  // Filtrer les points selon le filtre actif
  useEffect(() => {
    const filteredRecords = filter === 'all'
      ? allPoints
      : allPoints.filter(p => p.status === filter);
    setPoints(filteredRecords);
  }, [filter, allPoints]);

  return (
    <MapContainer
      center={[46.603354, 1.888334]}
      zoom={6}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      {points.map(p => (
        <Marker
          key={p.id}
          position={[p.latitude, p.longitude]}
          icon={p.status === 'selected' ? greenIcon : orangeIcon}
        >
          <Popup>
            <div className="p-1 min-w-[180px]">
              <div className="font-semibold text-grey-700 text-base mb-2">
                {p.name || 'Point sans nom'}
              </div>
              {p.address && (
                <div className="text-xs text-grey-500 mb-2 truncate max-w-[200px]">
                  {p.address}
                </div>
              )}
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-grey-500">Statut</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    p.status === 'selected'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {p.status === 'selected' ? 'Flashé' : 'À flasher'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-grey-500">Points</span>
                  <span className="font-semibold text-grey-700">{p.points || 0} pts</span>
                </div>
                <div className="pt-2 border-t border-grey-100">
                  <span className="text-grey-400 text-xs font-mono">
                    {p.latitude?.toFixed(4)}, {p.longitude?.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
