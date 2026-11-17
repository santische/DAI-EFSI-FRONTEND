import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Library } from 'lucide-react';
import SelectorEstado, { EstadoBibliotecaBD } from '../../componentes/biblioteca/SelectorEstado/SelectorEstado';
import BotonFavorito from '../../componentes/biblioteca/BotonFavorito/BotonFavorito';
import FormularioReseña from '../../componentes/biblioteca/FormularioReseña/FormularioReseña';
import { Loading } from '../../componentes/comunes/Loading/Loading';
import { MensajeError } from '../../componentes/comunes/MensajeError/MensajeError';
import './DetalleCancion.css';

// 1. interfaz adaptada a la estructura relacional de la bd
export interface CancionDetalleData {
  id: number;
  titulo: string;
  duracion: number; // son integer (segundos) desde la BD
  foto: string | null; // columna 'foto' en BD
  fecha_lanzamiento: string; // Corresponde a 'fecha_lanzamiento'
  // el backend debería cruzar estas tablas y devolverlas como arrays
  artistas: { id: number; nombre: string }[]; 
  generos: { id: number; nombre: string }[];
  // datos del usuario cruzados (biblioteca, puntuaciones, reseñas)
  estadoBiblioteca: EstadoBibliotecaBD | null;
  puntuacion: number | null;
  esFavorita: boolean;
  resena: string | null;
}

