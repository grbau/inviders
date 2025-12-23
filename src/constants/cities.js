// Mapping des préfixes vers les noms de villes
export const CITY_PREFIXES = {
  'PA_': 'Paris',
  'LDN_': 'Londres',
  'BXL_' : 'Bruxelles',
  'FTBL_': 'Fontainebleau',
  'LY_' : 'Lyon',
  'VLMO_': 'Valmorel', 
};

// Coordonnées des villes pour centrer la carte
export const CITY_COORDINATES = {
  'Paris': { lat: 48.8566, lng: 2.3522, zoom: 12 },
  'Londres': { lat: 51.5074, lng: -0.1278, zoom: 12 },
  'Bruxelles' : { lat: 50.84706529115858, lng: 4.352438508870051 },
  'Fontainebleau' : { lat: 48.40714184045785, lng: 2.6982209278436846 },
  'Lyon' : { lat: 45.760749330951356, lng: 4.852221240973202 },
  'Valmorel' : { lat: 45.46161840172874, lng: 6.44074274830039 },
};

// Fonction pour obtenir la ville à partir du nom d'un point
export const getCityFromName = (name) => {
  for (const [prefix, city] of Object.entries(CITY_PREFIXES)) {
    if (name?.startsWith(prefix)) {
      return city;
    }
  }
  return 'Autres';
};

// Liste des villes disponibles pour les filtres
export const getAvailableCities = () => [
  { key: 'all', label: 'Toutes les villes' },
  ...Object.values(CITY_PREFIXES).map(city => ({ key: city, label: city }))
];

// Ordre de tri des villes
export const getCityOrder = () => [...Object.values(CITY_PREFIXES), 'Autres'];
