import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <nav>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/explorar">Explorar</NavLink>
        <NavLink to="/biblioteca">Biblioteca</NavLink>
        <NavLink to="/playlists">Playlists</NavLink>
        <NavLink to="/estadisticas">Estadísticas</NavLink>
        <NavLink to="/perfil">Perfil</NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;