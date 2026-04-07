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
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-red-50 text-center">
                    <h1 className="text-3xl font-bold text-red-600 mb-4">Something went wrong</h1>
                    <p className="text-gray-700 mb-6 max-w-md">
                        The application encountered an unexpected error. This might be due to a graphics driver issue or a temporary loading failure.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg"
                    >
                        Reload Application
                    </button>
                    {process.env.NODE_ENV === 'development' && (
                        <pre className="mt-8 p-4 bg-white border border-red-200 rounded-lg text-left text-xs overflow-auto max-w-2xl w-full">
                            {this.state.error?.toString()}
                        </pre>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
