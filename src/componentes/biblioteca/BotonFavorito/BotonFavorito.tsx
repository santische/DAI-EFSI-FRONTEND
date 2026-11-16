import React from 'react';
import './BotonFavorito.css';

interface BotonFavoritoProps {
  esFavorita: boolean;
  onToggle: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

const BotonFavorito: React.FC<BotonFavoritoProps> = ({
  esFavorita,
  onToggle,
  disabled = false
}) => {
  return (
    <button
      type="button"
      className={`btn-favorito ${esFavorita ? 'activo' : ''}`}
      onClick={(e) => onToggle(e)}
      disabled={disabled}
      aria-label={esFavorita ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      title={esFavorita ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill={esFavorita ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
};

export default BotonFavorito;