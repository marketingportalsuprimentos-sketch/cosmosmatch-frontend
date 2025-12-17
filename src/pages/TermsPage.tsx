// src/pages/TermsPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const TermsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-gray-800 p-6 md:p-10 rounded-xl shadow-2xl border border-gray-700">
        <h1 className="text-3xl md:text-4xl font-bold text-indigo-400 mb-2">Termos de Uso</h1>
        <p className="mb-8 text-sm text-gray-400">Última atualização: 17 de Dezembro de 2025</p>

        <div className="space-y-8 text-justify leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3 border-b border-gray-700 pb-2">1. Aceitação dos Termos</h2>
            <p>
              Ao criar uma conta, acessar ou utilizar o aplicativo <strong>Cosmos Match</strong> ("Serviço"), você concorda em ficar vinculado a estes Termos de Uso e à nossa Política de Privacidade. Se você não concordar com qualquer parte destes termos, você não tem permissão para acessar o serviço.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 border-b border-gray-700 pb-2">2. Elegibilidade</h2>
            <p>
              Você deve ter pelo menos <strong>18 anos de idade</strong> para criar uma conta e usar o Cosmos Match. Ao utilizar o serviço, você declara e garante que tem capacidade legal para celebrar este contrato vinculativo e que não foi banido anteriormente do nosso serviço.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 border-b border-gray-700 pb-2">3. Regras da Comunidade e Banimento</h2>
            <p>Queremos manter o Cosmos Match um ambiente seguro e respeitoso. É estritamente proibido:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Usar o serviço para qualquer finalidade ilegal ou criminosa.</li>
              <li>Assediar, intimidar, difamar, perseguir ou fazer discurso de ódio contra qualquer pessoa.</li>
              <li>Publicar conteúdo pornográfico, violento, ou que promova o racismo, sexismo ou intolerância.</li>
              <li>Criar perfis falsos (fakes) ou se passar por outra pessoa.</li>
              <li>Enviar spam, correntes ou solicitar dinheiro a outros usuários.</li>
            </ul>
            <p className="mt-2 text-red-300 border-l-4 border-red-500 pl-4 py-1 bg-red-900/10">
              <strong>Banimento Permanente:</strong> Violações destas regras resultarão no banimento imediato da sua conta. Usuários banidos perdem o acesso a todos os serviços e não terão direito a reembolso de assinaturas ativas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 border-b border-gray-700 pb-2">4. Moderação de Conteúdo e "Blur"</h2>
            <p>
              Para proteger a comunidade de conteúdos sensíveis ou ofensivos antes mesmo da análise humana, utilizamos um sistema de moderação colaborativa:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Ocultação Automática (Blur):</strong> Qualquer postagem que receba um número elevado de denúncias (4 ou mais) será automaticamente ocultada por um filtro visual ("Blur") e bloqueada para interações.</li>
              <li><strong>Moderação Manual:</strong> A administração reserva-se o direito de ocultar manualmente qualquer conteúdo suspeito preventivamente.</li>
              <li><strong>Restauração:</strong> Conteúdos ocultos só voltarão a ser visíveis se, após análise, a equipe de moderação julgar que não houve violação das regras.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 border-b border-gray-700 pb-2">5. Serviços Astrológicos</h2>
            <p>
              O Cosmos Match utiliza algoritmos baseados em dados astronômicos e princípios da astrologia e numerologia para sugerir compatibilidades. 
            </p>
            <p className="mt-2">
              <strong>Isenção de Garantia:</strong> As interpretações astrológicas são fornecidas para fins de entretenimento e autoconhecimento. Não garantimos o sucesso de relacionamentos, nem a precisão absoluta de previsões sobre o futuro.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 border-b border-gray-700 pb-2">6. Contas Premium e Pagamentos</h2>
            <p>
              Algumas funcionalidades do app são pagas (Assinatura Premium).
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Cobrança:</strong> Os pagamentos são processados de forma segura. Ao assinar, você autoriza a cobrança da taxa escolhida.</li>
              <li><strong>Renovação:</strong> As assinaturas podem ser renovadas automaticamente, a menos que canceladas pelo menos 24 horas antes do fim do período.</li>
              <li><strong>Reembolso:</strong> Pagamentos não são reembolsáveis, exceto onde exigido por lei.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 border-b border-gray-700 pb-2">7. Segurança e Interações Offline</h2>
            <p>
              O Cosmos Match não realiza verificação de antecedentes criminais dos usuários. Você é o único responsável por suas interações com outros usuários. Recomendamos cautela extrema ao marcar encontros presenciais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 border-b border-gray-700 pb-2">8. Encerramento de Conta e Quarentena</h2>
            <p>
              O usuário pode solicitar a exclusão da conta a qualquer momento. No entanto, para segurança dos dados e prevenção de exclusões acidentais, aplicamos a seguinte regra:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Período de Quarentena:</strong> Ao confirmar a exclusão, sua conta entra em "Quarentena" por <strong>40 dias</strong>. Durante este período, seu perfil fica invisível para o público.</li>
              <li><strong>Restauração:</strong> Se você fizer login durante os 40 dias, terá a opção de restaurar sua conta imediatamente. Caso recuse a restauração, o acesso será negado e a contagem para exclusão continuará.</li>
              <li><strong>Exclusão Definitiva:</strong> Após 40 dias sem restauração, todos os seus dados (fotos, chats, perfil) serão apagados permanentemente dos nossos servidores, sem possibilidade de recuperação.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 border-b border-gray-700 pb-2">9. Alterações nos Termos</h2>
            <p>
              Podemos modificar estes termos a qualquer momento. O uso contínuo do serviço após as alterações constitui aceitação dos novos termos.
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