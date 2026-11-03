import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './componentes/layout/MainLayout/MainLayout'
import Home from './pages/Home/Home'
import Explorar from './pages/Explorar/Explorar'
import Biblioteca from './pages/Biblioteca/Biblioteca'
import Playlists from './pages/Playlist/Playlists'
import Perfil from './pages/Perfil/Perfil'
import Estadisticas from './pages/Estadisticas/Estadisticas'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="explorar" element={<Explorar />} />
          <Route path="biblioteca" element={<Biblioteca />} />
          <Route path="playlists" element={<Playlists />} />
          <Route path="perfil" element={<Perfil />} />
          <Route path="estadisticas" element={<Estadisticas />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App