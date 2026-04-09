
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { monitoringService } from '../../services/monitoringService';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    monitoringService.trackError('UI_CRASH', error, {
        componentStack: errorInfo.componentStack
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-primary flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-dark-tertiary p-10 rounded-3xl border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Unexpected Error</h1>
            <p className="text-gray-400 mb-8 leading-relaxed">
                Aura encountered a technical glitch. We've logged the incident and our team is looking into it.
            </p>
            <div className="space-y-3">
                <button
                    onClick={this.handleReset}
                    className="w-full py-3 bg-brand-cyan text-black font-bold rounded-xl hover:bg-brand-cyan/80 transition-colors shadow-lg shadow-brand-cyan/20"
                >
                    Reload Application
                </button>
                <button
                    onClick={() => window.history.back()}
                    className="w-full py-3 bg-white/5 text-gray-300 font-semibold rounded-xl hover:bg-white/10 transition-colors"
                >
                    Go Back
                </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-8 text-left p-4 bg-black/40 rounded-lg overflow-auto max-h-40">
                    <p className="text-xs font-mono text-red-400">{this.state.error.toString()}</p>
                </div>
            )}
          </div>
        </div>
      );
    }

    return this.children;
  }
}
