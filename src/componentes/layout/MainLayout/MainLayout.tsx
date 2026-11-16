import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import Reproductor from '../../musica/Reproductor/Reproductor';
import './MainLayout.css';

// Componente contenedor que envuelve todas las vistas privadas de la aplicación
const MainLayout: React.FC = () => {
  // Estado que controla si el Sidebar está abierto o cerrado en pantallas chicas (< 900px)
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  return (
    <div className="main-layout">
      {/* Menú lateral: recibe el estado actual y la función para cerrarse al navegar */}
      <Sidebar
        abiertoMobile={sidebarAbierto}
        onCerrarMobile={() => setSidebarAbierto(false)}
      />

      <div className="layout-content">
        {/* Barra superior: recibe la función que cambia el estado a true al tocar el botón menú */}
        <Navbar onAbrirSidebar={() => setSidebarAbierto(true)} />

        {/* Outlet renderiza dinámicamente la página hija según la ruta activa (Home, Explorar, Biblioteca, etc.) */}
        <main className="page-container">
          <Outlet />
        </main>
      </div>

      {/* Reproductor persistente en la parte inferior para que la música no se corte al cambiar de página */}
      <Reproductor />
    </div>
  );
};

export default MainLayout;