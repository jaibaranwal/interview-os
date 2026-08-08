// Future responsibility: Structured logging utility for server requests and interview engine events
export class Logger {
  public static info(message: string): void {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
  }

  public static error(message: string, err?: any): void {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, err || '');
  }
}
