import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary capturou:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fh-card" style={{ margin: 24 }}>
          <p style={{ color: 'var(--danger-text)', fontSize: '0.9rem' }}>
            Algo deu errado ao carregar esta página. Tente recarregar.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
