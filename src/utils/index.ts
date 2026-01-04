// Add minutes to a date
export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

// Safely parse JSON without throwing errors
export function safeParse<T>(str: string): T | null {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

// Export AppError for convenience
export { AppError } from '../errors/AppError';