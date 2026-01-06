// frontend/src/pages/AdminReportsPage.tsx

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resolveReport } from '@/features/admin/services/reportsApi';
import { banUser, deletePostAsAdmin } from '@/features/admin/services/adminApi';
import { api } from '@/services/api'; 
import { FiAlertTriangle, FiCheck, FiX, FiSlash, FiLoader, FiTrash2, FiRefreshCw, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'sonner'; 
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';

export function AdminReportsPage() {
  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useQuery({
    queryKey: ['admin', 'reports'],
    queryFn: async () => {
        const res = await api.get('/reports/pending');
        return res.data;
    },
  });

  // --- AÇÕES REFINADAS PARA SINCRONIA COM O BACKEND ---

  const { mutate: dismissReport } = useMutation({
    mutationFn: (id: string) => resolveReport(id, 'DISMISSED'),
    onSuccess: () => {
      toast.success('Denúncia arquivada.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
    },
  });

  const handleBanUser = async (userId: string, reportId: string) => {
    if (!window.confirm('🚨 PERIGO: Isso vai banir o usuário de todo o app. Confirmar?')) return;
    try {
      await banUser(userId);
      await resolveReport(reportId, 'RESOLVED');
      toast.success('Usuário banido!');
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
    } catch (error) {
      toast.error('Erro ao banir usuário.');
    }
  };

  const handleDeletePost = async (postId: string, reportId: string) => {
    if (!window.confirm('Apagar este post permanentemente?')) return;
    try {
      await deletePostAsAdmin(postId);
      await resolveReport(reportId, 'RESOLVED');
      toast.success('Post apagado com sucesso.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
    } catch (error) {
      toast.error('Erro ao apagar post.');
    }
  };

  // Ajustado para fechar a denúncia como RESOLVIDA ao restaurar
  const handleRestorePost = async (postId: string, reportId: string) => {
    try {
      await api.patch(`/post/${postId}/restore`); 
      await resolveReport(reportId, 'RESOLVED'); // Marcamos como resolvido pois o admin já julgou [cite: 1]
      toast.success('Blur removido! O post reapareceu no feed.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
    } catch (error) {
      toast.error('Erro ao restaurar post.');
    }
  };

  // Ajustado para aplicar o campo isHidden que dispara o Blur no mobile [cite: 19, 21]
  const handleHidePost = async (postId: string) => {
    try {
      await api.patch(`/post/${postId}/hide`);
      toast.success('Blur aplicado! O conteúdo agora está desfocado para os usuários.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
    } catch (error) {
      toast.error('Erro ao ocultar post.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        <FiLoader className="animate-spin text-4xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
            <FiAlertTriangle className="text-red-500" />
            Tribunal de Moderação
          </h1>
          <Link to="/admin" className="text-gray-400 hover:text-white transition-colors">
            Voltar ao Dashboard
          </Link>
        </div>

        {reports?.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 p-12 rounded-lg text-center shadow-sm">
            <FiCheck className="mx-auto text-5xl text-green-500 mb-4" />
            <h2 className="text-2xl font-semibold text-white">Tudo limpo!</h2>
            <p className="text-gray-400 mt-2">Nenhuma denúncia pendente.</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {reports?.map((report: any) => (
              <div key={report.id} className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl overflow-hidden flex flex-col md:flex-row">
                
                {/* --- LADO ESQUERDO: CONTEÚDO --- */}
                <div className="md:w-1/3 bg-black relative group min-h-[300px]">
                  {report.post ? (
                    <>
                      <img 
                        src={report.post.imageUrl} 
                        alt="Conteúdo" 
                        className={`w-full h-full object-cover transition-all ${report.post.isHidden ? 'blur-md opacity-50' : 'opacity-90 group-hover:opacity-100'}`}
                      />
                      {report.post.isHidden && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-2 shadow-2xl">
                            <FiEyeOff /> Conteúdo Oculto (Blur)
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 flex-col gap-2">
                      <FiX className="text-4xl" />
                      <span>Denúncia de Perfil</span>
                    </div>
                  )}
                </div>

                {/* --- LADO DIREITO: JULGAMENTO --- */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1 rounded-full text-xs font-bold">
                        MOTIVO: {report.reason}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {format(new Date(report.createdAt), "d MMM, HH:mm", { locale: ptBR })}
                      </span>
                    </div>

                    <div className="bg-gray-800/40 p-4 rounded-lg border border-gray-800">
                      <p className="text-xs text-gray-500 uppercase font-bold mb-2">Autor do Post</p>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{report.reported.name}</span>
                        {report.reported.isBanned && <span className="bg-red-600 text-[10px] px-1 rounded text-white">BANIDO</span>}
                      </div>
                      <p className="text-xs text-gray-500">{report.reported.email}</p>
                    </div>
                  </div>

                  {/* BOTÕES DE AÇÃO SINCRONIZADOS */}
                  <div className="grid grid-cols-2 gap-3 pt-6 border-t border-gray-800 mt-6">
                    
                    {report.post?.isHidden ? (
                      <button
                        onClick={() => handleRestorePost(report.post.id, report.id)}
                        className="col-span-2 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-all font-bold text-sm"
                      >
                        <FiRefreshCw className="animate-spin-slow" /> REMOVER BLUR E RESTAURAR
                      </button>
                    ) : (
                      <button
                        onClick={() => handleHidePost(report.post.id)}
                        className="col-span-2 flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white p-3 rounded-lg transition-all font-bold text-sm"
                      >
                        <FiEyeOff /> APLICAR BLUR MANUAL
                      </button>
                    )}

                    <button
                      onClick={() => handleDeletePost(report.post.id, report.id)}
                      className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-red-900/40 text-gray-300 hover:text-red-400 p-3 rounded-lg border border-gray-700 transition-all text-sm"
                    >
                      <FiTrash2 /> APAGAR POST
                    </button>

                    <button
                      onClick={() => handleBanUser(report.reported.id, report.id)}
                      disabled={report.reported.isBanned}
                      className="flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white p-3 rounded-lg border border-red-900/30 transition-all text-sm font-bold"
                    >
                      <FiSlash /> BANIR AUTOR
                    </button>

                    <button
                      onClick={() => dismissReport(report.id)}
                      className="col-span-2 text-xs text-gray-600 hover:text-gray-400 py-2 text-center"
                    >
                      Ignorar esta denúncia
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}