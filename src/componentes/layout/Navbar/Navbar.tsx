import { Search, Bell, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <header className="navbar">
      <div className="buscador">
        <Search size={19} />

        <input
          type="text"
          placeholder="Buscá canciones, artistas o álbumes..."
          aria-label="Buscar música"
        />

        <span className="atajo">⌘ K</span>
      </div>

      <div className="navbar-derecha">
        <button className="boton-icono" aria-label="Notificaciones">
          <Bell size={20} />
        </button>

        <Link to="/perfil" className="avatar">
          <UserRound size={20} />
        </Link>
      </div>
    </header>
  )
}

export default Navbar