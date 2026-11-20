import api from './api';

export const obtenerPerfil = async () => {
  const respuesta = await api.get('/api/perfil');
  return respuesta.data;
};

// cambios soportados: { nombre?, foto?, bio?, preferencias? }
export const actualizarPerfil = async (datos) => {
  const respuesta = await api.put('/api/perfil', datos);
  return respuesta.data;
};

export const actualizarPreferencias = async (preferencias) => {
  const respuesta = await api.put('/api/perfil', { preferencias });
  return respuesta.data;
};

export const desactivarCuenta = async () => {
  const respuesta = await api.delete('/api/perfil');
  return respuesta.data;
};

export const obtenerActividadPerfil = async (limite = 20, pagina = 1) => {
  const respuesta = await api.get('/api/perfil/actividad', {
    params: { limite, pagina },
  });
  return respuesta.data;
};