import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';

import Loading from '../../componentes/comunes/Loading/Loading';
import MensajeError from '../../componentes/comunes/MensajeError/MensajeError';
import { useUser } from '../../context/UserContext/UserContext';
import * as estadisticasService from '../../services/estadisticasService';

import './Estadisticas.css';

interface IndicadoresGenerales {
  segundosTotales: number;
  minutosTotales: number;
  horasTotales: number;
  totalReproducciones: number;
  cancionesUnicas: number;
  reproduccionesCompletadas: number;
  tasaExploracion: number;
  rachaActualDias: number;
  rachaMaximaDias: number;
}

interface TopArtista {
  id: number;
  nombre: string;
  foto?: string | null;
  reproducciones: number;
  segundos_escuchados: number;
}

interface TopCancion {
  id: number;
  titulo: string;
  foto?: string | null;
  artista?: string;
  artistas?: { id: number; nombre: string }[];
  reproducciones: number;
  segundos_escuchados: number;
}

interface TopGenero {
  id: number;
  nombre: string;
  reproducciones: number;
}

interface MesEscucha {
  mes: string;
  minutos: number;
}

interface EstadisticasAPI {
  indicadoresGenerales: IndicadoresGenerales;
  topArtistas: TopArtista[];
  topCanciones: TopCancion[];
  topGeneros: TopGenero[];
  escuchaMensual?: MesEscucha[];
}

const MESES_CORTOS = [
  'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
  'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC',
];

const INDICADORES_VACIOS: IndicadoresGenerales = {
  segundosTotales: 0,
  minutosTotales: 0,
  horasTotales: 0,
  totalReproducciones: 0,
  cancionesUnicas: 0,
  reproduccionesCompletadas: 0,
  tasaExploracion: 0,
  rachaActualDias: 0,
  rachaMaximaDias: 0,
};

const capitalizar = (texto: string): string =>
  texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : '';

