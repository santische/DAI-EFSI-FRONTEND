import React from 'react';
import { Link } from 'react-router-dom';
import { Coleccion } from '../../../interfaces/interfaz';
import './PlaylistCard.css';

interface PlaylistCardProps {
  playlist: Coleccion;
  varianteColor?: number;
  compacta?: boolean;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({
  playlist,
  varianteColor,
  compacta = false,
}) => {
  const variante =
    varianteColor ?? ((Number(playlist.id) || 0) % 3) + 1;

  return (
    <Link
      to={`/playlist/${playlist.id}`}
      className={`playlist-card variante-${variante} ${compacta ? 'compacta' : ''}`}
    >
      <div className="playlist-card-top">
        <span className="playlist-card-badge">COLECCIÓN</span>
        <h3 className="playlist-card-nombre">{playlist.nombre}</h3>
        {!compacta && playlist.descripcion && (
          <p className="playlist-card-descripcion">{playlist.descripcion}</p>
        )}
      </div>

      {!compacta && (
        <div className="playlist-card-footer">
          <span className="playlist-card-contador">
            {playlist.cantidad_canciones ?? 0}{' '}
            {(playlist.cantidad_canciones ?? 0) === 1 ? 'canción' : 'canciones'}
          </span>
          <span className="playlist-card-flecha">↗</span>
        </div>
      )}
    </Link>
  );
};

export default PlaylistCard;