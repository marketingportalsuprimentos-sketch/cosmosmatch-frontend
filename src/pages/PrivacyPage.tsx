// src/pages/PrivacyPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const PrivacyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-gray-800 p-6 md:p-10 rounded-xl shadow-2xl border border-gray-700">
        <h1 className="text-3xl md:text-4xl font-bold text-indigo-400 mb-2">Política de Privacidade</h1>
        <p className="mb-8 text-sm text-gray-400">Última atualização: 17 de Dezembro de 2025</p>

        <div className="space-y-8 text-justify leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3 border-b border-gray-700 pb-2">1. Introdução</h2>
            <p>
              Bem-vindo ao <strong>Cosmos Match</strong> ("nós", "nosso"). Esta Política de Privacidade explica como coletamos, usamos, armazenamos e protegemos suas informações pessoais. Ao criar uma conta, você concorda com as práticas descritas nesta política.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 border-b border-gray-700 pb-2">2. Informações que Coletamos</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Dados de Cadastro:</strong> Nome, e-mail, senha (criptografada) e gênero.</li>
              <li><strong>Dados Astrológicos:</strong> Data, hora e cidade de nascimento para cálculo do Mapa Astral.</li>
              <li><strong>Dados de Perfil:</strong> Fotos, biografia e preferências.</li>
              <li><strong>Localização:</strong> Geolocalização (latitude/longitude) para sugerir conexões próximas.</li>
              <li><strong>Comunicação:</strong> Mensagens enviadas e interações (likes, denúncias).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 border-b border-gray-700 pb-2">3. Como Usamos seus Dados</h2>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Cálculos Cósmicos:</strong> Gerar mapas e compatibilidade.</li>
              <li><strong>Conexão:</strong> Exibir seu perfil para outros usuários compatíveis.</li>
              <li><strong>Segurança:</strong> Monitorar denúncias e aplicar bloqueios automáticos (Blur) em conteúdos suspeitos.</li>
              <li><strong>Pagamentos:</strong> Processar assinaturas via gateway seguro.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 border-b border-gray-700 pb-2">4. Compartilhamento de Dados</h2>
            <p>
              Não vendemos seus dados. Compartilhamos apenas com prestadores de serviço essenciais (armazenamento de imagem, pagamentos) ou se obrigados por lei.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 border-b border-gray-700 pb-2">5. Segurança dos Dados</h2>
            <p>
              Adotamos medidas técnicas robustas (criptografia, HTTPS). No entanto, encorajamos você a proteger sua senha.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 border-b border-gray-700 pb-2">6. Seus Direitos (LGPD)</h2>
            <p>Você tem o direito de acessar, corrigir e solicitar a exclusão dos seus dados a qualquer momento.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 border-b border-gray-700 pb-2">7. Retenção e Exclusão Definitiva (Quarentena)</h2>
            <p>
              Para garantir a segurança da comunidade e permitir a recuperação de contas excluídas acidentalmente, adotamos o seguinte protocolo de retenção:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Período de Retenção (Quarentena):</strong> Quando você solicita a exclusão, seus dados são mantidos em sigilo por <strong>40 dias</strong> em nossos servidores, mas inacessíveis ao público.</li>
              <li><strong>Exclusão Automática:</strong> Se a conta não for reativada dentro deste prazo, nosso sistema automatizado excluirá permanentemente o seu registro no banco de dados e removerá todas as suas fotos e vídeos dos servidores de armazenamento. Esta ação é irreversível.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 border-b border-gray-700 pb-2">8. Dados de Moderação e Banimento</h2>
            <p>
              Em caso de banimento por violação grave das regras (ex: fraude, assédio, conteúdo ilegal), poderemos reter identificadores básicos (como E-mail ou ID do dispositivo) estritamente para impedir a criação de novas contas pelo mesmo infrator, com base no legítimo interesse de proteção da segurança da plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 border-b border-gray-700 pb-2">9. Contato</h2>
            <p>
              Dúvidas sobre privacidade? E-mail: <a href="mailto:contato@cosmosmatch.app" className="text-indigo-400 hover:underline">contato@cosmosmatch.app</a>.
            </p>
          </section>
        </div>
        
        <div className="mt-12 pt-6 border-t border-gray-700 text-center">
          <button 
            onClick={() => navigate(-1)} 
            className="inline-block bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-full transition-colors font-semibold"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
};