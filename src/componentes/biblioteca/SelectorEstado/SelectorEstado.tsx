import React, { useState, useRef, useEffect } from 'react';
import './SelectorEstado.css';

export type EstadoBibliotecaBD = 'quiero_escuchar' | 'escuchando' | 'escuchado';

interface SelectorEstadoProps {
  estado: EstadoBibliotecaBD;
  onChange: (nuevoEstado: EstadoBibliotecaBD) => void;
  disabled?: boolean;
}

const OPCIONES_ESTADO: { valor: EstadoBibliotecaBD; etiqueta: string }[] = [
  { valor: 'quiero_escuchar', etiqueta: 'Quiero escuchar' },
  { valor: 'escuchando', etiqueta: 'Escuchando' },
  { valor: 'escuchado', etiqueta: 'Escuchado' },
];

export const SelectorEstado: React.FC<SelectorEstadoProps> = ({
  estado,
  onChange,
  disabled = false,
}) => {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  const opcionActual =
    OPCIONES_ESTADO.find((op) => op.valor === estado) || OPCIONES_ESTADO[0];

  useEffect(() => {
    const manejarClickAfuera = (e: MouseEvent) => {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(e.target as Node)
      ) {
        setAbierto(false);
      }
    };

    const manejarEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false);
    };

    if (abierto) {
      document.addEventListener('mousedown', manejarClickAfuera);
      document.addEventListener('keydown', manejarEscape);
    }

    return () => {
      document.removeEventListener('mousedown', manejarClickAfuera);
      document.removeEventListener('keydown', manejarEscape);
    };
  }, [abierto]);

  const seleccionar = (nuevoEstado: EstadoBibliotecaBD) => {
    setAbierto(false);
    if (nuevoEstado !== estado) {
      onChange(nuevoEstado);
    }
  };

  return (
    <div className="selector-estado" ref={contenedorRef}>
      <button
        type="button"
        className={`selector-estado-trigger estado-${estado} ${abierto ? 'abierto' : ''}`}
        onClick={() => !disabled && setAbierto((prev) => !prev)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={abierto}
      >
        <span className="selector-estado-texto">{opcionActual.etiqueta}</span>
        <svg
          className="selector-estado-chevron"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {abierto && (
        <ul className="selector-estado-menu" role="listbox">
          {OPCIONES_ESTADO.map((opcion) => {
            const activa = opcion.valor === estado;
            return (
              <li key={opcion.valor} role="option" aria-selected={activa}>
                <button
                  type="button"
                  className={`selector-estado-opcion ${activa ? 'activa' : ''}`}
                  onClick={() => seleccionar(opcion.valor)}
                >
                  <span className={`estado-dot dot-${opcion.valor}`} />
                  <span>{opcion.etiqueta}</span>
                  {activa && <span className="estado-check">✓</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default SelectorEstado;