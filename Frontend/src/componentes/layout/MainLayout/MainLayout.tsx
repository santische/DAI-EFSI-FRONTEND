import { Outlet } from 'react-router-dom'
import Sidebar from '../Sidebar/Sidebar'
import Navbar from '../Navbar/Navbar'

function MainLayout() {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="contenido-principal">
        <Navbar />

        <main className="pagina">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout