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
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-danger/10 border border-danger/30 rounded-xl p-6 text-center">
          <p className="text-2xl mb-2">💥</p>
          <p className="text-sm font-semibold text-danger mb-1">Something went wrong</p>
          <p className="text-xs text-slate-500 mb-3">{this.state.error?.message || 'Unknown error'}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 text-sm font-medium bg-surface-raised text-slate-300 rounded-lg
                       border border-surface-overlay hover:bg-surface-overlay transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
