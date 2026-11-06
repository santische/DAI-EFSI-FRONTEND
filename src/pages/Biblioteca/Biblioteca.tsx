import React, { useState, useEffect } from 'react';
import Buscador from '../../componentes/comunes/Buscador/Buscador';
import Filtros from '../../componentes/comunes/Filtros/Filtros';
import Modal from '../../componentes/comunes/Modal/Modal';
import FilaBiblioteca, { ItemBiblioteca } from '../../componentes/biblioteca/FilaBiblioteca/FilaBiblioteca';
import { EstadoBibliotecaBD } from '../../componentes/biblioteca/SelectorEstado/SelectorEstado';
import FormularioPuntuacion from '../../componentes/biblioteca/FormularioPuntuacion/FormularioPuntuacion';
import FormularioReseña from '../../componentes/biblioteca/FormularioReseña/FormularioReseña';
import { Loading } from '../../componentes/comunes/Loading/Loading';
import { MensajeError } from '../../componentes/comunes/MensajeError/MensajeError';
import './Biblioteca.css';

const Biblioteca: React.FC = () => {
  // estado dinámico (vacio para back completar)
  const [canciones, setCanciones] = useState<ItemBiblioteca[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // estados de control de la UI
  const [busqueda, setBusqueda] = useState<string>('');
  const [filtroActivo, setFiltroActivo] = useState<string>('Todos');
  const [itemSeleccionado, setItemSeleccionado] = useState<ItemBiblioteca | null>(null);

  const opcionesFiltro = ['Todos', 'Quiero escuchar', 'Escuchando', 'Escuchado', 'Favoritos'];

  // carga datos real desde API back
  useEffect(() => {
    const obtenerBiblioteca = async () => {
      try {
        setCargando(true);
        setError(null);

        // reemplazar '/api/biblioteca' por el endpoint real del back
        const respuesta = await fetch('/api/biblioteca');
        
        if (!respuesta.ok) {
          throw new Error('Error al obtener los datos de la biblioteca');
        }

        const datos: ItemBiblioteca[] = await respuesta.json();
        setCanciones(datos);
      } catch (err: any) {
        setError(err.message || 'Ocurrió un error inesperado');
      } finally {
        setCargando(false);
      }
    };

    obtenerBiblioteca();
  }, []);

  // actualizar los estados a través de la API
  const handleCambiarEstado = async (id: number, nuevoEstado: EstadoBibliotecaBD) => {
    
    setCanciones(prev => prev.map(c => c.cancion_id === id ? { ...c, estado: nuevoEstado } : c));
    
  };

  const handleToggleFavorito = async (id: number) => {
    setCanciones(prev => prev.map(c => c.cancion_id === id ? { ...c, es_favorita: !c.es_favorita } : c));

    // TODO BACKEND: Petición PUT/PATCH al backend
    // await fetch(`/api/biblioteca/${id}/favorito`, { method: 'PATCH' });
  };

  const guardarPuntuacion = async (valor: number) => {
    if (itemSeleccionado) {
      setCanciones(prev => prev.map(c => c.cancion_id === itemSeleccionado.cancion_id ? { ...c, puntuacion: valor } : c));
      setItemSeleccionado(null);

      // TODO BACKEND: Petición POST/PUT de puntuación
    }
  };

  const guardarReseña = async (texto: string) => {
    if (itemSeleccionado) {
      setItemSeleccionado(null);

      // TODO BACKEND: Petición POST/PUT de reseña
    }
  };

  // Filtrado de canciones
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
        ) : error ? (
          <MensajeError mensaje={error} />
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
              {cancionesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--gris)', padding: '24px' }}>
                    No se encontraron canciones en tu biblioteca.
                  </td>
                </tr>
              ) : (
                cancionesFiltradas.map(item => (
                  <FilaBiblioteca
                    key={item.cancion_id}
                    item={item}
                    onCambiarEstado={handleCambiarEstado}
                    onToggleFavorito={handleToggleFavorito}
                    onAbrirOpciones={setItemSeleccionado}
                  />
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal 
        isOpen={!!itemSeleccionado} 
        onClose={() => setItemSeleccionado(null)} 
        titulo={`Opciones para ${itemSeleccionado?.titulo || ''}`}
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