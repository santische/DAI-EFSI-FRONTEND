import React from 'react';
export const MensajeError: React.FC<{mensaje: string}> = ({mensaje}) => <div style={{color: '#ff6b6b', padding: '20px'}}>Error: {mensaje}</div>;