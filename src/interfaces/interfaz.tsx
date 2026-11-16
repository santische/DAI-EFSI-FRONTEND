// ==========================================
// TIPOS AUXILIARES (RESTRICCIONES CHECK BD)
// ==========================================

export type EstadoBiblioteca = 'quiero_escuchar' | 'escuchando' | 'escuchado';

export type TipoActividad =
  | 'escucho'
  | 'reproduccion'
  | 'agregar_biblioteca'
  | 'cambiar_estado'
  | 'marcar_favorito'
  | 'quitar_favorito'
  | 'puntuar'
  | 'crear_resena'
  | 'editar_resena'
  | 'crear_coleccion'
  | 'agregar_a_coleccion';

// ==========================================
// TABLAS DE USUARIOS Y PERFILES
// ==========================================

export interface Usuario {
  id: number;
  password?: string;
  activo: boolean;
  username: string;
  email: string;
}

export interface PreferenciasPerfil {
  generos_favoritos?: string[];
  tema?: string;
  [key: string]: unknown;
}

export interface Perfil {
  usuario_id: number;
  nombre: string;
  foto?: string | null;
  bio?: string | null;
  preferencias?: PreferenciasPerfil | null;
}

export interface UsuarioConPerfil extends Usuario {
  nombre: string;
  foto?: string | null;
  bio?: string | null;
  preferencias?: PreferenciasPerfil | null;
}

// ==========================================
// TABLAS DE CATÁLOGO MUSICAL
// ==========================================

export interface Artista {
  id: number;
  nombre: string;
  foto?: string | null;
  external_id: number;
}

export interface Album {
  id: number;
  titulo: string;
  foto?: string | null;
  fecha_lanzamiento?: string | null;
  external_id: number;
}

export interface Genero {
  id: number;
  nombre: string;
}

export interface Cancion {
  id: number;
  titulo: string;
  album_id?: number | null;
  duracion: number; // en segundos
  foto?: string | null;
  fecha_lanzamiento?: string | null;
  external_id: number;
  // Propiedades opcionales cuando el backend devuelve relaciones (JOIN)
  artistas: Artista[];
  album?: Album | null;
  generos?: Genero[];
  es_favorita?: boolean;
  estado?: EstadoBiblioteca;
  preview_url?: string | null;
}

export interface CancionArtista {
  id: number;
  cancion_id: number;
  artista_id: number;
}

export interface CancionGenero {
  cancion_id: number;
  genero_id: number;
}

// ==========================================
// TABLAS DE BIBLIOTECA Y COLECCIONES
// ==========================================

export interface Biblioteca {
  id: number;
  estado: EstadoBiblioteca;
  es_favorita: boolean;
  fecha_agregado?: string | null;
  fecha_actualizacion?: string | null;
  usuario_id: number;
  cancion_id: number;
  cancion?: Cancion;
}

export interface Coleccion {
  id: number;
  usuario_id: number;
  nombre: string;
  descripcion?: string | null;
  fecha_creacion?: string | null;
  fecha_actualizacion?: string | null;
  // Propiedades opcionales calculadas o incluidas por la API
  canciones?: Cancion[];
  cantidad_canciones?: number;
}

export interface ColeccionCancion {
  coleccion_id: number;
  cancion_id: number;
  fecha_agregado?: string | null;
  posicion?: number | null;
  cancion?: Cancion;
}

// ==========================================
// TABLAS DE INTERACCIÓN Y ACTIVIDAD
// ==========================================

export interface Puntuacion {
  id: number;
  valor: number; // 1 a 5 (chk_puntuaciones_valor)
  fecha_creacion?: string | null;
  fecha_actualizacion?: string | null;
  usuario_id: number;
  cancion_id: number;
}

export interface Resena {
  id: number;
  texto: string;
  fecha_creacion?: string | null;
  fecha_actualizacion?: string | null;
  usuario_id: number;
  cancion_id: number;
}

export interface Reproduccion {
  id: number;
  usuario_id: number;
  cancion_id: number;
  fecha_inicio?: string | null;
  segundos_escuchados: number;
  completada: boolean;
  fuente?: string | null;
}

export interface Actividad {
  id: number;
  usuario_id: number;
  tipo?: TipoActividad | string | null;
  cancion_id?: number | null;
  coleccion_id?: number | null;
  detalles?: Record<string, any> | null;
  fecha?: string | null;
  // Campos opcionales resueltos por JOIN en la consulta de actividad reciente
  cancion_titulo?: string | null;
  coleccion_nombre?: string | null;
}

// ==========================================
// INTERFACES DE RESPUESTA PARA HOME / STATS
// ==========================================

export interface ResumenEstadisticas {
  minutos_escuchados: number;
  reproducciones: number;
  artistas_escuchados: number;
}

export interface DatosHome extends ResumenEstadisticas {
  favoritos: Cancion[];
  actividad_reciente: Actividad[];
  colecciones: Coleccion[];
}