import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiCheckCircle,
  FiEye,
  FiHeart,
  FiLock,
  FiMessageCircle,
  FiSearch,
  FiShield,
  FiStar,
  FiUsers,
  FiZap,
} from 'react-icons/fi';
import './HomePage.css';

const features = [
  {
    icon: FiSearch,
    title: 'Descoberta inteligente',
    description:
      'Encontre pessoas com interesses em comum e sugestões orientadas por afinidade.',
  },
  {
    icon: FiStar,
    title: 'Astrologia e numerologia',
    description:
      'Mapa astral e números ajudam a revelar padrões únicos e novas possibilidades de conexão.',
  },
  {
    icon: FiHeart,
    title: 'Compatibilidade profunda',
    description:
      'Uma leitura que combina afinidade, interesses, estilo de vida e indicadores de compatibilidade.',
  },
  {
    icon: FiMessageCircle,
    title: 'Conversas e conexões',
    description:
      'Dê match, converse e construa conexões reais no seu tempo, com mais contexto e propósito.',
  },
];

const capabilities = [
  ['Perfil completo', 'Mostre quem você é com fotos, interesses, estilo de vida e detalhes que importam.'],
  ['Curtidas e matches', 'Descubra pessoas que também demonstraram interesse em você.'],
  ['Chat', 'Converse com seus matches de forma prática e segura.'],
  ['Feed social', 'Compartilhe momentos, ideias, viagens e novas histórias.'],
  ['Bloqueio e denúncias', 'Ferramentas de controle, denúncia e proteção da experiência.'],
  ['Plano Premium', 'Mais visibilidade e recursos para aprofundar suas descobertas.'],
];

const compatibilityRows = [
  ['Mapa astral', 95],
  ['Numerologia', 88],
  ['Interesses', 90],
  ['Estilo de vida', 85],
];

