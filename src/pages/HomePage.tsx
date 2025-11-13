// src/pages/HomePage.tsx
import { Link } from 'react-router-dom';
import './HomePage.css'; // Importa o CSS específico

// NOTA: Como estamos fora do router, não podemos usar o 'useNavigate'
// Usamos o <Link> do 'react-router-dom' para a navegação.

export default function HomePage() {
  return (
    <div className="homepage-container">
      <header className="homepage-header">
        <div className="logo-placeholder">
          {/* TODO: Substitua este texto pela sua imagem de Logo */}
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

        {/* Secção Opcional de "Features" */}
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
        {/* TODO: Adicione links para "Termos de Uso" ou "Política de Privacidade" se necessário */}
      </footer>
    </div>
  );
}