export function logError(error: unknown, context?: string): void {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  console.error(`[${timestamp}] ${context ? `[${context}] ` : ''}Error:`, errorMessage);
  if (errorStack) {
    console.error('Stack:', errorStack);
  }
}

export function createError(message: string, code?: string): Error {
  const error = new Error(message);
  if (code) {
    (error as Error & { code?: string }).code = code;
  }
  return error;
}

export function handlePromiseError<T>(
  promise: Promise<T>,
  context?: string,
  fallback?: T
): Promise<T | undefined> {
  return promise.catch((error) => {
    logError(error, context);
    return fallback;
  });
}

export class AppError extends Error {
  public readonly code: string;
  public readonly userMessage: string;
  
  constructor(message: string, code: string = 'UNKNOWN_ERROR', userMessage?: string) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.userMessage = userMessage || message;
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.userMessage;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return '发生未知错误';
}
