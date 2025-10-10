
import { useState, useEffect } from 'react';

// Helper to check for localStorage availability safely.
export const isLocalStorageAvailable = (() => {
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


function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // 1. Initialize state from localStorage or the initialValue.
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (!isLocalStorageAvailable) {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  });

  // 2. The setter function is a wrapper around the state setter from useState.
  // This allows the hook to have the same API as useState.
  const setValue = (value: T | ((val: T) => T)) => {
    setStoredValue(value);
  };

  // 3. A useEffect hook to persist the state to localStorage whenever it changes.
  // This is more robust as it runs after the render cycle, ensuring the latest state is saved.
  useEffect(() => {
    if (isLocalStorageAvailable) {
      try {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      } catch (error) {
        console.warn(`Error setting localStorage key “${key}”:`, error);
      }
    }
  }, [key, storedValue]);
  
  // 4. A useEffect hook to listen for storage events from other tabs.
  useEffect(() => {
    if (isLocalStorageAvailable) {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === key && e.newValue) {
          try {
            setStoredValue(JSON.parse(e.newValue));
          } catch(error) {
            console.warn(`Error parsing storage change for key "${key}"`, error);
          }
        }
      };
      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [key]);


  return [storedValue, setValue];
}

export { useLocalStorage };