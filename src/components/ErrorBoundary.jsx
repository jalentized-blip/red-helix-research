import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-8">
          <div className="max-w-lg text-center">
            <h1 className="text-2xl font-black text-slate-900 mb-4">Something went wrong</h1>
            <pre className="text-xs text-left bg-slate-100 p-4 rounded-xl overflow-auto text-red-600 mb-6">
              {this.state.error?.message}
              {'\n'}
              {this.state.error?.stack?.slice(0, 500)}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#8B2635] text-white rounded-xl font-bold"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}