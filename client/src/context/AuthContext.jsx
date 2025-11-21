import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Configure axios defaults
    axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    axios.defaults.withCredentials = true;

    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const checkUserLoggedIn = async () => {
        try {
            const { data } = await axios.get('/api/auth/me');
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
            const { data } = await axios.post('/api/auth/login', { email, password });
            if (data.success) {
                setUser(data.user);
                // Token is handled by cookie
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
            const { data } = await axios.post('/api/auth/register', { name, email, password, role });
            if (data.success) {
                setUser(data.user);
                return true;
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
            return false;
        }
    };

    const logout = async () => {
        try {
            await axios.post('/api/auth/logout');
            setUser(null);
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
