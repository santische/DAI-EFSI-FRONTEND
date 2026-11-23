import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext/UserContext';
import Loading from '../../componentes/comunes/Loading/Loading';
import MensajeError from '../../componentes/comunes/MensajeError/MensajeError';
import Modal from '../../componentes/comunes/Modal/Modal';
import * as musicaService from '../../services/musicaService';
import * as bibliotecaService from '../../services/bibliotecaService';
import * as estadisticasService from '../../services/estadisticasService';
import * as playlistService from '../../services/playlistService';
import './DetalleCancion.css';

type EstadoEscucha = 'quiero_escuchar' | 'escuchando' | 'escuchado';

interface ArtistaDetalle {
  id?: number;
  nombre: string;
}

interface CancionDetalle {
  id: number;
  titulo: string;
  duracion: number;
  foto?: string | null;
  descripcion?: string | null;
  album?: string | { id?: number; titulo?: string } | null;
  artistas: ArtistaDetalle[];
  generos: string[];
  promedioPuntuacion?: number | null;
}

interface ResenaItem {
  id: number;
  usuario_id?: number;
  texto: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  autor: string;
  username?: string;
}

const ESTADOS_OPCIONES: { valor: EstadoEscucha; etiqueta: string }[] = [
  { valor: 'quiero_escuchar', etiqueta: 'Quiero escuchar' },
  { valor: 'escuchando', etiqueta: 'Escuchando' },
  { valor: 'escuchado', etiqueta: 'Escuchado' },
];

const formatearDuracion = (segundos?: number | null): string => {
  const total = Number(segundos) || 0;
  if (total <= 0) return '0:00';
  const min = Math.floor(total / 60);
  const seg = total % 60;
  return `${min}:${seg < 10 ? '0' : ''}${seg}`;
};

