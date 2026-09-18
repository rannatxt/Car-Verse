import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class WebGLBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'WebGL context loss or 3D graphics initialization error.',
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('WebGL Boundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center p-8 bg-neutral-950 text-white rounded-2xl border border-neutral-800">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-6 text-rose-400">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-mono font-bold tracking-tight text-white mb-2">
            {this.props.fallbackTitle || '3D Graphics Render Error'}
          </h2>

          <p className="text-sm text-neutral-400 text-center max-w-md mb-6 leading-relaxed">
            {this.state.errorMessage}
          </p>

          <button
            type="button"
            onClick={this.handleReload}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-white text-black font-semibold text-xs tracking-wider uppercase hover:bg-neutral-200 transition-all active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload 3D Engine</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
