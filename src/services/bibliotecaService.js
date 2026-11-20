import api from './api';

// filtros: { estado, favorita, genero, q, puntuacion, orden, dir, limite, pagina }
export const obtenerBiblioteca = async (filtros = {}) => {
  const respuesta = await api.get('/api/biblioteca', { params: filtros });
  return respuesta.data;
};

export const obtenerFavoritos = async () => {
  const respuesta = await api.get('/api/biblioteca', {
    params: { favorita: true },
  });
  return respuesta.data?.items ?? respuesta.data;
};

// datos: { cancionId | (artista + titulo) | mbid, estado?, es_favorita? }
export const agregarABiblioteca = async (datos) => {
  const respuesta = await api.post('/api/biblioteca', datos);
  return respuesta.data;
};

export const cambiarEstado = async (cancionId, estado) => {
  const respuesta = await api.put('/api/biblioteca', {
    cancionId,
    estado,
  });
  return respuesta.data;
};

export const toggleFavorito = async (cancionId, esFavorita) => {
  const body = esFavorita !== undefined ? { es_favorita: esFavorita } : {};
  const respuesta = await api.patch(`/api/biblioteca/${cancionId}/favorita`, body);
  return respuesta.data;
};

export const eliminarDeBiblioteca = async (cancionId) => {
  const respuesta = await api.delete(`/api/biblioteca/${cancionId}`);
  return respuesta.data;
};