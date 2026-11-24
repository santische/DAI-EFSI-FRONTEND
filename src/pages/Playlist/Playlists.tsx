import React, { useState, useEffect, useMemo } from 'react';
import PlaylistCard from '../../componentes/playlists/PlaylistCard/PlaylistCard';
import { Coleccion } from '../../interfaces/interfaz';
import FormularioPlaylist from '../../componentes/playlists/FormularioPlaylist/FormularioPlaylist';
import Buscador from '../../componentes/comunes/Buscador/Buscador';
import Modal from '../../componentes/comunes/Modal/Modal';
import Loading from '../../componentes/comunes/Loading/Loading';
import MensajeError from '../../componentes/comunes/MensajeError/MensajeError';
import { useUser } from '../../context/UserContext/UserContext';
import { obtenerColecciones, crearColeccion } from '../../services/playlistService'; 
import './Playlists.css';

const Playlists: React.FC = () => {
  const { user } = useUser();
 const [playlists, setPlaylists] = useState<Coleccion[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  const cargarPlaylists = async () => {
    try {
      setLoading(true);
      setError(null);
      // petición al back (/api/colecciones)
      const data = await obtenerColecciones();
      setPlaylists(data || []);
    } catch (err) {
      setError('No pudimos cargar tus colecciones. Verifica tu conexión.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPlaylists();
  }, []);

  const handleCrearPlaylist = async (datos: { nombre: string; descripcion: string }) => {
    try {
      // POST al backend (/api/colecciones)
      const nuevaPlaylist = await crearColeccion(datos);
      setPlaylists((prev) => [nuevaPlaylist, ...prev]);
      setModalAbierto(false);
    } catch (err) {
      console.error('Error al crear colección', err);
     
      throw err; 
    }
  };

  // filtro (hecho con front igual no se) con buscador
  const playlistsFiltradas = useMemo(() => {
    if (!busqueda) return playlists;
    const query = busqueda.toLowerCase();
    return playlists.filter(
      (p) => p.nombre.toLowerCase().includes(query) || (p.descripcion && p.descripcion.toLowerCase().includes(query))
    );
  }, [playlists, busqueda]);

  if (loading) return <Loading mensaje="Cargando tus colecciones..." />;
  if (error) return <MensajeError mensaje={error} onReintentar={cargarPlaylists} />;

  return (
    <div className="playlists-page">
      <div className="playlists-header">
        <div>
          <h1>Tus Colecciones</h1>
          <p>Organiza tu música y crea listas personalizadas.</p>
        </div>
        <button className="btn-nueva-playlist" onClick={() => setModalAbierto(true)}>
          + Nueva Colección
        </button>
      </div>

      <div className="playlists-controles">
        <label className="label-buscador">BUSCAR EN TUS COLECCIONES</label>
        <Buscador 
          valor={busqueda} 
          onChange={setBusqueda} 
          placeholder="Buscar por nombre o descripción..." 
        />
      </div>

      {playlistsFiltradas.length > 0 ? (
        <div className="playlists-grid">
          {playlistsFiltradas.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      ) : (
        <div className="playlists-vacias">
          <p>No se encontraron colecciones.</p>
        </div>
      )}

      <Modal 
        isOpen={modalAbierto} 
        onClose={() => setModalAbierto(false)} 
        titulo="Crear Nueva Colección"
      >
        <FormularioPlaylist 
          onSubmit={handleCrearPlaylist} 
          onCancel={() => setModalAbierto(false)} 
        />
      </Modal>
    </div>
  );
};

export default Playlists;