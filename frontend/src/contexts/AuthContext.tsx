import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  groups: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasGroup: (group: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          // Configure axios to use the token
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch user profile
          const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/auth/profile`);
          setUser(response.data.user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/auth/login`, {
        username,
        password
      });

      const { token: newToken, user: userData } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
      
      // Configure axios to use the token
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    delete axios.defaults.headers.common['Authorization'];
  };

  const hasGroup = (group: string) => {
    if (!user || !user.groups) return false;
    return user.groups.includes(group);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isAuthenticated, 
      isLoading, 
      login, 
      logout,
      hasGroup
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
