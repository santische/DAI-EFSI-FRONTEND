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

const DATOS_INICIALES_DEMO: DatosHome = {
  minutos_escuchados: 18420,
  reproducciones: 3210,
  artistas_escuchados: 42,
  favoritos: [
    {
      id: 1,
      external_id: 101,
      titulo: 'Luz de Ciudad',
      duracion: 214,
      foto: null,
      es_favorita: true,
      artistas: [{ id: 1, external_id: 11, nombre: 'Alma Sol' }]
    },
    {
      id: 2,
      external_id: 102,
      titulo: 'Modo Avión',
      duracion: 198,
      foto: null,
      es_favorita: true,
      artistas: [{ id: 2, external_id: 12, nombre: 'Nube Clara' }]
    },
    {
      id: 3,
      external_id: 103,
      titulo: 'Noche Eléctrica',
      duracion: 245,
      foto: null,
      es_favorita: true,
      artistas: [{ id: 3, external_id: 13, nombre: 'Prisma' }]
    },
    {
      id: 4,
      external_id: 104,
      titulo: 'Todo Vuelve',
      duracion: 189,
      foto: null,
      es_favorita: true,
      artistas: [{ id: 1, external_id: 11, nombre: 'Alma Sol' }]
    }
  ],
  actividad_reciente: [
    {
      id: 1,
      usuario_id: 1,
      tipo: 'escucho',
      cancion_id: 1,
      cancion_titulo: 'Luz de Ciudad',
      fecha: 'hace 10 min'
    },
    {
      id: 2,
      usuario_id: 1,
      tipo: 'marcar_favorito',
      cancion_id: 2,
      cancion_titulo: 'Modo Avión',
      fecha: 'ayer'
    },
    {
      id: 3,
      usuario_id: 1,
      tipo: 'crear_coleccion',
      coleccion_id: 1,
      coleccion_nombre: 'Noches de ciudad',
      fecha: 'hace 2 días'
    }
  ],
  colecciones: [
    { id: 1, usuario_id: 1, nombre: 'Noches de ciudad', cantidad_canciones: 12 },
    { id: 2, usuario_id: 1, nombre: 'Para concentrarme', cantidad_canciones: 8 },
    { id: 3, usuario_id: 1, nombre: 'Volver a escuchar', cantidad_canciones: 15 }
  ]
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
  const [data, setData] = useState<DatosHome | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const cargarInicio = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);

      const estServ: any = estadisticasService;
      const bibServ: any = bibliotecaService;
      const playServ: any = playlistService;

      // Si algún endpoint todavía devuelve 404 porque el back no lo creó, cae al respaldo sin romper la vista
      const [resumen, favoritos, actividad, colecciones] = await Promise.all([
        estServ.obtenerResumen ? estServ.obtenerResumen().catch(() => null) : Promise.resolve(null),
        bibServ.obtenerFavoritos ? bibServ.obtenerFavoritos().catch(() => null) : Promise.resolve(null),
        estServ.obtenerActividadReciente ? estServ.obtenerActividadReciente(5).catch(() => null) : Promise.resolve(null),
        playServ.obtenerPlaylists ? playServ.obtenerPlaylists().catch(() => null) : Promise.resolve(null)
      ]);

      setData({
        minutos_escuchados: resumen?.minutos_escuchados ?? DATOS_INICIALES_DEMO.minutos_escuchados,
        reproducciones: resumen?.reproducciones ?? DATOS_INICIALES_DEMO.reproducciones,
        artistas_escuchados: resumen?.artistas_escuchados ?? DATOS_INICIALES_DEMO.artistas_escuchados,
        favoritos: Array.isArray(favoritos) ? favoritos : DATOS_INICIALES_DEMO.favoritos,
        actividad_reciente: Array.isArray(actividad) ? actividad : DATOS_INICIALES_DEMO.actividad_reciente,
        colecciones: Array.isArray(colecciones) ? colecciones : DATOS_INICIALES_DEMO.colecciones
      });
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al cargar los datos del inicio.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      cargarInicio();
    }
  }, [user, cargarInicio]);

  const handleToggleFavorito = async (cancionId: number) => {
    try {
      const bibServ: any = bibliotecaService;
      if (bibServ.toggleFavorito) {
        await bibServ.toggleFavorito(cancionId).catch(() => null);
      }
      setData((prev) =>
        prev
          ? {
              ...prev,
              favoritos: prev.favoritos.filter((c) => c.id !== cancionId)
            }
          : prev
      );
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
          <span className="banner-tag">TU RESUMEN MUSICAL · 2025</span>
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
          <div className="metrica-icon icon-reloj" aria-hidden="true">🕒</div>
          <div className="metrica-info">
            <span className="metrica-valor">
              {(data?.minutos_escuchados ?? 0).toLocaleString('es-AR')}
            </span>
            <span className="metrica-label">minutos escuchados</span>
          </div>
        </div>

        <div className="metrica-card">
          <div className="metrica-icon icon-nota" aria-hidden="true">🎵</div>
          <div className="metrica-info">
            <span className="metrica-valor">
              {(data?.reproducciones ?? 0).toLocaleString('es-AR')}
            </span>
            <span className="metrica-label">reproducciones</span>
          </div>
        </div>

        <div className="metrica-card">
          <div className="metrica-icon icon-artistas" aria-hidden="true">✳️</div>
          <div className="metrica-info">
            <span className="metrica-valor">{data?.artistas_escuchados ?? 0}</span>
            <span className="metrica-label">artistas escuchados</span>
          </div>
        </div>
      </section>

      {/* Grilla inferior: Tus favoritos + Actividad reciente + Tus colecciones */}
      <section className="home-grid">
        <div className="home-card tus-favoritos">
          <div className="card-header">
            <h3>Tus favoritos</h3>
            <Link to="/biblioteca" className="link-ver-mas">
              Ver biblioteca ↗
            </Link>
          </div>

          <ListaCanciones
            canciones={data?.favoritos || []}
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
              {data?.actividad_reciente && data.actividad_reciente.length > 0 ? (
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

            {data?.colecciones && data.colecciones.length > 0 ? (
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