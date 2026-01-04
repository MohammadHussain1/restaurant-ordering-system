import { RedisClientType } from 'redis';

// Helper function to store JSON objects in Redis with optional expiration
export const setJSON = async (client: RedisClientType, key: string, value: any, expirationSeconds?: number): Promise<string | null> => {
  try {
    const serializedValue = JSON.stringify(value);
    if (expirationSeconds) {
      return await client.set(key, serializedValue, { EX: expirationSeconds });
    } else {
      return await client.set(key, serializedValue);
    }
  } catch (error) {
    console.error('Error setting JSON in Redis:', error);
    return null;
  }
};

export const getRedisJSON = async (key: string): Promise<any> => {
  // Retrieve and parse a JSON object from Redis
  try {
    const value = await getRedisClient().get(key);
    if (value === null) {
      return null; // Key doesn't exist
    }
    return JSON.parse(value);
  } catch (error) {
    console.error('Error getting JSON from Redis:', error);
    return null;
  }
};

// Extend Redis client with JSON methods for easier usage
export const attachJSONMethods = (client: RedisClientType) => {
  (client as any).getJSON = (key: string) => getRedisJSON(key);
  (client as any).setJSON = (key: string, value: any, expirationSeconds?: number) => setJSON(client, key, value, expirationSeconds);
};

// Helper to get Redis client instance (avoiding circular dependency issues)
export const getRedisClient = () => {
  return require('../config/redis').getRedisClient();
};