const Estadisticas: React.FC = () => {
  const { user } = useUser();
  const anioActual = new Date().getFullYear();

  const [anioSeleccionado, setAnioSeleccionado] = useState<number>(anioActual);
  const [datos, setDatos] = useState<EstadisticasAPI | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const aniosDisponibles = useMemo(
    () => [anioActual, anioActual - 1, anioActual - 2],
    [anioActual]
  );

  const cargarEstadisticas = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const respuesta = await estadisticasService.obtenerEstadisticasCompletas(anioSeleccionado);
      setDatos(respuesta?.estadisticas ?? respuesta);
    } catch (err: any) {
      setError(
        err.response?.data?.mensaje || 'No se pudieron cargar tus estadísticas musicales.'
      );
    } finally {
      setCargando(false);
    }
  }, [anioSeleccionado]);

  useEffect(() => {
    if (user) {
      cargarEstadisticas();
    }
  }, [user, cargarEstadisticas]);

  if (cargando) return <Loading mensaje="Calculando tus estadísticas..." />;
  if (error) return <MensajeError mensaje={error} onReintentar={cargarEstadisticas} />;

  const indicadores = datos?.indicadoresGenerales ?? INDICADORES_VACIOS;
  const topArtistas = datos?.topArtistas ?? [];
  const topCanciones = datos?.topCanciones ?? [];
  const topGeneros = datos?.topGeneros ?? [];

  const artistaTop = topArtistas[0]?.nombre || 'Sin datos';
  const cancionTop = topCanciones[0]?.titulo || 'Sin datos';
  const generoTop = topGeneros[0]?.nombre ? capitalizar(topGeneros[0].nombre) : 'Sin datos';
  const artistasEscuchados = topArtistas.length;

  const datosMensuales: MesEscucha[] = MESES_CORTOS.map((etiqueta, idx) => {
    const encontrado = datos?.escuchaMensual?.find(
      (m, mIdx) => m.mes?.toUpperCase() === etiqueta || mIdx === idx
    );
    return {
      mes: etiqueta,
      minutos: encontrado?.minutos ?? 0,
    };
  });

  const maxMinutosMes = Math.max(...datosMensuales.map((m) => m.minutos), 0);
  const maxGeneroRep = Math.max(...topGeneros.map((g) => g.reproducciones), 0);

  return (
    <div className="estadisticas-container">
      {/* Encabezado */}
      <header className="estadisticas-header">
        <div className="estadisticas-header-texto">
          <h1>Estadísticas musicales</h1>
          <p>Indicadores calculados a partir de tu actividad guardada.</p>
        </div>

        <select
          className="estadisticas-select-anio"
          value={anioSeleccionado}
          onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
          aria-label="Seleccionar año"
        >
          {aniosDisponibles.map((anio) => (
            <option key={anio} value={anio}>
              Año {anio}
            </option>
          ))}
        </select>
      </header>

      {/* Grilla de 6 indicadores (KPIs) */}
      <section className="estadisticas-kpis-grid">
        <article className="kpi-card kpi-lila">
          <span className="kpi-valor">
            {indicadores.minutosTotales.toLocaleString('es-AR')}
          </span>
          <span className="kpi-label">minutos escuchados</span>
        </article>

        <article className="kpi-card kpi-amarillo">
          <span className="kpi-valor">
            {indicadores.totalReproducciones.toLocaleString('es-AR')}
          </span>
          <span className="kpi-label">reproducciones</span>
        </article>

        <article className="kpi-card kpi-rosa">
          <span className="kpi-valor">{artistasEscuchados}</span>
          <span className="kpi-label">artistas escuchados</span>
        </article>

        <article className="kpi-card kpi-celeste">
          <span className="kpi-valor">{artistaTop}</span>
          <span className="kpi-label">artista más escuchada</span>
        </article>

        <article className="kpi-card kpi-verde">
          <span className="kpi-valor">{cancionTop}</span>
          <span className="kpi-label">canción más escuchada</span>
        </article>

        <article className="kpi-card kpi-naranja">
          <span className="kpi-valor">{generoTop}</span>
          <span className="kpi-label">género predominante</span>
        </article>
      </section>

      {/* Grilla central: Barras mensuales + Géneros predominantes */}
      <section className="estadisticas-graficos-grid">
        <div className="estadisticas-card grafica-mensual">
          <div className="estadisticas-card-header">
            <h3>Tu escucha mes a mes</h3>
            <p>Minutos escuchados durante {anioSeleccionado}</p>
          </div>

          <div className="barras-mensuales">
            {datosMensuales.map((item) => {
              const porcentaje =
                maxMinutosMes > 0 ? Math.max((item.minutos / maxMinutosMes) * 100, 4) : 4;
              const esMesPico = maxMinutosMes > 0 && item.minutos === maxMinutosMes;

              return (
                <div
                  key={item.mes}
                  className="barra-columna"
                  title={`${item.mes}: ${item.minutos.toLocaleString('es-AR')} min`}
                >
                  <div className="barra-track">
                    <div
                      className={`barra-relleno ${esMesPico ? 'destacada' : ''}`}
                      style={{ height: `${porcentaje}%` }}
                    />
                  </div>
                  <span className="barra-mes">{item.mes}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="estadisticas-card generos-predominantes">
          <div className="estadisticas-card-header">
            <h3>Géneros que predominan</h3>
          </div>

          {topGeneros.length > 0 ? (
            <div className="generos-lista">
              {topGeneros.slice(0, 5).map((genero, idx) => {
                const ancho =
                  maxGeneroRep > 0
                    ? Math.round((genero.reproducciones / maxGeneroRep) * 100)
                    : 0;

                return (
                  <div key={genero.id} className="genero-item">
                    <span className="genero-nombre">{capitalizar(genero.nombre)}</span>
                    <div className="genero-barra-fondo">
                      <div
                        className={`genero-barra-progreso genero-color-${(idx % 5) + 1}`}
                        style={{ width: `${ancho}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="estadisticas-vacio">Todavía no hay géneros registrados.</p>
          )}
        </div>
      </section>

      {/* Ranking inferior: Tus canciones más escuchadas */}
      <section className="estadisticas-card top-canciones-card">
        <div className="estadisticas-card-header">
          <h3>Tus canciones más escuchadas</h3>
        </div>

        {topCanciones.length > 0 ? (
          <div className="top-canciones-lista">
            {topCanciones.map((cancion, index) => {
              const nombreArtista =
                cancion.artista ||
                cancion.artistas?.map((a) => a.nombre).join(', ') ||
                '';

              return (
                <Link
                  key={cancion.id}
                  to={`/cancion/${cancion.id}`}
                  className="top-cancion-fila"
                >
                  <span className="top-cancion-rank">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="top-cancion-titulo">{cancion.titulo}</span>
                  <span className="top-cancion-artista">{nombreArtista}</span>
                  <span className="top-cancion-reproducciones">
                    {cancion.reproducciones}{' '}
                    {cancion.reproducciones === 1 ? 'reproducción' : 'reproducciones'}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="estadisticas-vacio">
            Todavía no registraste reproducciones para armar tu ranking.
          </p>
        )}
      </section>
    </div>
  );
};

export default Estadisticas;