import api from './api';

export const obtenerPlaylists = async () => {
  const respuesta = await api.get('/api/colecciones');
  return respuesta.data;
};

export const obtenerPlaylistPorId = async (id) => {
  const respuesta = await api.get(`/api/colecciones/${id}`);
  return respuesta.data;
};

export const crearPlaylist = async (datos) => {
  const respuesta = await api.post('/api/colecciones', datos);
  return respuesta.data;
};

export const actualizarPlaylist = async (id, datos) => {
  const respuesta = await api.put(`/api/colecciones/${id}`, datos);
  return respuesta.data;
};

export const eliminarPlaylist = async (id) => {
  const respuesta = await api.delete(`/api/colecciones/${id}`);
  return respuesta.data;
};

// Acepta un cancionId numérico o { cancionId | (artista + titulo) | mbid }
export const agregarCancionAPlaylist = async (coleccionId, cancionOData) => {
  const payload =
    typeof cancionOData === 'object' ? cancionOData : { cancionId: cancionOData };
  const respuesta = await api.post(`/api/colecciones/${coleccionId}/canciones`, payload);
  return respuesta.data;
};

export const quitarCancionDePlaylist = async (coleccionId, cancionId) => {
  const respuesta = await api.delete(
    `/api/colecciones/${coleccionId}/canciones/${cancionId}`
  );
  return respuesta.data;
};

export const obtenerColecciones = obtenerPlaylists;
export const crearColeccion = crearPlaylist;