import React from 'react';
import './Loading.css';

interface LoadingProps {
  mensaje?: string;
  mini?: boolean; // Para usar dentro de botones o tarjetas pequeñas
}

const Loading: React.FC<LoadingProps> = ({ mensaje, mini = false }) => {
  if (mini) {
    return (
      <div className="loading-mini" role="status" aria-label="Cargando">
        <span className="spinner-mini"></span>
      </div>
    );
  }

  return (
    <div className="loading-contenedor" role="status">
      <div className="loading-ecualizador">
        <span className="barra b1"></span>
        <span className="barra b2"></span>
        <span className="barra b3"></span>
        <span className="barra b4"></span>
      </div>
      {mensaje && <p className="loading-texto">{mensaje}</p>}
    </div>
  );
};

export default Loading;