// frontend/src/pages/AdminPage.tsx
import { useState } from 'react';
import {
  useGetUsersList,
  useGetDashboardStats,
  useGetUserCoordinates, // <-- INÍCIO DA ADIÇÃO (Plano do Mapa V2)
} from '@/features/admin/hooks/useAdminQueries';
import {
  FiUsers,
  FiMessageSquare,
  FiDollarSign,
  FiCheckCircle,
  FiTrendingUp,
  FiUserCheck,
  FiLoader,
  FiAlertCircle,
  FiUserPlus,
  FiAlertTriangle,
  FiPercent,
  FiMap, // <-- Adicionado
} from 'react-icons/fi';
// Importa o formatDistanceToNowStrict (para "Última Atividade")
import { format, formatDistanceToNowStrict } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// --- INÍCIO DA ADIÇÃO (Plano do Mapa V2) ---
// Imports do Leaflet (Mapa)
import L from 'leaflet';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from 'react-leaflet';

// Define o nosso ícone de "Ponto Vermelho"
// Usamos a classe CSS 'red-dot-marker' que adicionámos ao index.css
const redDotIcon = L.divIcon({
  className: 'red-dot-marker',
  iconSize: [12, 12], // Tamanho do ícone
  iconAnchor: [6, 6], // Ponto central
  popupAnchor: [0, -6], // Onde o popup abre em relação ao ícone
});
// --- FIM DA ADIÇÃO ---

// Componente de Cartão de Estatística (Sem alterações)
const StatCard = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactElement;
}) => (
  <div className="bg-gray-800 p-4 rounded-lg shadow-md flex items-center space-x-4">
    <div className="p-3 rounded-full bg-indigo-600 text-white">{icon}</div>
    <div>
      <dt className="text-sm font-medium text-gray-400 truncate">{title}</dt>
      <dd className="mt-1 text-3xl font-semibold text-white">{value}</dd>
    </div>
  </div>
);

// --- INÍCIO DA ADIÇÃO (Plano do Mapa V2) ---
/**
 * O nosso novo componente de Mapa
 */
