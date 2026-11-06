import React, { useState } from 'react';
import './FormularioPuntuacion.css';

interface Props {
  puntuacionActual: number | null; // constraint BD: 1 al 5
  onSubmit: (puntuacion: number) => void;
}

const FormularioPuntuacion: React.FC<Props> = ({ puntuacionActual, onSubmit }) => {
  const [valor, setValor] = useState<number>(puntuacionActual || 0);

  return (
    <div className="formulario-puntuacion">
      <div className="selector-estrellas">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            type="button"
            className={num <= valor ? 'estrella-activa' : 'estrella-inactiva'}
            onClick={() => setValor(num)}
          >
            ★
          </button>
        ))}
      </div>
      <button 
        className="btn-guardar-puntuacion" 
        onClick={() => onSubmit(valor)}
        disabled={valor === 0}
      >
        Guardar Puntuación
      </button>
    </div>
  );
};

export default FormularioPuntuacion;