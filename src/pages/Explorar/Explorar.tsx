import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import './Explorar.css';

export type OrdenamientoTipo = 'relevancia' | 'fecha_lanzamiento';

export interface CancionExplorar {
  id: string;
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

const Explorar: React.FC = () => {
  const [busqueda, setBusqueda] = useState<string>('');
  const [generoActivo, setGeneroActivo] = useState<string>('');
  const [ordenarPor, setOrdenarPor] = useState<OrdenamientoTipo>('relevancia');

  const [canciones, setCanciones] = useState<CancionExplorar[]>([]);
  const [generos, setGeneros] = useState<string[]>([]);
  const [usuario, setUsuario] = useState<UsuarioHeader | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [procesandoId, setProcesandoId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const { data } = await api.get<UsuarioHeader>('/users/me');
        setUsuario(data);
      } catch {
        // Silencioso si el header global maneja la sesión
      }
    };
    fetchUsuario();
  }, []);

  const buscarEnCatalogo = async (
    queryTexto: string,
    genero: string,
    orden: OrdenamientoTipo
  ) => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await api.get<RespuestaExplorar>('/music/explore', {
        params: {
          q: queryTexto.trim() || undefined,
          genre: genero || undefined,
          sort: orden,
        },
      });

      setCanciones(data.canciones);
      if (data.generos && data.generos.length > 0) {
        setGeneros(data.generos);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'No se pudieron obtener resultados del catálogo.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarEnCatalogo(busqueda, generoActivo, ordenarPor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generoActivo, ordenarPor]);

  const handleSubmitBusqueda = (e: React.FormEvent) => {
    e.preventDefault();
    buscarEnCatalogo(busqueda, generoActivo, ordenarPor);
  };

  const handleGuardarBiblioteca = async (cancionId: string) => {
    try {
      setProcesandoId(cancionId);
      await api.post('/library', { trackId: cancionId });
      setCanciones((prev) =>
        prev.map((c) => (c.id === cancionId ? { ...c, enBiblioteca: true } : c))
      );
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudo guardar en tu biblioteca.');
    } finally {
      setProcesandoId(null);
    }
  };

  const handleToggleFavorito = async (cancion: CancionExplorar) => {
    try {
      setProcesandoId(cancion.id);
      if (cancion.esFavorito) {
        await api.delete(`/favorites/${cancion.id}`);
      } else {
        await api.post('/favorites', { trackId: cancion.id });
      }
      setCanciones((prev) =>
        prev.map((c) =>
          c.id === cancion.id ? { ...c, esFavorito: !c.esFavorito } : c
        )
      );
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar favoritos.');
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
                    <svg //corazón
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