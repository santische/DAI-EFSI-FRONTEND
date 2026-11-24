import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Loading from '../../componentes/comunes/Loading/Loading';
import MensajeError from '../../componentes/comunes/MensajeError/MensajeError';
import Modal from '../../componentes/comunes/Modal/Modal';
import {
  obtenerPlaylistPorId,
  actualizarPlaylist,
  eliminarPlaylist,
  agregarCancionAPlaylist,
  quitarCancionDePlaylist,
} from '../../services/playlistService';
import { buscarMusica } from '../../services/musicaService';
import './DetallePlaylist.css';

interface CancionDetalle {
  id: number;
  titulo: string;
  artista: string;
  foto?: string | null;
  duracion: number;
}

interface ColeccionDetalle {
  id: number;
  nombre: string;
  descripcion?: string | null;
  canciones: CancionDetalle[];
}

interface ResultadoBusqueda {
  clave: string;
  id?: number;
  mbid?: string;
  titulo: string;
  artista: string;
  foto?: string | null;
}

const normalizarTexto = (texto: string): string => texto.trim().toLowerCase();

const formatearDuracion = (segundos: number): string => {
  if (!segundos || segundos <= 0) return '--:--';
  const min = Math.floor(segundos / 60);
  const seg = segundos % 60;
  return `${min}:${seg < 10 ? '0' : ''}${seg}`;
};

const normalizarCancionLista = (item: any): CancionDetalle => {
  const c = item.cancion ?? item;
  const artistaStr =
    c.artista ??
    (Array.isArray(c.artistas) && c.artistas.length > 0
      ? c.artistas.map((a: any) => a.nombre ?? a).join(', ')
      : 'Artista desconocido');

  return {
    id: Number(c.id ?? item.cancion_id),
    titulo: c.titulo ?? 'Sin título',
    artista: artistaStr,
    foto: c.foto ?? null,
    duracion: Number(c.duracion) || 0,
  };
};

