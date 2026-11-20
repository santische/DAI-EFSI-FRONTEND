import React, { useEffect, useState, useCallback } from 'react';
import { useUser } from '../../context/UserContext/UserContext';
import * as musicaService from '../../services/musicaService';
import * as bibliotecaService from '../../services/bibliotecaService';
import './Explorar.css';

export type OrdenamientoTipo = 'relevancia' | 'fecha_lanzamiento';

export interface CancionExplorar {
  id: string;
  cancionIdLocal?: number;
  mbid?: string;
  titulo: string;
  artista: string;
  genero: string;
  subtituloTipo: string;
  fechaLanzamiento: string;
  imagenUrl?: string;
  colorTarjeta?: string;
  enBiblioteca: boolean;
  esFavorito: boolean;
}

export interface RespuestaExplorar {
  canciones: CancionExplorar[];
  generos: string[];
}

export interface UsuarioHeader {
  nombre: string;
  avatarUrl?: string;
}

const GENEROS_BASE = ['Pop', 'Rock', 'Indie', 'Hip-Hop', 'Electrónica', 'Jazz', 'R&B'];
const COLORES_TARJETA = ['#b497ff', '#facc15', '#f4a6d7', '#7dd3fc'];

const Explorar: React.FC = () => {
  const { user } = useUser();

  const [busqueda, setBusqueda] = useState<string>('');
  const [generoActivo, setGeneroActivo] = useState<string>('');
  const [ordenarPor, setOrdenarPor] = useState<OrdenamientoTipo>('relevancia');

  const [canciones, setCanciones] = useState<CancionExplorar[]>([]);
  const [generos, setGeneros] = useState<string[]>(GENEROS_BASE);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [procesandoId, setProcesandoId] = useState<string | null>(null);

  const usuario: UsuarioHeader | null = user
    ? {
        nombre: user.nombre || user.username,
        avatarUrl: user.foto || undefined,
      }
    : null;

  const extraerLista = (res: any): any[] => {
    if (Array.isArray(res)) return res;
    return res?.items ?? res?.canciones ?? res?.resultados ?? res?.tracks ?? [];
  };

  const buscarEnCatalogo = useCallback(
    async (queryTexto: string, genero: string, orden: OrdenamientoTipo) => {
      try {
        setLoading(true);
        setError(null);

        const termino = queryTexto.trim() || genero || 'pop';
        const filtros: Record<string, any> = { limite: 24 };
        if (genero) filtros.genero = genero;
        if (orden !== 'relevancia') filtros.orden = orden;

        const [resMusica, resBiblioteca] = await Promise.all([
          musicaService.buscarMusica(termino, filtros),
          bibliotecaService.obtenerBiblioteca().catch(() => []),
        ]);

        let listaCruda = extraerLista(resMusica);

        // Si no hay término y el back devuelve vacío (Last.fm requiere query), pedimos un término inicial
        if (listaCruda.length === 0 && !termino) {
          const resFallback = await musicaService.buscarMusica('top hits', { limite: 24 });
          listaCruda = extraerLista(resFallback);
        }

        // Mapa de canciones ya guardadas en la biblioteca del usuario
        const itemsBib = Array.isArray(resBiblioteca)
          ? resBiblioteca
          : resBiblioteca?.items ?? resBiblioteca?.biblioteca ?? [];

        const mapaPorId = new Map<number, any>();
        const mapaPorClave = new Map<string, any>();

        itemsBib.forEach((b: any) => {
          const cId = b.cancion_id ?? b.id;
          if (typeof cId === 'number') mapaPorId.set(cId, b);

          const tit = (b.titulo ?? b.cancion?.titulo ?? '').toLowerCase().trim();
          const art = (
            b.artista ??
            (Array.isArray(b.artistas) ? b.artistas.map((a: any) => a.nombre ?? a).join(', ') : '')
          )
            .toLowerCase()
            .trim();
          if (tit) mapaPorClave.set(`${tit}::${art}`, b);
        });

        const cancionesNormalizadas: CancionExplorar[] = listaCruda.map(
          (item: any, index: number) => {
            const c = item.cancion ?? item;
            const titulo = c.titulo ?? c.name ?? 'Sin título';
            const artista =
              c.artista ??
              (Array.isArray(c.artistas) && c.artistas.length > 0
                ? c.artistas.map((a: any) => a.nombre ?? a).join(', ')
                : 'Artista desconocido');

            const idNumerico = typeof c.id === 'number' ? c.id : undefined;
            const mbid = c.mbid ?? c.external_id ?? undefined;
            const claveTexto = `${titulo.toLowerCase().trim()}::${artista.toLowerCase().trim()}`;
            const enBib =
              (idNumerico !== undefined ? mapaPorId.get(idNumerico) : undefined) ??
              mapaPorClave.get(claveTexto);

            const generoCancion =
              c.genero ??
              (Array.isArray(c.generos) && c.generos.length > 0
                ? c.generos[0]?.nombre ?? c.generos[0]
                : genero || '');

            const subtituloTipo =
              c.subtituloTipo ??
              (c.oyentes
                ? `${Number(c.oyentes).toLocaleString('es-AR')} oyentes`
                : c.album?.titulo ?? 'Canción');

            return {
              id: String(idNumerico ?? mbid ?? `${titulo}-${artista}-${index}`),
              cancionIdLocal: idNumerico ?? enBib?.cancion_id ?? enBib?.id,
              mbid: mbid ? String(mbid) : undefined,
              titulo,
              artista,
              genero: generoCancion,
              subtituloTipo,
              fechaLanzamiento: c.fechaLanzamiento ?? c.fecha_lanzamiento ?? '',
              imagenUrl: c.imagenUrl ?? c.foto ?? c.imagen ?? undefined,
              colorTarjeta: c.colorTarjeta ?? COLORES_TARJETA[index % COLORES_TARJETA.length],
              enBiblioteca: Boolean(enBib || c.enBiblioteca),
              esFavorito: Boolean(enBib?.es_favorita ?? c.esFavorito ?? c.es_favorita),
            };
          }
        );

        if (orden === 'fecha_lanzamiento') {
          cancionesNormalizadas.sort((a, b) =>
            (b.fechaLanzamiento || '').localeCompare(a.fechaLanzamiento || '')
          );
        }

        setCanciones(cancionesNormalizadas);

        if (Array.isArray(resMusica?.generos) && resMusica.generos.length > 0) {
          setGeneros(
            resMusica.generos.map((g: any) => (typeof g === 'string' ? g : g.nombre))
          );
        }
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

  const construirPayloadCancion = (cancion: CancionExplorar) => {
    if (cancion.cancionIdLocal) {
      return { cancionId: cancion.cancionIdLocal };
    }
    return {
      titulo: cancion.titulo,
      artista: cancion.artista,
      ...(cancion.mbid ? { mbid: cancion.mbid } : {}),
    };
  };

  const handleGuardarBiblioteca = async (cancionId: string) => {
    const cancion = canciones.find((c) => c.id === cancionId);
    if (!cancion) return;

    try {
      setProcesandoId(cancionId);
      setError(null);

      const res = await bibliotecaService.agregarABiblioteca({
        ...construirPayloadCancion(cancion),
        estado: 'quiero_escuchar',
      });

      const nuevoIdLocal =
        res?.item?.cancion_id ?? res?.cancion_id ?? res?.cancion?.id ?? cancion.cancionIdLocal;

      setCanciones((prev) =>
        prev.map((c) =>
          c.id === cancionId
            ? {
                ...c,
                enBiblioteca: true,
                cancionIdLocal:
                  typeof nuevoIdLocal === 'number' ? nuevoIdLocal : c.cancionIdLocal,
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
      setProcesandoId(null);
    }
  };

  const handleToggleFavorito = async (cancion: CancionExplorar) => {
    try {
      setProcesandoId(cancion.id);
      setError(null);

      const nuevoEstadoFavorito = !cancion.esFavorito;
      let nuevoIdLocal = cancion.cancionIdLocal;

      if (!cancion.enBiblioteca || !nuevoIdLocal) {
        // Si aún no estaba en biblioteca, la guarda y la marca como favorita en un paso
        const res = await bibliotecaService.agregarABiblioteca({
          ...construirPayloadCancion(cancion),
          estado: 'quiero_escuchar',
          es_favorita: nuevoEstadoFavorito,
        });
        const idDevuelto = res?.item?.cancion_id ?? res?.cancion_id ?? res?.cancion?.id;
        if (typeof idDevuelto === 'number') nuevoIdLocal = idDevuelto;
      } else {
        await bibliotecaService.toggleFavorito(nuevoIdLocal, nuevoEstadoFavorito);
      }

      setCanciones((prev) =>
        prev.map((c) =>
          c.id === cancion.id
            ? {
                ...c,
                enBiblioteca: true,
                cancionIdLocal: nuevoIdLocal,
                esFavorito: nuevoEstadoFavorito,
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
      setProcesandoId(null);
    }
  };

  const inicialUsuario = usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : '';

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
            placeholder="Buscar por canción o artista..."
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
              className={`pill-genero ${generoActivo === '' ? 'pill-genero--activo' : ''}`}
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
              <article key={cancion.id} className="track-card">
                <div className="track-card-top">
                  {cancion.imagenUrl ? (
                    <img
                      src={cancion.imagenUrl}
                      alt={cancion.titulo}
                      className="track-cover-img"
                    />
                  ) : (
                    <div
                      className="track-cover-placeholder"
                      style={
                        cancion.colorTarjeta
                          ? { backgroundColor: cancion.colorTarjeta }
                          : undefined
                      }
                    >
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
                    onClick={() => handleGuardarBiblioteca(cancion.id)}
                    disabled={cancion.enBiblioteca || procesandoId === cancion.id}
                    className={`btn-biblioteca ${
                      cancion.enBiblioteca ? 'btn-biblioteca--guardado' : ''
                    }`}
                  >
                    {cancion.enBiblioteca ? 'En tu biblioteca' : 'Guardar en biblioteca'}
                  </button>

                  <button
                    type="button"
                    aria-label="Marcar como favorito"
                    onClick={() => handleToggleFavorito(cancion)}
                    disabled={procesandoId === cancion.id}
                    className={`btn-favorito ${
                      cancion.esFavorito ? 'btn-favorito--activo' : ''
                    }`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill={cancion.esFavorito ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth="2"
                      className="heart-icon"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
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