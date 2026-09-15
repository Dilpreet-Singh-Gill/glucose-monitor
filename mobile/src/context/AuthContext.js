import { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const AUTH_KEY = 'glucoscan_user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);

  // Check whether a user is already logged in
  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        const stored = await SecureStore.getItemAsync(AUTH_KEY);

        if (stored) {
          const parsedUser = JSON.parse(stored);
          setUser(parsedUser);
        }
      } catch (error) {
        console.log('Stored user loading error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadStoredUser();
  }, []);

  const login = async (email) => {
    setLoginLoading(true);

    try {
      const userData = {
        email: email.trim(),
      };

      // Update app state immediately
      setUser(userData);

      // Save user for future app launches
      await SecureStore.setItemAsync(
        AUTH_KEY,
        JSON.stringify(userData)
      );

      console.log('Login successful:', userData);
    } catch (error) {
      console.log('Login error:', error);
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync(AUTH_KEY);
    } catch (error) {
      console.log('Logout storage error:', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        loginLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);