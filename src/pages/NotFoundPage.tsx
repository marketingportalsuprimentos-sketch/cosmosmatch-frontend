// src/pages/NotFoundPage.tsx
// --- 1. 'React' REMOVIDO (NÃO É NECESSÁRIO) ---
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div>
      <h1>404 - Página Não Encontrada</h1>
      <Link to="/login">Voltar para o Login</Link>
    </div>
  );
};

export default NotFoundPage;