const formatearFecha = (fechaIso?: string): string => {
  if (!fechaIso) return '';
  const fecha = new Date(fechaIso);
  if (Number.isNaN(fecha.getTime())) return '';
  return fecha.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const resolverAutorResena = (
  r: any,
  usuarioActual: { id?: number; nombre?: string; username?: string } | null,
  resenaPropiaId?: number | null
): string => {
  const nombreDirecto =
    r.nombre ||
    r.username ||
    r.autor ||
    r.usuario_nombre ||
    r.usuario_username ||
    (typeof r.usuario === 'string' ? r.usuario : null) ||
    r.usuario?.nombre ||
    r.usuario?.username ||
    r.perfil?.nombre;

  if (nombreDirecto) return nombreDirecto;

  const autorId = r.usuario_id ?? r.usuario?.id;
  const esMiaPorUsuario =
    usuarioActual &&
    autorId !== undefined &&
    Number(autorId) === Number(usuarioActual.id);
  const esMiaPorId =
    usuarioActual &&
    resenaPropiaId !== undefined &&
    resenaPropiaId !== null &&
    Number(r.id) === Number(resenaPropiaId);

  if (esMiaPorUsuario || esMiaPorId) {
    return usuarioActual.nombre || usuarioActual.username || 'Usuario';
  }

  return 'Usuario';
};

const DetalleCancion: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();

  const [cancion, setCancion] = useState<CancionDetalle | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estado en biblioteca del usuario
  const [enBiblioteca, setEnBiblioteca] = useState<boolean>(false);
  const [estadoBiblioteca, setEstadoBiblioteca] = useState<EstadoEscucha>('quiero_escuchar');
  const [esFavorita, setEsFavorita] = useState<boolean>(false);
  const [guardandoBiblioteca, setGuardandoBiblioteca] = useState<boolean>(false);

  // Reproducciones (Estadísticas)
  const [registrandoPlay, setRegistrandoPlay] = useState<boolean>(false);
  const [reproduccionesSesion, setReproduccionesSesion] = useState<number>(0);

  // Puntuación
  const [puntuacionSeleccionada, setPuntuacionSeleccionada] = useState<number>(0);
  const [puntuacionHover, setPuntuacionHover] = useState<number>(0);
  const [puntuacionId, setPuntuacionId] = useState<number | null>(null);
  const [guardandoPuntuacion, setGuardandoPuntuacion] = useState<boolean>(false);

  // Reseñas
  const [textoResena, setTextoResena] = useState<string>('');
  const [resenaId, setResenaId] = useState<number | null>(null);
  const [resenas, setResenas] = useState<ResenaItem[]>([]);
  const [guardandoResena, setGuardandoResena] = useState<boolean>(false);

  // Modal Agregar a colección
  const [modalPlaylistAbierto, setModalPlaylistAbierto] = useState<boolean>(false);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [cargandoPlaylists, setCargandoPlaylists] = useState<boolean>(false);
  const [agregandoPlaylistId, setAgregandoPlaylistId] = useState<number | null>(null);

  // Feedback visual
  const [toast, setToast] = useState<string | null>(null);

  const mostrarToast = (mensaje: string) => {
    setToast(mensaje);
    setTimeout(() => {
      setToast((actual) => (actual === mensaje ? null : actual));
    }, 3200);
  };

  const cargarDetalle = useCallback(async () => {
    if (!id) return;
    const cancionIdNum = Number(id);

    try {
      setCargando(true);
      setError(null);

      // 1. Detalle de la canción (GET /api/musica/:id)
      const resMusica = await musicaService.obtenerCancionPorId(cancionIdNum);
      const info = resMusica?.cancion ?? resMusica;

      const artistasNormalizados: ArtistaDetalle[] = Array.isArray(info?.artistas)
        ? info.artistas.map((a: any) =>
            typeof a === 'string' ? { nombre: a } : { id: a.id, nombre: a.nombre ?? 'Artista' }
          )
        : info?.artista
        ? [{ nombre: info.artista }]
        : [];

      const generosNormalizados: string[] = Array.isArray(info?.generos)
        ? info.generos.map((g: any) => (typeof g === 'string' ? g : g?.nombre)).filter(Boolean)
        : [];

      setCancion({
        id: Number(info?.id ?? cancionIdNum),
        titulo: info?.titulo ?? 'Sin título',
        duracion: Number(info?.duracion) || 0,
        foto: info?.foto ?? null,
        descripcion: info?.descripcion ?? null,
        album: info?.album ?? null,
        artistas: artistasNormalizados,
        generos: generosNormalizados,
        promedioPuntuacion: info?.promedio_puntuacion ?? info?.promedioPuntuacion ?? null,
      });

      // 2. Estado en biblioteca, puntuaciones y reseñas en paralelo
      const [resBib, resPunt, resRes] = await Promise.allSettled([
        bibliotecaService.obtenerBiblioteca(),
        musicaService.obtenerPuntuaciones(cancionIdNum),
        musicaService.obtenerResenas(cancionIdNum),
      ]);

      // Biblioteca
      if (resBib.status === 'fulfilled') {
        const rawBib = resBib.value;
        const itemsBib = Array.isArray(rawBib)
          ? rawBib
          : rawBib?.items ?? rawBib?.biblioteca ?? [];
        const itemEncontrado = itemsBib.find(
          (item: any) => Number(item.cancion_id ?? item.id) === cancionIdNum
        );

        if (itemEncontrado) {
          setEnBiblioteca(true);
          setEstadoBiblioteca(
            (itemEncontrado.estado as EstadoEscucha) || 'quiero_escuchar'
          );
          setEsFavorita(Boolean(itemEncontrado.es_favorita));
          if (itemEncontrado.puntuacion) {
            setPuntuacionSeleccionada(Number(itemEncontrado.puntuacion));
          }
        } else {
          setEnBiblioteca(Boolean(info?.enBiblioteca));
          setEstadoBiblioteca((info?.estado as EstadoEscucha) || 'quiero_escuchar');
          setEsFavorita(Boolean(info?.es_favorita));
        }
      }

      // Puntuaciones
      if (resPunt.status === 'fulfilled') {
        const rawPunt = resPunt.value;
        const listaPunt = Array.isArray(rawPunt)
          ? rawPunt
          : rawPunt?.puntuaciones ?? rawPunt?.items ?? [];

        const mia = user
          ? listaPunt.find((p: any) =>
              p.usuario_id !== undefined
                ? Number(p.usuario_id) === Number(user.id)
                : true
            )
          : listaPunt[0];

        if (mia) {
          setPuntuacionSeleccionada(Number(mia.valor) || 0);
          setPuntuacionId(mia.id ? Number(mia.id) : null);
        }
      }

      // Reseñas
      if (resRes.status === 'fulfilled') {
        const rawRes = resRes.value;
        const listaRes = Array.isArray(rawRes)
          ? rawRes
          : rawRes?.resenas ?? rawRes?.reseñas ?? rawRes?.items ?? [];

        const resenasMapeadas: ResenaItem[] = listaRes.map((r: any) => ({
          id: Number(r.id),
          usuario_id: r.usuario_id ? Number(r.usuario_id) : undefined,
          texto: r.texto ?? '',
          fecha_creacion: r.fecha_creacion,
          fecha_actualizacion: r.fecha_actualizacion,
          autor: resolverAutorResena(r, user),
          username: r.username || r.usuario?.username,
        }));

        setResenas(resenasMapeadas);

        if (user) {
          const miResena = resenasMapeadas.find(
            (r) => r.usuario_id !== undefined && Number(r.usuario_id) === Number(user.id)
          );
          if (miResena) {
            setTextoResena(miResena.texto);
            setResenaId(miResena.id);
          }
        }
      }
    } catch (err: any) {
      setError(
        err.response?.data?.mensaje ||
          err.message ||
          'No se pudo cargar el detalle de la canción.'
      );
    } finally {
      setCargando(false);
    }
  }, [id, user]);

  useEffect(() => {
    cargarDetalle();
  }, [cargarDetalle]);

  // Registrar escucha (POST /api/musica/:id/reproducciones) -> suma en Estadísticas
  const handleRegistrarReproduccion = async () => {
    if (!cancion || registrandoPlay) return;
    try {
      setRegistrandoPlay(true);
      await estadisticasService.registrarReproduccion(cancion.id, {
        segundos_escuchados: cancion.duracion > 0 ? cancion.duracion : 180,
        completada: true,
        fuente: 'detalle',
      });
      setReproduccionesSesion((prev) => prev + 1);
      mostrarToast('Reproducción registrada. Ya impacta en tus Estadísticas.');
    } catch (err: any) {
      mostrarToast(
        err.response?.data?.mensaje || 'No se pudo registrar la reproducción.'
      );
    } finally {
      setRegistrandoPlay(false);
    }
  };

  // Cambiar estado o agregar a biblioteca
  const handleCambiarEstado = async (nuevoEstado: EstadoEscucha) => {
    if (!cancion || guardandoBiblioteca) return;
    try {
      setGuardandoBiblioteca(true);
      if (!enBiblioteca) {
        await bibliotecaService.agregarABiblioteca({
          cancionId: cancion.id,
          estado: nuevoEstado,
        });
        setEnBiblioteca(true);
        setEstadoBiblioteca(nuevoEstado);
        mostrarToast('Canción guardada en tu biblioteca.');
      } else {
        await bibliotecaService.cambiarEstado(cancion.id, nuevoEstado);
        setEstadoBiblioteca(nuevoEstado);
        mostrarToast('Estado actualizado.');
      }
    } catch (err: any) {
      mostrarToast(
        err.response?.data?.mensaje || 'Error al actualizar estado en biblioteca.'
      );
    } finally {
      setGuardandoBiblioteca(false);
    }
  };

  // Alternar favorito
  const handleToggleFavorito = async () => {
    if (!cancion || guardandoBiblioteca) return;
    const nuevoValor = !esFavorita;

    try {
      setGuardandoBiblioteca(true);
      if (!enBiblioteca) {
        await bibliotecaService.agregarABiblioteca({
          cancionId: cancion.id,
          estado: estadoBiblioteca,
          es_favorita: true,
        });
        setEnBiblioteca(true);
        setEsFavorita(true);
        mostrarToast('Agregada a tus favoritos.');
      } else {
        await bibliotecaService.toggleFavorito(cancion.id, nuevoValor);
        setEsFavorita(nuevoValor);
        mostrarToast(
          nuevoValor ? 'Agregada a tus favoritos.' : 'Quitada de tus favoritos.'
        );
      }
    } catch (err: any) {
      mostrarToast(
        err.response?.data?.mensaje || 'No se pudo actualizar favorito.'
      );
    } finally {
      setGuardandoBiblioteca(false);
    }
  };

  // Quitar de biblioteca
  const handleQuitarDeBiblioteca = async () => {
    if (!cancion || !enBiblioteca || guardandoBiblioteca) return;
    try {
      setGuardandoBiblioteca(true);
      await bibliotecaService.eliminarDeBiblioteca(cancion.id);
      setEnBiblioteca(false);
      setEsFavorita(false);
      setEstadoBiblioteca('quiero_escuchar');
      mostrarToast('Canción eliminada de tu biblioteca.');
    } catch (err: any) {
      mostrarToast(
        err.response?.data?.mensaje || 'No se pudo quitar de la biblioteca.'
      );
    } finally {
      setGuardandoBiblioteca(false);
    }
  };

  // Guardar puntuación (POST /api/puntuaciones o PUT /api/puntuaciones/:id)
  const handleGuardarPuntuacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancion || puntuacionSeleccionada < 1 || guardandoPuntuacion) return;

    try {
      setGuardandoPuntuacion(true);
      let res;
      if (puntuacionId) {
        res = await musicaService.actualizarPuntuacion(
          puntuacionId,
          puntuacionSeleccionada
        );
      } else {
        try {
          res = await musicaService.puntuarCancion(
            cancion.id,
            puntuacionSeleccionada
          );
        } catch (errPost: any) {
          const idExistente = errPost.response?.data?.puntuacion?.id;
          if (idExistente) {
            res = await musicaService.actualizarPuntuacion(
              idExistente,
              puntuacionSeleccionada
            );
          } else {
            throw errPost;
          }
        }
      }

      const guardada = res?.puntuacion ?? res;
      if (guardada?.id) setPuntuacionId(Number(guardada.id));
      mostrarToast(`Puntuación guardada (${puntuacionSeleccionada}/5).`);
    } catch (err: any) {
      mostrarToast(
        err.response?.data?.mensaje || 'No se pudo guardar la puntuación.'
      );
    } finally {
      setGuardandoPuntuacion(false);
    }
  };

  // Guardar reseña (POST /api/resenas o PUT /api/resenas/:id)
  const handleGuardarResena = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancion || !textoResena.trim() || guardandoResena) return;

    try {
      setGuardandoResena(true);
      let res;
      if (resenaId) {
        res = await musicaService.actualizarResena(resenaId, textoResena.trim());
      } else {
        try {
          res = await musicaService.guardarResena(cancion.id, textoResena.trim());
        } catch (errPost: any) {
          const idExistente = errPost.response?.data?.resena?.id;
          if (idExistente) {
            res = await musicaService.actualizarResena(
              idExistente,
              textoResena.trim()
            );
          } else {
            throw errPost;
          }
        }
      }

      const guardada = res?.resena ?? res;
      const idActualizado = guardada?.id ? Number(guardada.id) : resenaId;
      if (idActualizado) setResenaId(idActualizado);

      // Actualizar listado de reseñas en pantalla
      const resLista = await musicaService.obtenerResenas(cancion.id);
      const lista = Array.isArray(resLista)
        ? resLista
        : resLista?.resenas ?? resLista?.reseñas ?? resLista?.items ?? [];

      setResenas(
        lista.map((r: any) => ({
          id: Number(r.id),
          usuario_id: r.usuario_id ? Number(r.usuario_id) : undefined,
          texto: r.texto ?? '',
          fecha_creacion: r.fecha_creacion,
          fecha_actualizacion: r.fecha_actualizacion,
          autor: resolverAutorResena(r, user, idActualizado),
          username: r.username || r.usuario?.username,
        }))
      );

      mostrarToast('Reseña guardada correctamente.');
    } catch (err: any) {
      mostrarToast(
        err.response?.data?.mensaje || 'No se pudo guardar la reseña.'
      );
    } finally {
      setGuardandoResena(false);
    }
  };

  // Abrir modal de colecciones
  const handleAbrirModalPlaylists = async () => {
    setModalPlaylistAbierto(true);
    try {
      setCargandoPlaylists(true);
      const res: any = await playlistService.obtenerPlaylists();
      const lista = Array.isArray(res)
        ? res
        : res?.colecciones ?? res?.playlists ?? res?.items ?? [];
      setPlaylists(lista);
    } catch {
      setPlaylists([]);
    } finally {
      setCargandoPlaylists(false);
    }
  };

  const handleAgregarAColeccion = async (coleccionId: number) => {
    if (!cancion || agregandoPlaylistId) return;
    try {
      setAgregandoPlaylistId(coleccionId);
      await playlistService.agregarCancionAPlaylist(coleccionId, cancion.id);
      setModalPlaylistAbierto(false);
      mostrarToast('Canción agregada a la colección.');
    } catch (err: any) {
      mostrarToast(
        err.response?.data?.mensaje || 'La canción ya estaba en esa colección.'
      );
    } finally {
      setAgregandoPlaylistId(null);
    }
  };

  if (cargando) return <Loading mensaje="Cargando detalles de la canción..." />;
  if (error || !cancion) {
    return (
      <div className="detalle-cancion-page">
        <MensajeError
          mensaje={error || 'No se encontró la canción solicitada.'}
          onReintentar={cargarDetalle}
        />
      </div>
    );
  }

  const nombresArtistas =
    cancion.artistas.length > 0
      ? cancion.artistas.map((a) => a.nombre).join(', ')
      : 'Artista desconocido';

  const nombreAlbum =
    typeof cancion.album === 'string'
      ? cancion.album
      : cancion.album?.titulo || null;

  const estrellaActiva = puntuacionHover || puntuacionSeleccionada;

  return (
    <div className="detalle-cancion-page">
      <button
        type="button"
        className="detalle-cancion-volver"
        onClick={() => navigate(-1)}
      >
        ← Volver
      </button>

      {toast && <div className="detalle-cancion-toast">{toast}</div>}

      {/* Cabecera principal */}
      <section className="detalle-cancion-hero">
        <div className="detalle-cancion-portada">
          {cancion.foto ? (
            <img src={cancion.foto} alt={cancion.titulo} />
          ) : (
            <div className="detalle-cancion-placeholder">
              <span>{cancion.titulo.charAt(0).toUpperCase()}</span>
            </div>
          )}
        </div>

        <div className="detalle-cancion-info">
          <span className="detalle-cancion-tag">
            {nombreAlbum ? `ÁLBUM · ${nombreAlbum.toUpperCase()}` : 'SENCILLO'}
          </span>

          <h1>{cancion.titulo}</h1>
          <p className="detalle-cancion-artista">{nombresArtistas}</p>

          <div className="detalle-cancion-meta">
            <span>Duración: {formatearDuracion(cancion.duracion)}</span>
            {cancion.promedioPuntuacion !== null &&
              cancion.promedioPuntuacion !== undefined && (
                <span>
                  · Promedio: ★ {Number(cancion.promedioPuntuacion).toFixed(1)}
                </span>
              )}
            {reproduccionesSesion > 0 && (
              <span className="detalle-cancion-plays-badge">
                · {reproduccionesSesion}{' '}
                {reproduccionesSesion === 1 ? 'escucha registrada' : 'escuchas registradas'}
              </span>
            )}
          </div>

          {cancion.generos.length > 0 && (
            <div className="detalle-cancion-generos">
              {cancion.generos.map((genero) => (
                <span key={genero} className="detalle-genero-pill">
                  {genero}
                </span>
              ))}
            </div>
          )}

          {/* Barra de acciones */}
          <div className="detalle-cancion-acciones">
            <button
              type="button"
              className="btn-dc-play"
              onClick={handleRegistrarReproduccion}
              disabled={registrandoPlay}
              title="Registrar escucha para tus Estadísticas"
            >
              {registrandoPlay ? 'Registrando...' : '▶ Escuchar / Registrar'}
            </button>

            <button
              type="button"
              className={`btn-dc-fav ${esFavorita ? 'activo' : ''}`}
              onClick={handleToggleFavorito}
              disabled={guardandoBiblioteca}
              aria-label={esFavorita ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              title={esFavorita ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              {esFavorita ? '♥' : '♡'}
            </button>

            <select
              className="select-dc-estado"
              value={enBiblioteca ? estadoBiblioteca : ''}
              onChange={(e) => {
                if (e.target.value) {
                  handleCambiarEstado(e.target.value as EstadoEscucha);
                }
              }}
              disabled={guardandoBiblioteca}
            >
              {!enBiblioteca && <option value="">+ Guardar en biblioteca</option>}
              {ESTADOS_OPCIONES.map((op) => (
                <option key={op.valor} value={op.valor}>
                  {op.etiqueta}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="btn-dc-secundario"
              onClick={handleAbrirModalPlaylists}
            >
              + Colección
            </button>

            {enBiblioteca && (
              <button
                type="button"
                className="btn-dc-quitar"
                onClick={handleQuitarDeBiblioteca}
                disabled={guardandoBiblioteca}
                title="Quitar de mi biblioteca"
              >
                Quitar
              </button>
            )}
          </div>
        </div>
      </section>

      {cancion.descripcion && (
        <section className="detalle-cancion-card detalle-cancion-bio">
          <h3>Sobre esta canción</h3>
          <p>{cancion.descripcion}</p>
        </section>
      )}

      {/* Grilla de Puntuación y Reseña */}
      <div className="detalle-cancion-grid">
        <section className="detalle-cancion-card">
          <h3>Tu Puntuación</h3>
          <p className="detalle-card-sub">
            Calificá esta canción del 1 al 5 para tu historial personal.
          </p>

          <form onSubmit={handleGuardarPuntuacion} className="detalle-puntuacion-form">
            <div className="detalle-estrellas" role="radiogroup" aria-label="Puntuación">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  className={`btn-estrella ${num <= estrellaActiva ? 'activa' : ''}`}
                  onMouseEnter={() => setPuntuacionHover(num)}
                  onMouseLeave={() => setPuntuacionHover(0)}
                  onClick={() => setPuntuacionSeleccionada(num)}
                  aria-label={`${num} estrellas`}
                >
                  ★
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="btn-dc-primario"
              disabled={puntuacionSeleccionada < 1 || guardandoPuntuacion}
            >
              {guardandoPuntuacion ? 'Guardando...' : 'Guardar Puntuación'}
            </button>
          </form>
        </section>

        <section className="detalle-cancion-card">
          <h3>Tu Reseña</h3>
          <p className="detalle-card-sub">
            Escribí tus notas o impresiones sobre este tema.
          </p>

          <form onSubmit={handleGuardarResena} className="detalle-resena-form">
            <textarea
              rows={4}
              value={textoResena}
              onChange={(e) => setTextoResena(e.target.value)}
              placeholder="¿Qué te transmite esta canción?"
              maxLength={1000}
            />

            <button
              type="submit"
              className="btn-dc-primario"
              disabled={!textoResena.trim() || guardandoResena}
            >
              {guardandoResena ? 'Guardando...' : 'Guardar Reseña'}
            </button>
          </form>
        </section>
      </div>

      {/* Listado de reseñas */}
      <section className="detalle-cancion-card">
        <h3>Reseñas ({resenas.length})</h3>
        {resenas.length === 0 ? (
          <p className="detalle-vacio">
            Todavía no hay reseñas para esta canción. ¡Sé el primero en dejar la tuya!
          </p>
        ) : (
          <div className="detalle-resenas-lista">
            {resenas.map((resena) => (
              <article key={resena.id} className="detalle-resena-item">
                <div className="detalle-resena-header">
                  <div className="detalle-resena-avatar">
                    {resena.autor.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <strong>{resena.autor}</strong>
                    {resena.fecha_creacion && (
                      <span> · {formatearFecha(resena.fecha_creacion)}</span>
                    )}
                  </div>
                </div>
                <p className="detalle-resena-texto">{resena.texto}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Modal para agregar a una colección */}
      <Modal
        isOpen={modalPlaylistAbierto}
        onClose={() => setModalPlaylistAbierto(false)}
        titulo="Agregar a una colección"
      >
        {cargandoPlaylists ? (
          <Loading mini />
        ) : playlists.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <p style={{ color: 'var(--texto-secundario, #9ca3af)', marginBottom: '12px' }}>
              Todavía no creaste ninguna colección.
            </p>
            <Link to="/playlists" className="btn-dc-primario" style={{ textDecoration: 'none' }}>
              Ir a Colecciones
            </Link>
          </div>
        ) : (
          <div className="detalle-playlists-modal">
            {playlists.map((pl: any) => (
              <button
                key={pl.id}
                type="button"
                className="detalle-playlist-opcion"
                disabled={agregandoPlaylistId === pl.id}
                onClick={() => handleAgregarAColeccion(pl.id)}
              >
                <span>{pl.nombre}</span>
                <span className="detalle-playlist-accion">
                  {agregandoPlaylistId === pl.id ? 'Agregando...' : '+ Agregar'}
                </span>
              </button>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DetalleCancion;