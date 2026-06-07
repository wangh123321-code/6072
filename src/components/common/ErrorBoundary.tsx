import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { logError } from '@/utils/errorHandler';
import { Button } from './Button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  moduleName?: string;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logError(error, `${this.props.moduleName || 'Component'} Error Boundary`);
    console.error('Component Stack:', errorInfo.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 bg-warm-50 rounded-card border-2 border-dashed border-gray-200 min-h-[200px]">
          <div className="relative mb-4">
            <img
              src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20cat%20looking%20confused%20with%20question%20mark%2C%20soft%20colors&image_size=square"
              alt="Error cat"
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <AlertTriangle className="w-6 h-6 text-danger-500 absolute -bottom-1 -right-1 bg-white rounded-full p-1" />
          </div>
          <h3 className="text-lg font-display text-gray-800 mb-2">
            {this.props.moduleName
              ? `${this.props.moduleName} 暂时无法加载`
              : '出了点小问题'}
          </h3>
          <p className="text-sm text-gray-500 mb-4 text-center max-w-xs">
            {this.state.error?.message || '别担心，这不会影响其他功能的使用'}
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={this.handleReset}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            重新加载
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  moduleName?: string
): React.FC<P> => {
  const Wrapped: React.FC<P> = (props) => (
    <ErrorBoundary moduleName={moduleName}>
      <Component {...props} />
    </ErrorBoundary>
  );
  Wrapped.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return Wrapped;
};
