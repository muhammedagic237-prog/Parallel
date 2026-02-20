import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('[Parallel] Caught error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="h-[100dvh] w-full ios26-wallpaper flex flex-col items-center justify-center p-8">
                    <div
                        className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
                        style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(255, 255, 255, 0.7)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)' }}
                    >
                        <span className="text-4xl">⚠️</span>
                    </div>
                    <h2 className="text-xl font-bold mb-2" style={{ color: 'rgba(0, 0, 0, 0.85)' }}>Something went wrong</h2>
                    <p className="text-sm text-center mb-6 max-w-xs" style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
                        An unexpected error occurred. Tap below to recover.
                    </p>
                    <button
                        onClick={this.handleReset}
                        className="px-6 py-3 rounded-2xl font-semibold active:scale-95 transition-transform"
                        style={{
                            color: 'white',
                            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                            boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
                        }}
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
