import React, { useState } from 'react';
import './FormularioReseña.css';

interface Props {
  reseñaActual: string | null; // BD: tabla reseñas, columna texto
  onSubmit: (texto: string) => void;
}

const FormularioReseña: React.FC<Props> = ({ reseñaActual, onSubmit }) => {
  const [texto, setTexto] = useState(reseñaActual || '');

  return (
    <div className="formulario-reseña">
      <textarea
        placeholder="Escribe tu opinión sobre esta canción..."
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={4}
      />
      <button 
        className="btn-guardar-reseña" 
        onClick={() => onSubmit(texto)}
        disabled={texto.trim().length === 0}
      >
        Guardar Reseña
      </button>
    </div>
  );
};

export default FormularioReseña;