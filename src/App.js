import { useState } from 'react';
import Layout from './components/Layout';
import MapView from './components/MapView';
import PointsList from './components/PointsList';
import PointForm from './components/PointForm';

function App() {
  const [filter, setFilter] = useState('all');

  return (
    <Layout>
      <div className="space-y-6">
        {/* Desktop: Liste et Carte côte à côte */}
        {/* Mobile: empilé (Liste -> Carte) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Liste des points */}
          <div className="order-1 h-[400px] lg:h-[560px]">
            <PointsList filter={filter} setFilter={setFilter} />
          </div>

          {/* Carte */}
          <div className="order-2 h-[400px] lg:h-[560px]">
            <div className="bg-white shadow-card overflow-hidden h-full flex flex-col">
              <div className="bg-primary-500 text-white px-4 py-3 font-medium">
                Carte
              </div>
              <div className="flex-1">
                <MapView filter={filter} />
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire en dessous - sur une ligne */}
        <div className="bg-white shadow-card p-6">
          <h2 className="text-h2 text-grey-700 mb-6">Ajouter un point</h2>
          <PointForm />
        </div>
      </div>
    </Layout>
  );
}

export default App;