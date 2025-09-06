export function safeParse<T>(input: string, fallback: T | null = null): T | null {
  try {
    return JSON.parse(input) as T;
  } catch (e) {
    return fallback;
  }
}
