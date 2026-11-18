import api from './api';

export const obtenerColecciones = async () => {
  const respuesta = await api.get('/api/colecciones');
  return respuesta.data;
};

export const crearColeccion = async (datos) => {
  const respuesta = await api.post('/api/colecciones', datos);
  return respuesta.data;
};