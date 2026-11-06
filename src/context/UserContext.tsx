import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { obtenerUsuario, iniciarSesion, registrarUsuario, cerrarSesion } from '../services/authService';


export interface Usuario {
  id: number;
  username: string;
  email: string;
  nombre?: string;
  foto?: string;
  bio?: string;
  preferencias?: Record<string, unknown>;
}

interface UserContextType {
  user: Usuario | null;
  loading: boolean;
  loginUser: (datos: { email: string; password: string }) => Promise<void>;
  registrarUser: (datos: Record<string, string>) => Promise<void>;
  logoutUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const comprobarSesion = async () => {
      try {
        const res = await obtenerUsuario();
        if (res.ok && res.usuario) {
          setUser(res.usuario);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    comprobarSesion();
  }, []);

  const loginUser = async (datos: { email: string; password: string }) => {
    const res = await iniciarSesion(datos);
    if (res.ok && res.usuario) {
      setUser(res.usuario);
    }
  };

  const registrarUser = async (datos: Record<string, string>) => {
    await registrarUsuario(datos);
  };

  const logoutUser = async () => {
    await cerrarSesion();
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, loading, loginUser, registrarUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser debe utilizarse dentro de un UserProvider');
  }
  return context;
};