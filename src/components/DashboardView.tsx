import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Cog,
  PlusCircle,
  FileSearch,
  FileSpreadsheet,
  TrendingUp,
  Layers,
  ArrowRight,
  Activity,
  Zap,
} from 'lucide-react';
import { formatTimeInSeconds } from '../utils/calculations';

export const DashboardView: React.FC = () => {
  const {
    studies,
    operations,
    improvements,
    setActiveTab,
    setIsStudyFormOpen,
    setSelectedStudyForModal,
    setIsStudyDetailOpen,
  } = useApp();

  // Cálculos do Dashboard
  const totalEstudos = studies.length;
  const estudosConcluidos = studies.filter((s) => s.status === 'concluido').length;
  const estudosEmAndamento = studies.filter((s) => s.status === 'em_andamento').length;
  const totalOperacoes = operations.length;

  // Tempo médio observado das operações
  const estudosComTempoMedio = studies.filter(
    (s) => s.tempoMedio !== undefined && s.tempoMedio > 0
  );
  const tempoMedioGeral =
    estudosComTempoMedio.length > 0
      ? estudosComTempoMedio.reduce((acc, s) => acc + (s.tempoMedio || 0), 0) /
        estudosComTempoMedio.length
      : 0;

  // Tempo padrão médio das operações cadastradas
  const operacoesComTempo = operations.filter((op) => op.tempoPadraoAtual > 0);
  const tempoPadraoMedio =
    operacoesComTempo.length > 0
      ? operacoesComTempo.reduce((acc, op) => acc + op.tempoPadraoAtual, 0) /
        operacoesComTempo.length
      : 0;

  // Operações críticas / potenciais gargalos (tempo padrão > 80s ou acima do takt time)
  const operacoesCriticas = operations.filter((op) => {
    if (op.taktTimeAlvo && op.tempoPadraoAtual > op.taktTimeAlvo) return true;
    return op.tempoPadraoAtual > 80;
  });

  // Ações de melhoria ativas
  const melhoriasAtivas = improvements.filter(
    (i) => i.status === 'planejada' || i.status === 'em_andamento'
  ).length;

  // Setores com maior volume de estudos
  const setorContagem: Record<string, number> = {};
  studies.forEach((s) => {
    const st = s.setor || 'Outros';
    setorContagem[st] = (setorContagem[st] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Banner / Boas-vindas Industrial */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 rounded-2xl p-6 text-white shadow-sm border border-blue-900/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-300">
                Plataforma de Engenharia de Produção
              </span>
              <span aria-hidden="true" className="text-blue-400">·</span>
              <span className="text-xs text-blue-200">ISO 9001 / Lean Manufacturing</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              APP Tempos e Métodos
            </h1>
            <p className="text-sm text-blue-100/90 mt-1 max-w-2xl text-balance">
              Monitore tempos operacionais, calcule tempos padrão conforme normas OIT e identifique gargalos para alavancar a produtividade da sua fábrica.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setSelectedStudyForModal(null);
                setIsStudyFormOpen(true);
              }}
              className="px-4 py-2.5 bg-white text-blue-900 hover:bg-blue-50 font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-blue-600" />
              Novo Estudo de Tempos
            </button>
            <button
              onClick={() => setActiveTab('analise')}
              className="px-3.5 py-2.5 bg-blue-800/80 hover:bg-blue-700/80 text-white font-medium text-xs rounded-xl border border-blue-700 transition-colors flex items-center gap-1.5"
            >
              <Activity className="w-4 h-4" />
              Ver Análise de Gargalos
            </button>
          </div>
        </div>
      </div>

      {/* Cards de Métricas Principais (Exigidos no Ponto 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total de Estudos */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total de Estudos
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {totalEstudos}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="text-emerald-600 font-semibold">{estudosConcluidos} concluídos</span>
          </div>
        </div>

        {/* Estudos em Andamento */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Em Andamento
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {estudosEmAndamento}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {estudosEmAndamento > 0 ? 'Ciclos em coleta ativa' : 'Todos os estudos concluídos'}
          </div>
        </div>

        {/* Operações Cadastradas */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Operações
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Cog className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {totalOperacoes}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {operacoesCriticas.length > 0 ? (
              <span className="text-rose-600 font-medium">
                {operacoesCriticas.length} operação(ões) crítica(s)
              </span>
            ) : (
              'Processos balanceados'
            )}
          </div>
        </div>

        {/* Tempo Médio das Operações */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tempo Médio (TO)
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {formatTimeInSeconds(tempoMedioGeral)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Média observada em cronometragens
          </div>
        </div>

        {/* Tempo Padrão Médio */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tempo Padrão (TP)
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {formatTimeInSeconds(tempoPadraoMedio)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Com ritmo + tolerâncias calculadas
          </div>
        </div>
      </div>

      {/* Botões de Acesso Rápido Exigidos (Ponto 1) */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Acessos Rápidos
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => {
              setSelectedStudyForModal(null);
              setIsStudyFormOpen(true);
            }}
            className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                Novo Estudo
              </div>
              <div className="text-[11px] text-slate-500">Cronometrar ciclos</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('consultar_estudos')}
            className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FileSearch className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                Consultar Estudos
              </div>
              <div className="text-[11px] text-slate-500">Histórico de cronometragens</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('operacoes')}
            className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Cog className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                Operações
              </div>
              <div className="text-[11px] text-slate-500">Catálogo e máquinas</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('relatorios')}
            className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                Relatórios
              </div>
              <div className="text-[11px] text-slate-500">Exportar Excel e PDF</div>
            </div>
          </button>
        </div>
      </div>

      {/* Seção com Duas Colunas: Estudos Recentes & Distribuição por Setor / Gargalos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1 & 2: Últimos Estudos Registrados */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Estudos de Tempos Recentes</h2>
              <p className="text-xs text-slate-500">Últimas cronometragens realizadas no chão de fábrica</p>
            </div>
            <button
              onClick={() => setActiveTab('consultar_estudos')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2.5 px-3 font-semibold">Código / Operação</th>
                  <th className="py-2.5 px-3 font-semibold">Setor</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Ciclos</th>
                  <th className="py-2.5 px-3 font-semibold text-right">T. Médio</th>
                  <th className="py-2.5 px-3 font-semibold text-right">T. Padrão</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studies.slice(0, 5).map((study) => (
                  <tr key={study.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{study.codigoEstudo}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">
                        {study.codigoOperacao} · {study.nomeOperacao}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{study.setor}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      {study.ciclos.length}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-medium text-slate-700">
                      {formatTimeInSeconds(study.tempoMedio)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-blue-600">
                      {formatTimeInSeconds(study.tempoPadrao)}
                    </td>
                    <td className="py-3 px-3">
                      {study.status === 'concluido' ? (
                        <span className="text-emerald-700 text-[11px] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Concluído
                        </span>
                      ) : (
                        <span className="text-amber-700 text-[11px] font-semibold flex items-center gap-1">
                          <Activity className="w-3 h-3 text-amber-600" /> Em andamento
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedStudyForModal(study);
                          setIsStudyDetailOpen(true);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Visualizar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Coluna 3: Distribuição por Setor & Ações Kaizen */}
        <div className="space-y-4">
          {/* Card Setores */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900">Estudos por Setor</h2>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-2.5">
              {Object.entries(setorContagem).map(([setor, count]) => {
                const percent = totalEstudos > 0 ? (count / totalEstudos) * 100 : 0;
                return (
                  <div key={setor}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-700 font-medium truncate max-w-[180px]">
                        {setor}
                      </span>
                      <span className="font-mono text-slate-500 font-medium">
                        {count} ({percent.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card Alerta de Gargalos & Oportunidades Kaizen */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900">Oportunidades de Melhoria</h2>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Existem <span className="font-bold text-slate-900">{melhoriasAtivas} ações ativas</span> para redução de tempos e eliminação de desperdícios no chão de fábrica.
            </p>

            <button
              onClick={() => setActiveTab('melhorias')}
              className="w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              Ver Painel Kaizen & Ganhos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
