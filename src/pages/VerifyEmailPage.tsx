// frontend/src/pages/VerifyEmailPage.tsx
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useVerifyEmail } from '@/features/auth/hooks/useAuthMutations'; // Importa o nosso novo hook
import { BarLoader } from 'react-spinners'; // Loader visual
import { IoCheckmarkCircleOutline, IoWarningOutline } from 'react-icons/io5'; // Ícones de sucesso/erro

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // Extrai o token da URL
  const { mutate: verifyEmail, isPending, isSuccess, isError } = useVerifyEmail();

  useEffect(() => {
    if (token) {
      verifyEmail(token); // Chama o hook para verificar o email
    } else {
      // Se não houver token, marca como erro (o onError do hook vai lidar com o redirecionamento)
      // Ou podemos redirecionar diretamente, dependendo da UX desejada.
      // Por agora, vamos deixar o isError reagir.
      console.error('Nenhum token de verificação encontrado na URL.');
      // O useVerifyEmail.onError já redireciona para /login e mostra um toast
    }
  }, [token, verifyEmail]); // Dependências do useEffect

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-gray-900 text-white">
      <div className="mx-auto max-w-lg text-center">
        <h2 className="mt-10 text-center text-3xl font-bold leading-9 tracking-tight text-white">
          Verificando o seu Email...
        </h2>

        <div className="mt-10 flex flex-col items-center justify-center space-y-4">
          {isPending && (
            <>
              <BarLoader color="#8B5CF6" /> {/* Cor roxa */}
              <p className="text-gray-400">Por favor, aguarde enquanto confirmamos o seu email.</p>
            </>
          )}

          {isSuccess && (
            <>
              <IoCheckmarkCircleOutline className="h-16 w-16 text-green-500" />
              <p className="text-lg font-medium text-green-400">Email verificado com sucesso!</p>
              <p className="text-gray-400">Você será redirecionado(a) em breve.</p>
            </>
          )}

          {isError && (
            <>
              <IoWarningOutline className="h-16 w-16 text-red-500" />
              <p className="text-lg font-medium text-red-400">Falha na verificação.</p>
              <p className="text-gray-400">
                O token pode ser inválido ou expirado. Você será redirecionado(a) para a página de login.
              </p>
            </>
          )}

          {!token && (
            <>
              <IoWarningOutline className="h-16 w-16 text-red-500" />
              <p className="text-lg font-medium text-red-400">Token de verificação não encontrado.</p>
              <p className="text-gray-400">
                Por favor, use o link completo enviado para o seu email. Você será redirecionado(a) para a página de login.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyEmailPage; // Exportação padrão também