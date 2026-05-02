'use client';

export default function AnalyticsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Goal Progress</h3>
          <p className="text-gray-400 text-sm">Charts will appear here once you have goals with milestones.</p>
        </div>
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Action Item Trends</h3>
          <p className="text-gray-400 text-sm">Track completion rates and team velocity.</p>
        </div>
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Activity Feed</h3>
          <p className="text-gray-400 text-sm">See who's contributing and what they're working on.</p>
        </div>
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Team Performance</h3>
          <p className="text-gray-400 text-sm">Member-level breakdown of completed work.</p>
        </div>
      </div>
    </div>
  );
}