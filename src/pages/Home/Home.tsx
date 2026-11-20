import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

// Componentes reutilizables
import Loading from '../../componentes/comunes/Loading/Loading';
import MensajeError from '../../componentes/comunes/MensajeError/MensajeError';
import ListaCanciones from '../../componentes/musica/ListaCanciones/ListaCanciones';
import PlaylistCard from '../../componentes/playlists/PlaylistCard/PlaylistCard';

// Contexto, servicios e interfaces de la BD
import { useUser } from '../../context/UserContext/UserContext';
import { Actividad, DatosHome } from '../../interfaces/interfaz';
import * as estadisticasService from '../../services/estadisticasService';
import * as bibliotecaService from '../../services/bibliotecaService';
import * as playlistService from '../../services/playlistService';

import './Home.css';

const ESTADO_INICIAL_HOME: DatosHome = {
  minutos_escuchados: 0,
  reproducciones: 0,
  artistas_escuchados: 0,
  favoritos: [],
  actividad_reciente: [],
  colecciones: []
};

const formatearActividad = (act: Actividad) => {
  const nombreCancion = act.cancion_titulo || act.detalles?.titulo || '';
  const nombreColeccion = act.coleccion_nombre || act.detalles?.nombre || '';

  switch (act.tipo) {
    case 'escucho':
    case 'reproduccion':
      return {
        titulo: 'Escuchaste',
        subtitulo: nombreCancion,
        claseDot: 'dot-escucho'
      };
    case 'marcar_favorito':
      return {
        titulo: 'Agregaste a favoritos',
        subtitulo: nombreCancion,
        claseDot: 'dot-favorito'
      };
    case 'quitar_favorito':
      return {
        titulo: 'Quitaste de favoritos',
        subtitulo: nombreCancion,
        claseDot: 'dot-favorito'
      };
    case 'crear_coleccion':
      return {
        titulo: 'Creaste una colección',
        subtitulo: nombreColeccion,
        claseDot: 'dot-coleccion'
      };
    case 'agregar_a_coleccion':
      return {
        titulo: `Agregaste a ${nombreColeccion || 'una colección'}`,
        subtitulo: nombreCancion,
        claseDot: 'dot-coleccion'
      };
    case 'puntuar':
      return {
        titulo: `Puntuaste con ${act.detalles?.valor ?? ''}★`,
        subtitulo: nombreCancion,
        claseDot: 'dot-escucho'
      };
    case 'crear_resena':
    case 'editar_resena':
      return {
        titulo: 'Reseñaste una canción',
        subtitulo: nombreCancion,
        claseDot: 'dot-escucho'
      };
    default:
      return {
        titulo: 'Agregaste a tu biblioteca',
        subtitulo: nombreCancion,
        claseDot: 'dot-escucho'
      };
  }
};

