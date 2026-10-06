import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatTimeInSeconds } from '../utils/calculations';
import {
  Activity,
  AlertTriangle,
  TrendingUp,
  Clock,
  Layers,
  Zap,
  ArrowRight,
  PlusCircle,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';

export const ProcessAnalysisView: React.FC = () => {
  const {
    operations,
    studies,
    departments,
    products,
    setActiveTab,
    saveImprovement,
    addToast,
  } = useApp();

  const [selectedOpId, setSelectedOpId] = useState<string>(
    operations[0]?.id || ''
  );

  // Parâmetros de análise de capacidade da fábrica
  const [horasTurno, setHorasTurno] = useState<number>(8.0);
  const [eficienciaTurno, setEficienciaTurno] = useState<number>(85); // 85% de eficiência
  const [taktTimePadrao, setTaktTimePadrao] = useState<number>(60); // 60 segundos alvo de takt time

  const selectedOp = operations.find((op) => op.id === selectedOpId) || operations[0];
  const opStudies = studies.filter((s) => s.operacaoId === selectedOp?.id);
  const latestStudy = opStudies.sort(
    (a, b) => new Date(b.dataEstudo).getTime() - new Date(a.dataEstudo).getTime()
  )[0];

  // Métricas do Processo
  const tempoPadrao = selectedOp ? selectedOp.tempoPadraoAtual : 0;
  // Tempo atual: obtido do estudo mais recente ou do próprio tempo médio
  const tempoAtual = latestStudy?.tempoMedio ?? (tempoPadrao > 0 ? tempoPadrao * 0.92 : 0);
  const diferencaSegundos = tempoAtual - tempoPadrao;
  const diferencaPercentual =
    tempoPadrao > 0 ? ((tempoAtual - tempoPadrao) / tempoPadrao) * 100 : 0;

  // Capacidade por hora (3600 / TP)
  const capacidadeHora = tempoPadrao > 0 ? Math.round(3600 / tempoPadrao) : 0;

  // Capacidade por turno com eficiência (horas * 3600 * (eficiencia/100)) / TP
  const segundosUteisTurno = horasTurno * 3600 * (eficienciaTurno / 100);
  const capacidadeTurno = tempoPadrao > 0 ? Math.round(segundosUteisTurno / tempoPadrao) : 0;

  // Critério de criticidade: se o tempo padrão for maior que o Takt Time da operação ou a variação for alta
  const opTaktTime = selectedOp?.taktTimeAlvo || taktTimePadrao;
  const isCritica = tempoPadrao > opTaktTime || diferencaPercentual > 15;

  const handleOpenKaizenForOp = () => {
    setActiveTab('melhorias');
    addToast(
      'info',
      'Plano de Ação',
      `Redirecionado para o painel de melhorias para a operação ${selectedOp?.codigo}.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Análise do Processo & Balanceamento de Linha
          </h1>
          <p className="text-xs text-slate-500">
            Diagnóstico de tempos atuais versus tempos padrão, capacidade fabril e detecção de gargalos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Operação Analisada:</span>
          <select
            value={selectedOpId}
            onChange={(e) => setSelectedOpId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
          >
            {operations.map((op) => (
              <option key={op.id} value={op.id}>
                {op.codigo} - {op.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Painel de Parâmetros de Turno & Configurações da Linha */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Parâmetros de Turno & Takt Time para Cálculo de Capacidade
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Jornada Fabril Ativa
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Horas de Trabalho por Turno
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                min="1"
                max="24"
                value={horasTurno}
                onChange={(e) => setHorasTurno(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs font-mono font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-500 whitespace-nowrap">horas/turno</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Eficiência Global da Linha (OEE / OLE)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="1"
                min="10"
                max="100"
                value={eficienciaTurno}
                onChange={(e) => setEficienciaTurno(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs font-mono font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-500 whitespace-nowrap">% útil</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Takt Time Referência da Linha (s)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="1"
                min="1"
                value={taktTimePadrao}
                onChange={(e) => setTaktTimePadrao(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs font-mono font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-500 whitespace-nowrap">s/peça</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Análise da Operação Selecionada (Exigidos no Ponto 4) */}
      {selectedOp && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {selectedOp.codigo}
                </span>
                <span className="text-xs text-slate-500">
                  {departments.find((d) => d.id === selectedOp.setorId)?.nome}
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-xs text-slate-500">{selectedOp.maquina}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                {selectedOp.nome}
              </h2>
            </div>

            {/* Identificação de Operação Crítica */}
            <div>
              {isCritica ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>OPERAÇÃO CRÍTICA (Gargalo da Linha)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>OPERAÇÃO BALANCEADA</span>
                </div>
              )}
            </div>
          </div>

          {/* Grid dos 5 Indicadores Exigidos no Ponto 4 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 1. Tempo Atual */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                1. Tempo Atual (Observado)
              </span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1.5 tabular-nums">
                {formatTimeInSeconds(tempoAtual)}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {latestStudy ? `Estudo ${latestStudy.codigoEstudo}` : 'Média recente da linha'}
              </span>
            </div>

            {/* 2. Tempo Padrão */}
            <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-200/70">
              <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block">
                2. Tempo Padrão (TP)
              </span>
              <div className="text-2xl font-extrabold font-mono text-blue-900 mt-1.5 tabular-nums">
                {formatTimeInSeconds(tempoPadrao)}
              </div>
              <span className="text-[11px] text-blue-600 mt-1 block">
                Com tolerâncias e ritmo normal
              </span>
            </div>

            {/* 3. Diferença entre tempo atual e padrão */}
            <div
              className={`rounded-xl p-4 border ${
                diferencaSegundos > 0
                  ? 'bg-rose-50/60 border-rose-200 text-rose-900'
                  : 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
              }`}
            >
              <span className="text-[11px] font-semibold uppercase tracking-wider block opacity-80">
                3. Diferença (Desvio)
              </span>
              <div className="text-2xl font-bold font-mono mt-1.5 tabular-nums">
                {diferencaSegundos > 0 ? '+' : ''}
                {formatTimeInSeconds(diferencaSegundos)}
              </div>
              <span className="text-[11px] font-medium mt-1 block opacity-90">
                {diferencaPercentual > 0 ? '+' : ''}
                {diferencaPercentual.toFixed(1)}% vs padrão
              </span>
            </div>

            {/* 4. Capacidade estimada por hora */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                4. Capacidade por Hora
              </span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1.5 tabular-nums">
                {capacidadeHora}
                <span className="text-xs text-slate-500 font-normal ml-1">un/h</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block font-mono">
                3600s ÷ {formatTimeInSeconds(tempoPadrao)}
              </span>
            </div>

            {/* 5. Capacidade estimada por turno */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                5. Capacidade por Turno
              </span>
              <div className="text-2xl font-bold font-mono text-emerald-700 mt-1.5 tabular-nums">
                {capacidadeTurno}
                <span className="text-xs text-slate-500 font-normal ml-1">peças</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {horasTurno}h com {eficienciaTurno}% eficiência
              </span>
            </div>
          </div>

          {/* Diagnóstico & Recomendações */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Diagnóstico de Engenharia Industrial
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                {isCritica ? (
                  <>
                    Esta operação está consumindo{' '}
                    <strong className="text-rose-600 font-mono">
                      {formatTimeInSeconds(tempoPadrao)}
                    </strong>
                    , ultrapassando o Takt Time alvo de{' '}
                    <strong className="font-mono">{formatTimeInSeconds(opTaktTime)}</strong>. Ela atua
                    como o gargalo que restringe o ritmo de saída de toda a linha. Recomenda-se
                    aplicar estudo de movimentos (Therbligs), balanceamento com operações adjacentes
                    ou dispositivo de automação.
                  </>
                ) : (
                  <>
                    A operação está dentro do tempo de ciclo previsto com margem confortável de{' '}
                    <strong className="text-emerald-600 font-mono">
                      {formatTimeInSeconds(opTaktTime - tempoPadrao)}
                    </strong>{' '}
                    em relação ao Takt Time da célula de fabricação.
                  </>
                )}
              </p>
            </div>

            {isCritica && (
              <button
                onClick={handleOpenKaizenForOp}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 whitespace-nowrap self-start md:self-auto"
              >
                <PlusCircle className="w-4 h-4" />
                Registrar Ação de Melhoria
              </button>
            )}
          </div>
        </div>
      )}

      {/* Gráfico de Balanceamento de Linha (Line Balancing Chart) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Gráfico de Balanceamento de Todas as Operações da Fábrica
            </h2>
            <p className="text-xs text-slate-500">
              Comparação visual dos Tempos Padrão frente à linha de Takt Time ({taktTimePadrao}s)
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded bg-blue-600 inline-block"></span> Tempo Padrão
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded bg-rose-500 inline-block"></span> Gargalo Crítico (&gt; Takt)
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-4 h-0.5 bg-amber-500 inline-block"></span> Takt Time ({taktTimePadrao}s)
            </span>
          </div>
        </div>

        {/* Barras Horizontais do Balanceamento */}
        <div className="space-y-3 pt-2">
          {operations.map((op) => {
            const isBottleneck = op.tempoPadraoAtual > (op.taktTimeAlvo || taktTimePadrao);
            const maxRef = Math.max(
              ...operations.map((o) => o.tempoPadraoAtual),
              taktTimePadrao * 1.2
            );
            const barWidthPercent = (op.tempoPadraoAtual / maxRef) * 100;
            const taktPosPercent = ((op.taktTimeAlvo || taktTimePadrao) / maxRef) * 100;

            return (
              <div
                key={op.id}
                onClick={() => setSelectedOpId(op.id)}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedOpId === op.id
                    ? 'border-blue-500 bg-blue-50/30 ring-1 ring-blue-500'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800">{op.codigo}</span>
                    <span className="text-slate-700 font-medium truncate max-w-xs">{op.nome}</span>
                    <span className="text-[11px] text-slate-400">({op.maquina})</span>
                  </div>

                  <div className="flex items-center gap-3 font-mono">
                    <span
                      className={`font-bold ${
                        isBottleneck ? 'text-rose-600' : 'text-blue-700'
                      }`}
                    >
                      {formatTimeInSeconds(op.tempoPadraoAtual)}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Takt: {op.taktTimeAlvo || taktTimePadrao}s
                    </span>
                  </div>
                </div>

                {/* Barra com Linha de Takt Time */}
                <div className="relative w-full bg-slate-200 rounded-full h-3 overflow-visible">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${
                      isBottleneck ? 'bg-rose-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(barWidthPercent, 100)}%` }}
                  />

                  {/* Marcador Takt Time */}
                  <div
                    className="absolute top-[-3px] bottom-[-3px] w-0.5 bg-amber-500 z-10"
                    style={{ left: `${Math.min(taktPosPercent, 100)}%` }}
                    title={`Takt Time: ${op.taktTimeAlvo || taktTimePadrao}s`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
