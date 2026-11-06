import React, { JSX } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext/UserContext';
import { PlayerProvider } from './context/PlayerContext/PlayerContext';

import MainLayout from './componentes/layout/MainLayout/MainLayout';

// Páginas
import Home from './pages/Home/Home';
import Explorar from './pages/Explorar/Explorar';
import DetalleCancion from './pages/DetalleCancion/DetalleCancion';
import DetallePlaylist from './pages/DetallePlaylist/DetallePlaylist';
import Biblioteca from './pages/Biblioteca/Biblioteca';
import Playlists from './pages/Playlist/Playlists';
import Perfil from './pages/Perfil/Perfil';
import Estadisticas from './pages/Estadisticas/Estadisticas';
import Login from './pages/Login/Login';
import Registro from './pages/Registro/Registro';

import './styles/global.css';
import './styles/variables.css';

// Guardián para proteger rutas privadas
const ProtectedRoute = (): JSX.Element => {
  const { user, loading } = useUser();

  if (loading) {
    return <div className="loading-screen">Cargando sesión...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

const App: React.FC = () => {
  return (
    <UserProvider>
      <PlayerProvider>
        <BrowserRouter>
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />

            {/* Rutas Protegidas dentro del MainLayout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/explorar" element={<Explorar />} />
                <Route path="/cancion/:id" element={<DetalleCancion />} />
                <Route path="/playlist/:id" element={<DetallePlaylist />} />
                <Route path="/biblioteca" element={<Biblioteca />} />
                <Route path="/playlists" element={<Playlists />} />
                <Route path="/perfil" element={<Perfil />} />
                <Route path="/estadisticas" element={<Estadisticas />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </PlayerProvider>
    </UserProvider>
  );
};

export default App;