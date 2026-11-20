import React from 'react';
import CancionCard from '../CancionCard/CancionCard';
import { Cancion } from '../../../interfaces/interfaz';
import './ListaCanciones.css';

interface ListaCancionesProps {
  canciones: Cancion[];
  onToggleFavorito?: (cancionId: number) => void;
  compacta?: boolean;
  mensajeVacio?: string;
}

const ListaCanciones: React.FC<ListaCancionesProps> = ({
  canciones,
  onToggleFavorito,
  compacta = false,
  mensajeVacio = 'No hay canciones para mostrar.'
}) => {
  if (!canciones || canciones.length === 0) {
    return <p className="lista-canciones-vacia">{mensajeVacio}</p>;
  }

  return (
    <div className={`lista-canciones ${compacta ? 'compacta' : ''}`}>
      {canciones.map((cancion, index) => {
        // Si el ítem viene de /api/biblioteca, el ID de la canción llega en cancion_id
        const cancionNormalizada: Cancion = {
          ...cancion,
          id: (cancion as Cancion & { cancion_id?: number }).cancion_id ?? cancion.id
        };

        return (
          <CancionCard
            key={cancionNormalizada.id}
            cancion={cancionNormalizada}
            indiceColor={index}
            compacta={compacta}
            onToggleFavorito={onToggleFavorito}
          />
        );
      })}
    </div>
  );
};

export default ListaCanciones;