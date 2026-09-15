import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'glucoscan_history';
const MAX_HISTORY = 50;

/**
 * Save a scan result to persistent history
 */
export async function saveResult(data) {
  try {
    const existing = await getHistory();
    const entry = {
      ...data,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
    };
    const updated = [entry, ...existing].slice(0, MAX_HISTORY);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

/**
 * Get all scan history
 */
export async function getHistory() {
  try {
    const stored = await AsyncStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Clear all scan history
 */
export async function clearHistory() {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch {
    // Ignore
  }
}
