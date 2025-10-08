import { useState, useEffect } from 'react';

// Helper to check for localStorage availability safely.
const isLocalStorageAvailable = (() => {
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

  const setValue = (value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    
    if (isLocalStorageAvailable) {
      try {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.warn(`Error setting localStorage key “${key}”:`, error);
      }
    }
  };
  
  // This effect will listen for changes to the local storage from other tabs/windows
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
