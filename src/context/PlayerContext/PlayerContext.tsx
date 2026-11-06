import React, { createContext, useContext } from 'react';

const PlayerContext = createContext<any>(null);

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  return <PlayerContext.Provider value={{}}>{children}</PlayerContext.Provider>;
};

export const usePlayer = () => useContext(PlayerContext);