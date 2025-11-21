import { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const checkUserLoggedIn = async () => {
        try {
            const { data } = await api.get('/auth/me');
            if (data.success) {
                setUser(data.data);
            }
        } catch (err) {
            // Not logged in
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            setError(null);
            const { data } = await api.post('/auth/login', { email, password });
            if (data.success) {
                setUser(data.user);
                // Store tokens for mobile compatibility
                if (data.accessToken) {
                    localStorage.setItem('accessToken', data.accessToken);
                }
                if (data.refreshToken) {
                    localStorage.setItem('refreshToken', data.refreshToken);
                }
                return true;
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
            return false;
        }
    };

    const register = async (name, email, password, role = 'Viewer') => {
        try {
            setError(null);
            const { data } = await api.post('/auth/register', { name, email, password, role });
            if (data.success) {
                setUser(data.user);
                // Store tokens for mobile compatibility
                if (data.accessToken) {
                    localStorage.setItem('accessToken', data.accessToken);
                }
                if (data.refreshToken) {
                    localStorage.setItem('refreshToken', data.refreshToken);
                }
                return true;
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
            return false;
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
            setUser(null);
            // Clear stored tokens
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
