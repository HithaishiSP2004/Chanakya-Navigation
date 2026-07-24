export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'ANALYTICS';

export class Logger {
  private static isDev = process.env.NODE_ENV !== 'production';

  public static info(message: string, meta?: unknown) {
    console.log(`[INFO] [${new Date().toLocaleTimeString()}] ${message}`, meta || '');
  }

  public static warn(message: string, meta?: unknown) {
    console.warn(`[WARN] [${new Date().toLocaleTimeString()}] ${message}`, meta || '');
  }

  public static error(message: string, meta?: unknown) {
    console.error(`[ERROR] [${new Date().toLocaleTimeString()}] ${message}`, meta || '');
  }

  public static debug(message: string, meta?: unknown) {
    if (this.isDev) {
      console.log(`[DEBUG] [${new Date().toLocaleTimeString()}] ${message}`, meta || '');
    }
  }

  public static analytics(eventName: string, properties?: unknown) {
    console.log(`[ANALYTICS] 📊 Event: ${eventName}`, properties || '');
  }
}
