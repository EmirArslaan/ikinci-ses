"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role?: "USER" | "ADMIN";
    phone?: string;
    phoneVerified?: boolean;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    favoriteIds: string[];
    toggleFavorite: (listingId: string) => Promise<void>;
    refreshUser: () => Promise<void>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

    const fetchFavorites = async (authToken: string) => {
        try {
            const res = await fetch("/api/favorites", {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                setFavoriteIds(data.favorites || []);
            }
        } catch (err) {
            console.error("Error fetching favorites:", err);
        }
    };

    const fetchUser = async (authToken: string) => {
        try {
            const res = await fetch("/api/auth/me", {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                localStorage.setItem("user", JSON.stringify(data.user));
            } else {
                throw new Error("Session expired");
            }
        } catch (err) {
            console.error("Error fetching user:", err);
            // Invalid token or error, clear auth
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setToken(null);
            setUser(null);
        }
    };

    const refreshUser = async () => {
        if (token) {
            await fetchUser(token);
        }
    };

    useEffect(() => {
        // Check for existing auth on mount
        const storedToken = localStorage.getItem("token");

        if (storedToken) {
            // Validate token and get fresh user data
            fetchUser(storedToken).finally(() => setIsLoading(false));
            setToken(storedToken);
            fetchFavorites(storedToken);
        } else {
            setTimeout(() => setIsLoading(false), 0);
        }
    }, []);



    const login = (newToken: string, newUser: User) => {
        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        fetchFavorites(newToken);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
        setFavoriteIds([]);
    };

    const toggleFavorite = async (listingId: string) => {
        if (!token) return;

        // Optimistic update
        const isFavorited = favoriteIds.includes(listingId);
        setFavoriteIds(prev =>
            isFavorited ? prev.filter(id => id !== listingId) : [...prev, listingId]
        );

        try {
            const res = await fetch("/api/favorites", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ listingId })
            });

            if (!res.ok) {
                // Revert on error
                setFavoriteIds(prev =>
                    isFavorited ? [...prev, listingId] : prev.filter(id => id !== listingId)
                );
            }
        } catch (err) {
            console.error("Error toggling favorite:", err);
            // Revert on error
            setFavoriteIds(prev =>
                isFavorited ? [...prev, listingId] : prev.filter(id => id !== listingId)
            );
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                login,
                logout,
                isAuthenticated: !!token && !!user,
                favoriteIds,
                toggleFavorite,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
