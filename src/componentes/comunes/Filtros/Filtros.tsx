import React from 'react';
import './Filtros.css';

interface FiltrosProps {
  opciones: string[];
  activo: string;
  onSelect: (opcion: string) => void;
}

const Filtros: React.FC<FiltrosProps> = ({ opciones, activo, onSelect }) => (
  <div className="contenedor-filtros">
    {opciones.map(op => (
      <button 
        key={op} 
        className={`btn-filtro ${activo === op ? 'activo' : ''}`}
        onClick={() => onSelect(op)}
      >
        {op}
      </button>
    ))}
  </div>
);
export default Filtros;