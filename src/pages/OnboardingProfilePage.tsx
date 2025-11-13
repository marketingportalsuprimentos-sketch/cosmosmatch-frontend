import React from 'react';
// 1. Importar o EditProfileForm
// O caminho '../features/profile/components/EditProfileForm' está correto
import { EditProfileForm } from '../features/profile/components/EditProfileForm'; 

export const OnboardingProfilePage: React.FC = () => {

  // 2. Renderiza o formulário de perfil dentro de um layout simples
  //    para centralizá-lo, similar ao formulário de login/registo.
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4 py-8">
      {/* O EditProfileForm já tem o seu próprio fundo e padding,
          mas este wrapper garante que ele esteja centralizado na página. */}
      <EditProfileForm />
    </div>
  );
};

export default OnboardingProfilePage;

