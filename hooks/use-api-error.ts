import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { getErrorMessage, isAuthError, isNetworkError } from "@/lib/utils"
import { useCallback } from "react"

interface UseApiErrorOptions {
  onAuthError?: () => void
  onNetworkError?: () => void
  onGenericError?: () => void
  redirectOnAuthError?: boolean
}

export function useApiError(options: UseApiErrorOptions = {}) {
  const { toast } = useToast()
  const router = useRouter()

  const handleError = useCallback((error: any, context?: string) => {
    console.error(`${context || 'API'} error:`, error)

    const errorMessage = getErrorMessage(error)
    let errorTitle = "Error"
    
    // Determine error title based on type
    if (isAuthError(error)) {
      errorTitle = "Authentication Error"
      
      // Handle auth errors
      if (options.onAuthError) {
        options.onAuthError()
      } else if (options.redirectOnAuthError !== false) {
        // Clear auth data and redirect to login
        localStorage.clear()
        router.push('/')
      }
    } else if (isNetworkError(error)) {
      errorTitle = "Connection Error"
      
      if (options.onNetworkError) {
        options.onNetworkError()
      }
    } else {
      if (options.onGenericError) {
        options.onGenericError()
      }
    }

    // Show toast notification
    toast({
      title: errorTitle,
      description: errorMessage,
      variant: "destructive",
    })

    return {
      title: errorTitle,
      message: errorMessage,
      isAuthError: isAuthError(error),
      isNetworkError: isNetworkError(error)
    }
  }, [toast, router, options])

  return { handleError }
}

// Convenience hook for login errors
export function useLoginError() {
  return useApiError({
    redirectOnAuthError: false, // Don't redirect on login auth errors
    onAuthError: () => {
      // Clear any existing auth data on login failure
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
    }
  })
}

// Convenience hook for protected route errors
export function useProtectedRouteError() {
  return useApiError({
    redirectOnAuthError: true, // Always redirect on auth errors in protected routes
  })
} 