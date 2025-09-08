// import { useState } from 'react';

// interface User {
//   id: string;
//   email: string;
//   createdAt: string;
// }

// interface AuthResponse {
//   message: string;
//   user: User;
//   token?: string;
// }

// export const useAuth = () => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const signup = async (email: string, password: string): Promise<AuthResponse | null> => {
//     setLoading(true);
//     setError(null);
    
//     try {
//       console.log('Signup attempt for:', email);
//       const response = await fetch('/api/auth/signup', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await response.json();
//       console.log('Signup response:', data);

//       if (!response.ok) {
//         throw new Error(data.error || 'Signup failed');
//       }

//       setUser(data.user);
//       return data;
//     } catch (err: any) {
//       console.error('Signup error:', err.message);
//       setError(err.message);
//       return null;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const login = async (email: string, password: string): Promise<AuthResponse | null> => {
//     setLoading(true);
//     setError(null);
    
//     try {
//       console.log('Login attempt for:', email);
//       const response = await fetch('/api/auth/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await response.json();
//       console.log('Login API response:', data); // Debug the response

//       if (!response.ok) {
//         throw new Error(data.error || 'Login failed');
//       }

//       setUser(data.user);
      
//       // Store token in localStorage - FIXED VERSION
//       if (data.token) {
//         console.log('Storing token in localStorage:', data.token);
//         localStorage.setItem('token', data.token);
        
//         // Verify it was stored
//         const storedToken = localStorage.getItem('token');
//         console.log('Token retrieved from localStorage:', storedToken);
//       } else {
//         console.warn('No token received in login response');
//       }
      
//       return data;
//     } catch (err: any) {
//       console.error('Login error:', err.message);
//       setError(err.message);
//       return null;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const logout = () => {
//     console.log('Logging out user');
//     setUser(null);
//     localStorage.removeItem('token');
//   };

//   const getCurrentUser = async (): Promise<User | null> => {
//     const token = localStorage.getItem('token');
//     console.log('Retrieving current user, token exists:', !!token);
    
//     if (!token) {
//       console.log('No token found in localStorage');
//       return null;
//     }

//     try {
//       const response = await fetch('/api/users', {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//       });

//       if (!response.ok) {
//         throw new Error('Failed to fetch user');
//       }

//       const data = await response.json();
//       setUser(data.user);
//       return data.user;
//     } catch (err) {
//       console.error('Failed to get current user:', err);
//       localStorage.removeItem('token');
//       return null;
//     }
//   };

//   return {
//     user,
//     loading,
//     error,
//     signup,
//     login,
//     logout,
//     getCurrentUser,
//   };
// };