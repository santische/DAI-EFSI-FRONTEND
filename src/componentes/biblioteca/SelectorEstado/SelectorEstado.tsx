import React from 'react';
import './SelectorEstado.css';

export type EstadoBibliotecaBD = 'quiero_escuchar' | 'escuchando' | 'escuchado';

interface SelectorEstadoProps {
  estado: EstadoBibliotecaBD;
  onChange: (nuevoEstado: EstadoBibliotecaBD) => void;
}

const SelectorEstado: React.FC<SelectorEstadoProps> = ({ estado, onChange }) => {
  const formatearEstado = (est: EstadoBibliotecaBD) => {
    switch (est) {
      case 'quiero_escuchar': return 'Quiero escuchar';
      case 'escuchando': return 'Escuchando';
      case 'escuchado': return 'Escuchado';
      default: return est;
    }
  };

  return (
    <select 
      className={`selector-estado estado-${estado}`}
      value={estado}
      onChange={(e) => onChange(e.target.value as EstadoBibliotecaBD)}
    >
      <option value="quiero_escuchar">Quiero escuchar</option>
      <option value="escuchando">Escuchando</option>
      <option value="escuchado">Escuchado</option>
    </select>
  );
};

export default SelectorEstado;