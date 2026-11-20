import api from './api';

export const obtenerEstadisticasCompletas = async () => {
  const respuesta = await api.get('/api/estadisticas');
  return respuesta.data;
};

// Adapta indicadoresGenerales del back al formato que consume Home.tsx
export const obtenerResumen = async (anio) => {
  const respuesta = await api.get('/api/estadisticas', {
    params: anio ? { anio } : {},
  });
  const data = respuesta.data?.estadisticas || respuesta.data;
  const ind = data?.indicadoresGenerales || {};

  return {
    ...data,
    minutos_escuchados: data?.minutos_escuchados ?? ind.minutosTotales ?? 0,
    reproducciones: data?.reproducciones ?? ind.totalReproducciones ?? 0,
    artistas_escuchados:
      data?.artistas_escuchados ?? data?.topArtistas?.length ?? 0,
  };
};

export const obtenerActividadReciente = async (limite = 10, pagina = 1) => {
  const respuesta = await api.get('/api/perfil/actividad', {
    params: { limite, pagina },
  });
  return respuesta.data;
};

export const registrarReproduccion = async (cancionId, datos = {}) => {
  const respuesta = await api.post(
    `/api/musica/${cancionId}/reproducciones`,
    datos
  );
  return respuesta.data;
};