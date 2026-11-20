import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import BotonFavorito from '../../componentes/biblioteca/BotonFavorito/BotonFavorito';
import SelectorEstado, { EstadoBibliotecaBD } from '../../componentes/biblioteca/SelectorEstado/SelectorEstado';
import FormularioPuntuacion from '../../componentes/biblioteca/FormularioPuntuacion/FormularioPuntuacion';
import FormularioReseña from '../../componentes/biblioteca/FormularioReseña/FormularioReseña';
import { Loading } from '../../componentes/comunes/Loading/Loading';
import { MensajeError } from '../../componentes/comunes/MensajeError/MensajeError';
import './DetalleCancion.css';

interface CancionDetalle {
  cancion_id: number;
  titulo: string;
  artista: string;
  genero: string;
  fecha_lanzamiento: string;
  imagenUrl?: string;
  colorUI?: string;
  en_biblioteca: boolean;
  estado: EstadoBibliotecaBD;
  es_favorito: boolean;
  puntuacion: number | null;
  resena: string | null;
}

const DetalleCancion: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [cancion, setCancion] = useState<CancionDetalle | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<boolean>(false);

  useEffect(() => {
    cargarDetalleCancion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const cargarDetalleCancion = async () => {
    try {
      setCargando(true);
      setError(null);
      // endpoint GET del detalle completo ( info de tabla canciones y biblioteca/reseñas del usuario)
      const { data } = await api.get<CancionDetalle>(`/api/musica/cancion/${id}`);
      setCancion(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar los detalles de la canción.');
    } finally {
      setCargando(false);
    }
  };

  const handleToggleFavorito = async () => {
    if (!cancion) return;
    try {
      setProcesando(true);
      if (cancion.es_favorito) {
        await api.delete(`/api/biblioteca/${cancion.cancion_id}/favorito`);
      } else {
        await api.post(`/api/biblioteca/${cancion.cancion_id}/favorito`);
      }
      setCancion({ ...cancion, es_favorito: !cancion.es_favorito });
    } catch (err) {
      console.error('Error al actualizar favorito:', err);
    } finally {
      setProcesando(false);
    }
  };

  const handleCambiarEstado = async (nuevoEstado: EstadoBibliotecaBD) => {
    if (!cancion) return;
    try {
      setProcesando(true);
      await api.put(`/api/biblioteca/${cancion.cancion_id}/estado`, { estado: nuevoEstado });
      setCancion({ ...cancion, estado: nuevoEstado, en_biblioteca: true });
    } catch (err) {
      console.error('Error al actualizar estado:', err);
    } finally {
      setProcesando(false);
    }
  };

  const handleGuardarPuntuacion = async (valor: number) => {
    if (!cancion) return;
    try {
      setProcesando(true);
      await api.put(`/api/puntuaciones/${cancion.cancion_id}`, { puntuacion: valor });
      setCancion({ ...cancion, puntuacion: valor });
    } catch (err) {
      console.error('Error al guardar puntuación:', err);
    } finally {
      setProcesando(false);
    }
  };

  const handleGuardarResena = async (texto: string) => {
    if (!cancion) return;
    try {
      setProcesando(true);
      await api.put(`/api/reseñas/${cancion.cancion_id}`, { texto });
      setCancion({ ...cancion, resena: texto });
    } catch (err) {
      console.error('Error al guardar reseña:', err);
    } finally {
      setProcesando(false);
    }
  };

  if (cargando) return <Loading mensaje="Cargando detalles de la canción..." />;
  if (error) return <MensajeError mensaje={error} onReintentar={cargarDetalleCancion} />;
  if (!cancion) return <MensajeError mensaje="No se encontró la canción solicitada." />;

  const inicialCancion = cancion.titulo ? cancion.titulo.charAt(0).toUpperCase() : '?';

  return (
    <div className="detalle-page">
      {/* hero section (o sea lo visual mas importante tipo lo primero q ve el user) */}
      <div className="detalle-hero">
        <div className="hero-cover">
          {cancion.imagenUrl ? (
            <img src={cancion.imagenUrl} alt={cancion.titulo} />
          ) : (
            <div 
              className="hero-cover-placeholder" 
              style={{ backgroundColor: cancion.colorUI || 'var(--gris)' }}
            >
              {inicialCancion}
            </div>
          )}
        </div>
        <div className="hero-info">
          <span className="hero-badge">Sencillo</span>
          <h1 className="hero-titulo">{cancion.titulo}</h1>
          <div className="hero-metadata">
            <span className="hero-artista">{cancion.artista}</span>
            <span className="hero-separador">•</span>
            <span>{cancion.genero}</span>
            <span className="hero-separador">•</span>
            <span>{new Date(cancion.fecha_lanzamiento).getFullYear()}</span>
          </div>
        </div>
      </div>

      {/* controles de interacción */}
      <div className="detalle-controles">
        <button className="btn-play-gigante" disabled={procesando}>
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
        </button>
        
        <div className="controles-biblioteca">
          <BotonFavorito 
            esFavorito={cancion.es_favorito} 
            onToggle={handleToggleFavorito} 
          />
          <SelectorEstado 
            estado={cancion.estado || 'quiero_escuchar'} 
            onChange={handleCambiarEstado} 
          />
        </div>
      </div>

      {/* grid de puntuación y reseñas */}
      <div className="detalle-interaccion-grid">
        <section className="interaccion-card">
          <h3>Tu Puntuación</h3>
          <p className="interaccion-desc">Calificá esta canción para mejorar tus estadísticas.</p>
          <FormularioPuntuacion 
            puntuacionActual={cancion.puntuacion} 
            onSubmit={handleGuardarPuntuacion} 
          />
        </section>

        <section className="interaccion-card">
          <h3>Tu Reseña</h3>
          <p className="interaccion-desc">¿Qué opinás de esta pista? Guardá tus notas acá.</p>
          <FormularioReseña 
            reseñaActual={cancion.resena} 
            onSubmit={handleGuardarResena} 
          />
        </section>
      </div>
    </div>
  );
};

export default DetalleCancion;