"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, Smartphone, Wifi, Battery, Signal } from "lucide-react";

interface DeviceInfo {
  userAgent: string;
  platform: string;
  language: string;
  cookieEnabled: boolean;
  onLine: boolean;
  hardwareConcurrency: number;
  deviceMemory?: number;
  connection?: any;
  standalone?: boolean;
  orientation?: string;
  screenSize: string;
  viewport: string;
  pixelRatio: number;
}

interface ErrorInfo {
  message: string;
  timestamp: string;
  stack?: string;
}

export default function MobileDebugger() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show on mobile devices
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    if (!isMobile) return;

    // Collect device info
    const info: DeviceInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: (navigator as any).deviceMemory,
      connection: (navigator as any).connection,
      standalone: (window.navigator as any).standalone,
      orientation: screen.orientation?.type || "unknown",
      screenSize: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      pixelRatio: window.devicePixelRatio,
    };

    setDeviceInfo(info);

    // Listen for errors
    const handleError = (event: ErrorEvent) => {
      const errorInfo: ErrorInfo = {
        message: event.message,
        timestamp: new Date().toISOString(),
        stack: event.error?.stack,
      };
      setErrors((prev) => [...prev, errorInfo]);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorInfo: ErrorInfo = {
        message: `Promise rejection: ${event.reason}`,
        timestamp: new Date().toISOString(),
        stack: event.reason?.stack,
      };
      setErrors((prev) => [...prev, errorInfo]);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    // Auto-show if there are errors
    if (errors.length > 0) {
      setIsVisible(true);
    }

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, [errors.length]);

  // Don't render on desktop or if no device info
  if (!deviceInfo) return null;

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`fixed bottom-4 right-4 z-50 btn btn-circle btn-sm ${
          errors.length > 0 ? "btn-error animate-pulse" : "btn-primary"
        }`}
        title="Mobile Debug Info"
      >
        {errors.length > 0 ? (
          <AlertTriangle className="w-4 h-4" />
        ) : (
          <Smartphone className="w-4 h-4" />
        )}
        {errors.length > 0 && (
          <span className="badge badge-error badge-xs absolute -top-1 -right-1">
            {errors.length}
          </span>
        )}
      </button>

      {/* Debug Panel */}
      {isVisible && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
          <div className="w-full max-h-[80vh] bg-base-100 rounded-t-lg overflow-y-auto">
            <div className="p-4 border-b border-base-300 flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Mobile Debug Info
              </h3>
              <button
                onClick={() => setIsVisible(false)}
                className="btn btn-ghost btn-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Errors Section */}
              {errors.length > 0 && (
                <div className="alert alert-error">
                  <AlertTriangle className="w-5 h-5" />
                  <div>
                    <h4 className="font-semibold">
                      JavaScript Errors Detected ({errors.length})
                    </h4>
                    <div className="mt-2 space-y-2">
                      {errors.slice(-3).map((error, idx) => (
                        <details key={idx} className="text-sm">
                          <summary className="cursor-pointer">
                            {error.message} (
                            {new Date(error.timestamp).toLocaleTimeString()})
                          </summary>
                          {error.stack && (
                            <pre className="mt-1 text-xs bg-base-300 p-2 rounded overflow-auto">
                              {error.stack}
                            </pre>
                          )}
                        </details>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Device Info */}
              <div className="space-y-3">
                <h4 className="font-semibold">Device Information</h4>

                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Platform:</span>
                    <span className="font-mono">{deviceInfo.platform}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Screen:</span>
                    <span className="font-mono">{deviceInfo.screenSize}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Viewport:</span>
                    <span className="font-mono">{deviceInfo.viewport}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Pixel Ratio:</span>
                    <span className="font-mono">{deviceInfo.pixelRatio}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Orientation:</span>
                    <span className="font-mono">{deviceInfo.orientation}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <Wifi className="w-4 h-4" />
                      Online:
                    </span>
                    <span
                      className={
                        deviceInfo.onLine ? "text-success" : "text-error"
                      }
                    >
                      {deviceInfo.onLine ? "Yes" : "No"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Cookies:</span>
                    <span
                      className={
                        deviceInfo.cookieEnabled ? "text-success" : "text-error"
                      }
                    >
                      {deviceInfo.cookieEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>

                  {deviceInfo.deviceMemory && (
                    <div className="flex justify-between">
                      <span>Device Memory:</span>
                      <span className="font-mono">
                        {deviceInfo.deviceMemory} GB
                      </span>
                    </div>
                  )}

                  {deviceInfo.connection && (
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <Signal className="w-4 h-4" />
                        Connection:
                      </span>
                      <span className="font-mono">
                        {deviceInfo.connection.effectiveType}
                      </span>
                    </div>
                  )}

                  {typeof deviceInfo.standalone !== "undefined" && (
                    <div className="flex justify-between">
                      <span>PWA Mode:</span>
                      <span className="font-mono">
                        {deviceInfo.standalone ? "Yes" : "No"}
                      </span>
                    </div>
                  )}
                </div>

                <details className="text-sm">
                  <summary className="cursor-pointer font-medium">
                    User Agent
                  </summary>
                  <p className="mt-1 text-xs bg-base-300 p-2 rounded break-all">
                    {deviceInfo.userAgent}
                  </p>
                </details>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      JSON.stringify(
                        {
                          deviceInfo,
                          errors,
                          url: window.location.href,
                          timestamp: new Date().toISOString(),
                        },
                        null,
                        2
                      )
                    );
                    alert("Debug info copied to clipboard!");
                  }}
                  className="btn btn-outline btn-sm"
                >
                  Copy Debug Info
                </button>

                <button
                  onClick={() => setErrors([])}
                  className="btn btn-outline btn-sm"
                  disabled={errors.length === 0}
                >
                  Clear Errors
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
