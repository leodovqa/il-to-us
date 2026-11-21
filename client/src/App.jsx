import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import OverviewPage from './pages/OverviewPage';
import LocationsPage from './pages/LocationsPage';
import VisasPage from './pages/VisasPage';
import DiabetesPage from './pages/DiabetesPage';
import StoriesPage from './pages/StoriesPage';
import PracticalPage from './pages/PracticalPage';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/locations" element={<LocationsPage />} />
          <Route path="/visas" element={<VisasPage />} />
          <Route path="/diabetes" element={<DiabetesPage />} />
          <Route path="/stories" element={<StoriesPage />} />
          <Route path="/practical" element={<PracticalPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
