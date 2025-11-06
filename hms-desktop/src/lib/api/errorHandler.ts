import { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export class ApiException extends Error {
  public status?: number;
  public code?: string;
  public details?: any;

  constructor(message: string, status?: number, code?: string, details?: any) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const handleApiError = (error: AxiosError): ApiException => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    const message = (data as any)?.message || 'An error occurred';
    const code = (data as any)?.code;
    const details = (data as any)?.errors || (data as any)?.data;

    return new ApiException(message, status, code, details);
  } else if (error.request) {
    // Request was made but no response received
    return new ApiException('Network error - please check your connection', 0, 'NETWORK_ERROR');
  } else {
    // Something else happened
    return new ApiException(error.message || 'An unexpected error occurred', 0, 'UNKNOWN_ERROR');
  }
};

export const isApiError = (error: any): error is ApiException => {
  return error instanceof ApiException;
};

export const getErrorMessage = (error: any): string => {
  if (isApiError(error)) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

export const getErrorStatus = (error: any): number | undefined => {
  if (isApiError(error)) {
    return error.status;
  }
  
  if (error instanceof AxiosError && error.response) {
    return error.response.status;
  }
  
  return undefined;
};

// Common error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error - please check your connection',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  FORBIDDEN: 'Access denied - insufficient permissions',
  NOT_FOUND: 'The requested resource was not found',
  VALIDATION_ERROR: 'Please check your input and try again',
  SERVER_ERROR: 'Server error - please try again later',
  TIMEOUT: 'Request timeout - please try again',
  UNKNOWN_ERROR: 'An unexpected error occurred',
} as const;
