import api from './api';

const extraerConteoCanciones = (col) => {
  const valor =
    col?.cantidad_canciones ??
    col?.total_canciones ??
    col?.cantidad ??
    col?.count ??
    (Array.isArray(col?.canciones) ? col.canciones.length : undefined);

  return valor !== undefined && valor !== null ? Number(valor) : undefined;
};

export const obtenerPlaylistPorId = async (id) => {
  const respuesta = await api.get(`/api/colecciones/${id}`);
  const data = respuesta.data;
  if (data?.coleccion) {
    const canciones = data.coleccion.canciones ?? data.canciones ?? [];
    return {
      ...data.coleccion,
      canciones,
      cantidad_canciones: canciones.length,
    };
  }
  return data;
};

export const obtenerPlaylists = async () => {
  const respuesta = await api.get('/api/colecciones');
  const data = respuesta.data;
  const lista = Array.isArray(data)
    ? data
    : data?.colecciones ?? data?.playlists ?? [];

  const normalizadas = await Promise.all(
    lista.map(async (col) => {
      const conteo = extraerConteoCanciones(col);
      if (conteo !== undefined && !Number.isNaN(conteo)) {
        return { ...col, cantidad_canciones: conteo };
      }

      try {
        const detalle = await obtenerPlaylistPorId(col.id);
        return {
          ...col,
          cantidad_canciones: Array.isArray(detalle?.canciones)
            ? detalle.canciones.length
            : 0,
        };
      } catch {
        return { ...col, cantidad_canciones: 0 };
      }
    })
  );

  return normalizadas;
};

export const crearPlaylist = async (datos) => {
  const respuesta = await api.post('/api/colecciones', datos);
  const data = respuesta.data;
  const creada = data?.coleccion ?? data?.playlist ?? data;
  return {
    ...creada,
    cantidad_canciones: extraerConteoCanciones(creada) ?? 0,
  };
};

export const actualizarPlaylist = async (id, datos) => {
  const respuesta = await api.put(`/api/colecciones/${id}`, datos);
  return respuesta.data?.coleccion ?? respuesta.data;
};

export const eliminarPlaylist = async (id) => {
  const respuesta = await api.delete(`/api/colecciones/${id}`);
  return respuesta.data;
};

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