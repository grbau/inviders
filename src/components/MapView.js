import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

export default function MapView({ filter, refreshKey }) {
  const [points, setPoints] = useState([]);

  useEffect(() => {
    console.log('MapView useEffect déclenché, filter:', filter, 'refreshKey:', refreshKey);

    // Debounce : on attend 300ms sans changement avant de fetch
    const debounceTimer = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('points')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const filtered = filter === 'all' ? data : data.filter(p => p.status === filter);
        setPoints(filtered);
      } catch (error) {
        console.error('Erreur lors du chargement des points :', error.message);
      }
    }, 300);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [filter, refreshKey]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-gray-50 border-b">
        <h3 className="text-lg font-semibold text-gray-800">
          🗺️ Carte des points ({points.length})
        </h3>
      </div>
      <MapContainer
        center={[48.85, 2.35]}
        zoom={6}
        style={{ height: '500px', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {points.map(p => (
          <Marker key={p.id} position={[p.latitude, p.longitude]}>
            <Popup>
              <div className="p-2">
                <div className="font-bold text-lg mb-1">{p.name}</div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>
                    <span className="font-medium">Statut:</span>{' '}
                    <span className={p.status === 'selected' ? 'text-green-600' : 'text-yellow-600'}>
                      {p.status === 'selected' ? '✅ Flashé' : '📍 À flasher'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Coordonnées:</span>
                    <div className="font-mono text-xs mt-1">
                      {p.latitude.toFixed(6)}, {p.longitude.toFixed(6)}
                    </div>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
