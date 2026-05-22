import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Cross-platform secure storage utility
 * Uses SecureStore on native platforms and localStorage on web
 */
class CrossPlatformStorage {
  async setItemAsync(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Use localStorage on web
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(key, value);
        } else {
          console.warn('localStorage not available');
        }
      } else {
        // Use SecureStore on native platforms
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error('Storage setItem error:', error);
      throw error;
    }
  }

  async getItemAsync(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        // Use localStorage on web
        if (typeof localStorage !== 'undefined') {
          return localStorage.getItem(key);
        } else {
          console.warn('localStorage not available');
          return null;
        }
      } else {
        // Use SecureStore on native platforms
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  }

  async deleteItemAsync(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Use localStorage on web
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(key);
        } else {
          console.warn('localStorage not available');
        }
      } else {
        // Use SecureStore on native platforms
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error('Storage deleteItem error:', error);
      // Don't throw on delete errors, just log them
    }
  }
}

export const storage = new CrossPlatformStorage();