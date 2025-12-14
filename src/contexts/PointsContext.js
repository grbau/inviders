import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { useUser } from './UserContext';

const PointsContext = createContext();

export function PointsProvider({ children }) {
  const { currentProfile } = useUser();
  const [allPoints, setAllPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const subscriptionRef = useRef(null);

  // Vérifie si l'ID est un UUID valide (pas un ID par défaut)
  const isValidUUID = (id) => {
    if (!id || typeof id !== 'string') return false;
    // Les IDs par défaut commencent par "default-"
    if (id.startsWith('default-')) return false;
    // Vérification basique du format UUID
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  };

  // Fonction pour charger les points
  const fetchPoints = useCallback(async () => {
    if (!currentProfile) {
      setAllPoints([]);
      setLoading(false);
      return;
    }

    // Si le profil a un ID par défaut (pas un UUID), ne pas faire de requête
    if (!isValidUUID(currentProfile.id)) {
      setAllPoints([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('points')
        .select('*')
        .eq('profile_id', currentProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllPoints(data || []);
    } catch (error) {
      console.error('Erreur fetch points:', error);
    } finally {
      setLoading(false);
    }
  }, [currentProfile]);

  // Ajoute ou met à jour un point sans doublon
  const upsertPoint = useCallback((record) => {
    if (record.profile_id !== currentProfile?.id) return;

    setAllPoints(prev => {
      const exists = prev.some(p => p.id === record.id);
      if (exists) {
        return prev.map(p => (p.id === record.id ? record : p));
      }
      return [record, ...prev];
    });
  }, [currentProfile?.id]);

  // Supprimer un point de la liste
  const removePoint = useCallback((pointId) => {
    setAllPoints(prev => prev.filter(p => p.id !== pointId));
  }, []);

  // Charger les points et s'abonner aux changements
  useEffect(() => {
    if (!currentProfile) {
      setAllPoints([]);
      return;
    }

    setLoading(true);
    fetchPoints();

    // S'abonner aux changements en temps réel
    const channel = supabase
      .channel(`points-realtime-${currentProfile.id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'points' },
        (payload) => {
          console.log('Realtime event:', payload.eventType, payload);
          if (payload.eventType === 'INSERT') {
            upsertPoint(payload.new);
          } else if (payload.eventType === 'UPDATE') {
            upsertPoint(payload.new);
          } else if (payload.eventType === 'DELETE') {
            removePoint(payload.old.id);
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    subscriptionRef.current = channel;

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [currentProfile, fetchPoints, upsertPoint, removePoint]);

  // Fonction pour forcer le rechargement (fallback si realtime ne fonctionne pas)
  const refreshPoints = useCallback(() => {
    fetchPoints();
  }, [fetchPoints]);

  return (
    <PointsContext.Provider value={{
      allPoints,
      loading,
      refreshPoints,
    }}>
      {children}
    </PointsContext.Provider>
  );
}

export function usePoints() {
  const context = useContext(PointsContext);
  if (!context) {
    throw new Error('usePoints must be used within a PointsProvider');
  }
  return context;
}
