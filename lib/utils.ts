import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ====================================================================
// ERROR HANDLING UTILITIES
// ====================================================================

interface ApiError {
  message: string;
  status: number;
  details?: any;
  userFriendly?: string;
}

export function parseApiError(error: any): ApiError {
  try {
    // If it's already a parsed error object
    if (typeof error === 'object' && error.message) {
      return {
        message: error.message,
        status: error.status || 500,
        details: error.details,
        userFriendly: error.userFriendly || createUserFriendlyError(error.status || 500, error.message)
      };
    }

    // If it's a JSON string
    if (typeof error === 'string') {
      try {
        const parsed = JSON.parse(error);
        return {
          message: parsed.message || error,
          status: parsed.status || 500,
          details: parsed.details,
          userFriendly: parsed.userFriendly || createUserFriendlyError(parsed.status || 500, parsed.message || error)
        };
      } catch {
        // If JSON parsing fails, treat as generic error
        return {
          message: error,
          status: 500,
          userFriendly: "Something went wrong. Please try again."
        };
      }
    }

    // Default fallback
    return {
      message: error?.message || 'Unknown error occurred',
      status: 500,
      userFriendly: "Something went wrong. Please try again."
    };
  } catch {
    return {
      message: 'Error parsing error message',
      status: 500,
      userFriendly: "Something went wrong. Please try again."
    };
  }
}

export function createUserFriendlyError(status: number, message: string): string {
  switch (status) {
    case 401:
      return "Your session has expired. Please log in again.";
    case 403:
      return "You don't have permission to perform this action.";
    case 404:
      return "The requested information was not found.";
    case 422:
      return "Please check your input and try again.";
    case 429:
      return "Too many requests. Please wait a moment and try again.";
    case 500:
      return "Something went wrong on our end. Please try again later.";
    case 502:
    case 503:
    case 504:
      return "Our servers are temporarily unavailable. Please try again later.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export function getErrorMessage(error: any): string {
  const apiError = parseApiError(error);
  return apiError.userFriendly || apiError.message || "Something went wrong. Please try again.";
}

export function isNetworkError(error: any): boolean {
  return error instanceof TypeError || 
         (error.message && error.message.includes('Network error')) ||
         error.status === 0;
}

export function isAuthError(error: any): boolean {
  const apiError = parseApiError(error);
  return apiError.status === 401 || apiError.status === 403;
}

// ====================================================================
// MOCK DATA UTILITIES
// ====================================================================

export function getMockDataStatus(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('useMockData') === 'true';
  }
  return false;
}

export function setMockDataStatus(useMock: boolean): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('useMockData', useMock.toString());
  }
}
