import { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

const Home = lazy(() => import('./pages/Home'));
const Players = lazy(() => import('./pages/Players'));
const NewMatch = lazy(() => import('./pages/NewMatch'));
const FaceOff = lazy(() => import('./pages/FaceOff'));
const Winner = lazy(() => import('./pages/Winner'));
const History = lazy(() => import('./pages/History'));
const Settings = lazy(() => import('./pages/Settings'));

function Loader() {
  return (
    <div className="min-h-screen bg-goat-navy flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-goat-red border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/players" element={<Players />} />
          <Route path="/new-match" element={<NewMatch />} />
          <Route path="/faceoff" element={<FaceOff />} />
          <Route path="/winner" element={<Winner />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
