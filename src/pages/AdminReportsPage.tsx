// frontend/src/pages/AdminReportsPage.tsx

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resolveReport } from '@/features/admin/services/reportsApi';
import { banUser, deletePostAsAdmin } from '@/features/admin/services/adminApi';
import { api } from '@/services/api'; 
// Adicionei FiEyeOff para o ícone de Blur
import { FiAlertTriangle, FiCheck, FiX, FiSlash, FiLoader, FiTrash2, FiRefreshCw, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'sonner'; 
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';

export function AdminReportsPage() {
  const queryClient = useQueryClient();

  // Busca as denúncias
  const { data: reports, isLoading } = useQuery({
    queryKey: ['admin', 'reports'],
    queryFn: async () => {
        const res = await api.get('/reports/pending');
        return res.data;
    },
  });

  // Ação: Absolver (Arquivar denúncia)
  const { mutate: dismissReport } = useMutation({
    mutationFn: (id: string) => resolveReport(id, 'DISMISSED'),
    onSuccess: () => {
      toast.success('Denúncia arquivada.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
    },
  });

  // Ação: Banir Usuário
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

  // Ação: Apagar Post Definitivamente
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

  // Ação: Restaurar Post (Inocente)
  const handleRestorePost = async (postId: string, reportId: string) => {
    try {
      await api.patch(`/post/${postId}/restore`); 
      await resolveReport(reportId, 'DISMISSED'); // Fecha a denúncia pois foi julgado inocente
      toast.success('Post restaurado e visível no feed!');
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
    } catch (error) {
      toast.error('Erro ao restaurar post.');
    }
  };

  // --- NOVA AÇÃO: Ocultar Manualmente (Aplicar Blur) ---
  const handleHidePost = async (postId: string) => {
    try {
      await api.patch(`/post/${postId}/hide`);
      toast.success('Blur aplicado! O post agora está oculto.');
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
            <p className="text-gray-400 mt-2">Nenhuma denúncia pendente para análise.</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {reports?.map((report: any) => (
              <div key={report.id} className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl overflow-hidden flex flex-col md:flex-row">
                
                {/* --- LADO ESQUERDO: A PROVA (FOTO) --- */}
                <div className="md:w-1/3 bg-black relative group min-h-[300px]">
                  {report.post ? (
                    <>
                      <img 
                        src={report.post.imageUrl} 
                        alt="Conteúdo Denunciado" 
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                      />
                      {/* Badge se estiver oculto */}
                      {report.post.isHidden && (
                        <div className="absolute top-4 left-4 bg-red-600/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase shadow-lg flex items-center gap-2">
                          <FiEye className="text-white" /> Oculto (Blur)
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                        <p className="text-white text-sm line-clamp-2">{report.post.content}</p>
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 flex-col gap-2">
                      <FiX className="text-4xl" />
                      <span>Post não encontrado ou Perfil</span>
                    </div>
                  )}
                </div>

                {/* --- LADO DIREITO: JULGAMENTO --- */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                         <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                          {report.reason}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {format(new Date(report.createdAt), "d MMM, HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-800">
                        <p className="text-sm text-gray-400 mb-1">Acusado (Autor)</p>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-lg">{report.reported.name}</span>
                          {report.reported.isBanned && <span className="text-red-500 text-xs font-bold border border-red-500 px-1 rounded">BANIDO</span>}
                        </div>
                        <p className="text-xs text-gray-500">{report.reported.email}</p>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>Denunciado por:</span>
                        <span className="text-indigo-400 font-medium">{report.reporter.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* ZONA DE AÇÃO */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-6 border-t border-gray-800">
                    
                    {/* BOTÃO INTELIGENTE: Alterna entre RESTAURAR e APLICAR BLUR */}
                    {report.post?.isHidden ? (
                      <button
                        onClick={() => handleRestorePost(report.post.id, report.id)}
                        className="col-span-2 flex items-center justify-center gap-2 bg-green-600/10 hover:bg-green-600/20 text-green-400 border border-green-600/30 p-3 rounded-lg transition-all font-medium"
                      >
                        <FiRefreshCw /> Restaurar Post (Inocente)
                      </button>
                    ) : (
                      <button
                        onClick={() => handleHidePost(report.post.id)}
                        className="col-span-2 flex items-center justify-center gap-2 bg-yellow-600/10 hover:bg-yellow-600/20 text-yellow-500 border border-yellow-600/30 p-3 rounded-lg transition-all font-medium"
                      >
                        <FiEyeOff /> Aplicar Blur (Ocultar)
                      </button>
                    )}

                    {/* 2. MANTER REMOVIDO / APAGAR */}
                    {report.post && (
                        <button
                        onClick={() => handleDeletePost(report.post.id, report.id)}
                        className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 p-3 rounded-lg transition-colors font-medium"
                        >
                        <FiTrash2 /> 
                        {report.post?.isHidden ? 'Confirmar Remoção' : 'Apagar Post'}
                        </button>
                    )}

                    {/* 3. BANIR (Culpado) */}
                    <button
                      onClick={() => handleBanUser(report.reported.id, report.id)}
                      disabled={report.reported.isBanned}
                      className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg transition-colors font-medium shadow-lg shadow-red-900/20"
                    >
                      <FiSlash /> {report.reported.isBanned ? 'Já Banido' : 'Banir Usuário'}
                    </button>
                    
                    {/* 4. DESCARTAR (Sem ação) */}
                    <button
                      onClick={() => dismissReport(report.id)}
                      className="col-span-2 text-xs text-gray-500 hover:text-gray-300 py-2 mt-2 underline decoration-gray-700"
                    >
                      Ignorar denúncia sem fazer nada
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