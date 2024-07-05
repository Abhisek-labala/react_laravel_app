// src/contexts/AuthContext.js

import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [tokenStatus, setTokenStatus] = useState('valid'); 

  return (
    <AuthContext.Provider value={{ tokenStatus, setTokenStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
