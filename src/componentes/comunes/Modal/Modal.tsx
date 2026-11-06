import React from 'react';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  titulo: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, titulo, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h3>{titulo}</h3>
          <button className="modal-btn-cerrar" onClick={onClose}>✕</button>
        </header>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;