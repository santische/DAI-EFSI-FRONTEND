import React, { createContext, useContext, useState, ReactNode } from 'react';

const UserContext = createContext<any>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>({ name: 'Usuario Demo' });
  const [loading, setLoading] = useState(false);

  return (
    <UserContext.Provider value={{ user, loading, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);