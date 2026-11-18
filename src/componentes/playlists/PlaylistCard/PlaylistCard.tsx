import React from 'react';
import { Link } from 'react-router-dom';
import './PlaylistCard.css';

export interface Playlist {
  id: number;
  nombre: string;
  descripcion?: string;
  fecha_creacion: string;
  cantidad_canciones?: number; 
}

interface PlaylistCardProps {
  playlist: Playlist;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist }) => {
  const inicial = playlist.nombre.charAt(0).toUpperCase();

  return (
    <Link to={`/playlist/${playlist.id}`} className="playlist-card">
      <div className="playlist-cover">
        <span>{inicial}</span>
      </div>
      <div className="playlist-info">
        <h3>{playlist.nombre}</h3>
        {playlist.descripcion && <p className="playlist-desc">{playlist.descripcion}</p>}
        <span className="playlist-meta">
          {playlist.cantidad_canciones !== undefined 
            ? `${playlist.cantidad_canciones} canciones` 
            : 'Colección'}
        </span>
      </div>
    </Link>
  );
};

export default PlaylistCard;