import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BotonFavorito from '../../componentes/biblioteca/BotonFavorito/BotonFavorito';
import { buscarMusica, importarMusica } from '../../services/musicaService';
import {
  obtenerBiblioteca,
  agregarABiblioteca,
  toggleFavorito,
} from '../../services/bibliotecaService';
import { obtenerPerfil } from '../../services/perfilService';
import './Explorar.css';

export type OrdenamientoTipo = 'relevancia' | 'fecha_lanzamiento';

export interface CancionExplorar {
  clave: string;
  id?: number;
  mbid?: string;
  titulo: string;
  artista: string;
  genero: string;
  subtituloTipo: string;
  imagenUrl?: string | null;
  oyentes?: number;
  enBiblioteca: boolean;
  esFavorito: boolean;
}

interface UsuarioHeader {
  nombre: string;
  avatarUrl?: string | null;
}

const GENEROS_DEFAULT = [
  'Pop',
  'Rock',
  'Indie',
  'Hip-Hop',
  'Electrónica',
  'Jazz',
  'R&B',
];

const Explorar: React.FC = () => {
  const navigate = useNavigate();

  const [busqueda, setBusqueda] = useState<string>('');
  const [generoActivo, setGeneroActivo] = useState<string>('');
  const [ordenarPor, setOrdenarPor] = useState<OrdenamientoTipo>('relevancia');

  const [canciones, setCanciones] = useState<CancionExplorar[]>([]);
  const [generos] = useState<string[]>(GENEROS_DEFAULT);
  const [usuario, setUsuario] = useState<UsuarioHeader | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [procesandoClave, setProcesandoClave] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const res = await obtenerPerfil();
        const u = res?.usuario ?? res;
        if (u?.nombre) {
          setUsuario({ nombre: u.nombre, avatarUrl: u.foto ?? u.avatarUrl });
        }
      } catch {
        // Silencioso si el header global maneja la sesión
      }
    };
    fetchUsuario();
  }, []);

  const buscarEnCatalogo = useCallback(
    async (queryTexto: string, genero: string, orden: OrdenamientoTipo) => {
      try {
        setLoading(true);
        setError(null);

        const termino =
          queryTexto.trim() || (genero ? genero.toLowerCase() : 'pop');

        const [resMusica, resBib] = await Promise.all([
          buscarMusica(termino, {
            orden: orden === 'relevancia' ? 'oyentes' : 'fecha',
            dir: 'desc',
            limite: 24,
          }),
          obtenerBiblioteca().catch(() => []),
        ]);

        const itemsBib = Array.isArray(resBib) ? resBib : resBib?.items ?? [];
        const mapaPorId = new Map<
          number,
          { id?: number; enBiblioteca: boolean; esFavorito: boolean }
        >();
        const mapaPorNombre = new Map<
          string,
          { id?: number; enBiblioteca: boolean; esFavorito: boolean }
        >();

        itemsBib.forEach((item: any) => {
          const cancionId = Number(item.cancion_id ?? item.id);
          const estado = {
            id: Number.isNaN(cancionId) ? undefined : cancionId,
            enBiblioteca: true,
            esFavorito: Boolean(item.es_favorita),
          };
          if (!Number.isNaN(cancionId)) {
            mapaPorId.set(cancionId, estado);
          }
          const artistaItem =
            item.artista ??
            (Array.isArray(item.artistas) && item.artistas.length > 0
              ? item.artistas[0].nombre ?? item.artistas[0]
              : '');
          if (item.titulo) {
            mapaPorNombre.set(
              `${String(item.titulo).toLowerCase()}|${String(artistaItem).toLowerCase()}`,
              estado
            );
          }
        });

        const listaCruda = Array.isArray(resMusica)
          ? resMusica
          : resMusica?.items ??
            resMusica?.canciones ??
            resMusica?.resultados ??
            [];

        const mapeadas: CancionExplorar[] = listaCruda.map(
          (raw: any, index: number) => {
            const c = raw.cancion ?? raw;
            const idNum =
              typeof c.id === 'number'
                ? c.id
                : c.id && !Number.isNaN(Number(c.id))
                ? Number(c.id)
                : undefined;

            const tituloStr = c.titulo ?? c.name ?? 'Sin título';
            const artistaStr =
              c.artista ??
              (Array.isArray(c.artistas) && c.artistas.length > 0
                ? c.artistas.map((a: any) => a.nombre ?? a).join(', ')
                : typeof c.artist === 'string'
                ? c.artist
                : c.artist?.name ?? 'Artista desconocido');

            const claveNombre = `${tituloStr.toLowerCase()}|${artistaStr.toLowerCase()}`;
            const estadoBib =
              (idNum !== undefined ? mapaPorId.get(idNum) : undefined) ??
              mapaPorNombre.get(claveNombre);

            const oyentesNum =
              c.oyentes !== undefined ? Number(c.oyentes) : undefined;

            return {
              clave: String(
                idNum ?? c.mbid ?? `${tituloStr}-${artistaStr}-${index}`
              ),
              id: idNum ?? estadoBib?.id,
              mbid: c.mbid ?? c.external_id ?? undefined,
              titulo: tituloStr,
              artista: artistaStr,
              genero:
                c.genero ??
                (Array.isArray(c.generos) && c.generos[0]) ??
                genero ??
                '',
              subtituloTipo:
                oyentesNum !== undefined && !Number.isNaN(oyentesNum)
                  ? `${oyentesNum.toLocaleString('es-AR')} oyentes`
                  : 'Canción del catálogo',
              imagenUrl: c.foto ?? c.imagen ?? null,
              oyentes: oyentesNum,
              enBiblioteca: Boolean(estadoBib?.enBiblioteca),
              esFavorito: Boolean(estadoBib?.esFavorito),
            };
          }
        );

        setCanciones(mapeadas);
      } catch (err: any) {
        setError(
          err.response?.data?.mensaje ||
            err.response?.data?.message ||
            'No se pudieron obtener resultados del catálogo.'
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    buscarEnCatalogo(busqueda, generoActivo, ordenarPor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generoActivo, ordenarPor]);

  const handleSubmitBusqueda = (e: React.FormEvent) => {
    e.preventDefault();
    buscarEnCatalogo(busqueda, generoActivo, ordenarPor);
  };

  const asegurarIdLocal = async (
    cancion: CancionExplorar
  ): Promise<number | undefined> => {
    if (typeof cancion.id === 'number') return cancion.id;

    const res = await importarMusica({
      titulo: cancion.titulo,
      artista: cancion.artista,
      ...(cancion.mbid ? { mbid: cancion.mbid } : {}),
    });

    const idLocal = Number(res?.cancion?.id ?? res?.id);
    if (!Number.isNaN(idLocal)) {
      setCanciones((prev) =>
        prev.map((c) => (c.clave === cancion.clave ? { ...c, id: idLocal } : c))
      );
      return idLocal;
    }
    return undefined;
  };

  const handleVerDetalle = async (cancion: CancionExplorar) => {
    try {
      setProcesandoClave(cancion.clave);
      const idLocal = await asegurarIdLocal(cancion);
      if (idLocal) {
        navigate(`/cancion/${idLocal}`);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.mensaje ||
          'No se pudo abrir el detalle de la canción.'
      );
    } finally {
      setProcesandoClave(null);
    }
  };

  const handleGuardarBiblioteca = async (cancion: CancionExplorar) => {
    try {
      setProcesandoClave(cancion.clave);
      const payload = cancion.id
        ? { cancionId: cancion.id }
        : {
            titulo: cancion.titulo,
            artista: cancion.artista,
            ...(cancion.mbid ? { mbid: cancion.mbid } : {}),
          };

      const res = await agregarABiblioteca(payload);
      const nuevoId = Number(
        res?.item?.cancion_id ?? res?.cancion_id ?? cancion.id
      );

      setCanciones((prev) =>
        prev.map((c) =>
          c.clave === cancion.clave
            ? {
                ...c,
                id: Number.isNaN(nuevoId) ? c.id : nuevoId,
                enBiblioteca: true,
              }
            : c
        )
      );
    } catch (err: any) {
      setError(
        err.response?.data?.mensaje ||
          err.response?.data?.message ||
          'No se pudo guardar en tu biblioteca.'
      );
    } finally {
      setProcesandoClave(null);
    }
  };

  const handleToggleFavorito = async (cancion: CancionExplorar) => {
    try {
      setProcesandoClave(cancion.clave);
      const nuevoValor = !cancion.esFavorito;
      let cancionId = cancion.id;

      if (!cancionId) {
        const res = await agregarABiblioteca({
          titulo: cancion.titulo,
          artista: cancion.artista,
          es_favorita: nuevoValor,
          ...(cancion.mbid ? { mbid: cancion.mbid } : {}),
        });
        const idCreado = Number(res?.item?.cancion_id ?? res?.cancion_id);
        if (!Number.isNaN(idCreado)) cancionId = idCreado;
      } else {
        if (!cancion.enBiblioteca) {
          await agregarABiblioteca({
            cancionId,
            es_favorita: nuevoValor,
          });
        } else {
          await toggleFavorito(cancionId, nuevoValor);
        }
      }

      setCanciones((prev) =>
        prev.map((c) =>
          c.clave === cancion.clave
            ? {
                ...c,
                id: cancionId ?? c.id,
                enBiblioteca: true,
                esFavorito: nuevoValor,
              }
            : c
        )
      );
    } catch (err: any) {
      setError(
        err.response?.data?.mensaje ||
          err.response?.data?.message ||
          'Error al actualizar favoritos.'
      );
    } finally {
      setProcesandoClave(null);
    }
  };

  const inicialUsuario = usuario?.nombre
    ? usuario.nombre.charAt(0).toUpperCase()
    : '';

  return (
    <div className="explorar-container">
      <header className="explorar-header">
        <div>
          <h1 className="explorar-titulo">Explorar música</h1>
          <p className="explorar-subtitulo">
            Buscá canciones y artistas en el catálogo musical.
          </p>
        </div>

        {usuario &&
          (usuario.avatarUrl ? (
            <img
              src={usuario.avatarUrl}
              alt={usuario.nombre}
              className="explorar-avatar-img"
            />
          ) : (
            <div className="explorar-avatar-badge">{inicialUsuario}</div>
          ))}
      </header>

      <form className="explorar-search-bar" onSubmit={handleSubmitBusqueda}>
        <div className="search-input-wrapper">
          <svg
            className="search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar canciones o artistas"
            className="search-input"
          />
        </div>
        <button type="submit" className="btn-buscar" disabled={loading}>
          Buscar
        </button>
      </form>

      <div className="explorar-controles">
        <div className="control-grupo">
          <span className="control-label">GÉNERO</span>
          <div className="generos-pills">
            <button
              type="button"
              onClick={() => setGeneroActivo('')}
              className={`pill-genero ${
                generoActivo === '' ? 'pill-genero--activo' : ''
              }`}
            >
              Todos
            </button>
            {generos.map((genero) => (
              <button
                key={genero}
                type="button"
                onClick={() => setGeneroActivo(genero)}
                className={`pill-genero ${
                  generoActivo === genero ? 'pill-genero--activo' : ''
                }`}
              >
                {genero}
              </button>
            ))}
          </div>
        </div>

        <div className="control-grupo control-grupo--orden">
          <label htmlFor="select-orden" className="control-label">
            ORDENAR POR
          </label>
          <div className="select-wrapper">
            <select
              id="select-orden"
              value={ordenarPor}
              onChange={(e) => setOrdenarPor(e.target.value as OrdenamientoTipo)}
              className="select-orden"
            >
              <option value="relevancia">Relevancia</option>
              <option value="fecha_lanzamiento">Fecha de lanzamiento</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div className="explorar-error">{error}</div>}

      {loading ? (
        <div className="explorar-estado">Buscando en el catálogo...</div>
      ) : canciones.length === 0 ? (
        <div className="explorar-estado">
          No se encontraron canciones para los filtros seleccionados.
        </div>
      ) : (
        <div className="explorar-grid">
          {canciones.map((cancion) => {
            const inicialCancion = cancion.titulo.charAt(0).toUpperCase();
            return (
              <article key={cancion.clave} className="track-card">
                <div
                  className="track-card-top"
                  onClick={() => handleVerDetalle(cancion)}
                  role="button"
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                >
                  {cancion.imagenUrl ? (
                    <img
                      src={cancion.imagenUrl}
                      alt={cancion.titulo}
                      className="track-cover-img"
                    />
                  ) : (
                    <div className="track-cover-placeholder">
                      <span className="cover-inicial">{inicialCancion}</span>
                      <div className="cover-bottom">
                        <span className="cover-genero">{cancion.genero}</span>
                        <span className="cover-barra" />
                      </div>
                    </div>
                  )}

                  <div className="track-meta">
                    <h2 className="track-titulo" title={cancion.titulo}>
                      {cancion.titulo}
                    </h2>
                    <p className="track-artista">{cancion.artista}</p>
                    {cancion.genero && (
                      <span className="track-tag-genero">{cancion.genero}</span>
                    )}
                  </div>
                </div>

                <div className="track-divider" />

                <p className="track-subtitulo-tipo">{cancion.subtituloTipo}</p>

                <div className="track-acciones">
                  <button
                    type="button"
                    onClick={() => handleGuardarBiblioteca(cancion)}
                    disabled={
                      cancion.enBiblioteca || procesandoClave === cancion.clave
                    }
                    className={`btn-biblioteca ${
                      cancion.enBiblioteca ? 'btn-biblioteca--guardado' : ''
                    }`}
                  >
                    {cancion.enBiblioteca
                      ? 'En tu biblioteca'
                      : 'Guardar en biblioteca'}
                  </button>

                  <BotonFavorito
                    esFavorito={cancion.esFavorito}
                    onToggle={() => handleToggleFavorito(cancion)}
                    disabled={procesandoClave === cancion.clave}
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Explorar;