"use client";
// import { useSearchParams } from "next/navigation";
import { CheckCircle, Crown, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SubscriptionSuccess() {
  // const router = useRouter();
  // const searchParams = useSearchParams();
  // const [sessionId, setSessionId] = useState<string | null>(null);

  // useEffect(() => {
  //   // Get the session_id from URL parameters
  //   const sessionIdParam = searchParams.get("session_id");
  //   if (sessionIdParam) {
  //     setSessionId(sessionIdParam);
  //   }
  // }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-6">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Card */}
        <div className="card bg-base-100 shadow-2xl border border-success/20">
          <div className="card-body p-8">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-success" />
              </div>
            </div>

            {/* Success Message */}
            <h1 className="text-3xl font-bold text-success mb-4">
              Welcome to Premium! 🎉
            </h1>

            <p className="text-lg text-gray-600 mb-6">
              Your subscription has been activated successfully. You now have
              access to all premium features!
            </p>

            {/* Subscription Details */}
            <div className="bg-base-200 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Crown className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold text-primary">
                  TripMaps Premium
                </h2>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <p>✓ No advertisements</p>
                <p>✓ Premium features coming soon</p>
                <p>✓ Priority support</p>
                <p>✓ $1.99/month</p>
              </div>
            </div>

            {/* Session ID (for debugging) */}
            {/* {sessionId && (
              <div className="bg-base-200 rounded-lg p-4 mb-6">
                <p className="text-xs text-gray-500 mb-2">Session ID:</p>
                <p className="text-xs font-mono text-gray-600 break-all">
                   {sessionId} 
                </p>
              </div>
            )} */}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard?tab=Settings"
                className="btn btn-primary btn-lg flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Settings
              </Link>

              <Link href="/dashboard" className="btn btn-outline btn-lg">
                Go to Dashboard
              </Link>
            </div>

            {/* Additional Info */}
            <div className="mt-8 text-sm text-gray-500">
              <p>
                You&apos;ll receive a confirmation email shortly. Your
                subscription will automatically renew each month.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
