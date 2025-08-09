"use client";
import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);

    // Enhanced logging for production debugging
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });

    // Store error info in state for better debugging
    this.setState({ errorInfo });

    // Send error to monitoring service in production
    if (process.env.NODE_ENV === "production") {
      // You can replace this with your preferred error monitoring service
      try {
        fetch("/api/log-error", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            error: {
              message: error.message,
              stack: error.stack,
              name: error.name,
            },
            errorInfo,
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: new Date().toISOString(),
          }),
        }).catch(() => {
          // Fail silently if error logging fails
        });
      } catch {
        // Fail silently
      }
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
          <div className="text-center p-8 bg-base-100 rounded-lg shadow-lg max-w-md">
            <AlertTriangle className="w-16 h-16 text-error mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-error mb-4">
              Something went wrong
            </h2>
            <p className="text-base-content mb-6">
              We&apos;re sorry, but something unexpected happened. Please try
              refreshing the page.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary w-full"
              >
                Refresh Page
              </button>
              <button
                onClick={() => {
                  this.setState({
                    hasError: false,
                    error: undefined,
                    errorInfo: undefined,
                  });
                }}
                className="btn btn-outline w-full"
              >
                Try Again
              </button>
            </div>

            {/* Show error details in development OR if user is on mobile (for debugging) */}
            {(process.env.NODE_ENV === "development" ||
              /Mobi|Android/i.test(navigator.userAgent)) &&
              this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm text-base-content/70">
                    Error Details{" "}
                    {process.env.NODE_ENV === "production" && "(Mobile Debug)"}
                  </summary>
                  <div className="mt-2 text-xs bg-base-300 p-2 rounded overflow-auto max-h-40">
                    <p>
                      <strong>Error:</strong> {this.state.error.message}
                    </p>
                    <p>
                      <strong>Name:</strong> {this.state.error.name}
                    </p>
                    {this.state.error.stack && (
                      <>
                        <p>
                          <strong>Stack:</strong>
                        </p>
                        <pre className="whitespace-pre-wrap text-xs">
                          {this.state.error.stack}
                        </pre>
                      </>
                    )}
                    <p>
                      <strong>User Agent:</strong> {navigator.userAgent}
                    </p>
                    <p>
                      <strong>URL:</strong> {window.location.href}
                    </p>
                  </div>
                </details>
              )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
