import { create } from 'zustand';
import api from './api';

interface User {
    id: string;
    email: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
    isLoading: true,
    login: (token, user) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ token, user, isLoading: false });
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ token: null, user: null, isLoading: false });
    },
    checkAuth: async () => {
        try {
            set({ isLoading: true });
            const token = localStorage.getItem('token');
            if (!token) {
                set({ token: null, user: null, isLoading: false });
                return;
            }

            // We can verify token by making a call to an endpoint that requires auth, e.g. /entries (hacky but works if no /me endpoint)
            // Or we should have added a /me endpoint. For now, we trust presence of token or load user from storage if we had it.
            // Better: let's verify with health check or add /me. 
            // Plan: Assume token is valid until 401. User data is lost on refresh if not persisted.
            // Fix: Persist user in localStorage too or decode token.

            // Let's add user to localStorage as well for simplicity.
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                set({ user: JSON.parse(savedUser), token, isLoading: false });
            } else {
                set({ isLoading: false });
            }

        } catch (error) {
            localStorage.removeItem('token');
            set({ token: null, user: null, isLoading: false });
        }
    },
}));
