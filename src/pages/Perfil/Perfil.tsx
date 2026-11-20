import React, { useEffect, useState, useCallback } from 'react';
import { useUser } from '../../context/UserContext/UserContext';
import * as perfilService from '../../services/perfilService';
import * as bibliotecaService from '../../services/bibliotecaService';
import './Perfil.css';

interface Favorito {
  id: string;
  titulo: string;
  artista: string;
  color?: string;
}

interface Actividad {
  id: string;
  accion: string;
  detalle: string;
  fecha: string;
  esReciente?: boolean;
}

interface UserProfile {
  nombre: string;
  username?: string;
  email: string;
  avatarUrl?: string;
  bio: string;
  preferencias: string[];
  generosDisponibles?: string[];
  favoritos: Favorito[];
  actividad: Actividad[];
}

const GENEROS_SUGERIDOS = [
  'Rock',
  'Pop',
  'Indie',
  'Electrónica',
  'Hip Hop',
  'Jazz',
  'R&B',
  'Clásica',
  'Reggaetón',
  'Folk',
  'Metal',
  'Alternativo',
];

const extraerPreferencias = (raw: any): string[] => {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.generos)) return raw.generos;
  return [];
};

const formatearFecha = (fechaRaw?: string): string => {
  if (!fechaRaw) return '';
  const fecha = new Date(fechaRaw);
  if (Number.isNaN(fecha.getTime())) return fechaRaw;
  return fecha.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
  });
};

const normalizarActividad = (act: any, index: number): Actividad => {
  if (act.accion) {
    return {
      id: String(act.id ?? index),
      accion: act.accion,
      detalle: act.detalle ?? '',
      fecha: formatearFecha(act.fecha),
      esReciente: index === 0,
    };
  }

  const cancion = act.cancion_titulo || act.detalles?.titulo || '';
  const coleccion = act.coleccion_nombre || act.detalles?.nombre || '';

  const mapaTipos: Record<string, { accion: string; detalle: string }> = {
    reproduccion: { accion: 'Escuchaste', detalle: cancion },
    escucho: { accion: 'Escuchaste', detalle: cancion },
    favorita_agregada: { accion: 'Agregaste a favoritos', detalle: cancion },
    marcar_favorito: { accion: 'Agregaste a favoritos', detalle: cancion },
    favorita_quitada: { accion: 'Quitaste de favoritos', detalle: cancion },
    quitar_favorito: { accion: 'Quitaste de favoritos', detalle: cancion },
    coleccion_creada: { accion: 'Creaste una colección', detalle: coleccion },
    crear_coleccion: { accion: 'Creaste una colección', detalle: coleccion },
    coleccion_cancion_agregada: {
      accion: `Agregaste a ${coleccion || 'una colección'}`,
      detalle: cancion,
    },
    agregar_a_coleccion: {
      accion: `Agregaste a ${coleccion || 'una colección'}`,
      detalle: cancion,
    },
    puntuacion_creada: {
      accion: `Puntuaste con ${act.detalles?.valor ?? ''}★`,
      detalle: cancion,
    },
    puntuar: {
      accion: `Puntuaste con ${act.detalles?.valor ?? ''}★`,
      detalle: cancion,
    },
    resena_creada: { accion: 'Reseñaste una canción', detalle: cancion },
    crear_resena: { accion: 'Reseñaste una canción', detalle: cancion },
    editar_resena: { accion: 'Editaste una reseña', detalle: cancion },
    biblioteca_agregada: { accion: 'Agregaste a tu biblioteca', detalle: cancion },
    biblioteca_actualizada: { accion: 'Actualizaste estado', detalle: cancion },
  };

  const info = mapaTipos[act.tipo] || {
    accion: 'Actividad en biblioteca',
    detalle: cancion || coleccion,
  };

  return {
    id: String(act.id ?? index),
    accion: info.accion,
    detalle: info.detalle,
    fecha: formatearFecha(act.fecha || act.created_at),
    esReciente: index === 0,
  };
};

