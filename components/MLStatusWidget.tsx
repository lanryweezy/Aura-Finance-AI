import React, { useState, useEffect } from 'react';
import { checkMLHealth } from '../services/mlApiService';

export const MLStatusWidget: React.FC = () => {
  const [status, setStatus] = useState<{ tabfm: boolean; timesfm: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkMLHealth().then(setStatus).finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!status) return null;

  const bothOnline = status.tabfm && status.timesfm;
  const anyOnline = status.tabfm || status.timesfm;

  return (
    <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
      bothOnline ? 'bg-green-500/10 border-green-500/30 text-green-400' :
      anyOnline ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
      'bg-gray-500/10 border-gray-500/30 text-gray-400'
    }`}>
      <span className={`w-2 h-2 rounded-full ${bothOnline ? 'bg-green-400 animate-pulse' : anyOnline ? 'bg-yellow-400' : 'bg-gray-400'}`} />
      <span className="font-bold">
        {bothOnline ? 'AI Brain: Online' : anyOnline ? 'AI Brain: Partial' : 'AI Brain: Offline'}
      </span>
      <span className="ml-auto text-[10px]">
        TabFM: {status.tabfm ? '✓' : '✕'} | TimesFM: {status.timesfm ? '✓' : '✕'}
      </span>
    </div>
  );
};