const UserLocationMap = () => {
  const {
    data: coordinates,
    isLoading,
    error,
  } = useGetUserCoordinates();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[500px]">
        <FiLoader className="animate-spin text-4xl" />
      </div>
    );
  }

  if (error || !coordinates) {
    return (
      <div className="p-4 text-center text-red-400 h-[500px] flex flex-col justify-center items-center">
        <FiAlertCircle className="mx-auto text-4xl mb-2" />
        <h2 className="text-lg font-semibold">Erro ao carregar o mapa</h2>
        <p className="mt-2">Não foi possível buscar as coordenadas.</p>
      </div>
    );
  }

  if (coordinates.length === 0) {
     return (
      <div className="p-4 text-center text-gray-400 h-[500px] flex flex-col justify-center items-center">
        <FiMap className="mx-auto text-4xl mb-2" />
        <h2 className="text-lg font-semibold">Nenhum dado de localização</h2>
        <p className="mt-2">Nenhum utilizador registou uma "Cidade Atual" ainda.</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={[20, 0]} // Centro inicial (visão global)
      zoom={2}
      scrollWheelZoom={true}
      className="admin-map-container" // Classe que define a altura (do index.css)
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {coordinates.map((coord) => (
        <Marker
          key={coord.id}
          position={[coord.lat, coord.lng]}
          icon={redDotIcon} // <-- O NOSSO PONTO VERMELHO
        >
          <Popup>
            {/* O conteúdo que aparece ao clicar no ponto */}
            <strong>{coord.name}</strong>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
// --- FIM DA ADIÇÃO ---


// Componente Principal da Página (Versão 2 - Atualizada)
export function AdminPage() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    data: statsData,
    isLoading: isLoadingStats,
    error: statsError,
  } = useGetDashboardStats();

  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useGetUsersList(page, limit);

  const stats = statsData;
  const totalPages = usersData
    ? Math.ceil(usersData.count / usersData.limit)
    : 0;

  // Handler de erro (Sem alterações)
  if (statsError || usersError) {
    const errorMsg =
      (statsError as any)?.response?.data?.message ||
      (usersError as any)?.response?.data?.message;
    return (
      <div className="p-4 text-center text-red-400 max-w-lg mx-auto">
        <FiAlertCircle className="mx-auto text-4xl mb-2" />
        <h2 className="text-lg font-semibold">Acesso Negado ou Erro</h2>
        <p className="mt-2">
          {errorMsg === 'Forbidden resource'
            ? 'Você não tem permissão para aceder a esta página.'
            : 'Ocorreu um erro ao buscar os dados.'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 text-white max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Dashboard do Admin</h1>

      {/* 1. Estatísticas (Versão 2) */}
      {isLoadingStats || !stats ? (
        <div className="flex justify-center p-8">
          <FiLoader className="animate-spin text-4xl" />
        </div>
      ) : (
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total de Utilizadores"
            value={stats.totalUsers}
            icon={<FiUsers className="w-6 h-6" />}
          />
          <StatCard
            title="Novos (7 dias)"
            value={stats.newUsers}
            icon={<FiUserPlus className="w-6 h-6" />}
          />
          <StatCard
            title="Utilizadores Pagantes"
            value={stats.subscribedUsers}
            icon={<FiUserCheck className="w-6 h-6" />}
          />
          <StatCard
            title="Total de Mensagens"
            value={stats.totalMessages}
            icon={<FiMessageSquare className="w-6 h-6" />}
          />
          <StatCard
            title="No Paywall (>= 3)"
            value={stats.usersAtPaywall}
            icon={<FiAlertTriangle className="w-6 h-6" />}
          />
          <StatCard
            title="Taxa de Conversão"
            value={`${stats.conversionRate.toFixed(1)}%`}
            icon={<FiPercent className="w-6 h-6" />}
          />
          <StatCard
            title="Assinaturas (Ativas)"
            value={stats.confirmedPayments}
            icon={<FiCheckCircle className="w-6 h-6" />}
          />
          <StatCard
            title="Receita (WIP)"
            value={`R$ ${stats.totalRevenue.toFixed(2)}`}
            icon={<FiDollarSign className="w-6 h-6" />}
          />
        </dl>
      )}

      {/* --- INÍCIO DA ADIÇÃO (Plano do Mapa V2 - Ação 3) --- */}
      {/* 2. Mapa de Utilizadores */}
      <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <h2 className="text-xl font-semibold p-4">
          Mapa de Localização de Utilizadores
        </h2>
        <div className="p-4 pt-0"> {/* Wrapper para o mapa */}
          <UserLocationMap />
        </div>
      </div>
      {/* --- FIM DA ADIÇÃO --- */}

      {/* 3. Tabela de Utilizadores (Anteriormente Ponto 2) */}
      <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <h2 className="text-xl font-semibold p-4">Lista de Utilizadores</h2>
        {isLoadingUsers ? (
          <div className="flex justify-center p-8">
            <FiLoader className="animate-spin text-4xl" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Nome</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Uso Gratuito</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Expira em</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Idade</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Gênero</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Localidade</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Fotos</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Seguindo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Últ. Atividade</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {usersData?.data.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-700">
                      {/* Nome */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">{user.name}</td>
                      {/* Email */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                      {/* Status */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        
                        {/* --- INÍCIO DA CORREÇÃO (Plano do Mapa V2) --- */}
                        {/* O status 'PAID' não existe; os status são PREMIUM e LIFETIME */}
                        {user.subscription?.status === 'PREMIUM' || user.subscription?.status === 'LIFETIME' ? (
                        /* --- FIM DA CORREÇÃO --- */
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900 text-green-200">
                            {user.subscription.status}
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-600 text-gray-200">
                            {user.subscription?.status || 'FREE'}
                          </span>
                        )}
                      </td>
                      {/* Uso Gratuito */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300 text-center">
                        {user.subscription?.freeContactsUsed ?? 0}
                      </td>
                      {/* Expira em */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                        {user.subscription?.expiresAt
                          ? format(new Date(user.subscription.expiresAt), 'dd/MM/yy')
                          : 'N/A'}
                      </td>
                      {/* Idade */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300 text-center">{user.age || 'N/A'}</td>
                      {/* Gênero */}
                      <td className="px-4 py-4 whitespace-pr-nowrap text-sm text-gray-300">{user.gender || 'N/A'}</td>
                      {/* Localidade */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300 truncate max-w-xs">{user.currentCity || 'N/A'}</td>
                      {/* Fotos */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300 text-center">{user._count.photos}</td>
                      {/* Seguindo */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300 text-center">{user._count.following}</td>
                      {/* Últ. Atividade */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDistanceToNowStrict(new Date(user.updatedAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </td>
                      {/* Role */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{user.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação (Sem alterações) */}
            <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-700 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-400">
                    Mostrando{' '}
                    <span className="font-medium">
                      {usersData?.data.length}
                    </span>{' '}
                    de{' '}
                    <span className="font-medium">{usersData?.count}</span>{' '}
                    resultados
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-600 bg-gray-700 text-sm font-medium text-gray-400 hover:bg-gray-600 disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-600 bg-gray-700 text-sm font-medium text-gray-300">
                      Página {page} de {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-600 bg-gray-700 text-sm font-medium text-gray-400 hover:bg-gray-600 disabled:opacity-50"
                    >
                      Próxima
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}