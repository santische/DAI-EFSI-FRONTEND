import React from 'react';
import './SelectorEstado.css';

export type EstadoMusica = 'Quiero escuchar' | 'Escuchando' | 'Escuchado' | 'Favorito';

interface SelectorEstadoProps {
  estadoActual: EstadoMusica;
  onChangeEstado?: (nuevoEstado: EstadoMusica) => void;
}

const SelectorEstado: React.FC<SelectorEstadoProps> = ({ estadoActual, onChangeEstado }) => {
  const getClaseEstado = (estado: EstadoMusica) => {
    switch (estado) {
      case 'Escuchado': return 'estado-escuchado';
      case 'Escuchando': return 'estado-escuchando';
      case 'Quiero escuchar': return 'estado-quiero';
      case 'Favorito': return 'estado-favorito';
      default: return '';
    }
  };

  return (
    <select 
      className={`selector-estado ${getClaseEstado(estadoActual)}`}
      value={estadoActual}
      onChange={(e) => onChangeEstado && onChangeEstado(e.target.value as EstadoMusica)}
    >
      <option value="Quiero escuchar">Quiero escuchar</option>
      <option value="Escuchando">Escuchando</option>
      <option value="Escuchado">Escuchado</option>
      <option value="Favorito">Favorito</option>
    </select>
  );
};

export default SelectorEstado;