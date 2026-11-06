import api from './api';

export const registrarUsuario = async (datos) => {
  const respuesta = await api.post('/api/auth/registro', datos);
  return respuesta.data;
};

export const iniciarSesion = async (datos) => {
  const respuesta = await api.post('/api/auth/login', datos);
  return respuesta.data;
};

export const cerrarSesion = async () => {
  const respuesta = await api.post('/api/auth/logout');
  return respuesta.data;
};

export const obtenerUsuario = async () => {
  const respuesta = await api.get('/api/auth/me');
  return respuesta.data;
};