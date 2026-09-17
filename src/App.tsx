import React, { useEffect } from 'react';
import { Routes, Route, useParams, Navigate, useLocation } from 'react-router-dom';
import { Navigation } from './components/ui/Navigation';
import { SearchModal } from './components/ui/SearchModal';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { Home } from './pages/Home';
import { useCar } from './context/CarContext';

// Lazy loaded routes for bundle optimization
const Studio = React.lazy(() => import('./pages/Studio').then((m) => ({ default: m.Studio })));
const Compare = React.lazy(() => import('./pages/Compare').then((m) => ({ default: m.Compare })));
const About = React.lazy(() => import('./pages/About').then((m) => ({ default: m.About })));
const BengaluruDrive = React.lazy(() => import('./pages/BengaluruDrive').then((m) => ({ default: m.BengaluruDrive })));

// Param-aware route wrapper for /models/:id
const ModelParamHandler: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { selectCar } = useCar();

  useEffect(() => {
    if (id) {
      selectCar(id);
    }
  }, [id, selectCar]);

  return <Home />;
};

export const App: React.FC = () => {
  const location = useLocation();
  const isDrivePage = location.pathname === '/drive';

  return (
    <div className="min-h-screen bg-[#050507] text-white flex flex-col justify-between selection:bg-white selection:text-black">
      {/* Luxury Loading Screen */}
      {!isDrivePage && <LoadingScreen />}

      {/* Global Apple iOS Navigation Bar (hidden in drive mode) */}
      {!isDrivePage && <Navigation />}

      {/* Global Spotlight Search Modal */}
      {!isDrivePage && <SearchModal />}

      {/* Application Routing */}
      <main className="flex-1">
        <React.Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/models" element={<Home />} />
            <Route path="/models/:id" element={<ModelParamHandler />} />
            <Route path="/studio" element={<Studio />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/about" element={<About />} />
            <Route path="/drive" element={<BengaluruDrive />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </React.Suspense>
      </main>
    </div>
  );
};
