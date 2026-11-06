import React, { ChangeEvent, FormEvent } from 'react';
import './Buscador.css';

interface BuscadorProps {
  valor: string;
  onCambio: (nuevoValor: string) => void;
  onBuscar?: () => void;
  placeholder?: string;
}

export const Buscador: React.FC<BuscadorProps> = ({
  valor,
  onCambio,
  onBuscar,
  placeholder = 'Buscar canciones, artistas o álbumes...'
}) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onCambio(e.target.value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (onBuscar) {
      onBuscar();
    }
  };

  const handleLimpiar = () => {
    onCambio('');
  };

  return (
    <form className="buscador-form" onSubmit={handleSubmit}>
      <div className="buscador-input-wrapper">
        <span className="buscador-icono">🔍</span>
        <input
          type="text"
          className="buscador-input"
          value={valor}
          onChange={handleChange}
          placeholder={placeholder}
        />
        {valor && (
          <button
            type="button"
            className="buscador-btn-limpiar"
            onClick={handleLimpiar}
            aria-label="Limpiar búsqueda"
          >
            ✕
          </button>
        )}
      </div>
      {onBuscar && (
        <button type="submit" className="buscador-btn-submit">
          Buscar
        </button>
      )}
    </form>
  );
};

export default Buscador;