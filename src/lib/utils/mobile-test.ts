import { storage } from './storage';

/**
 * Simple test function to verify storage works on mobile
 * Call this from a component to test storage functionality
 */
export async function testMobileStorage(): Promise<boolean> {
  try {
    const testKey = 'mobile_test_key';
    const testValue = 'mobile_test_value';
    
    // Test write
    await storage.setItemAsync(testKey, testValue);
    console.log('✅ Storage write successful');
    
    // Test read
    const retrievedValue = await storage.getItemAsync(testKey);
    console.log('✅ Storage read successful:', retrievedValue);
    
    // Test delete
    await storage.deleteItemAsync(testKey);
    console.log('✅ Storage delete successful');
    
    // Verify deletion
    const deletedValue = await storage.getItemAsync(testKey);
    console.log('✅ Storage verification successful:', deletedValue === null);
    
    return retrievedValue === testValue && deletedValue === null;
  } catch (error) {
    console.error('❌ Storage test failed:', error);
    return false;
  }
}