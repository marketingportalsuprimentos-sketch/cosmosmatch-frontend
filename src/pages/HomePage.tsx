// src/pages/HomePage.tsx
import { Link } from 'react-router-dom';
import './HomePage.css'; 

export default function HomePage() {
  return (
    <div className="homepage-container">
      <header className="homepage-header">
        <div className="logo-placeholder">
          <span className="logo-text">CosmosMatch</span>
        </div>
        <nav className="homepage-nav">
          <Link to="/login" className="btn btn-secondary">
            Entrar
          </Link>
          <Link to="/register" className="btn btn-primary">
            Criar Conta
          </Link>
        </nav>
      </header>

      <main className="homepage-main">
        <div className="hero-content">
          <h1 className="hero-title">
            Conecte-se através dos astros.
          </h1>
          <p className="hero-subtitle">
            Descubra pessoas que realmente combinam consigo,
            usando a sabedoria da astrologia e da numerologia
            para criar conexões profundas.
          </p>
          <Link to="/register" className="btn btn-primary btn-large">
            Começar Agora (É Grátis)
          </Link>
        </div>

        {/* Secção de Features */}
        <section className="features-section">
          <div className="feature-item">
            <h3>🌌 Mapas Astrais</h3>
            <p>Análise de compatibilidade sinástrica detalhada.</p>
          </div>
          <div className="feature-item">
            <h3>💬 Chat Consciente</h3>
            <p>Converse com quem partilha as suas energias.</p>
          </div>
          <div className="feature-item">
            <h3>✨ Descoberta</h3>
            <p>Filtre por signo, ascendente ou localização.</p>
          </div>
        </section>
      </main>

      <footer className="homepage-footer">
        <p>© 2025 CosmosMatch. Todos os direitos reservados.</p>
        
        {/* LINKS RECOLOCADOS AQUI */}
        <div style={{ marginTop: '15px', fontSize: '0.9em', opacity: 0.8, display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <Link to="/terms" style={{ color: 'inherit', textDecoration: 'underline' }}>
            Termos de Uso
          </Link>
          <Link to="/privacy" style={{ color: 'inherit', textDecoration: 'underline' }}>
            Política de Privacidade
          </Link>
        </div>
      </footer>
    </div>
  );
}