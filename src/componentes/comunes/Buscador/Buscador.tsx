import React from 'react';
import './Buscador.css';

interface BuscadorProps {
  placeholder?: string;
  valor: string;
  onChange: (nuevoValor: string) => void;
}

const Buscador: React.FC<BuscadorProps> = ({ placeholder = 'Buscar...', valor, onChange }) => {
  return (
    <div className="buscador-container">
      <svg className="buscador-icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="text"
        className="buscador-input"
        placeholder={placeholder}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default Buscador;