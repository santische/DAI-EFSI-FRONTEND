import React, { useState } from 'react';
import Buscador from '../../componentes/comunes/Buscador/Buscador';
import Filtros from '../../componentes/comunes/Filtros/Filtros';
import FilaBiblioteca, { CancionItem } from '../../componentes/biblioteca/FilaBiblioteca/FilaBiblioteca';
import Modal from '../../componentes/comunes/Modal/Modal';
import FormularioPuntuacion from '../../componentes/biblioteca/FormularioPuntuacion/FormularioPuntuacion';
import FormularioReseña from '../../componentes/biblioteca/FormularioReseña/FormularioReseña';
import { EstadoMusica } from '../../componentes/biblioteca/SelectorEstado/SelectorEstado';
import './Biblioteca.css';

const DATOS_MOCK: CancionItem[] = [
  { id: '1', titulo: 'Luz de Ciudad', artista: 'Alma Sol', estado: 'Escuchado', puntuacion: 5, esFavorito: true, inicial: 'L', colorAvatar: '#b99aff' },
  { id: '2', titulo: 'Modo Avión', artista: 'Nube Clara', estado: 'Escuchando', puntuacion: 4, esFavorito: true, inicial: 'M', colorAvatar: '#f3a0d0' },
  { id: '3', titulo: 'Bajo la Lluvia', artista: 'Los Satélites', estado: 'Quiero escuchar', puntuacion: 0, esFavorito: false, inicial: 'B', colorAvatar: '#95bdff' },
  { id: '4', titulo: 'Noche Eléctrica', artista: 'Prisma', estado: 'Escuchado', puntuacion: 5, esFavorito: true, inicial: 'N', colorAvatar: '#f4e85b' },
  { id: '5', titulo: 'Después de las 3', artista: 'Vera Luna', estado: 'Escuchado', puntuacion: 4, esFavorito: false, inicial: 'D', colorAvatar: '#8060c9' },
  { id: '6', titulo: 'Frecuencia', artista: 'Dúo Polar', estado: 'Escuchando', puntuacion: 4, esFavorito: true, inicial: 'F', colorAvatar: '#9bf0be' },
  { id: '7', titulo: 'Cerca del Sol', artista: 'La Ruta', estado: 'Quiero escuchar', puntuacion: 0, esFavorito: false, inicial: 'C', colorAvatar: '#f4e85b' },
  { id: '8', titulo: 'Todo Vuelve', artista: 'Alma Sol', estado: 'Escuchado', puntuacion: 5, esFavorito: true, inicial: 'T', colorAvatar: '#b99aff' },
];

const Biblioteca: React.FC = () => {
  const [canciones, setCanciones] = useState<CancionItem[]>(DATOS_MOCK);
  const [busqueda, setBusqueda] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('Todos');
  const [cancionSeleccionadaModal, setCancionSeleccionadaModal] = useState<CancionItem | null>(null);

  const opcionesFiltro = [
    'Todos',
    'Quiero escuchar',
    'Escuchando',
    'Escuchado',
    'Favoritos',
    'Con puntuación',
    'Con reseña'
  ];

  // Manejadores de cambios
  const handleCambiarEstado = (id: string, nuevoEstado: EstadoMusica) => {
    setCanciones(prev =>
      prev.map(item => item.id === id ? { ...item, estado: nuevoEstado } : item)
    );
  };

  const handleToggleFavorito = (id: string) => {
    setCanciones(prev =>
      prev.map(item => item.id === id ? { ...item, esFavorito: !item.esFavorito } : item)
    );
  };

  // Filtrado de lista
  const cancionesFiltradas = canciones.filter(item => {
    const coincideTexto = item.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
                          item.artista.toLowerCase().includes(busqueda.toLowerCase());

    if (!coincideTexto) return false;

    if (filtroActivo === 'Todos') return true;
    if (filtroActivo === 'Favoritos') return item.esFavorito;
    if (filtroActivo === 'Con puntuación') return item.puntuacion > 0;
    return item.estado === filtroActivo;
  });

  return (
    <div className="biblioteca-page">
      <header className="biblioteca-header">
        <div>
          <h1>Mi biblioteca</h1>
          <p>Administrá estados, favoritos, puntuaciones, reseñas y filtros.</p>
        </div>
        <button className="btn-agregar-contenido">+ Agregar contenido</button>
      </header>

      {/* Buscador */}
      <div className="biblioteca-buscador-wrapper">
        <Buscador 
          placeholder="Filtrar canciones guardadas..." 
          valor={busqueda}
          onChange={setBusqueda}
        />
      </div>

      {/* Filtros */}
      <div className="biblioteca-filtros-section">
        <span className="filtros-label">ESTADO</span>
        <Filtros 
          opciones={opcionesFiltro} 
          activo={filtroActivo} 
          onSelect={setFiltroActivo} 
        />
      </div>

      {/* Tabla de canciones */}
      <div className="biblioteca-tabla-container">
        <table className="biblioteca-tabla">
          <thead>
            <tr>
              <th>CANCIÓN</th>
              <th>ARTISTA</th>
              <th>ESTADO</th>
              <th>PUNTUACIÓN</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cancionesFiltradas.map((item) => (
              <FilaBiblioteca
                key={item.id}
                item={item}
                onCambiarEstado={handleCambiarEstado}
                onToggleFavorito={handleToggleFavorito}
                onAbrirOpciones={(cancion) => setCancionSeleccionadaModal(cancion)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para opciones (Reseña / Puntuación) */}
      <Modal 
        isOpen={!!cancionSeleccionadaModal} 
        onClose={() => setCancionSeleccionadaModal(null)}
        titulo={`Opciones de ${cancionSeleccionadaModal?.titulo || ''}`}
      >
        <div className="modal-opciones-body">
          <h4>Puntuación</h4>
          <FormularioPuntuacion />
          
          <h4 style={{ marginTop: '20px' }}>Reseña</h4>
          <FormularioReseña />
        </div>
      </Modal>
    </div>
  );
};

export default Biblioteca;