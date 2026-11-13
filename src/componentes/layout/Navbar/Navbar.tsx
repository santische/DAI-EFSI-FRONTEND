import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../../context/UserContext/UserContext';
import './Navbar.css';

interface NavbarProps {
  onAbrirSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onAbrirSidebar }) => {
  const { user } = useUser();

  const nombreVisible = user?.nombre || user?.username || '';
  const inicialUsuario = nombreVisible ? nombreVisible.charAt(0).toUpperCase() : '';

  return (
    <header className="navbar">
      {/* Contenedor oculto en escritorio; se muestra en pantallas chicas (<900px) para abrir el Sidebar */}
      <div className="navbar-mobile-left">
        <button
          type="button"
          className="navbar-menu-btn"
          onClick={onAbrirSidebar}
          aria-label="Abrir menú"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span className="navbar-mobile-brand">MY COLLECTION</span>
      </div>

      {/* Acceso directo al perfil del usuario en la esquina superior derecha */}
      <div className="navbar-right">
        <Link to="/perfil" className="navbar-avatar" title="Ir a mi perfil">
          {user?.foto ? (
            <img src={user.foto} alt={nombreVisible} />
          ) : (
            <span>{inicialUsuario}</span>
          )}
        </Link>
      </div>
    </header>
  );
};

export default Navbar;