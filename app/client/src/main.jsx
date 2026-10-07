import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', fontFamily: 'monospace', background: '#fff', maxWidth: '800px', margin: '40px auto' }}>
          <h2 style={{ color: '#e11d48', fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>
            Sayfa Yüklenirken Hata Oluştu
          </h2>
          <pre style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', color: '#334155', fontSize: '13px', overflow: 'auto', border: '1px solid #cbd5e1' }}>
            {this.state.error?.toString()}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => { localStorage.clear(); window.location.href = '/'; }}
            style={{ marginTop: '16px', background: '#f59e0b', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Önbelleği Temizle &amp; Yeniden Yükle
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
