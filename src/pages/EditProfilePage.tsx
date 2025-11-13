// src/pages/EditProfilePage.tsx
import { EditProfileForm } from '../features/profile/components/EditProfileForm';

const EditProfilePage = () => {
  return (
    // --- INÍCIO DA CORREÇÃO ---
    // 1. Mudado 'py-6' (padding em cima E em baixo) para 'pt-6' (padding SÓ em cima)
    //    para dar mais espaço em baixo e remover o scroll.
    // 2. Mantido 'sm:py-12' para ecrãs maiores.
    <div className="flex min-h-screen items-start justify-center bg-gray-900 px-4 pt-6 sm:py-12">
    {/* --- FIM DA CORREÇÃO --- */}
      <EditProfileForm />
    </div>
  );
};

export default EditProfilePage;