export default function HomePage() {
  return (
    <div className="enterprise-home">
      <div className="cosmic-layer cosmic-layer-one" />
      <div className="cosmic-layer cosmic-layer-two" />

      <header className="enterprise-header">
        <Link to="/" className="brand" aria-label="CosmosMatch">
          <span className="brand-orbit">◉</span>
          <span>Cosmos<span>Match</span></span>
        </Link>

        <nav className="enterprise-nav" aria-label="Navegação principal">
          <a href="#como-funciona">Como funciona</a>
          <a href="#compatibilidade">Compatibilidade</a>
          <a href="#premium">Premium</a>
          <a href="#seguranca">Segurança</a>
        </nav>

        <div className="header-actions">
          <Link to="/login" className="header-login">Entrar</Link>
          <Link to="/register" className="primary-pill">
            Criar meu perfil <FiArrowRight />
          </Link>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              Conexões com mais contexto, afinidade e propósito
            </div>

            <h1>
              Encontre conexões que <span>fazem sentido</span> para você
            </h1>

            <p className="hero-description">
              O CosmosMatch une descoberta social, compatibilidade, astrologia e numerologia
              para ajudar você a conhecer pessoas reais com mais afinidade desde o primeiro contato.
            </p>

            <div className="hero-actions">
              <Link to="/register" className="primary-cta">
                Começar agora <FiArrowRight />
              </Link>
              <a href="#como-funciona" className="secondary-cta">
                Ver como funciona
              </a>
            </div>

            <div className="trust-row">
              <span><FiCheckCircle /> Experiência confiável</span>
              <span><FiLock /> Privacidade</span>
              <span><FiStar /> Compatibilidade inteligente</span>
            </div>
          </div>

          <div className="hero-product-stage" aria-label="Prévia do produto CosmosMatch">
            <div className="astro-panel glass-card">
              <div className="panel-kicker">Mapa astral</div>
              <div className="astro-wheel">
                <div className="astro-core" />
                <span className="astro-mark mark-one">✦</span>
                <span className="astro-mark mark-two">☾</span>
                <span className="astro-mark mark-three">♌</span>
                <span className="astro-mark mark-four">∞</span>
              </div>
              <div className="astro-list">
                <span><b>Sol</b> em Sagitário</span>
                <span><b>Lua</b> em Câncer</span>
                <span><b>Ascendente</b> em Leão</span>
              </div>
            </div>

            <div className="profile-phone">
              <div className="profile-photo">
                <div className="profile-glow" />
                <div className="profile-avatar">M</div>
                <div className="profile-photo-overlay" />
                <div className="profile-identity">
                  <strong>Mariana, 26</strong>
                  <span>São Paulo, SP</span>
                </div>
              </div>
              <div className="profile-tags">
                <span>Sagitário</span>
                <span>Viagens</span>
                <span>Música</span>
              </div>
              <div className="profile-actions">
                <button aria-label="Pular">×</button>
                <button aria-label="Favoritar"><FiStar /></button>
                <button className="like-action" aria-label="Curtir"><FiHeart /></button>
              </div>
            </div>

            <div className="compatibility-card glass-card">
              <div className="score-ring">
                <strong>92%</strong>
                <span>compatibilidade</span>
              </div>
              <div className="mini-bars">
                {compatibilityRows.map(([label, value]) => (
                  <div key={String(label)} className="mini-bar-row">
                    <div>
                      <span>{label}</span>
                      <b>{value}%</b>
                    </div>
                    <div className="mini-track">
                      <span style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="chat-card glass-card">
              <div className="chat-user">
                <div className="chat-avatar">L</div>
                <div>
                  <strong>Lucas</strong>
                  <span>Online agora</span>
                </div>
              </div>
              <div className="message message-in">Também amo viajar ✨</div>
              <div className="message message-out">Qual foi sua última aventura?</div>
            </div>
          </div>
        </section>

        <section className="section-shell" id="como-funciona">
          <div className="section-heading">
            <span>Uma experiência pensada para conexões melhores</span>
            <h2>Como o CosmosMatch funciona</h2>
            <p>
              Descubra, compare afinidades, converse e construa relações com mais informação e menos ruído.
            </p>
          </div>

          <div className="feature-grid">
            {features.map(({ icon: Icon, title, description }) => (
              <article className="feature-card" key={title}>
                <div className="feature-icon"><Icon /></div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="compatibility-section" id="compatibilidade">
          <div className="match-visual">
            <div className="person-orb orb-left">
              <div className="orb-avatar">M</div>
              <span>Mariana, 26</span>
              <small>Sagitário</small>
            </div>

            <div className="match-score">
              <strong>92%</strong>
              <span>de compatibilidade</span>
              <FiHeart />
            </div>

            <div className="person-orb orb-right">
              <div className="orb-avatar">L</div>
              <span>Lucas, 28</span>
              <small>Leão</small>
            </div>
          </div>

          <div className="compatibility-copy">
            <span className="section-label">Compatibilidade inteligente</span>
            <h2>Além do superficial</h2>
            <p>
              O CosmosMatch organiza sinais de afinidade em uma leitura simples e visual para ajudar
              você a entender por que uma conexão pode fazer sentido.
            </p>

            <div className="compatibility-bars">
              {compatibilityRows.map(([label, value]) => (
                <div className="compatibility-row" key={String(label)}>
                  <div className="compatibility-meta">
                    <span>{label}</span>
                    <b>{value}%</b>
                  </div>
                  <div className="compatibility-track">
                    <span style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <blockquote>
              “Mais do que um match, uma experiência de descoberta com contexto.”
            </blockquote>
          </div>
        </section>

        <section className="section-shell capability-section">
          <div className="section-heading">
            <span>Produto completo</span>
            <h2>Tudo o que você precisa em um só lugar</h2>
            <p>Uma plataforma para descobrir pessoas, se expressar e viver novas histórias.</p>
          </div>

          <div className="capability-grid">
            {capabilities.map(([title, description], index) => {
              const icons = [FiUsers, FiHeart, FiMessageCircle, FiEye, FiShield, FiZap];
              const Icon = icons[index];
              return (
                <article className="capability-card" key={title}>
                  <div className="capability-icon"><Icon /></div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="premium-banner" id="premium">
          <div className="premium-copy">
            <span className="premium-kicker">CosmosMatch Premium</span>
            <h2>Mais possibilidades para conexões ainda mais especiais</h2>
            <p>
              Amplie sua experiência com recursos extras de descoberta, visibilidade e personalização.
            </p>
          </div>

          <div className="premium-benefits">
            <div><FiEye /><span><b>Mais visibilidade</b>Seja encontrado por mais pessoas compatíveis.</span></div>
            <div><FiStar /><span><b>Recursos exclusivos</b>Acesse uma experiência mais completa.</span></div>
            <div><FiZap /><span><b>Mais possibilidades</b>Descubra mais sem perder o foco na afinidade.</span></div>
          </div>

          <Link to="/register" className="premium-cta">
            Conhecer Premium <FiArrowRight />
          </Link>
        </section>

        <section className="security-section" id="seguranca">
          <div className="section-heading">
            <span>Confiança desde o primeiro contato</span>
            <h2>Privacidade e segurança em primeiro lugar</h2>
            <p>Você mantém o controle sobre sua experiência e suas conexões.</p>
          </div>

          <div className="security-grid">
            <article><FiLock /><div><h3>Controle da visibilidade</h3><p>Defina como deseja se apresentar e gerencie suas informações.</p></div></article>
            <article><FiShield /><div><h3>Bloqueio e proteção</h3><p>Bloqueie perfis e mantenha sua experiência sob controle.</p></div></article>
            <article><FiCheckCircle /><div><h3>Denúncias e moderação</h3><p>Ferramentas para reportar comportamentos inadequados com facilidade.</p></div></article>
            <article><FiUsers /><div><h3>Experiência confiável</h3><p>Regras claras e recursos voltados para interações mais respeitosas.</p></div></article>
          </div>
        </section>

        <section className="final-cta">
          <div className="final-orbit final-orbit-left" />
          <div className="final-orbit final-orbit-right" />
          <span>Seu próximo encontro pode começar por uma afinidade</span>
          <h2>Pronto para descobrir conexões com mais sentido?</h2>
          <p>Crie sua conta e dê o primeiro passo para conhecer pessoas de um jeito diferente.</p>
          <Link to="/register" className="primary-cta">
            Criar conta grátis <FiArrowRight />
          </Link>
        </section>
      </main>

      <footer className="enterprise-footer">
        <div>
          <Link to="/" className="brand footer-brand">
            <span className="brand-orbit">◉</span>
            <span>Cosmos<span>Match</span></span>
          </Link>
          <p>Conexões com mais afinidade, contexto e propósito.</p>
        </div>

        <div className="footer-links">
          <Link to="/terms">Termos</Link>
          <Link to="/privacy">Privacidade</Link>
          <Link to="/login">Entrar</Link>
          <Link to="/register">Criar conta</Link>
        </div>
      </footer>
    </div>
  );
}
