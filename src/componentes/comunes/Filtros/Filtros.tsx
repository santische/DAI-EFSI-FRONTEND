import React from 'react';
import './Filtros.css';

interface FiltrosProps {
  opciones: string[];
  activo: string;
  onSelect: (opcion: string) => void;
}

const Filtros: React.FC<FiltrosProps> = ({ opciones, activo, onSelect }) => {
  return (
    <div className="filtros-container">
      {opciones.map((opcion) => (
        <button
          key={opcion}
          type="button"
          className={`filtro-pill ${activo === opcion ? 'activo' : ''}`}
          onClick={() => onSelect(opcion)}
        >
          {opcion}
        </button>
      ))}
    </div>
  );
};

export default Filtros;