const DetalleCancion: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [cancion, setCancion] = useState<CancionDetalleData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = 'http://localhost:3000/api'; //capaz da error aca pq alejo esta cambiando algo en su rama del env pero no se

  // esto es la función para convertir los segundos de la BD a formato "MM:SS"
  const formatearDuracion = (segundosTotales: number) => {
    const minutos = Math.floor(segundosTotales / 60);
    const segundos = segundosTotales % 60;
    return `${minutos}:${segundos.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchDetalleCancion = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/canciones/${id}`);
        
        if (!response.ok) {
          throw new Error('Error al obtener los datos de la canción');
        }

        const data: CancionDetalleData = await response.json();
        setCancion(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido de conexión');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetalleCancion();
    }
  }, [id]);

  const handleCambiarEstado = async (nuevoEstado: EstadoBibliotecaBD) => {
    if (!cancion) return;
    const estadoAnterior = cancion.estadoBiblioteca;
    setCancion({ ...cancion, estadoBiblioteca: nuevoEstado });

    try {
      const response = await fetch(`${API_BASE_URL}/biblioteca/${id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (!response.ok) throw new Error('Error al actualizar el estado');
    } catch (err) {
      setCancion({ ...cancion, estadoBiblioteca: estadoAnterior });
      console.error(err);
    }
  };

  const handleToggleFavorito = async () => {
    if (!cancion) return;
    const estadoAnterior = cancion.esFavorita;
    setCancion({ ...cancion, esFavorita: !estadoAnterior });

    try {
      const method = estadoAnterior ? 'DELETE' : 'POST';
      const response = await fetch(`${API_BASE_URL}/favoritos/${id}`, { method });
      if (!response.ok) throw new Error('Error al actualizar favoritos');
    } catch (err) {
      setCancion({ ...cancion, esFavorita: estadoAnterior });
      console.error(err);
    }
  };

  const handlePuntuar = async (valor: number) => {
    if (!cancion) return;
    const puntuacionAnterior = cancion.puntuacion;
    setCancion({ ...cancion, puntuacion: valor });

    try {
      const response = await fetch(`${API_BASE_URL}/biblioteca/${id}/puntuacion`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valor: valor }), // esta asi pq BD usa la columna valor
      });
      if (!response.ok) throw new Error('Error al guardar la puntuación');
    } catch (err) {
      setCancion({ ...cancion, puntuacion: puntuacionAnterior });
      console.error(err);
    }
  };

  const handleGuardarResena = async (texto: string) => {
    if (!cancion) return;
    const resenaAnterior = cancion.resena;
    setCancion({ ...cancion, resena: texto });

    try {
      const response = await fetch(`${API_BASE_URL}/resenas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: texto }), // La BD usa la columna 'texto'
      });
      if (!response.ok) throw new Error('Error al guardar la reseña');
    } catch (err) {
      setCancion({ ...cancion, resena: resenaAnterior });
      console.error(err);
    }
  };

  if (loading) return <Loading mensaje="Cargando detalles de la canción..." />;
  if (error) return <MensajeError mensaje={error} onReintentar={() => window.location.reload()} />;
  if (!cancion) return <MensajeError mensaje="Canción no encontrada." />;

  // formatear datos para la UI
  const nombresArtistas = cancion.artistas?.map(a => a.nombre).join(', ') || 'Artista Desconocido';
  const nombresGeneros = cancion.generos?.map(g => g.nombre).join(', ') || 'Sin género';
  const anioLanzamiento = cancion.fecha_lanzamiento ? new Date(cancion.fecha_lanzamiento).getFullYear() : 'Desconocido';

  return (
    <div className="detalle-cancion-page">
      <header className="header-principal">
        <div className="header-textos">
          <h1>Detalle de canción</h1>
          <p>Consultá metadatos, guardá el tema y registrá tu valoración.</p>
        </div>
        <div className="avatar-usuario">M</div>
      </header>

      <main className="detalle-grid">
        {/* columna izq */}
        <aside className="columna-izq">
          {cancion.foto ? (
             <img src={cancion.foto} alt="Portada" className="portada-imagen" style={{width: '100%', borderRadius: '12px'}} />
          ) : (
            <div className="portada-placeholder">
              <h2>{cancion.titulo}</h2>
              <div className="portada-bottom">
                <span>{nombresArtistas.toUpperCase()}</span>
                <div className="portada-linea"></div>
              </div>
            </div>
          )}

          <div className="card-oscura">
            <h3>Información</h3>
            <div className="info-row">
              <span className="info-label">Artista</span>
              <span className="info-value">{nombresArtistas}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Álbum</span>
              <span className="info-value">Todo empieza</span> {/* O el dato real si lo tenés */}
            </div>
            <div className="info-row">
              <span className="info-label">Género</span>
              <span className="info-value">{nombresGeneros}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Duración</span>
              <span className="info-value">{formatearDuracion(cancion.duracion)} min</span>
            </div>
            <div className="info-row">
              <span className="info-label">Origen</span>
              <span className="info-value">Catálogo musical</span>
            </div>
          </div>
        </aside>

        {/* columna der */}
        <section className="columna-der">
          <div>
            <h2 className="titulo-cancion">{cancion.titulo}</h2>
            <p className="subtitulo-cancion">{nombresArtistas} · Álbum: Todo empieza</p>
            
            <div className="tags-container">
              <span className="tag-pill">{nombresGeneros}</span>
              <span className="tag-pill">{anioLanzamiento}</span>
              <span className="tag-pill">{formatearDuracion(cancion.duracion)} min</span>
            </div>

            <div className="botones-accion">
              <button className="btn-accion btn-purple">
                Guardar en biblioteca
              </button>
              <button className="btn-accion btn-yellow" onClick={handleToggleFavorito}>
                ♥ Favorito
              </button>
            </div>
          </div>

          <div className="card-oscura">
            <span className="estado-label">ESTADO EN TU BIBLIOTECA</span>
            <div className="estado-pills">
              {['quiero_escuchar', 'escuchando', 'escuchado'].map((est) => (
                <button 
                  key={est}
                  className={`estado-pill ${cancion.estadoBiblioteca === est ? 'activo' : ''}`}
                  onClick={() => handleCambiarEstado(est as EstadoBibliotecaBD)}
                >
                  {est.replace('_', ' ').charAt(0).toUpperCase() + est.replace('_', ' ').slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="card-oscura">
            <h3>Tu valoración</h3>
            <div className="valoracion-header">
              <div className="estrellas">
                {[1, 2, 3, 4, 5].map(num => (
                  <span key={num} onClick={() => handlePuntuar(num)} style={{cursor: 'pointer', opacity: num <= (cancion.puntuacion || 0) ? 1 : 0.3}}>
                    ★
                  </span>
                ))}
              </div>
              <span className="valoracion-texto">{cancion.puntuacion || 0} de 5</span>
            </div>
            
            <div className="resena-area">
              <span className="estado-label">RESEÑA</span>
              <textarea 
                className="resena-textarea" 
                placeholder="Escribí tu reseña sobre esta canción..."
                defaultValue={cancion.resena || ''}
                onBlur={(e) => handleGuardarResena(e.target.value)}
              />
              <button className="btn-accion btn-yellow btn-guardar-resena">
                Guardar reseña
              </button>
            </div>
          </div>
          
          <p className="footer-texto">La puntuación y la reseña quedan asociadas a tu cuenta.</p>

          <div className="card-oscura">
            <h3>Descripción</h3>
            <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5'}}>
              Una canción de {nombresGeneros} que combina melodías suaves con una base electrónica. La descripción y los metadatos se obtienen del catálogo musical.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DetalleCancion;