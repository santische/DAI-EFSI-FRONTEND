import React from 'react';
import './MensajeError.css';

interface MensajeErrorProps {
  mensaje?: string;
  titulo?: string;
  onReintentar?: () => void;
}

const MensajeError: React.FC<MensajeErrorProps> = ({
  mensaje = 'Ocurrió un error al cargar la información.',
  titulo = 'Algo salió mal',
  onReintentar
}) => {
  return (
    <div className="error-contenedor" role="alert">
      <div className="error-icono">⚠️</div>
      <div className="error-contenido">
        <h4 className="error-titulo">{titulo}</h4>
        <p className="error-texto">{mensaje}</p>
        {onReintentar && (
          <button type="button" className="error-btn-reintentar" onClick={onReintentar}>
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
};

export default MensajeError;