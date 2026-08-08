const IS_DEV = process.env.NODE_ENV !== 'production';

export class Logger {
  public static info(message: string, data?: any): void {
    const extra = data ? ` ${JSON.stringify(data)}` : '';
    console.log(`[INFO] ${new Date().toISOString()} - ${message}${extra}`);
  }

  public static warn(message: string, data?: any): void {
    const extra = data ? ` ${JSON.stringify(data)}` : '';
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}${extra}`);
  }

  public static error(message: string, err?: any): void {
    // Sanitize: never log raw error objects that may contain auth headers/API keys
    const safeErr = typeof err === 'string' ? err : (err?.message || 'Unknown error');
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, safeErr);
  }

  // Debug-level: only printed in development mode
  public static debug(message: string, data?: any): void {
    if (!IS_DEV) return;
    const extra = data ? ` ${JSON.stringify(data)}` : '';
    console.log(`[DEBUG] ${new Date().toISOString()} - ${message}${extra}`);
  }
}
