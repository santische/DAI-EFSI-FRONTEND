import React, { useState, useEffect } from 'react';
import Buscador from '../../componentes/comunes/Buscador/Buscador';
import Filtros from '../../componentes/comunes/Filtros/Filtros';
import Modal from '../../componentes/comunes/Modal/Modal';
import FilaBiblioteca, { ItemBiblioteca } from '../../componentes/biblioteca/FilaBiblioteca/FilaBiblioteca';
import { EstadoBibliotecaBD } from '../../componentes/biblioteca/SelectorEstado/SelectorEstado';
import FormularioPuntuacion from '../../componentes/biblioteca/FormularioPuntuacion/FormularioPuntuacion';
import FormularioReseña from '../../componentes/biblioteca/FormularioReseña/FormularioReseña';
import { Loading } from '../../componentes/comunes/Loading/Loading';
import './Biblioteca.css';

const Biblioteca: React.FC = () => {
  const [canciones, setCanciones] = useState<ItemBiblioteca[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('Todos');
  const [itemSeleccionado, setItemSeleccionado] = useState<ItemBiblioteca | null>(null);

  // TODO: Reemplazar por fetch/axios real al backend
  useEffect(() => {
    // Simulación de respuesta de BD para estructurar la UI
    const fetchDatos = async () => {
      setTimeout(() => {
        setCanciones([
          { cancion_id: 1, titulo: 'Luz de Ciudad', artista: 'Alma Sol', estado: 'escuchado', es_favorita: true, puntuacion: 5, colorUI: '#b99aff' },
          { cancion_id: 2, titulo: 'Bajo la Lluvia', artista: 'Los Satélites', estado: 'quiero_escuchar', es_favorita: false, puntuacion: null, colorUI: '#95bdff' },
        ]);
        setCargando(false);
      }, 500);
    };
    fetchDatos();
  }, []);

  const opcionesFiltro = ['Todos', 'Quiero escuchar', 'Escuchando', 'Escuchado', 'Favoritos'];

  // Manejadores (Aquí irían los PUT/POST al backend)
  const handleCambiarEstado = (id: number, nuevoEstado: EstadoBibliotecaBD) => {
    setCanciones(prev => prev.map(c => c.cancion_id === id ? { ...c, estado: nuevoEstado } : c));
  };

  const handleToggleFavorito = (id: number) => {
    setCanciones(prev => prev.map(c => c.cancion_id === id ? { ...c, es_favorita: !c.es_favorita } : c));
  };

  const guardarPuntuacion = (valor: number) => {
    if (itemSeleccionado) {
      setCanciones(prev => prev.map(c => c.cancion_id === itemSeleccionado.cancion_id ? { ...c, puntuacion: valor } : c));
      setItemSeleccionado(null);
    }
  };

  const guardarReseña = (texto: string) => {
    // Lógica para guardar reseña
    setItemSeleccionado(null);
  };

  const cancionesFiltradas = canciones.filter(item => {
    const coincideBusqueda = item.titulo.toLowerCase().includes(busqueda.toLowerCase()) || 
                             item.artista.toLowerCase().includes(busqueda.toLowerCase());
    if (!coincideBusqueda) return false;
    
    if (filtroActivo === 'Todos') return true;
    if (filtroActivo === 'Favoritos') return item.es_favorita;
    if (filtroActivo === 'Quiero escuchar') return item.estado === 'quiero_escuchar';
    if (filtroActivo === 'Escuchando') return item.estado === 'escuchando';
    if (filtroActivo === 'Escuchado') return item.estado === 'escuchado';
    
    return true;
  });

  return (
    <div className="biblioteca-page">
      <header className="biblioteca-header">
        <div className="textos-header">
          <h1>Mi biblioteca</h1>
          <p>Administrá estados, favoritos, puntuaciones, reseñas y filtros.</p>
        </div>
        <button className="btn-agregar-contenido">Agregar contenido</button>
      </header>

      <div className="biblioteca-controles">
        <Buscador valor={busqueda} onChange={setBusqueda} placeholder="Filtrar canciones guardadas..." />
        <div className="seccion-filtros">
          <span className="label-filtros">ESTADO</span>
          <Filtros opciones={opcionesFiltro} activo={filtroActivo} onSelect={setFiltroActivo} />
        </div>
      </div>

      <div className="tabla-contenedor">
        {cargando ? (
          <Loading />
        ) : (
          <table className="tabla-biblioteca">
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
              {cancionesFiltradas.map(item => (
                <FilaBiblioteca
                  key={item.cancion_id}
                  item={item}
                  onCambiarEstado={handleCambiarEstado}
                  onToggleFavorito={handleToggleFavorito}
                  onAbrirOpciones={setItemSeleccionado}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal 
        isOpen={!!itemSeleccionado} 
        onClose={() => setItemSeleccionado(null)} 
        titulo={`Opciones para ${itemSeleccionado?.titulo}`}
      >
        <div className="modal-secciones">
          <h4>Puntuación</h4>
          <FormularioPuntuacion 
            puntuacionActual={itemSeleccionado?.puntuacion || null} 
            onSubmit={guardarPuntuacion} 
          />
          <hr style={{ borderColor: 'var(--borde)', margin: '20px 0' }} />
          <h4>Reseña</h4>
          <FormularioReseña 
            reseñaActual={''} 
            onSubmit={guardarReseña} 
          />
        </div>
      </Modal>
    </div>
  );
};

export default Biblioteca;