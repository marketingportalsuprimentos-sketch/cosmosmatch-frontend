// src/pages/PrivacyPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Importamos o hook de navegação

export const PrivacyPage = () => {
  const navigate = useNavigate(); // Hook para controlar o histórico

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-gray-800 p-6 md:p-10 rounded-xl shadow-2xl border border-gray-700">
        <h1 className="text-3xl md:text-4xl font-bold text-indigo-400 mb-2">Política de Privacidade</h1>
        <p className="mb-8 text-sm text-gray-400">Última atualização: 01 de Dezembro de 2025</p>

        <div className="space-y-8 text-justify leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3 border-b border-gray-700 pb-2">1. Introdução</h2>
            <p>
              Bem-vindo ao <strong>Cosmos Match</strong> ("nós", "nosso"). A sua privacidade é a nossa prioridade. 
              Esta Política de Privacidade explica de forma transparente como coletamos, usamos, armazenamos e protegemos 
              suas informações pessoais ao utilizar nosso aplicativo e serviços de conexão astrológica.
            </p>
            <p className="mt-2">
              Ao criar uma conta, você concorda com as práticas descritas nesta política. Se não concordar, por favor, não utilize o serviço.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 border-b border-gray-700 pb-2">2. Informações que Coletamos</h2>
            <p className="mb-2">Para oferecer nossos serviços de compatibilidade, precisamos processar os seguintes dados:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Dados de Cadastro:</strong> Nome, endereço de e-mail, senha (criptografada) e gênero.</li>
              <li><strong>Dados Astrológicos e Numerológicos (Essenciais):</strong> Data de nascimento, hora exata de nascimento e cidade de nascimento. Estes dados são fundamentais para o cálculo do seu Mapa Astral e Sinastria.</li>
              <li><strong>Dados de Perfil:</strong> Fotos, biografia, preferências de relacionamento e respostas ao quiz comportamental.</li>
              <li><strong>Dados de Localização:</strong> Coletamos sua geolocalização precisa (latitude e longitude) quando você usa o app para sugerir conexões próximas ("Descoberta").</li>
              <li><strong>Conteúdo de Comunicação:</strong> Mensagens enviadas através do nosso chat e interações (likes, skips, follows).</li>
              <li><strong>Dados Técnicos:</strong> Endereço IP, tipo de dispositivo e dados de uso para segurança e melhoria do app.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 border-b border-gray-700 pb-2">3. Como Usamos seus Dados</h2>
            <p>Utilizamos suas informações para:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Cálculos Cósmicos:</strong> Gerar seu mapa astral, mapa numerológico e calcular a porcentagem de compatibilidade com outros usuários.</li>
              <li><strong>Conexão:</strong> Exibir seu perfil para outros usuários com base em localização e afinidade astral.</li>
              <li><strong>Comunicação:</strong> Permitir o envio de mensagens e notificações sobre matches e interações.</li>
              <li><strong>Segurança:</strong> Detectar e prevenir fraudes, contas falsas e comportamentos abusivos.</li>
              <li><strong>Pagamentos:</strong> Processar assinaturas Premium (via gateway seguro Asaas). Nós <strong>não</strong> armazenamos os dados completos do seu cartão de crédito.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 border-b border-gray-700 pb-2">4. Compartilhamento de Dados</h2>
            <p>
              Não vendemos seus dados pessoais a terceiros. Compartilhamos informações apenas nas seguintes situações estritas:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Com Outros Usuários:</strong> Seu perfil público (nome, fotos, idade, signo, bio e cidade) é visível para outros usuários do app. Seus dados exatos de nascimento (hora/minuto) não são exibidos publicamente, apenas as interpretações astrológicas.</li>
              <li><strong>Prestadores de Serviço:</strong> Empresas que nos ajudam a operar o app (ex: Cloudinary para armazenamento de imagens, Asaas para pagamentos, serviços de hospedagem).</li>
              <li><strong>Obrigação Legal:</strong> Se formos obrigados por lei ou ordem judicial a divulgar informações às autoridades competentes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 border-b border-gray-700 pb-2">5. Segurança dos Dados</h2>
            <p>
              Adotamos medidas técnicas robustas para proteger seus dados, incluindo criptografia de senhas, conexões seguras (HTTPS/SSL) e restrição de acesso aos nossos servidores. No entanto, nenhum sistema é 100% impenetrável, e encorajamos você a proteger sua senha.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 border-b border-gray-700 pb-2">6. Seus Direitos (LGPD)</h2>
            <p>Você tem o direito de:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Acessar os dados que temos sobre você.</li>
              <li>Corrigir dados incompletos ou inexatos (via edição de perfil).</li>
              <li>Revogar o consentimento de uso de localização.</li>
              <li>Solicitar a exclusão da sua conta e de todos os seus dados pessoais.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 border-b border-gray-700 pb-2">7. Exclusão de Conta</h2>
            <p>
              Você pode excluir sua conta a qualquer momento acessando as configurações do perfil ou enviando uma solicitação para <strong>contato@cosmosmatch.app</strong>. Após a exclusão, seus dados serão removidos de nossos sistemas ativos, salvo se a retenção for necessária por lei.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 border-b border-gray-700 pb-2">8. Contato</h2>
            <p>
              Se tiver dúvidas, preocupações ou solicitações sobre esta política, entre em contato com nosso Encarregado de Dados pelo e-mail: <a href="mailto:contato@cosmosmatch.app" className="text-indigo-400 hover:underline">contato@cosmosmatch.app</a>.
            </p>
          </section>
        </div>
        
        <div className="mt-12 pt-6 border-t border-gray-700 text-center">
          {/* CORREÇÃO: Usamos navigate(-1) para voltar à página anterior (seja Register, Home ou Profile) */}
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