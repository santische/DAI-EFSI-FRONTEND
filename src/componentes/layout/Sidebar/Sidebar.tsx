import { NavLink } from 'react-router-dom'
import {
  House,
  Compass,
  Library,
  ListMusic,
  UserRound,
  ChartNoAxesColumn,
  Headphones,
} from 'lucide-react'

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-icono">
          <Headphones size={24} />
        </div>

        <div>
          <h2>my collection</h2>
          <p>MÚSICA PARA VOS</p>
        </div>
      </div>

      <p className="menu-titulo">MENÚ PRINCIPAL</p>

      <nav className="menu">
        <NavLink to="/" end className="menu-enlace">
          <House size={19} />
          <span>Inicio</span>
        </NavLink>

        <NavLink to="/explorar" className="menu-enlace">
          <Compass size={19} />
          <span>Explorar</span>
        </NavLink>

        <NavLink to="/biblioteca" className="menu-enlace">
          <Library size={19} />
          <span>Mi biblioteca</span>
        </NavLink>

        <NavLink to="/playlists" className="menu-enlace">
          <ListMusic size={19} />
          <span>Mis playlists</span>
        </NavLink>
      </nav>

      <p className="menu-titulo">MI CUENTA</p>

      <nav className="menu">
        <NavLink to="/perfil" className="menu-enlace">
          <UserRound size={19} />
          <span>Mi perfil</span>
        </NavLink>

        <NavLink to="/estadisticas" className="menu-enlace">
          <ChartNoAxesColumn size={19} />
          <span>Estadísticas</span>
        </NavLink>
      </nav>

      <div className="sidebar-inferior">
        <div className="nota-musical">♫</div>
        <p>Tu música, tu espacio.</p>
        <span>Descubrí algo nuevo cada día.</span>
      </div>
    </aside>
  )
}

export default Sidebar