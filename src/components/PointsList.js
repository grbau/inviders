import { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import PointForm from './PointForm';

export default function PointsList({ filter }) {
  const [points, setPoints] = useState([]);
  const subscriptionRef = useRef(null);

  // Ajoute ou met à jour un point sans doublon
  const upsertPoint = (record) => {
    setPoints(prev => {
      const exists = prev.some(p => p.id === record.id);
      if (exists) {
        return prev.map(p => (p.id === record.id ? record : p));
      }
      return [record, ...prev];
    });
  };

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const { data, error } = await supabase
          .from('points')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // filtre selon le filter reçu en prop
        const filteredRecords = filter === 'all' ? data : data.filter(p => p.status === filter);
        setPoints(filteredRecords);
      } catch (error) {
        console.error('Erreur fetch points:', error);
      }
    };

    fetchPoints();

    // S'abonner aux changements en temps réel
    const channel = supabase
      .channel('points-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'points' }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          if (filter === 'all' || payload.new.status === filter) {
            upsertPoint(payload.new);
          } else {
            // si le point ne correspond plus au filtre, on le retire
            setPoints(prev => prev.filter(p => p.id !== payload.new.id));
          }
        }
        if (payload.eventType === 'DELETE') {
          setPoints(prev => prev.filter(p => p.id !== payload.old.id));
        }
      })
      .subscribe();

    subscriptionRef.current = channel;

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [filter]);

  return (
    <div className="space-y-6">
      {/* Section Formulaire */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          ➕ Ajouter un nouveau point
        </h2>
        <PointForm />
      </div>

      {/* Section Liste */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          📋 Liste des points ({points.length})
        </h2>

        {points.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-400 text-5xl mb-4">📍</div>
            <p className="text-gray-600">Aucun point pour le moment</p>
            <p className="text-sm text-gray-500 mt-2">Ajoutez votre premier point ci-dessus</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {points.map(p => (
              <div
                key={p.id}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition duration-200 border-l-4 border-blue-500"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 text-lg">
                    {p.name}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      p.status === 'selected'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {p.status === 'selected' ? '✅ Flashé' : '📍 À flasher'}
                  </span>
                </div>

                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="font-medium mr-2">🌍 Lat:</span>
                    <span className="font-mono">{p.latitude.toFixed(6)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">🌍 Lon:</span>
                    <span className="font-mono">{p.longitude.toFixed(6)}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-2">
                    <span>🕐 {new Date(p.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
