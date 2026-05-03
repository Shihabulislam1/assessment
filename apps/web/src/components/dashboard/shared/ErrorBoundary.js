'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription className="flex flex-col gap-4">
            <p>
              The application encountered an error while rendering this component.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-fit gap-2"
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Reload Page
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}
