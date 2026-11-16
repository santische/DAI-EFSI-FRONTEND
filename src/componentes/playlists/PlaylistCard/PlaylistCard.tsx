import React from 'react';
import { Link } from 'react-router-dom';
import { Coleccion } from '../../../interfaces/interfaz';
import './PlaylistCard.css';

interface PlaylistCardProps {
  playlist: Coleccion;
  varianteColor?: number; // 1 = lila, 2 = amarillo, 3 = rosa
  compacta?: boolean;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({
  playlist,
  varianteColor = 1,
  compacta = false
}) => {
  return (
    <Link
      to={`/playlist/${playlist.id}`}
      className={`playlist-card variante-${varianteColor} ${compacta ? 'compacta' : ''}`}
    >
      <span className="playlist-card-nombre">{playlist.nombre}</span>
      {!compacta && playlist.descripcion && (
        <p className="playlist-card-descripcion">{playlist.descripcion}</p>
      )}
      {!compacta && typeof playlist.cantidad_canciones === 'number' && (
        <span className="playlist-card-contador">
          {playlist.cantidad_canciones} {playlist.cantidad_canciones === 1 ? 'canción' : 'canciones'}
        </span>
      )}
    </Link>
  );
};

export default PlaylistCard;