const Home: React.FC = () => {
  const { user } = useUser();
  const [data, setData] = useState<DatosHome>(ESTADO_INICIAL_HOME);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const anioActual = new Date().getFullYear();

  const cargarInicio = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);

      const [resumen, favoritos, actividad, colecciones] = await Promise.all([
        estadisticasService.obtenerResumen(anioActual).catch(() => null),
        bibliotecaService.obtenerFavoritos().catch(() => []),
        estadisticasService.obtenerActividadReciente(5).catch(() => []),
        playlistService.obtenerPlaylists().catch(() => [])
      ]);

      setData({
        minutos_escuchados: resumen?.minutos_escuchados ?? 0,
        reproducciones: resumen?.reproducciones ?? 0,
        artistas_escuchados: resumen?.artistas_escuchados ?? 0,
        favoritos: Array.isArray(favoritos) ? favoritos : favoritos?.favoritos ?? [],
        actividad_reciente: Array.isArray(actividad) ? actividad : actividad?.actividad ?? [],
        colecciones: Array.isArray(colecciones) ? colecciones : colecciones?.colecciones ?? []
      });
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al cargar los datos del inicio.');
    } finally {
      setCargando(false);
    }
  }, [anioActual]);

  useEffect(() => {
    if (user) {
      cargarInicio();
    }
  }, [user, cargarInicio]);

  const handleToggleFavorito = async (cancionId: number) => {
    try {
      await bibliotecaService.toggleFavorito(cancionId);
      setData((prev) => ({
        ...prev,
        favoritos: prev.favoritos.filter((c) => c.id !== cancionId)
      }));
    } catch (err) {
      console.error('Error al actualizar favorito:', err);
    }
  };

  if (cargando) return <Loading mensaje="Cargando tu resumen musical..." />;
  if (error) return <MensajeError mensaje={error} onReintentar={cargarInicio} />;

  return (
    <div className="home-container">
      {/* Encabezado */}
      <header className="home-header">
        <div className="home-header-texto">
          <h1>Inicio</h1>
          <p>Tu biblioteca, tus favoritos y un resumen de tu actividad musical.</p>
        </div>
      </header>

      {/* Banner principal */}
      <section className="home-banner">
        <div className="banner-contenido">
          <span className="banner-tag">TU RESUMEN MUSICAL · {anioActual}</span>
          <h2>Tu año sonó así.</h2>
          <p>Un recorrido por artistas, canciones y géneros que te acompañaron.</p>
          <Link to="/estadisticas" className="btn-estadisticas">
            Ver estadísticas ↗
          </Link>
        </div>
      </section>

      {/* Tarjetas de métricas */}
      <section className="home-metricas">
        <div className="metrica-card">
          <div className="metrica-icon" aria-hidden="true">🕒</div>
          <div className="metrica-info">
            <span className="metrica-valor">
              {data.minutos_escuchados.toLocaleString('es-AR')}
            </span>
            <span className="metrica-label">minutos escuchados</span>
          </div>
        </div>

        <div className="metrica-card">
          <div className="metrica-icon" aria-hidden="true">🎵</div>
          <div className="metrica-info">
            <span className="metrica-valor">
              {data.reproducciones.toLocaleString('es-AR')}
            </span>
            <span className="metrica-label">reproducciones</span>
          </div>
        </div>

        <div className="metrica-card">
          <div className="metrica-icon" aria-hidden="true">✳️</div>
          <div className="metrica-info">
            <span className="metrica-valor">{data.artistas_escuchados}</span>
            <span className="metrica-label">artistas escuchados</span>
          </div>
        </div>
      </section>

      {/* Grilla inferior */}
      <section className="home-grid">
        <div className="home-card tus-favoritos">
          <div className="card-header">
            <h3>Tus favoritos</h3>
            <Link to="/biblioteca" className="link-ver-mas">
              Ver biblioteca ↗
            </Link>
          </div>

          <ListaCanciones
            canciones={data.favoritos}
            onToggleFavorito={handleToggleFavorito}
            compacta
            mensajeVacio="No tenés canciones en favoritos aún."
          />
        </div>

        <div className="home-columna-derecha">
          <div className="home-card actividad-reciente">
            <div className="card-header">
              <h3>Actividad reciente</h3>
            </div>

            <div className="actividad-lista">
              {data.actividad_reciente.length > 0 ? (
                data.actividad_reciente.map((act) => {
                  const info = formatearActividad(act);
                  return (
                    <div key={act.id} className="actividad-item">
                      <span className={`actividad-dot ${info.claseDot}`}>●</span>
                      <div className="actividad-info">
                        <p className="actividad-texto">
                          <strong>{info.titulo}</strong>
                        </p>
                        <p className="actividad-subtexto">{info.subtitulo}</p>
                      </div>
                      <span className="actividad-tiempo">{act.fecha}</span>
                    </div>
                  );
                })
              ) : (
                <p className="sin-datos">Sin actividad reciente registrada.</p>
              )}
            </div>
          </div>

          <div className="home-card tus-colecciones">
            <div className="card-header">
              <h3>Tus colecciones</h3>
              <Link to="/playlists" className="link-ver-mas">
                Ver todas ↗
              </Link>
            </div>

            {data.colecciones.length > 0 ? (
              <div className="colecciones-grid">
                {data.colecciones.map((col, idx) => (
                  <PlaylistCard
                    key={col.id}
                    playlist={col}
                    varianteColor={(idx % 3) + 1}
                    compacta
                  />
                ))}
              </div>
            ) : (
              <p className="sin-datos">No tenés colecciones creadas.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;