import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  role: string;
  // Add other user properties as needed
}

const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
        
        if (accessToken) {
          // Here you would typically validate the token and fetch user data
          // For now, we'll just parse the token if it's a JWT
          try {
            const payload = JSON.parse(atob(accessToken.split('.')[1]));
            setUser({
              id: payload.id || '',
              email: payload.email || '',
              role: payload.role || 'user',
            });
          } catch (error) {
            console.error('Error parsing token:', error);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
};

export default useAuth;
