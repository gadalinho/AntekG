import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : 'Nieznany błąd';
    return { hasError: true, message };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary złapał błąd:', error, info);
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-[#1B3B6F]">
          <div className="text-6xl mb-4">🗺️</div>
          <h1 className="text-2xl font-bold text-[#FFD93D] mb-2">Ups! Coś poszło nie tak.</h1>
          <p className="text-white/80 mb-6">
            Nawigator się zgubił! Wróć na mapę i spróbuj ponownie.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, message: '' });
              window.location.reload();
            }}
            className="bg-[#FF8C42] text-white font-bold px-8 py-3 rounded-2xl text-lg"
          >
            🔄 Wróć na mapę
          </button>
          {import.meta.env.DEV && (
            <p className="mt-4 text-xs text-white/40 font-mono">{this.state.message}</p>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
