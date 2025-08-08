"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useApiError } from "@/hooks/use-api-error"

export function ErrorDemo() {
  const [isLoading, setIsLoading] = useState(false)
  const { handleError } = useApiError()

  const simulateError = (errorType: string) => {
    setIsLoading(true)
    
    setTimeout(() => {
      let error: any
      
      switch (errorType) {
        case '401':
          error = {
            message: 'API request failed with status 401',
            status: 401,
            userFriendly: 'Invalid email, work ID, or role. Please check your credentials and try again.'
          }
          break
        case '403':
          error = {
            message: 'Forbidden',
            status: 403,
            userFriendly: 'You don\'t have permission to access this resource.'
          }
          break
        case '404':
          error = {
            message: 'Not Found',
            status: 404,
            userFriendly: 'The requested information was not found.'
          }
          break
        case '500':
          error = {
            message: 'Internal Server Error',
            status: 500,
            userFriendly: 'Something went wrong on our end. Please try again later.'
          }
          break
        case 'network':
          error = new TypeError('Network error - unable to connect to server')
          break
        case 'timeout':
          error = {
            message: 'Request timeout',
            status: 408,
            userFriendly: 'The request took too long to complete. Please try again.'
          }
          break
        default:
          error = {
            message: 'Unknown error occurred',
            status: 500,
            userFriendly: 'Something went wrong. Please try again.'
          }
      }
      
      handleError(error, `Demo ${errorType} Error`)
      setIsLoading(false)
    }, 1000)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Error Handling Demo</CardTitle>
        <CardDescription>
          Test different types of errors to see how they're handled
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => simulateError('401')}
            disabled={isLoading}
          >
            401 Auth Error
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => simulateError('403')}
            disabled={isLoading}
          >
            403 Forbidden
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => simulateError('404')}
            disabled={isLoading}
          >
            404 Not Found
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => simulateError('500')}
            disabled={isLoading}
          >
            500 Server Error
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => simulateError('network')}
            disabled={isLoading}
          >
            Network Error
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => simulateError('timeout')}
            disabled={isLoading}
          >
            Timeout Error
          </Button>
        </div>
        
        {isLoading && (
          <div className="text-center text-sm text-muted-foreground">
            Simulating error...
          </div>
        )}
        
        <div className="text-xs text-muted-foreground mt-4">
          <p><strong>Features:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>User-friendly error messages</li>
            <li>Automatic auth token cleanup</li>
            <li>Network error detection</li>
            <li>Consistent error handling</li>
            <li>Toast notifications</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
} 