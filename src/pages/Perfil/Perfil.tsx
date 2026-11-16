import React, { useEffect, useState } from 'react';
import api from '../../services/api';
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
  email: string;
  avatarUrl?: string;
  bio: string;
  preferencias: string[];
  generosDisponibles?: string[];
  favoritos: Favorito[];
  actividad: Actividad[];
}

const Perfil: React.FC = () => {
  const [perfil, setPerfil] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [nombreEdit, setNombreEdit] = useState<string>('');
  const [bioEdit, setBioEdit] = useState<string>('');
  const [avatarEdit, setAvatarEdit] = useState<string>('');
  const [preferenciasEdit, setPreferenciasEdit] = useState<string[]>([]);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get<UserProfile>('/users/me');
        setPerfil(data);
        sincronizarFormulario(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al cargar el perfil.');
      } finally {
        setLoading(false);
      }
    };

    fetchPerfil();
  }, []);

  const sincronizarFormulario = (data: UserProfile) => {
    setNombreEdit(data.nombre);
    setBioEdit(data.bio);
    setAvatarEdit(data.avatarUrl || '');
    setPreferenciasEdit(data.preferencias);
  };

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
      const payload = {
        nombre: nombreEdit.trim(),
        bio: bioEdit.trim(),
        avatarUrl: avatarEdit.trim() || null,
        preferencias: preferenciasEdit,
      };

      const { data } = await api.put<UserProfile>('/users/me', payload);
      setPerfil((prev) => (prev ? { ...prev, ...data } : data));
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar los cambios.');
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

  const inicial = perfil.nombre.charAt(0).toUpperCase();
  const listaGeneros = isEditing
    ? perfil.generosDisponibles || perfil.preferencias
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