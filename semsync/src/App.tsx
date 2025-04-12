import * as React from 'react';
import { configureSyncEngine } from '@tonk/keepsync';
import { Schedule } from './components/Schedule';

const App = () => {
  React.useEffect(() => {
    // Initialize the sync engine when the app starts
    configureSyncEngine({
      url: 'ws://localhost:8080', // This should be updated to your actual sync server URL in production
      name: 'SemSync',
      onSync: (docId: string) => console.log(`Document ${docId} synced`),
      onError: (error: Error) => console.error('Sync error:', error),
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fcf8]">
      <header className="bg-[#1F2421] shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-6 relative">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-1">
                <span className="text-[#49A078]">Sem</span>
                <span className="text-[#9CC5A1]">Sync</span>
              </h1>
              <p className="text-white text-xs font-medium">
                Track your class schedule, assignments, and exams in real-time
              </p>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Schedule />
      </main>
    </div>
  );
};

export default App;
