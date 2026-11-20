import React, { useState, useEffect, useCallback } from 'react';
import Buscador from '../../componentes/comunes/Buscador/Buscador';
import Filtros from '../../componentes/comunes/Filtros/Filtros';
import Modal from '../../componentes/comunes/Modal/Modal';
import FilaBiblioteca, { ItemBiblioteca } from '../../componentes/biblioteca/FilaBiblioteca/FilaBiblioteca';
import { EstadoBibliotecaBD } from '../../componentes/biblioteca/SelectorEstado/SelectorEstado';
import FormularioPuntuacion from '../../componentes/biblioteca/FormularioPuntuacion/FormularioPuntuacion';
import FormularioReseña from '../../componentes/biblioteca/FormularioReseña/FormularioReseña';
import { Loading } from '../../componentes/comunes/Loading/Loading';
import { MensajeError } from '../../componentes/comunes/MensajeError/MensajeError';
import * as bibliotecaService from '../../services/bibliotecaService';
import * as musicaService from '../../services/musicaService';
import './Biblioteca.css';

const Biblioteca: React.FC = () => {
  // Estado principal desde la BD
  const [canciones, setCanciones] = useState<ItemBiblioteca[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de control de la UI
  const [busqueda, setBusqueda] = useState<string>('');
  const [filtroActivo, setFiltroActivo] = useState<string>('Todos');
  const [itemSeleccionado, setItemSeleccionado] = useState<ItemBiblioteca | null>(null);

  // Estados del modal "Agregar contenido"
  const [modalAgregarAbierto, setModalAgregarAbierto] = useState<boolean>(false);
  const [busquedaCatalogo, setBusquedaCatalogo] = useState<string>('');
  const [resultadosCatalogo, setResultadosCatalogo] = useState<any[]>([]);
  const [buscandoCatalogo, setBuscandoCatalogo] = useState<boolean>(false);
  const [agregandoId, setAgregandoId] = useState<string | number | null>(null);

  const opcionesFiltro = ['Todos', 'Quiero escuchar', 'Escuchando', 'Escuchado', 'Favoritos'];

  // Carga inicial desde GET /api/biblioteca
  const cargarBiblioteca = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);

      const res = await bibliotecaService.obtenerBiblioteca();
      const listaCruda = Array.isArray(res) ? res : res?.items ?? res?.biblioteca ?? [];

      const datosNormalizados: ItemBiblioteca[] = listaCruda.map((item: any) => ({
        ...item,
        cancion_id: item.cancion_id ?? item.id,
        titulo: item.titulo ?? item.cancion?.titulo ?? 'Sin título',
        artista:
          item.artista ??
          (Array.isArray(item.artistas) && item.artistas.length > 0
            ? item.artistas.map((a: any) => a.nombre ?? a).join(', ')
            : item.cancion?.artista ?? 'Artista desconocido'),
        estado: item.estado ?? 'quiero_escuchar',
        es_favorita: Boolean(item.es_favorita),
        puntuacion: item.puntuacion ?? null,
      }));

      setCanciones(datosNormalizados);
    } catch (err: any) {
      setError(err.response?.data?.mensaje || err.message || 'Error al obtener los datos de la biblioteca');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarBiblioteca();
  }, [cargarBiblioteca]);

  // Actualizar estado de escucha (PUT /api/biblioteca)
  const handleCambiarEstado = async (id: number, nuevoEstado: EstadoBibliotecaBD) => {
    const estadoAnterior = canciones.find(c => c.cancion_id === id)?.estado;

    setCanciones(prev =>
      prev.map(c => (c.cancion_id === id ? { ...c, estado: nuevoEstado } : c))
    );

    try {
      await bibliotecaService.cambiarEstado(id, nuevoEstado);
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      if (estadoAnterior) {
        setCanciones(prev =>
          prev.map(c => (c.cancion_id === id ? { ...c, estado: estadoAnterior } : c))
        );
      }
    }
  };

  // Alternar favorita (PATCH /api/biblioteca/:cancionId/favorita)
  const handleToggleFavorito = async (id: number) => {
    setCanciones(prev =>
      prev.map(c => (c.cancion_id === id ? { ...c, es_favorita: !c.es_favorita } : c))
    );

    try {
      await bibliotecaService.toggleFavorito(id);
    } catch (err) {
      console.error('Error al actualizar favorito:', err);
      setCanciones(prev =>
        prev.map(c => (c.cancion_id === id ? { ...c, es_favorita: !c.es_favorita } : c))
      );
    }
  };

  // Guardar puntuación (POST /api/puntuaciones)
  const guardarPuntuacion = async (valor: number) => {
    if (!itemSeleccionado) return;
    const cancionId = itemSeleccionado.cancion_id;

    try {
      await musicaService.puntuarCancion(cancionId, valor);
      setCanciones(prev =>
        prev.map(c => (c.cancion_id === cancionId ? { ...c, puntuacion: valor } : c))
      );
      setItemSeleccionado(null);
    } catch (err) {
      console.error('Error al guardar puntuación:', err);
    }
  };

  // Guardar reseña (POST /api/resenas)
  const guardarReseña = async (texto: string) => {
    if (!itemSeleccionado) return;
    const cancionId = itemSeleccionado.cancion_id;

    try {
      await musicaService.guardarResena(cancionId, texto);
      setCanciones(prev =>
        prev.map(c => (c.cancion_id === cancionId ? { ...c, resena: texto } : c))
      );
      setItemSeleccionado(null);
    } catch (err) {
      console.error('Error al guardar reseña:', err);
    }
  };

  // Buscar canciones en catálogo / Last.fm (GET /api/musica)
  const handleBuscarCatalogo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!busquedaCatalogo.trim()) return;

    try {
      setBuscandoCatalogo(true);
      const res = await musicaService.buscarMusica(busquedaCatalogo.trim(), { limite: 10 });
      const lista = Array.isArray(res)
        ? res
        : res?.items ?? res?.canciones ?? res?.resultados ?? [];
      setResultadosCatalogo(lista);
    } catch (err) {
      console.error('Error al buscar en catálogo:', err);
      setResultadosCatalogo([]);
    } finally {
      setBuscandoCatalogo(false);
    }
  };

  // Agregar canción elegida desde el modal (POST /api/biblioteca)
  const handleAgregarCancion = async (cancion: any) => {
    const clave = cancion.id ?? cancion.mbid ?? `${cancion.titulo}-${cancion.artista}`;
    try {
      setAgregandoId(clave);

      const nombreArtista =
        cancion.artista ??
        (Array.isArray(cancion.artistas) && cancion.artistas.length > 0
          ? cancion.artistas.map((a: any) => a.nombre ?? a).join(', ')
          : '');

      const payload = cancion.id
        ? { cancionId: cancion.id, estado: 'quiero_escuchar' }
        : {
            titulo: cancion.titulo,
            artista: nombreArtista,
            ...(cancion.mbid ? { mbid: cancion.mbid } : {}),
            estado: 'quiero_escuchar',
          };

      await bibliotecaService.agregarABiblioteca(payload);
      await cargarBiblioteca();
      setModalAgregarAbierto(false);
      setBusquedaCatalogo('');
      setResultadosCatalogo([]);
    } catch (err) {
      console.error('Error al agregar a biblioteca:', err);
    } finally {
      setAgregandoId(null);
    }
  };

  // Filtrado de canciones en pantalla
  const cancionesFiltradas = canciones.filter(item => {
    const coincideBusqueda =
      item.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.artista.toLowerCase().includes(busqueda.toLowerCase());
    if (!coincideBusqueda) return false;

    if (filtroActivo === 'Todos') return true;
    if (filtroActivo === 'Favoritos') return item.es_favorita;
    if (filtroActivo === 'Quiero escuchar') return item.estado === 'quiero_escuchar';
    if (filtroActivo === 'Escuchando') return item.estado === 'escuchando';
    if (filtroActivo === 'Escuchado') return item.estado === 'escuchado';

    return true;
  });

  return (
    <div className="biblioteca-page">
      <header className="biblioteca-header">
        <div className="textos-header">
          <h1>Mi biblioteca</h1>
          <p>Administrá estados, favoritos, puntuaciones, reseñas y filtros.</p>
        </div>
        <button
          type="button"
          className="btn-agregar-contenido"
          onClick={() => setModalAgregarAbierto(true)}
        >
          Agregar contenido
        </button>
      </header>

      <div className="biblioteca-controles">
        <Buscador valor={busqueda} onChange={setBusqueda} placeholder="Filtrar canciones guardadas..." />
        <div className="seccion-filtros">
          <span className="label-filtros">ESTADO</span>
          <Filtros opciones={opcionesFiltro} activo={filtroActivo} onSelect={setFiltroActivo} />
        </div>
      </div>

      <div className="tabla-contenedor">
        {cargando ? (
          <Loading />
        ) : error ? (
          <MensajeError mensaje={error} />
        ) : (
          <table className="tabla-biblioteca">
            <thead>
              <tr>
                <th>CANCIÓN</th>
                <th>ARTISTA</th>
                <th>ESTADO</th>
                <th>PUNTUACIÓN</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cancionesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--gris)', padding: '24px' }}>
                    No se encontraron canciones en tu biblioteca.
                  </td>
                </tr>
              ) : (
                cancionesFiltradas.map(item => (
                  <FilaBiblioteca
                    key={item.cancion_id}
                    item={item}
                    onCambiarEstado={handleCambiarEstado}
                    onToggleFavorito={handleToggleFavorito}
                    onAbrirOpciones={setItemSeleccionado}
                  />
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de puntuación y reseña */}
      <Modal
        isOpen={!!itemSeleccionado}
        onClose={() => setItemSeleccionado(null)}
        titulo={`Opciones para ${itemSeleccionado?.titulo || ''}`}
      >
        <div className="modal-secciones">
          <h4>Puntuación</h4>
          <FormularioPuntuacion
            puntuacionActual={itemSeleccionado?.puntuacion || null}
            onSubmit={guardarPuntuacion}
          />
          <hr style={{ borderColor: 'var(--borde)', margin: '20px 0' }} />
          <h4>Reseña</h4>
          <FormularioReseña
            reseñaActual={(itemSeleccionado as any)?.resena || ''}
            onSubmit={guardarReseña}
          />
        </div>
      </Modal>

      {/* Modal para buscar y agregar canciones desde el catálogo */}
      <Modal
        isOpen={modalAgregarAbierto}
        onClose={() => setModalAgregarAbierto(false)}
        titulo="Agregar canción a tu biblioteca"
      >
        <div className="modal-secciones">
          <form onSubmit={handleBuscarCatalogo} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <input
              type="text"
              value={busquedaCatalogo}
              onChange={(e) => setBusquedaCatalogo(e.target.value)}
              placeholder="Buscar canción o artista..."
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid var(--borde)',
                background: 'var(--fondo-input, #18181c)',
                color: 'inherit',
              }}
            />
            <button type="submit" className="btn-agregar-contenido" disabled={buscandoCatalogo}>
              {buscandoCatalogo ? 'Buscando...' : 'Buscar'}
            </button>
          </form>

          {resultadosCatalogo.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '320px', overflowY: 'auto' }}>
              {resultadosCatalogo.map((c: any, idx: number) => {
                const clave = c.id ?? c.mbid ?? `${c.titulo}-${idx}`;
                const artistaNombre =
                  c.artista ??
                  (Array.isArray(c.artistas) ? c.artistas.map((a: any) => a.nombre ?? a).join(', ') : '');

                return (
                  <div
                    key={clave}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid var(--borde)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{c.titulo}</div>
                      <div style={{ fontSize: '13px', color: 'var(--gris)' }}>{artistaNombre}</div>
                    </div>
                    <button
                      type="button"
                      className="btn-agregar-contenido"
                      disabled={agregandoId === clave}
                      onClick={() => handleAgregarCancion(c)}
                    >
                      {agregandoId === clave ? 'Agregando...' : '+ Agregar'}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            !buscandoCatalogo && (
              <p style={{ color: 'var(--gris)', fontSize: '14px', textAlign: 'center', margin: '12px 0' }}>
                Buscá una canción por título o artista para guardarla en tu biblioteca.
              </p>
            )
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Biblioteca;