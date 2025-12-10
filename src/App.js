import { useState } from 'react';
import Layout from './components/Layout';
import MapView from './components/MapView';
import Filters from './components/Filters';
import PointsList from './components/PointsList';

function App() {
  const [filter, setFilter] = useState('all');
  const refreshKey = useState(0);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Filtres */}
        <Filters filter={filter} setFilter={setFilter} />

        {/* Layout responsive avec la carte et la liste */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Colonne gauche : Liste et formulaire */}
          <div className="order-2 lg:order-1">
            <PointsList filter={filter} />
          </div>

          {/* Colonne droite : Carte */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-6 lg:self-start">
            <MapView filter={filter} refreshKey={refreshKey[0]} />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default App;