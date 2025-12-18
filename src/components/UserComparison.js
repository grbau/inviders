import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../services/supabaseClient';

export default function UserComparison() {
  const { profiles } = useUser();
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [pointsByProfile, setPointsByProfile] = useState({});
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Charger les points pour les profils sélectionnés
  useEffect(() => {
    const fetchPointsForProfiles = async () => {
      if (selectedProfiles.length === 0) {
        setPointsByProfile({});
        return;
      }

      setLoading(true);
      const pointsMap = {};

      try {
        for (const profileId of selectedProfiles) {
          const { data, error } = await supabase
            .from('points')
            .select('*')
            .eq('profile_id', profileId);

          if (!error && data) {
            pointsMap[profileId] = data;
          }
        }
        setPointsByProfile(pointsMap);
      } catch (error) {
        console.error('Erreur lors du chargement des points:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPointsForProfiles();
  }, [selectedProfiles]);

  // Toggle la sélection d'un profil
  const toggleProfile = (profileId) => {
    setSelectedProfiles(prev => {
      if (prev.includes(profileId)) {
        return prev.filter(id => id !== profileId);
      }
      return [...prev, profileId];
    });
  };

  // Calculer les points communs et différences
  const getComparisonData = () => {
    if (selectedProfiles.length < 2) return null;

    // Créer un map de tous les points par leur nom (ou coordonnées comme clé unique)
    const allPointsMap = new Map();

    selectedProfiles.forEach(profileId => {
      const points = pointsByProfile[profileId] || [];
      points.forEach(point => {
        // Utiliser le nom comme clé, ou les coordonnées si pas de nom
        const key = point.name || `${point.latitude?.toFixed(4)},${point.longitude?.toFixed(4)}`;
        if (!allPointsMap.has(key)) {
          allPointsMap.set(key, {
            name: point.name || 'Sans nom',
            address: point.address,
            latitude: point.latitude,
            longitude: point.longitude,
            profilesWithPoint: new Set(),
            pointsValue: point.points || 0,
          });
        }
        allPointsMap.get(key).profilesWithPoint.add(profileId);
      });
    });

    // Séparer les points communs et les différences
    const commonPoints = [];
    const differences = [];

    allPointsMap.forEach((data, key) => {
      const pointInfo = {
        key,
        name: data.name,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        points: data.pointsValue,
        profilesWithPoint: Array.from(data.profilesWithPoint),
      };

      if (data.profilesWithPoint.size === selectedProfiles.length) {
        commonPoints.push(pointInfo);
      } else {
        differences.push(pointInfo);
      }
    });

    return { commonPoints, differences };
  };

  const comparisonData = getComparisonData();

  // Obtenir le profil par ID
  const getProfile = (profileId) => profiles.find(p => p.id === profileId);

  // Filtrer les profils valides (pas les IDs par défaut)
  const validProfiles = profiles.filter(p => !p.id.startsWith('default-'));

  if (validProfiles.length < 2) {
    return null; // Pas assez de profils pour comparer
  }

  return (
    <div className="bg-white shadow-card p-6">
      {/* Header cliquable pour expand/collapse */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <h2 className="text-h2 text-grey-700">Comparer les utilisateurs</h2>
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
          {/* Sélection des profils */}
          <div className="mb-6">
            <p className="text-sm text-grey-500 mb-3">Sélectionnez 2 utilisateurs ou plus à comparer :</p>
            <div className="flex flex-wrap gap-2">
              {validProfiles.map(profile => {
                const isSelected = selectedProfiles.includes(profile.id);
                return (
                  <button
                    key={profile.id}
                    onClick={() => toggleProfile(profile.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-grey-200 hover:border-grey-300'
                    }`}
                  >
                    {profile.picture ? (
                      <img
                        src={profile.picture}
                        alt={profile.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: profile.color }}
                      >
                        {profile.initials}
                      </div>
                    )}
                    <span className={`text-sm font-medium ${isSelected ? 'text-primary-700' : 'text-grey-700'}`}>
                      {profile.name}
                    </span>
                    {isSelected && (
                      <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Résultats de la comparaison */}
          {loading ? (
            <div className="py-8 text-center text-grey-500">
              <svg className="animate-spin h-6 w-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Chargement...
            </div>
          ) : selectedProfiles.length < 2 ? (
            <div className="py-8 text-center text-grey-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-grey-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Sélectionnez au moins 2 utilisateurs pour voir la comparaison
            </div>
          ) : comparisonData ? (
            <div className="space-y-6">
              {/* Statistiques rapides */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{comparisonData.commonPoints.length}</div>
                  <div className="text-sm text-green-700">Points en commun</div>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-amber-600">{comparisonData.differences.length}</div>
                  <div className="text-sm text-amber-700">Différences</div>
                </div>
                <div className="bg-primary-50 rounded-lg p-4 text-center sm:col-span-1 col-span-2">
                  <div className="text-2xl font-bold text-primary-600">
                    {comparisonData.commonPoints.length + comparisonData.differences.length}
                  </div>
                  <div className="text-sm text-primary-700">Total unique</div>
                </div>
              </div>

              {/* Tableau des points communs */}
              {comparisonData.commonPoints.length > 0 && (
                <div>
                  <h3 className="text-base font-semibold text-grey-700 mb-3 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    Points en commun ({comparisonData.commonPoints.length})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-grey-50">
                          <th className="px-3 py-2 text-left font-medium text-grey-600">Nom</th>
                          <th className="px-3 py-2 text-left font-medium text-grey-600 hidden sm:table-cell">Adresse</th>
                          <th className="px-3 py-2 text-right font-medium text-grey-600">Points</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-grey-100">
                        {comparisonData.commonPoints.map((point, idx) => (
                          <tr key={idx} className="hover:bg-grey-50">
                            <td className="px-3 py-2 text-grey-700">{point.name}</td>
                            <td className="px-3 py-2 text-grey-500 hidden sm:table-cell truncate max-w-[200px]">
                              {point.address || '-'}
                            </td>
                            <td className="px-3 py-2 text-right">
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                                {point.points} pts
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tableau des différences */}
              {comparisonData.differences.length > 0 && (
                <div>
                  <h3 className="text-base font-semibold text-grey-700 mb-3 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    Différences ({comparisonData.differences.length})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-grey-50">
                          <th className="px-3 py-2 text-left font-medium text-grey-600">Nom</th>
                          <th className="px-3 py-2 text-left font-medium text-grey-600">Possédé par</th>
                          <th className="px-3 py-2 text-right font-medium text-grey-600">Points</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-grey-100">
                        {comparisonData.differences.map((point, idx) => (
                          <tr key={idx} className="hover:bg-grey-50">
                            <td className="px-3 py-2 text-grey-700">{point.name}</td>
                            <td className="px-3 py-2">
                              <div className="flex flex-wrap gap-1">
                                {point.profilesWithPoint.map(profileId => {
                                  const profile = getProfile(profileId);
                                  return profile ? (
                                    <span
                                      key={profileId}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                                      style={{
                                        backgroundColor: `${profile.color}20`,
                                        color: profile.color
                                      }}
                                    >
                                      {profile.name}
                                    </span>
                                  ) : null;
                                })}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-right">
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                                {point.points} pts
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Message si aucun point */}
              {comparisonData.commonPoints.length === 0 && comparisonData.differences.length === 0 && (
                <div className="py-8 text-center text-grey-400">
                  Aucun point trouvé pour les utilisateurs sélectionnés
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
