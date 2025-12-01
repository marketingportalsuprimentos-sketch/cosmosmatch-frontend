// src/pages/TermsPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Importamos o hook de navegação

export const TermsPage = () => {
  const navigate = useNavigate(); // Hook para controlar o histórico

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-gray-800 p-6 md:p-10 rounded-xl shadow-2xl border border-gray-700">
        <h1 className="text-3xl md:text-4xl font-bold text-indigo-400 mb-2">Termos de Uso</h1>
        <p className="mb-8 text-sm text-gray-400">Última atualização: 01 de Dezembro de 2025</p>

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
            <h2 className="text-xl font-bold text-white mb-3 border-b border-gray-700 pb-2">3. Regras da Comunidade</h2>
            <p>Queremos manter o Cosmos Match um ambiente seguro e respeitoso. É estritamente proibido:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Usar o serviço para qualquer finalidade ilegal ou criminosa.</li>
              <li>Assediar, intimidar, difamar, perseguir ou fazer discurso deódio contra qualquer pessoa.</li>
              <li>Publicar conteúdo pornográfico, violento, ou que promova o racismo, sexismo ou intolerância.</li>
              <li>Criar perfis falsos (fakes) ou se passar por outra pessoa.</li>
              <li>Enviar spam, correntes ou solicitar dinheiro a outros usuários.</li>
              <li>Usar robôs, crawlers ou qualquer meio automatizado para acessar o serviço.</li>
            </ul>
            <p className="mt-2 text-red-300">
              Violações destas regras resultarão no banimento imediato e permanente da sua conta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 border-b border-gray-700 pb-2">4. Serviços Astrológicos e Conteúdo</h2>
            <p>
              O Cosmos Match utiliza algoritmos baseados em dados astronômicos e princípios da astrologia e numerologia para sugerir compatibilidades. 
            </p>
            <p className="mt-2">
              <strong>Isenção de Garantia:</strong> Embora nos esforcemos pela precisão técnica dos cálculos planetários, as interpretações astrológicas são fornecidas para fins de entretenimento, autoconhecimento e conexão social. Não garantimos o sucesso de relacionamentos, nem a precisão absoluta de previsões sobre o futuro ou personalidade.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 border-b border-gray-700 pb-2">5. Contas Premium e Pagamentos</h2>
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
            <h2 className="text-xl font-bold text-white mb-3 border-b border-gray-700 pb-2">6. Segurança e Interações Offline</h2>
            <p>
              O Cosmos Match não realiza verificação de antecedentes criminais dos usuários. Você é o único responsável por suas interações com outros usuários.
            </p>
            <p className="mt-2 text-yellow-300 font-semibold">
              Recomendamos cautela extrema ao compartilhar informações pessoais sensíveis e ao marcar encontros presenciais. Encontre-se sempre em locais públicos e avise amigos ou familiares.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 border-b border-gray-700 pb-2">7. Limitação de Responsabilidade</h2>
            <p>
              O serviço é fornecido "como está". Não garantimos que o aplicativo será ininterrupto, seguro ou livre de erros. Em nenhuma circunstância o Cosmos Match será responsável por danos indiretos, incidentais ou consequentes decorrentes do uso do aplicativo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 border-b border-gray-700 pb-2">8. Alterações nos Termos</h2>
            <p>
              Podemos modificar estes termos a qualquer momento. Notificaremos sobre mudanças significativas. O uso contínuo do serviço após as alterações constitui aceitação dos novos termos.
            </p>
          </section>
        </div>
        
        <div className="mt-12 pt-6 border-t border-gray-700 text-center">
          {/* CORREÇÃO: Botão de Voltar Inteligente */}
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