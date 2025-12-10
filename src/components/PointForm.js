import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export default function PointForm() {
  const initialFormState = {
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    status: 'to_select',
  };

  const [form, setForm] = useState(initialFormState);
  const [suggestions, setSuggestions] = useState([]);

  const fetchSuggestions = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await res.json();
      const unique = data.filter(
        (s, index, self) => index === self.findIndex(t => t.display_name === s.display_name)
      );
      setSuggestions(unique);
    } catch (error) {
      console.error('Erreur lors de la récupération des suggestions :', error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(form.address);
    }, 300);
    return () => clearTimeout(timer);
  }, [form.address]);

  const handleSelectSuggestion = (s) => {
    setForm({
      ...form,
      address: s.display_name,
      latitude: s.lat,
      longitude: s.lon,
    });
    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('points')
        .insert([{
          name: form.name,
          latitude: parseFloat(form.latitude),
          longitude: parseFloat(form.longitude),
          status: form.status,
        }]);

      if (error) throw error;

      setForm(initialFormState);
      setSuggestions([]);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nom */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom du point
          </label>
          <input
            type="text"
            placeholder="Ex: Maison, Bureau..."
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>

        {/* Statut */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Statut
          </label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
          >
            <option value="to_select">📍 À flasher</option>
            <option value="selected">✅ Déjà flashé</option>
          </select>
        </div>
      </div>

      {/* Adresse avec autocomplétion */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Adresse
        </label>
        <input
          type="text"
          placeholder="Rechercher une adresse..."
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        />

        {suggestions.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
            {suggestions.map((s, idx) => (
              <li
                key={idx}
                onClick={() => handleSelectSuggestion(s)}
                className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm transition"
              >
                📍 {s.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Coordonnées */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Latitude
          </label>
          <input
            type="number"
            step="any"
            placeholder="48.8566"
            value={form.latitude}
            onChange={(e) => setForm({ ...form, latitude: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Longitude
          </label>
          <input
            type="number"
            step="any"
            placeholder="2.3522"
            value={form.longitude}
            onChange={(e) => setForm({ ...form, longitude: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>
      </div>

      {/* Bouton submit */}
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
      >
        ➕ Ajouter le point
      </button>
    </form>
  );
}
