import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { API_BASE_URL } from "@/lib/api";

type AppUser = {
    id: number;
    firebase_uid?: string | null;
    name: string;
    email?: string | null;
    roll_number?: string | null;
    role: string;
    admin: boolean;
    onboarding_required: boolean;
};

type AuthContextValue = {
    user: User | null;
    appUser: AppUser | null;
    token: string | null;
    isAdmin: boolean;
    loading: boolean;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function resolveBackendSession(user: User) {
    const idToken = await user.getIdToken();

    try {
        const response = await fetch(`${API_BASE_URL}/me`, {
            headers: { Authorization: `Bearer ${idToken}` },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch session from backend");
        }

        const payload = (await response.json()) as {
            user: any;
            onboarding_required: boolean;
        };

        const userData = payload.user;
        const isAdmin = Boolean(userData?.admin) || userData?.role === "admin";

        return {
            idToken,
            appUser: {
                ...userData,
                admin: isAdmin,
                onboarding_required: payload.onboarding_required,
            } as AppUser,
            isAdmin,
        };
    } catch (error) {
        console.error("Backend session resolution failed:", error);
        return {
            idToken,
            appUser: null,
            isAdmin: false,
        };
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [appUser, setAppUser] = useState<AppUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    const applyAnonymousState = () => {
        setUser(null);
        setAppUser(null);
        setToken(null);
        setIsAdmin(false);
        localStorage.removeItem("devcell_id_token");
    };

    useEffect(() => {
        let cancelled = false;

        // Failsafe: if Firebase fails to initialize or doesn't resolve within 5s
        const failsafeTimer = setTimeout(() => {
            if (!cancelled) {
                setLoading(false);
                console.warn("Firebase Auth timed out during initialization");
            }
        }, 5000);

        const syncAuthState = async (nextUser: User | null) => {
            clearTimeout(failsafeTimer);
            setLoading(true);

            try {
                if (!nextUser) {
                    applyAnonymousState();
                    return;
                }

                const { idToken, appUser: resolvedAppUser, isAdmin: resolvedAdmin } = await resolveBackendSession(nextUser);

                if (cancelled) {
                    return;
                }

                setUser(nextUser);
                setAppUser(resolvedAppUser);
                setToken(idToken);
                setIsAdmin(resolvedAdmin);
                localStorage.setItem("devcell_id_token", idToken);
            } catch (err) {
                console.error("Auth transformation error:", err);
                if (cancelled) {
                    return;
                }

                applyAnonymousState();
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
            void syncAuthState(nextUser);
        });

        return () => {
            cancelled = true;
            unsubscribe();
        };
    }, []);

    const logout = async () => {
        await signOut(auth);
        applyAnonymousState();
    };

    const value = useMemo<AuthContextValue>(
        () => ({ user, appUser, token, isAdmin, loading, logout }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [user, appUser, token, isAdmin, loading],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider.");
    }

    return context;
}
