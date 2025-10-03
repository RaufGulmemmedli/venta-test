"use client"
import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; onRetry: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  onRetry: () => void;
}

function DefaultErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-6 text-center">
          <div className="mb-4 p-3 bg-red-100 rounded-full inline-flex">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Xəta baş verdi
          </h2>
          
          <p className="text-gray-600 mb-4">
            Təəssüf ki, bir şey səhv getdi. Zəhmət olmasa yenidən cəhd edin.
          </p>
          
          {error && process.env.NODE_ENV === 'development' && (
            <details className="mb-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Xəta detalları
              </summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs text-red-600 overflow-auto">
                {error.message}
                {error.stack && `\n${error.stack}`}
              </pre>
            </details>
          )}
          
          <Button
            onClick={onRetry}
            className="w-full flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Yenidən cəhd et</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Validation error display component
interface ValidationErrorsProps {
  errors: string[];
  className?: string;
}

export function ValidationErrors({ errors, className }: ValidationErrorsProps) {
  if (errors.length === 0) return null;

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800 mb-1">
            Aşağıdakı xətaları düzəldin:
          </h3>
          <ul className="text-sm text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="flex items-start">
                <span className="w-1 h-1 bg-red-600 rounded-full mt-2 mr-2 flex-shrink-0" />
                {error}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
