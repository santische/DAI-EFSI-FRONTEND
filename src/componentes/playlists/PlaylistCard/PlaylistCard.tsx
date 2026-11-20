import React from 'react';
import { Link } from 'react-router-dom';
import { Coleccion } from '../../../interfaces/interfaz';
import './PlaylistCard.css';

interface PlaylistCardProps {
  playlist: Coleccion & { total_canciones?: number };
  varianteColor?: number;
  compacta?: boolean;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({
  playlist,
  varianteColor = 1,
  compacta = false
}) => {
  const cantidad = playlist.cantidad_canciones ?? playlist.total_canciones;

  return (
    <Link
      to={`/playlist/${playlist.id}`}
      className={`playlist-card variante-${varianteColor} ${compacta ? 'compacta' : ''}`}
    >
      <span className="playlist-card-nombre">{playlist.nombre}</span>
      {!compacta && playlist.descripcion && (
        <p className="playlist-card-descripcion">{playlist.descripcion}</p>
      )}
      {!compacta && typeof cantidad === 'number' && (
        <span className="playlist-card-contador">
          {cantidad} {cantidad === 1 ? 'canción' : 'canciones'}
        </span>
      )}
    </Link>
  );
};

export default PlaylistCard;