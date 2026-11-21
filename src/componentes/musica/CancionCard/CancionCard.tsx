import React from 'react';
import { Link } from 'react-router-dom';
import BotonFavorito from '../../biblioteca/BotonFavorito/BotonFavorito';
import { Cancion } from '../../../interfaces/interfaz';
import './CancionCard.css';

interface CancionCardProps {
  cancion: Cancion;
  indiceColor?: number;
  compacta?: boolean;
  onToggleFavorito?: (cancionId: number) => void;
}

const formatearDuracion = (segundos: number): string => {
  const min = Math.floor(segundos / 60);
  const seg = segundos % 60;
  return `${min}:${seg < 10 ? '0' : ''}${seg}`;
};

const CancionCard: React.FC<CancionCardProps> = ({
  cancion,
  indiceColor = 0,
  compacta = false,
  onToggleFavorito,
}) => {
  const idCancion = (cancion as Cancion & { cancion_id?: number }).cancion_id ?? cancion.id;

  const nombresArtistas =
    cancion.artistas && cancion.artistas.length > 0
      ? cancion.artistas.map((a) => a.nombre).join(', ')
      : 'Artista desconocido';

  const clasePlaceholder = `placeholder-color-${(indiceColor % 4) + 1}`;

  return (
    <div className={`cancion-card ${compacta ? 'compacta' : ''}`}>
      <Link to={`/cancion/${idCancion}`} className="cancion-card-link">
        <div className="cancion-portada">
          {cancion.foto ? (
            <img src={cancion.foto} alt={cancion.titulo} />
          ) : (
            <div className={`cancion-portada-placeholder ${clasePlaceholder}`}>
              <span className="placeholder-letra">
                {cancion.titulo.charAt(0).toUpperCase()}
              </span>
              <span className="placeholder-barra" />
            </div>
          )}
        </div>

        <div className="cancion-info">
          <h4 className="cancion-titulo">{cancion.titulo}</h4>
          <p className="cancion-artista">{nombresArtistas}</p>
        </div>
      </Link>

      {!compacta && cancion.duracion > 0 && (
        <span className="cancion-duracion">{formatearDuracion(cancion.duracion)}</span>
      )}

      {onToggleFavorito && (
        <BotonFavorito
          esFavorito={Boolean(cancion.es_favorita)}
          onToggle={() => onToggleFavorito(idCancion)}
        />
      )}
    </div>
  );
};

export default CancionCard;