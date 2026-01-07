import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { FiAlertTriangle, FiCheck, FiTrash2, FiEye, FiLoader, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Report {
  id: string;
  reporterId: string;
  reporterName?: string; // Nome de quem denunciou
  reportedId: string;
  reportedName: string;
  targetId: string;
  reason: string;
  type: string;
  description: string;
  status: string;
  createdAt: string;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingReports();
  }, []);

  const fetchPendingReports = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/reports/pending');
      setReports(response.data);
    } catch (error) {
      console.error('Erro ao buscar denúncias:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHidePost = async (postId: string, reportId: string) => {
    if (!window.confirm('Deseja aplicar o desfoque (Blur) neste post?')) return;
    
    try {
      setLoadingId(reportId); // Feedback de carregamento no botão
      await api.patch(`/post/${postId}/hide`);
      
      // Resolve a denúncia após aplicar o blur
      await api.patch(`/reports/${reportId}/resolve`);
      
      alert('✅ Blur aplicado e denúncia resolvida!');
      fetchPendingReports(); // Atualiza a lista
    } catch (error) {
      console.error('Erro ao aplicar blur:', error);
      alert('❌ Erro ao processar comando no servidor.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDismissReport = async (reportId: string) => {
    if (!window.confirm('Deseja descartar esta denúncia?')) return;
    try {
      setLoadingId(reportId);
      await api.patch(`/reports/${reportId}/resolve`);
      fetchPendingReports();
    } catch (error) {
      console.error('Erro ao descartar denúncia:', error);
    } finally {
      setLoadingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <FiLoader className="animate-spin text-4xl text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FiAlertTriangle className="text-yellow-500" />
              Moderação de Conteúdo
            </h1>
            <p className="text-gray-400 mt-2">Analise denúncias de posts e perfis</p>
          </div>
          <button 
            onClick={fetchPendingReports}
            className="bg-gray-800 hover:bg-gray-700 p-2 rounded-full transition-colors"
          >
            Sincronizar
          </button>
        </header>

        {reports.length === 0 ? (
          <div className="bg-gray-800 p-10 rounded-xl text-center border border-gray-700">
            <FiCheck className="text-5xl text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Tudo limpo!</h2>
            <p className="text-gray-400">Nenhuma denúncia pendente no momento.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {reports.map((report) => (
              <div key={report.id} className="bg-gray-800 border border-gray-700 rounded-xl p-5 shadow-lg">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  
                  {/* Informações da Denúncia */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-red-900/50 text-red-300 px-2 py-1 rounded text-xs font-bold uppercase">
                        {report.type}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {format(new Date(report.createdAt), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-indigo-300">
                      Motivo: {report.reason}
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <p className="flex items-center gap-2 text-gray-300">
                        <FiUser className="text-gray-500" />
                        <strong>Denunciado:</strong> {report.reportedName}
                      </p>
                      <p className="flex items-center gap-2 text-gray-300">
                        <FiAlertTriangle className="text-gray-500" />
                        <strong>Denunciante:</strong> {report.reporterName || 'Utilizador Anônimo'}
                      </p>
                    </div>

                    {report.description && (
                      <div className="bg-gray-900/50 p-3 rounded mt-2 border-l-2 border-indigo-500">
                        <p className="text-sm italic text-gray-400">"{report.description}"</p>
                      </div>
                    )}
                  </div>

                  {/* Ações de Moderação */}
                  <div className="flex flex-row md:flex-col gap-2 justify-end">
                    {report.type === 'POST' && (
                      <button
                        onClick={() => handleHidePost(report.targetId, report.id)}
                        disabled={loadingId === report.id}
                        className="flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all font-medium"
                      >
                        {loadingId === report.id ? <FiLoader className="animate-spin" /> : <FiEye className="opacity-70" />}
                        {loadingId === report.id ? 'Processando...' : 'Aplicar Blur Visual'}
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDismissReport(report.id)}
                      disabled={loadingId === report.id}
                      className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-all"
                    >
                      <FiTrash2 />
                      Descartar
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