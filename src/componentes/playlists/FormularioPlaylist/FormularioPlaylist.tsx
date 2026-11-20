import React, { useState } from 'react';
import './FormularioPlaylist.css';

interface FormularioPlaylistProps {
  onSubmit: (datos: { nombre: string; descripcion: string }) => Promise<void>;
  onCancel: () => void;
}

const FormularioPlaylist: React.FC<FormularioPlaylistProps> = ({ onSubmit, onCancel }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    
    setLoading(true);
    try {
      await onSubmit({ nombre, descripcion });
      setNombre('');
      setDescripcion('');
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="formulario-playlist" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="nombre">Nombre de la Colección</label>
        <input
          id="nombre"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej. Rock Clásico, Para estudiar..."
          required
          autoFocus
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="descripcion">Descripción (Opcional)</label>
        <textarea
          id="descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Añade un resumen de tu lista..."
          rows={3}
        />
      </div>

      <div className="form-actions">
        <button 
          type="button" 
          className="btn-cancelar" 
          onClick={onCancel} 
          disabled={loading}
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="btn-crear" 
          disabled={!nombre.trim() || loading}
        >
          {loading ? 'Creando...' : 'Crear Colección'}
        </button>
      </div>
    </form>
  );
};

export default FormularioPlaylist;