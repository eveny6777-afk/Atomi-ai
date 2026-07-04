import { ProtectedRoute } from '@/components/protected-route';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Card } from '@atomic-ai/ui';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900">
        <DashboardHeader />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-gray-800 border-gray-700">
              <div className="mb-2 text-sm font-medium text-gray-400">Total Projects</div>
              <div className="text-3xl font-bold text-white">0</div>
              <p className="mt-2 text-xs text-gray-500">Create your first project</p>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <div className="mb-2 text-sm font-medium text-gray-400">Active Sessions</div>
              <div className="text-3xl font-bold text-white">1</div>
              <p className="mt-2 text-xs text-gray-500">Your current session</p>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <div className="mb-2 text-sm font-medium text-gray-400">API Usage</div>
              <div className="text-3xl font-bold text-white">0%</div>
              <p className="mt-2 text-xs text-gray-500">Within plan limits</p>
            </Card>
          </div>

          <div className="mt-8">
            <Card className="bg-gray-800 border-gray-700">
              <h2 className="mb-4 text-lg font-semibold text-white">Quick Start</h2>
              <div className="space-y-3 text-sm text-gray-300">
                <p>✓ Authentication system is ready</p>
                <p>✓ Dashboard is protected and working</p>
                <p>✓ User session is persisted securely</p>
                <p>→ Next: Configure your API endpoints and start building</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
