import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext/UserContext';
import './Sidebar.css';

interface SidebarProps {
  abiertoMobile: boolean;
  onCerrarMobile: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ abiertoMobile, onCerrarMobile }) => {
  // Obtenemos los datos del usuario autenticado (tablas usuarios + perfiles) y la función de cierre de sesión
  const { user, logoutUser } = useUser();
  const navigate = useNavigate();

  // Prioriza el nombre del perfil; si no existe, usa el username y extrae su inicial para el avatar por defecto
  const nombreVisible = user?.nombre || user?.username || '';
  const inicialUsuario = nombreVisible ? nombreVisible.charAt(0).toUpperCase() : '';

  // Limpia el token/sesión en el contexto y redirige al login
  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <>
      {/* Fondo oscuro que aparece solo en móvil para cerrar el menú al tocar fuera */}
      {abiertoMobile && (
        <div className="sidebar-overlay" onClick={onCerrarMobile} />
      )}

      <aside className={`sidebar ${abiertoMobile ? 'abierto' : ''}`}>
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <div className="brand-logo">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </div>
            <div className="brand-textos">
              <span className="brand-titulo">MY COLLECTION</span>
              <span className="brand-subtitulo">TU MÚSICA, TU HISTORIA</span>
            </div>
          </div>

          <div className="sidebar-divider" />

          {/* NavLink detecta automáticamente la ruta actual (isActive) para aplicar la clase 'activo' */}
          <nav className="sidebar-nav" aria-label="Navegación principal">
            <NavLink
              to="/"
              end // 'end' evita que Inicio quede marcado como activo cuando navegás a otras subrutas
              className={({ isActive }) => `sidebar-link ${isActive ? 'activo' : ''}`}
              onClick={onCerrarMobile}
            >
              <svg className="sidebar-icono" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Inicio</span>
            </NavLink>

            <NavLink
              to="/explorar"
              className={({ isActive }) => `sidebar-link ${isActive ? 'activo' : ''}`}
              onClick={onCerrarMobile}
            >
              <svg className="sidebar-icono" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>Explorar</span>
            </NavLink>

            <NavLink
              to="/biblioteca"
              className={({ isActive }) => `sidebar-link ${isActive ? 'activo' : ''}`}
              onClick={onCerrarMobile}
            >
              <svg className="sidebar-icono" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
              <span>Biblioteca</span>
            </NavLink>

            <NavLink
              to="/playlists"
              className={({ isActive }) => `sidebar-link ${isActive ? 'activo' : ''}`}
              onClick={onCerrarMobile}
            >
              <svg className="sidebar-icono" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="3" y1="14" x2="21" y2="14" />
              </svg>
              <span>Colecciones</span>
            </NavLink>

            <NavLink
              to="/estadisticas"
              className={({ isActive }) => `sidebar-link ${isActive ? 'activo' : ''}`}
              onClick={onCerrarMobile}
            >
              <svg className="sidebar-icono" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="4" />
              </svg>
              <span>Estadísticas</span>
            </NavLink>

            <NavLink
              to="/perfil"
              className={({ isActive }) => `sidebar-link ${isActive ? 'activo' : ''}`}
              onClick={onCerrarMobile}
            >
              <svg className="sidebar-icono" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>Mi perfil</span>
            </NavLink>
          </nav>
        </div>

        {/* Bloque inferior con la info del usuario activo y botón de logout */}
        <div className="sidebar-bottom">
          <div className="sidebar-divider" />

          <div className="sidebar-usuario">
            <div className="sidebar-avatar">
              {/* Si el perfil tiene URL de foto en la BD la muestra; si no, renderiza la inicial */}
              {user?.foto ? (
                <img src={user.foto} alt={nombreVisible} />
              ) : (
                <span>{inicialUsuario}</span>
              )}
            </div>
            <div className="sidebar-usuario-info">
              <span className="sidebar-usuario-nombre">{nombreVisible}</span>
              <span className="sidebar-usuario-rol">@{user?.username}</span>
            </div>
          </div>

          <button type="button" className="sidebar-logout" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 10 4 15 9 20" />
              <path d="M20 4v7a4 4 0 0 1-4 4H4" />
            </svg>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;