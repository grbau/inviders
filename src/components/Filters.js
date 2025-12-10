export default function Filters({ filter, setFilter }) {
  const filterButtons = [
    { value: 'all', label: 'Tous', icon: '🌍' },
    { value: 'selected', label: 'Déjà flashés', icon: '✅' },
    { value: 'to_select', label: 'À flasher', icon: '📍' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Filtrer les points</h3>
      <div className="flex flex-wrap gap-2">
        {filterButtons.map(({ value, label, icon }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition duration-200 ${
              filter === value
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>
    </div>
  );
}