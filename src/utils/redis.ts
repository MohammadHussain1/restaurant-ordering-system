import { RedisClientType } from 'redis';

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
  try {
    const value = await getRedisClient().get(key);
    if (value === null) {
      return null;
    }
    return JSON.parse(value);
  } catch (error) {
    console.error('Error getting JSON from Redis:', error);
    return null;
  }
};

// Also export a standalone setJSON that can be attached to the client
export const attachJSONMethods = (client: RedisClientType) => {
  (client as any).getJSON = (key: string) => getRedisJSON(key);
  (client as any).setJSON = (key: string, value: any, expirationSeconds?: number) => setJSON(client, key, value, expirationSeconds);
};

// Export a function to get the Redis client to avoid circular dependencies
export const getRedisClient = () => {
  return require('../config/redis').getRedisClient();
};