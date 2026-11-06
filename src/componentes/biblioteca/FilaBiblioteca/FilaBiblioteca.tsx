import React from 'react';
import SelectorEstado, { EstadoMusica } from '../SelectorEstado/SelectorEstado';
import BotonFavorito from '../BotonFavorito/BotonFavorito';
import './FilaBiblioteca.css';

export interface CancionItem {
  id: string;
  titulo: string;
  artista: string;
  estado: EstadoMusica;
  puntuacion: number;
  esFavorito: boolean;
  inicial: string;
  colorAvatar: string;
}

interface FilaBibliotecaProps {
  item: CancionItem;
  onCambiarEstado: (id: string, estado: EstadoMusica) => void;
  onToggleFavorito: (id: string) => void;
  onAbrirOpciones: (item: CancionItem) => void;
}

const FilaBiblioteca: React.FC<FilaBibliotecaProps> = ({
  item,
  onCambiarEstado,
  onToggleFavorito,
  onAbrirOpciones,
}) => {
  return (
    <tr className="fila-biblioteca">
      <td className="col-cancion">
        <div className="avatar-cancion" style={{ backgroundColor: item.colorAvatar }}>
          {item.inicial}
        </div>
        <span className="titulo-cancion">{item.titulo}</span>
      </td>
      <td className="col-artista">{item.artista}</td>
      <td className="col-estado">
        <SelectorEstado 
          estadoActual={item.estado} 
          onChangeEstado={(nuevo) => onCambiarEstado(item.id, nuevo)} 
        />
      </td>
      <td className="col-puntuacion">
        {item.puntuacion > 0 ? (
          <span className="estrellas">
            {'★'.repeat(item.puntuacion)}{'☆'.repeat(5 - item.puntuacion)}
          </span>
        ) : (
          <span className="sin-puntuacion">—</span>
        )}
      </td>
      <td className="col-favorito">
        <BotonFavorito 
          esFavorito={item.esFavorito} 
          onToggle={() => onToggleFavorito(item.id)} 
        />
      </td>
      <td className="col-acciones">
        <button className="btn-opciones" onClick={() => onAbrirOpciones(item)}>
          •••
        </button>
      </td>
    </tr>
  );
};

export default FilaBiblioteca;