const Perfil: React.FC = () => {
const { setUser } = useUser() as any;

  const [perfil, setPerfil] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const [nombreEdit, setNombreEdit] = useState<string>('');
  const [bioEdit, setBioEdit] = useState<string>('');
  const [avatarEdit, setAvatarEdit] = useState<string>('');
  const [preferenciasEdit, setPreferenciasEdit] = useState<string[]>([]);

  const sincronizarFormulario = (data: UserProfile) => {
    setNombreEdit(data.nombre);
    setBioEdit(data.bio);
    setAvatarEdit(data.avatarUrl || '');
    setPreferenciasEdit(data.preferencias);
  };

  const cargarPerfil = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [resPerfil, resFavoritos, resActividad] = await Promise.all([
        perfilService.obtenerPerfil(),
        bibliotecaService.obtenerFavoritos().catch(() => []),
        perfilService.obtenerActividadPerfil(10, 1).catch(() => []),
      ]);

      const rawUsuario =
        resPerfil?.usuario || resPerfil?.perfil || resPerfil?.data || resPerfil || {};
      const subPerfil = rawUsuario.perfil || resPerfil?.perfil || {};

      const listaFavs = Array.isArray(resFavoritos)
        ? resFavoritos
        : resFavoritos?.items ?? resFavoritos?.favoritos ?? [];

      const favoritosNormalizados: Favorito[] = listaFavs.map((item: any, idx: number) => ({
        id: String(item.cancion_id ?? item.id ?? idx),
        titulo: item.titulo ?? item.cancion?.titulo ?? 'Sin título',
        artista:
          item.artista ??
          (Array.isArray(item.artistas) && item.artistas.length > 0
            ? item.artistas.map((a: any) => a.nombre ?? a).join(', ')
            : 'Artista desconocido'),
        color: item.color,
      }));

      const listaAct = Array.isArray(resActividad)
        ? resActividad
        : resActividad?.items ?? resActividad?.actividad ?? [];

      const actividadNormalizada: Actividad[] = listaAct.map((act: any, idx: number) =>
        normalizarActividad(act, idx)
      );

      const prefs = extraerPreferencias(
        rawUsuario.preferencias ?? subPerfil.preferencias
      );

      const perfilArmado: UserProfile = {
        nombre:
          rawUsuario.nombre ??
          subPerfil.nombre ??
          rawUsuario.username ??
          'Usuario',
        username: rawUsuario.username,
        email: rawUsuario.email ?? '',
        avatarUrl: rawUsuario.foto ?? subPerfil.foto ?? rawUsuario.avatarUrl ?? '',
        bio: rawUsuario.bio ?? subPerfil.bio ?? '',
        preferencias: prefs,
        generosDisponibles: Array.from(new Set([...GENEROS_SUGERIDOS, ...prefs])),
        favoritos: favoritosNormalizados,
        actividad: actividadNormalizada,
      };

      setPerfil(perfilArmado);
      sincronizarFormulario(perfilArmado);
    } catch (err: any) {
      setError(
        err.response?.data?.mensaje ||
          err.response?.data?.message ||
          'Error al cargar el perfil.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarPerfil();
  }, [cargarPerfil]);

  const toggleGenero = (genero: string) => {
    if (!isEditing) return;
    setPreferenciasEdit((prev) =>
      prev.includes(genero) ? prev.filter((g) => g !== genero) : [...prev, genero]
    );
  };

  const handleGuardarCambios = async () => {
    if (!perfil) return;
    try {
      setSaving(true);
      setError(null);

      const nombreLimpio = nombreEdit.trim() || perfil.nombre;
      const bioLimpia = bioEdit.trim();
      const fotoLimpia = avatarEdit.trim() || null;

      await perfilService.actualizarPerfil({
        nombre: nombreLimpio,
        bio: bioLimpia,
        foto: fotoLimpia,
        preferencias: { generos: preferenciasEdit },
      });

      setPerfil((prev) =>
        prev
          ? {
              ...prev,
              nombre: nombreLimpio,
              bio: bioLimpia,
              avatarUrl: fotoLimpia || undefined,
              preferencias: preferenciasEdit,
              generosDisponibles: Array.from(
                new Set([...GENEROS_SUGERIDOS, ...preferenciasEdit])
              ),
            }
          : prev
      );

      // Actualiza también el usuario en el Sidebar y Navbar
      setUser((prev: any) =>
        prev
          ? {
              ...prev,
              nombre: nombreLimpio,
              bio: bioLimpia,
              foto: fotoLimpia,
              preferencias: preferenciasEdit,
            }
          : prev
      );

      setIsEditing(false);
    } catch (err: any) {
      const listaErrores = err.response?.data?.errores;
      const mensajeBase =
        err.response?.data?.mensaje ||
        err.response?.data?.message ||
        'Error al guardar los cambios.';

      setError(
        Array.isArray(listaErrores) && listaErrores.length > 0
          ? `${mensajeBase}: ${listaErrores.join('. ')}` : mensajeBase
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancelarEdicion = () => {
    if (perfil) sincronizarFormulario(perfil);
    setIsEditing(false);
  };

  if (loading) {
    return <div className="perfil-estado">Cargando perfil...</div>;
  }

  if (error && !perfil) {
    return <div className="perfil-estado perfil-estado--error">{error}</div>;
  }

  if (!perfil) return null;

  const inicial = (perfil.nombre || perfil.username || 'U').charAt(0).toUpperCase();
  const listaGeneros = isEditing
    ? perfil.generosDisponibles || GENEROS_SUGERIDOS
    : perfil.preferencias;

  return (
    <div className="perfil-container">
      <header className="perfil-header">
        <div>
          <h1 className="perfil-titulo">Mi perfil</h1>
          <p className="perfil-subtitulo">
            Editá tus datos personales y preferencias musicales.
          </p>
        </div>
        <div className="avatar-badge-top">{inicial}</div>
      </header>

      {error && <div className="perfil-alerta-error">{error}</div>}

      <section className="perfil-card-principal">
        <div className="perfil-info-wrapper">
          {perfil.avatarUrl && !isEditing ? (
            <img
              src={perfil.avatarUrl}
              alt={perfil.nombre}
              className="perfil-avatar-img"
            />
          ) : (
            <div className="perfil-avatar-placeholder">{inicial}</div>
          )}

          <div className="perfil-datos">
            {isEditing ? (
              <div className="perfil-form-edicion">
                <div className="form-grupo">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    value={nombreEdit}
                    onChange={(e) => setNombreEdit(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-grupo">
                  <label className="form-label">Bio</label>
                  <textarea
                    rows={2}
                    value={bioEdit}
                    onChange={(e) => setBioEdit(e.target.value)}
                    className="form-textarea"
                  />
                </div>
                <div className="form-grupo">
                  <label className="form-label">URL de Avatar</label>
                  <input
                    type="text"
                    value={avatarEdit}
                    onChange={(e) => setAvatarEdit(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            ) : (
              <>
                <h2 className="perfil-nombre">{perfil.nombre}</h2>
                <p className="perfil-email">{perfil.email}</p>
                {perfil.bio && <p className="perfil-bio">{perfil.bio}</p>}
              </>
            )}

            <div className="perfil-preferencias">
              <span className="preferencias-titulo">Mis géneros</span>
              {listaGeneros.length === 0 ? (
                <p className="texto-vacio">
                  Sin géneros seleccionados. Hacé clic en "Editar perfil" para elegir.
                </p>
              ) : (
                <div className="generos-lista">
                  {listaGeneros.map((genero) => {
                    const activo = preferenciasEdit.includes(genero);
                    return (
                      <button
                        key={genero}
                        type="button"
                        onClick={() => toggleGenero(genero)}
                        className={`genero-pill ${
                          isEditing ? 'genero-pill--editable' : ''
                        } ${isEditing && activo ? 'genero-pill--activo' : ''}`}
                      >
                        {genero}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="perfil-acciones-top">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="btn-editar"
            >
              Editar perfil
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCancelarEdicion}
              className="btn-cancelar"
            >
              Cancelar
            </button>
          )}
        </div>
      </section>

      <div className="perfil-grid-inferior">
        <section className="perfil-card-seccion">
          <h3 className="seccion-titulo">Mis favoritos</h3>
          {perfil.favoritos.length === 0 ? (
            <p className="texto-vacio">No hay favoritos registrados.</p>
          ) : (
            <div className="favoritos-lista">
              {perfil.favoritos.map((fav) => (
                <div key={fav.id} className="favorito-item">
                  <div className="favorito-info">
                    <div
                      className="favorito-cover"
                      style={fav.color ? { backgroundColor: fav.color } : undefined}
                    >
                      {fav.titulo.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="favorito-titulo">{fav.titulo}</p>
                      <p className="favorito-artista">{fav.artista}</p>
                    </div>
                  </div>
                  <span className="favorito-corazon">♥</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="perfil-card-seccion">
          <h3 className="seccion-titulo">Actividad reciente</h3>
          {perfil.actividad.length === 0 ? (
            <p className="texto-vacio">No hay actividad registrada.</p>
          ) : (
            <div className="actividad-lista">
              {perfil.actividad.map((act) => (
                <div key={act.id} className="actividad-item">
                  <div className="actividad-info">
                    <span
                      className={`actividad-dot ${
                        act.esReciente ? 'actividad-dot--reciente' : ''
                      }`}
                    />
                    <div>
                      <p className="actividad-accion">{act.accion}</p>
                      <p className="actividad-detalle">{act.detalle}</p>
                    </div>
                  </div>
                  <span className="actividad-fecha">{act.fecha}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {isEditing && (
        <div className="perfil-footer-acciones">
          <button
            type="button"
            onClick={handleGuardarCambios}
            disabled={saving}
            className="btn-guardar"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Perfil;