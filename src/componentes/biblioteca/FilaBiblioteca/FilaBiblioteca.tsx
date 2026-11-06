import React from 'react';
import BotonFavorito from '../BotonFavorito/BotonFavorito';
import SelectorEstado, { EstadoBibliotecaBD } from '../SelectorEstado/SelectorEstado';
import './FilaBiblioteca.css';

// DTO Combinado para la UI basado en las tablas: biblioteca, canciones, artistas, puntuaciones
export interface ItemBiblioteca {
  cancion_id: number;
  titulo: string;
  artista: string;
  estado: EstadoBibliotecaBD;
  es_favorita: boolean;
  puntuacion: number | null; // NULL si no hay registro en tabla puntuaciones
  colorUI?: string; // Dato auxiliar para el Figma (avatar)
}

interface FilaBibliotecaProps {
  item: ItemBiblioteca;
  onCambiarEstado: (id: number, estado: EstadoBibliotecaBD) => void;
  onToggleFavorito: (id: number) => void;
  onAbrirOpciones: (item: ItemBiblioteca) => void;
}

const FilaBiblioteca: React.FC<FilaBibliotecaProps> = ({ 
  item, 
  onCambiarEstado, 
  onToggleFavorito,
  onAbrirOpciones 
}) => {
  const inicial = item.titulo ? item.titulo.charAt(0).toUpperCase() : '?';
  const estrellas = [1, 2, 3, 4, 5];

  return (
    <tr className="fila-biblioteca">
      <td className="celda-cancion">
        <div className="avatar-cancion" style={{ backgroundColor: item.colorUI || 'var(--gris)' }}>
          {inicial}
        </div>
        <span className="titulo-cancion">{item.titulo}</span>
      </td>
      <td className="celda-artista">{item.artista}</td>
      <td className="celda-estado">
        <SelectorEstado 
          estado={item.estado} 
          onChange={(nuevo) => onCambiarEstado(item.cancion_id, nuevo)} 
        />
      </td>
      <td className="celda-puntuacion">
        {item.puntuacion ? (
          <div className="estrellas">
            {estrellas.map((num) => (
              <span key={num} className={num <= item.puntuacion! ? 'estrella-llena' : 'estrella-vacia'}>
                ★
              </span>
            ))}
          </div>
        ) : (
          <span className="sin-puntuacion">—</span>
        )}
      </td>
      <td className="celda-favorito">
        <BotonFavorito 
          esFavorita={item.es_favorita} 
          onToggle={() => onToggleFavorito(item.cancion_id)} 
        />
      </td>
      <td className="celda-opciones">
        <button className="btn-opciones" onClick={() => onAbrirOpciones(item)}>•••</button>
      </td>
    </tr>
  );
};

export default FilaBiblioteca;