const DetallePlaylist: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [coleccion, setColeccion] = useState<ColeccionDetalle | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  // Modal editar colección
  const [modalEditarAbierto, setModalEditarAbierto] = useState<boolean>(false);
  const [nombreEdit, setNombreEdit] = useState<string>('');
  const [descripcionEdit, setDescripcionEdit] = useState<string>('');
  const [guardandoEdit, setGuardandoEdit] = useState<boolean>(false);

  // Modal agregar canciones
  const [modalAgregarAbierto, setModalAgregarAbierto] = useState<boolean>(false);
  const [terminoBusqueda, setTerminoBusqueda] = useState<string>('');
  const [resultados, setResultados] = useState<ResultadoBusqueda[]>([]);
  const [buscandoMusica, setBuscandoMusica] = useState<boolean>(false);
  const [agregandoClave, setAgregandoClave] = useState<string | null>(null);
  const [clavesAgregadas, setClavesAgregadas] = useState<string[]>([]);
  const [avisoModal, setAvisoModal] = useState<string | null>(null);

  const mostrarAviso = (texto: string) => {
    setAviso(texto);
    setTimeout(() => setAviso(null), 3000);
  };

  const mostrarAvisoModal = (texto: string) => {
    setAvisoModal(texto);
    setTimeout(() => setAvisoModal(null), 3000);
  };

  const cargarDetalle = useCallback(
    async (silencioso = false) => {
      if (!id) return;
      try {
        if (!silencioso) {
          setCargando(true);
          setError(null);
        }
        const data = await obtenerPlaylistPorId(id);

        const listaCruda = Array.isArray(data?.canciones) ? data.canciones : [];
        const normalizada: ColeccionDetalle = {
          id: Number(data?.id ?? id),
          nombre: data?.nombre ?? 'Colección sin nombre',
          descripcion: data?.descripcion ?? '',
          canciones: listaCruda.map(normalizarCancionLista),
        };

        setColeccion(normalizada);
        setNombreEdit(normalizada.nombre);
        setDescripcionEdit(normalizada.descripcion || '');
      } catch (err: any) {
        if (!silencioso) {
          setError(
            err.response?.data?.mensaje ||
              'No se pudo cargar el detalle de la colección.'
          );
        }
      } finally {
        if (!silencioso) {
          setCargando(false);
        }
      }
    },
    [id]
  );

  useEffect(() => {
    cargarDetalle();
  }, [cargarDetalle]);

  // Verifica si una canción de búsqueda ya está en la colección (por id o por título + artista)
  const estaEnColeccion = (item: ResultadoBusqueda): boolean => {
    if (!coleccion) return false;
    if (clavesAgregadas.includes(item.clave)) return true;
    if (item.id !== undefined && coleccion.canciones.some((c) => c.id === item.id)) {
      return true;
    }

    const tituloBuscado = normalizarTexto(item.titulo);
    const artistaBuscado = normalizarTexto(item.artista);

    return coleccion.canciones.some(
      (c) =>
        normalizarTexto(c.titulo) === tituloBuscado &&
        (normalizarTexto(c.artista).includes(artistaBuscado) ||
          artistaBuscado.includes(normalizarTexto(c.artista)))
    );
  };

  // Guardar edición de nombre/descripción
  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !nombreEdit.trim()) return;

    try {
      setGuardandoEdit(true);
      await actualizarPlaylist(id, {
        nombre: nombreEdit.trim(),
        descripcion: descripcionEdit.trim(),
      });
      setColeccion((prev) =>
        prev
          ? {
              ...prev,
              nombre: nombreEdit.trim(),
              descripcion: descripcionEdit.trim(),
            }
          : prev
      );
      setModalEditarAbierto(false);
      mostrarAviso('Colección actualizada.');
    } catch (err: any) {
      mostrarAviso(err.response?.data?.mensaje || 'Error al actualizar la colección.');
    } finally {
      setGuardandoEdit(false);
    }
  };

  // Eliminar colección
  const handleEliminarColeccion = async () => {
    if (!id || !coleccion) return;
    const confirmar = window.confirm(
      `¿Seguro que querés eliminar la colección "${coleccion.nombre}"?`
    );
    if (!confirmar) return;

    try {
      await eliminarPlaylist(id);
      navigate('/playlists');
    } catch (err: any) {
      mostrarAviso(err.response?.data?.mensaje || 'No se pudo eliminar la colección.');
    }
  };

  // Quitar canción de la colección
  const handleQuitarCancion = async (cancionId: number, titulo: string) => {
    if (!id) return;
    try {
      await quitarCancionDePlaylist(id, cancionId);
      setColeccion((prev) =>
        prev
          ? {
              ...prev,
              canciones: prev.canciones.filter((c) => c.id !== cancionId),
            }
          : prev
      );
      setClavesAgregadas([]);
      mostrarAviso(`"${titulo}" quitada de la colección.`);
    } catch (err: any) {
      mostrarAviso(err.response?.data?.mensaje || 'No se pudo quitar la canción.');
    }
  };

  // Buscar canciones para agregar
  const ejecutarBusqueda = async (query: string) => {
    try {
      setBuscandoMusica(true);
      const res = await buscarMusica(query.trim() || 'pop', { limite: 15 });
      const lista = Array.isArray(res)
        ? res
        : res?.items ?? res?.canciones ?? res?.resultados ?? [];

      const mapeados: ResultadoBusqueda[] = lista.map((item: any, idx: number) => {
        const c = item.cancion ?? item;
        const artistaStr =
          c.artista ??
          (Array.isArray(c.artistas) && c.artistas.length > 0
            ? c.artistas.map((a: any) => a.nombre ?? a).join(', ')
            : 'Artista desconocido');

        return {
          clave: String(c.id ?? c.mbid ?? `${c.titulo}-${artistaStr}-${idx}`),
          id: typeof c.id === 'number' ? c.id : undefined,
          mbid: c.mbid ?? c.external_id ?? undefined,
          titulo: c.titulo ?? 'Sin título',
          artista: artistaStr,
          foto: c.foto ?? null,
        };
      });

      setResultados(mapeados);
    } catch (err) {
      console.error('Error buscando canciones:', err);
      setResultados([]);
    } finally {
      setBuscandoMusica(false);
    }
  };

  const abrirModalAgregar = () => {
    setTerminoBusqueda('');
    setAvisoModal(null);
    setClavesAgregadas([]);
    setModalAgregarAbierto(true);
    ejecutarBusqueda('');
  };

  const handleAgregarCancion = async (item: ResultadoBusqueda) => {
    if (!id || estaEnColeccion(item)) return;
    try {
      setAgregandoClave(item.clave);
      const payload = item.id
        ? { cancionId: item.id }
        : {
            titulo: item.titulo,
            artista: item.artista,
            ...(item.mbid ? { mbid: item.mbid } : {}),
          };

      await agregarCancionAPlaylist(id, payload);
      setClavesAgregadas((prev) => [...prev, item.clave]);
      await cargarDetalle(true);
      mostrarAvisoModal(`"${item.titulo}" agregada a la colección.`);
    } catch (err: any) {
      if (err.response?.status === 409) {
        setClavesAgregadas((prev) => [...prev, item.clave]);
        mostrarAvisoModal(`"${item.titulo}" ya estaba en la colección.`);
      } else {
        mostrarAvisoModal(
          err.response?.data?.mensaje || 'No se pudo agregar la canción.'
        );
      }
    } finally {
      setAgregandoClave(null);
    }
  };

  if (cargando) return <Loading mensaje="Cargando colección..." />;
  if (error || !coleccion) {
    return (
      <MensajeError
        mensaje={error || 'No se encontró la colección.'}
        onReintentar={() => cargarDetalle()}
      />
    );
  }

  return (
    <div className="detalle-playlist-page">
      <Link to="/playlists" className="detalle-playlist-volver">
        ← Volver a colecciones
      </Link>

      <header className="detalle-playlist-hero">
        <div className="detalle-playlist-cover">
          <span>{coleccion.nombre.charAt(0).toUpperCase()}</span>
        </div>

        <div className="detalle-playlist-meta">
          <span className="detalle-playlist-tag">COLECCIÓN PERSONALIZADA</span>
          <h1>{coleccion.nombre}</h1>
          {coleccion.descripcion && (
            <p className="detalle-playlist-desc">{coleccion.descripcion}</p>
          )}
          <span className="detalle-playlist-stats">
            {coleccion.canciones.length}{' '}
            {coleccion.canciones.length === 1 ? 'canción' : 'canciones'}
          </span>
        </div>

        <div className="detalle-playlist-acciones">
          <button
            type="button"
            className="btn-dp-primario"
            onClick={abrirModalAgregar}
          >
            + Agregar canciones
          </button>
          <button
            type="button"
            className="btn-dp-secundario"
            onClick={() => setModalEditarAbierto(true)}
          >
            Editar
          </button>
          <button
            type="button"
            className="btn-dp-peligro"
            onClick={handleEliminarColeccion}
          >
            Eliminar
          </button>
        </div>
      </header>

      {aviso && <div className="detalle-playlist-toast">{aviso}</div>}

      {coleccion.canciones.length === 0 ? (
        <div className="detalle-playlist-vacio">
          <p>Esta colección todavía no tiene canciones.</p>
          <button
            type="button"
            className="btn-dp-primario"
            onClick={abrirModalAgregar}
          >
            + Agregar primera canción
          </button>
        </div>
      ) : (
        <div className="detalle-playlist-tabla-wrap">
          <table className="detalle-playlist-tabla">
            <thead>
              <tr>
                <th>#</th>
                <th>CANCIÓN</th>
                <th>ARTISTA</th>
                <th>DURACIÓN</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {coleccion.canciones.map((cancion, index) => (
                <tr key={cancion.id}>
                  <td className="dp-col-num">{index + 1}</td>
                  <td>
                    <Link
                      to={`/cancion/${cancion.id}`}
                      className="dp-cancion-link"
                    >
                      <div className={`dp-mini-portada color-${(index % 4) + 1}`}>
                        {cancion.foto ? (
                          <img src={cancion.foto} alt={cancion.titulo} />
                        ) : (
                          <span>{cancion.titulo.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <span className="dp-cancion-titulo">{cancion.titulo}</span>
                    </Link>
                  </td>
                  <td className="dp-col-artista">{cancion.artista}</td>
                  <td className="dp-col-duracion">
                    {formatearDuracion(cancion.duracion)}
                  </td>
                  <td className="dp-col-acciones">
                    <button
                      type="button"
                      className="btn-dp-quitar"
                      onClick={() =>
                        handleQuitarCancion(cancion.id, cancion.titulo)
                      }
                      title="Quitar de esta colección"
                    >
                      Quitar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal para editar nombre y descripción */}
      <Modal
        isOpen={modalEditarAbierto}
        onClose={() => !guardandoEdit && setModalEditarAbierto(false)}
        titulo="Editar colección"
      >
        <form className="dp-form-modal" onSubmit={handleGuardarEdicion}>
          <div className="dp-form-grupo">
            <label htmlFor="dp-edit-nombre">Nombre *</label>
            <input
              id="dp-edit-nombre"
              type="text"
              value={nombreEdit}
              onChange={(e) => setNombreEdit(e.target.value)}
              maxLength={80}
              required
            />
          </div>
          <div className="dp-form-grupo">
            <label htmlFor="dp-edit-desc">Descripción</label>
            <textarea
              id="dp-edit-desc"
              rows={3}
              value={descripcionEdit}
              onChange={(e) => setDescripcionEdit(e.target.value)}
              maxLength={250}
            />
          </div>
          <div className="dp-form-botones">
            <button
              type="button"
              className="btn-dp-secundario"
              onClick={() => setModalEditarAbierto(false)}
              disabled={guardandoEdit}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-dp-primario"
              disabled={guardandoEdit || !nombreEdit.trim()}
            >
              {guardandoEdit ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal para buscar y agregar canciones */}
      <Modal
        isOpen={modalAgregarAbierto}
        onClose={() => setModalAgregarAbierto(false)}
        titulo={`Agregar canciones a "${coleccion.nombre}"`}
      >
        <form
          className="dp-buscador-form"
          onSubmit={(e) => {
            e.preventDefault();
            ejecutarBusqueda(terminoBusqueda);
          }}
        >
          <input
            type="text"
            placeholder="Buscar por canción o artista..."
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
          />
          <button type="submit" className="btn-dp-primario">
            Buscar
          </button>
        </form>

        {avisoModal && <div className="dp-modal-toast">{avisoModal}</div>}

        {buscandoMusica ? (
          <Loading mensaje="Buscando canciones..." />
        ) : resultados.length === 0 ? (
          <p className="dp-sin-resultados">No se encontraron canciones.</p>
        ) : (
          <div className="dp-resultados-lista">
            {resultados.map((item) => {
              const yaEsta = estaEnColeccion(item);

              return (
                <div key={item.clave} className="dp-resultado-item">
                  <div className="dp-resultado-info">
                    <strong>{item.titulo}</strong>
                    <span>{item.artista}</span>
                  </div>
                  <button
                    type="button"
                    className={`btn-dp-agregar-item ${yaEsta ? 'agregada' : ''}`}
                    disabled={yaEsta || agregandoClave === item.clave}
                    onClick={() => handleAgregarCancion(item)}
                  >
                    {yaEsta
                      ? '✓ Agregada'
                      : agregandoClave === item.clave
                      ? '...'
                      : '+ Agregar'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DetallePlaylist;