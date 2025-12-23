import { useState, useEffect, useMemo, useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../services/supabaseClient';
import { getCityFromName } from '../constants/cities';

export default function UserRanking({ selectedCity }) {
  const { profiles } = useUser();
  const [rawData, setRawData] = useState([]); // Données brutes par profil
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const channelRef = useRef(null);

  // Filtrer les profils valides (pas les IDs par défaut) - mémorisé
  const validProfiles = useMemo(() =>
    profiles.filter(p => !p.id.startsWith('default-')),
    [profiles]
  );

  // IDs des profils valides pour la dépendance stable
  const profileIds = useMemo(() =>
    validProfiles.map(p => p.id).join(','),
    [validProfiles]
  );

  // Ref pour stocker la fonction fetch (évite les problèmes de dépendance)
  const fetchRankingsRef = useRef();

  fetchRankingsRef.current = async () => {
    if (validProfiles.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const profilesData = [];

      for (const profile of validProfiles) {
        const { data, error } = await supabase
          .from('points')
          .select('*')
          .eq('profile_id', profile.id);

        if (!error && data) {
          profilesData.push({
            profile,
            points: data, // Stocker tous les points bruts
          });
        }
      }

      setRawData(profilesData);
    } catch (error) {
      console.error('Erreur lors du chargement du classement:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données quand les profils changent
  useEffect(() => {
    setLoading(true);
    fetchRankingsRef.current();
  }, [profileIds]);

  // Calculer les rankings filtrés par ville
  const rankings = useMemo(() => {
    return rawData.map(({ profile, points }) => {
      // Filtrer les points par ville si une ville est sélectionnée
      const filteredPoints = selectedCity === 'all'
        ? points
        : points.filter(p => getCityFromName(p.name) === selectedCity);

      const totalPoints = filteredPoints
        .filter(p => p.status === 'selected')
        .reduce((sum, p) => sum + (p.points || 0), 0);
      const flashedCount = filteredPoints.filter(p => p.status === 'selected').length;
      const toFlashCount = filteredPoints.filter(p => p.status === 'to_select').length;
      const totalCount = filteredPoints.length;

      return {
        profile,
        totalPoints,
        flashedCount,
        toFlashCount,
        totalCount,
      };
    }).sort((a, b) => b.totalPoints - a.totalPoints);
  }, [rawData, selectedCity]);

  // S'abonner aux changements en temps réel
  useEffect(() => {
    const channel = supabase
      .channel('ranking-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'points' },
        () => {
          fetchRankingsRef.current();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  if (validProfiles.length < 2) {
    return null; // Pas assez de profils pour un classement
  }

  // Obtenir la médaille selon le rang
  const getMedal = (index) => {
    switch (index) {
      case 0:
        return (
          <span className="text-2xl" role="img" aria-label="Or">
            🥇
          </span>
        );
      case 1:
        return (
          <span className="text-2xl" role="img" aria-label="Argent">
            🥈
          </span>
        );
      case 2:
        return (
          <span className="text-2xl" role="img" aria-label="Bronze">
            🥉
          </span>
        );
      default:
        return (
          <span className="w-8 h-8 rounded-full bg-grey-200 flex items-center justify-center text-grey-600 font-bold text-sm">
            {index + 1}
          </span>
        );
    }
  };

  return (
    <div className="bg-white shadow-card p-6">
      {/* Header cliquable pour expand/collapse */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <h2 className="text-h2 text-grey-700">Classement</h2>
          {selectedCity && selectedCity !== 'all' && (
            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-medium">
              {selectedCity}
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-grey-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-6">
          {loading ? (
            <div className="py-8 text-center text-grey-500">
              <svg className="animate-spin h-6 w-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Chargement...
            </div>
          ) : rankings.length === 0 ? (
            <div className="py-8 text-center text-grey-400">
              Aucune donnée disponible
            </div>
          ) : (
            <div className="space-y-3">
              {rankings.map((item, index) => {
                const { profile, totalPoints, flashedCount, toFlashCount, totalCount } = item;
                const progressPercent = totalCount > 0 ? (flashedCount / totalCount) * 100 : 0;

                return (
                  <div
                    key={profile.id}
                    className={`p-4 rounded-lg transition-colors ${
                      index === 0 ? 'bg-yellow-50 border border-yellow-200' :
                      index === 1 ? 'bg-grey-100 border border-grey-200' :
                      index === 2 ? 'bg-orange-50 border border-orange-200' :
                      'bg-grey-50'
                    }`}
                  >
                    {/* Header : Rang + Avatar + Nom + Points */}
                    <div className="flex items-center gap-3">
                      {/* Rang */}
                      <div className="flex-shrink-0 w-8 flex justify-center">
                        {getMedal(index)}
                      </div>

                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {profile.picture ? (
                          <img
                            src={profile.picture}
                            alt={profile.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: profile.color }}
                          >
                            {profile.initials}
                          </div>
                        )}
                      </div>

                      {/* Nom + Points */}
                      <div className="flex-1 min-w-0 flex items-center justify-between">
                        <span className="font-semibold text-grey-700 truncate">
                          {profile.name}
                        </span>
                        <span className="text-lg font-bold text-primary-600 ml-2 flex-shrink-0">
                          {totalPoints} pts
                        </span>
                      </div>
                    </div>

                    {/* Barre de progression + Stats (en dessous) */}
                    <div className="mt-3 pl-11 xs:pl-0 xs:ml-[4.5rem]">
                      {/* Barre de progression */}
                      <div className="h-2 bg-grey-300 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-500"
                          style={{ width: `${progressPercent}%`, backgroundColor: profile.color }}
                        />
                      </div>

                      {/* Stats */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-grey-500">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-success-500"></span>
                          {flashedCount} flashés
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-warning-500"></span>
                          {toFlashCount} à flasher
                        </span>
                        <span className="text-grey-400">
                          ({totalCount} total)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
