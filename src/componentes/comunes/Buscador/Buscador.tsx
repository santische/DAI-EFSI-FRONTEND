import React from 'react';
import './Buscador.css';

interface BuscadorProps {
  valor: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

const Buscador: React.FC<BuscadorProps> = ({ valor, onChange, placeholder }) => (
  <input 
    type="text" 
    className="input-buscador" 
    placeholder={placeholder || "Buscar..."} 
    value={valor} 
    onChange={(e) => onChange(e.target.value)} 
  />
);
export default Buscador;