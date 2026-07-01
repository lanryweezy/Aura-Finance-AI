export async function simulateDelay<T>(fn: () => T, ms: number = 1000): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(fn()), ms + Math.random() * 500);
  });
}
