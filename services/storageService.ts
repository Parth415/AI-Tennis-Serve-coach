import { UserProfile, Session, UserAccount } from '../types';

// Helper to check for localStorage availability safely.
export const isStorageAvailable = (() => {
  // The check should not run on the server.
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    const storage = window.localStorage;
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return false;
  }
})();

const get = <T>(key: string, defaultValue: T): T => {
    if (!isStorageAvailable) return defaultValue;
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.warn(`Error reading localStorage key “${key}”:`, error);
        return defaultValue;
    }
};

const set = <T>(key: string, value: T): void => {
    if (!isStorageAvailable) return;
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn(`Error setting localStorage key “${key}”:`, error);
    }
};

// --- Accounts ---
const DEMO_EMAIL = 'demo@example.com';
const DEMO_PASSWORD = 'password123';
const DEFAULT_ACCOUNTS: Record<string, UserAccount> = { [DEMO_EMAIL]: { password: DEMO_PASSWORD } };

export const getAccounts = (): Record<string, UserAccount> => {
    const accounts = get('userAccounts', {});
    // If storage is empty (e.g., first visit or cleared storage in a preview env),
    // seed it with a default demo account to ensure login is always possible.
    if (Object.keys(accounts).length === 0) {
        set('userAccounts', DEFAULT_ACCOUNTS); // Save the default for the current session
        return DEFAULT_ACCOUNTS;
    }
    return accounts;
};
export const saveAccounts = (accounts: Record<string, UserAccount>): void => set('userAccounts', accounts);

// --- Current User ---
export const getCurrentUser = (): string | null => get('currentUser', null);
export const setCurrentUser = (email: string): void => set('currentUser', email);
export const clearCurrentUser = (): void => {
    if (!isStorageAvailable) return;
    window.localStorage.removeItem('currentUser');
};

// --- User-specific data ---
export const getUserProfile = (email: string): UserProfile => get(`${email}_userProfile`, {
    name: '',
    age: '',
    skillLevel: '',
    playingHand: '',
    preferredCourtSurface: '',
    racquetType: '',
    serveGoals: [],
});
export const saveUserProfile = (email: string, profile: UserProfile): void => set(`${email}_userProfile`, profile);

export const getSessionHistory = (email: string): Session[] => get(`${email}_sessionHistory`, []);
export const saveSessionHistory = (email: string, history: Session[]): void => set(`${email}_sessionHistory`, history);

// --- Feedback ---
export const getFeedback = (analysisId: string): 'up' | 'down' | null => get(`feedback_${analysisId}`, null);
export const saveFeedback = (analysisId: string, vote: 'up' | 'down'): void => set(`feedback_${analysisId}`, vote);