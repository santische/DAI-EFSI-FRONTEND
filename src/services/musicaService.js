import api from './api';

// --- CATÁLOGO Y BÚSQUEDA (/api/musica) ---
// filtros: { orden, dir, artista, minOyentes, limite }
export const buscarMusica = async (q, filtros = {}) => {
  const respuesta = await api.get('/api/musica', {
    params: { q, ...filtros },
  });
  return respuesta.data;
};

// Guarda una canción de Last.fm en la BD local sin agregarla a la biblioteca
export const importarMusica = async (datos) => {
  const respuesta = await api.post('/api/musica', datos);
  return respuesta.data;
};

export const obtenerCancionPorId = async (id) => {
  const respuesta = await api.get(`/api/musica/${id}`);
  return respuesta.data;
};

// --- PUNTUACIONES (/api/puntuaciones) ---
export const obtenerPuntuaciones = async (cancionId) => {
  const respuesta = await api.get('/api/puntuaciones', {
    params: cancionId ? { cancionId } : {},
  });
  return respuesta.data;
};

// Acepta (cancionId, valor) o ({ cancionId | (artista + titulo) | mbid, valor })
export const puntuarCancion = async (cancionIdOData, valor) => {
  const payload =
    typeof cancionIdOData === 'object'
      ? cancionIdOData
      : { cancionId: cancionIdOData, valor };
  const respuesta = await api.post('/api/puntuaciones', payload);
  return respuesta.data;
};

export const actualizarPuntuacion = async (puntuacionId, valor) => {
  const respuesta = await api.put(`/api/puntuaciones/${puntuacionId}`, { valor });
  return respuesta.data;
};

export const eliminarPuntuacion = async (puntuacionId) => {
  const respuesta = await api.delete(`/api/puntuaciones/${puntuacionId}`);
  return respuesta.data;
};

// --- RESEÑAS (/api/resenas) ---
export const obtenerResenas = async (cancionId) => {
  const respuesta = await api.get('/api/resenas', {
    params: cancionId ? { cancionId } : {},
  });
  return respuesta.data;
};

// Acepta (cancionId, texto) o ({ cancionId | (artista + titulo) | mbid, texto })
export const guardarResena = async (cancionIdOData, texto) => {
  const payload =
    typeof cancionIdOData === 'object'
      ? cancionIdOData
      : { cancionId: cancionIdOData, texto };
  const respuesta = await api.post('/api/resenas', payload);
  return respuesta.data;
};

export const actualizarResena = async (resenaId, texto) => {
  const respuesta = await api.put(`/api/resenas/${resenaId}`, { texto });
  return respuesta.data;
};

export const eliminarResena = async (resenaId) => {
  const respuesta = await api.delete(`/api/resenas/${resenaId}`);
  return respuesta.data;
};