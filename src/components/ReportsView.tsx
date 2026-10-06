import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatTimeInSeconds, exportToCSV } from '../utils/calculations';
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  Layers,
  TrendingUp,
  Clock,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Award,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { studies, operations, improvements, departments, addToast } = useApp();

  const [dataInicio, setDataInicio] = useState('2026-01-01');
  const [dataFim, setDataFim] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedSetor, setSelectedSetor] = useState('todos');
  const [relatorioTab, setRelatorioTab] = useState<
    'estudos' | 'tempos' | 'melhorias' | 'gargalos'
  >('estudos');

  // Filtragem dos estudos por período e setor
  const filteredStudies = studies.filter((s) => {
    const studyDate = s.dataEstudo;
    const matchDate =
      (!dataInicio || studyDate >= dataInicio) &&
      (!dataFim || studyDate <= dataFim);
    const matchSetor =
      selectedSetor === 'todos' || s.setor.toLowerCase() === selectedSetor.toLowerCase();
    return matchDate && matchSetor;
  });

  // Operações com maior tempo (Gargalos)
  const rankingGargalos = [...operations].sort(
    (a, b) => b.tempoPadraoAtual - a.tempoPadraoAtual
  );

  // Comparativo de melhorias concluídas
  const melhoriasValidas = improvements.filter(
    (imp) => imp.tempoAntes > 0 && imp.tempoDepois !== undefined && imp.tempoDepois > 0
  );

  // Ações de exportação
  const handleExportExcel = () => {
    if (relatorioTab === 'estudos') {
      const rows = filteredStudies.map((s) => ({
        'Código Estudo': s.codigoEstudo,
        'Data': s.dataEstudo,
        'Operação': `${s.codigoOperacao} - ${s.nomeOperacao}`,
        'Produto': s.produto,
        'Setor': s.setor,
        'Máquina': s.maquina,
        'Operador': s.nomeOperador,
        'Responsável': s.responsavel,
        'Ciclos': s.ciclos.length,
        'Tempo Médio (s)': s.tempoMedio || 0,
        'Tempo Normal (s)': s.tempoNormal || 0,
        'Tempo Padrão (s)': s.tempoPadrao || 0,
        'Capacidade (un/h)': s.tempoPadrao ? Math.round(3600 / s.tempoPadrao) : 0,
      }));
      exportToCSV(`relatorio_estudos_periodo_${dataInicio}_a_${dataFim}`, rows);
    } else if (relatorioTab === 'tempos' || relatorioTab === 'gargalos') {
      const rows = rankingGargalos.map((op, idx) => ({
        'Posição': idx + 1,
        'Código': op.codigo,
        'Operação': op.nome,
        'Setor': departments.find((d) => d.id === op.setorId)?.nome || '',
        'Máquina': op.maquina,
        'Tempo Padrão (s)': op.tempoPadraoAtual,
        'Takt Time Alvo (s)': op.taktTimeAlvo || 0,
        'Capacidade Teórica (un/h)': op.tempoPadraoAtual > 0 ? Math.round(3600 / op.tempoPadraoAtual) : 0,
        'Status': op.taktTimeAlvo && op.tempoPadraoAtual > op.taktTimeAlvo ? 'Gargalo Crítico' : 'Normal',
      }));
      exportToCSV(`relatorio_tempos_operacoes`, rows);
    } else if (relatorioTab === 'melhorias') {
      const rows = improvements.map((imp) => ({
        'Código Kaizen': imp.codigo,
        'Problema': imp.problema,
        'Ação Realizada': imp.acaoMelhoria,
        'Responsável': imp.responsavel,
        'Data Prevista': imp.dataPrevista,
        'Tempo Antes (s)': imp.tempoAntes,
        'Tempo Depois (s)': imp.tempoDepois || 0,
        'Ganho Produtivo (%)': imp.ganhoPercentual || 0,
        'Status': imp.status,
      }));
      exportToCSV(`relatorio_melhorias_antes_depois`, rows);
    }

    addToast('success', 'Relatório Exportado', 'Arquivo gerado e baixado com sucesso.');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header do Módulo de Relatórios */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Relatórios de Tempos & Métodos
          </h1>
          <p className="text-xs text-slate-500">
            Estatísticas de produtividade, tempos médios, tempos padrão e comparativos de evolução
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            Imprimir / Salvar PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exportar para Excel
          </button>
        </div>
      </div>

      {/* Barra de Filtro de Período e Setor */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs no-print">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Data Inicial
            </label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Data Final
            </label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Filtrar por Setor
            </label>
            <select
              value={selectedSetor}
              onChange={(e) => setSelectedSetor(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
            >
              <option value="todos">Todos os Setores</option>
              {departments.map((d) => (
                <option key={d.id} value={d.nome}>
                  {d.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs dos 4 Relatórios Principais */}
      <div className="flex border-b border-slate-200 no-print overflow-x-auto gap-1">
        <button
          onClick={() => setRelatorioTab('estudos')}
          className={`py-2 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            relatorioTab === 'estudos'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          1. Estudos por Período ({filteredStudies.length})
        </button>
        <button
          onClick={() => setRelatorioTab('tempos')}
          className={`py-2 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            relatorioTab === 'tempos'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          2. Tempo Médio vs Tempo Padrão
        </button>
        <button
          onClick={() => setRelatorioTab('gargalos')}
          className={`py-2 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            relatorioTab === 'gargalos'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          3. Ranking de Gargalos (Maior Tempo)
        </button>
        <button
          onClick={() => setRelatorioTab('melhorias')}
          className={`py-2 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            relatorioTab === 'melhorias'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          4. Comparativo Antes e Depois (Kaizen)
        </button>
      </div>

      {/* Cabeçalho Formal para Impressão */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">RELATÓRIO DE ENGENHARIA DE TEMPOS E MÉTODOS</h1>
            <p className="text-xs text-slate-600">
              Período de Análise: {dataInicio} a {dataFim} · Setor: {selectedSetor}
            </p>
          </div>
          <div className="text-right text-xs">
            <span className="font-bold">APP Tempos e Métodos</span>
            <div className="text-slate-500">Emitido em {new Date().toLocaleDateString('pt-BR')}</div>
          </div>
        </div>
      </div>

      {/* RELATÓRIO 1: Estudos por Período */}
      {relatorioTab === 'estudos' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden print-card">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Estudos Realizados no Período Selecionado
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              Total: {filteredStudies.length} estudos
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Código</th>
                  <th className="py-2.5 px-3 font-semibold">Data</th>
                  <th className="py-2.5 px-3 font-semibold">Operação</th>
                  <th className="py-2.5 px-3 font-semibold">Setor</th>
                  <th className="py-2.5 px-3 font-semibold">Operador</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Ciclos</th>
                  <th className="py-2.5 px-3 font-semibold text-right">T. Médio</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Ritmo</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Tolerância</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Tempo Padrão</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Capacidade/h</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudies.map((s) => {
                  const cap = s.tempoPadrao ? Math.round(3600 / s.tempoPadrao) : 0;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-bold font-mono text-slate-900">
                        {s.codigoEstudo}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono">{s.dataEstudo}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-900">{s.nomeOperacao}</span>
                        <span className="text-[11px] text-slate-400 block font-mono">
                          {s.codigoOperacao}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{s.setor}</td>
                      <td className="py-2.5 px-3 text-slate-600">{s.nomeOperador}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{s.ciclos.length}</td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        {formatTimeInSeconds(s.tempoMedio)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">{s.fatorRitmo}%</td>
                      <td className="py-2.5 px-3 text-right font-mono">+{s.percentualTolerancia}%</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">
                        {formatTimeInSeconds(s.tempoPadrao)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-700">
                        {cap} un/h
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RELATÓRIO 2: Tempo Médio vs Tempo Padrão por Operação */}
      {relatorioTab === 'tempos' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4 print-card">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Comparativo: Tempo Médio Observado (TO) vs Tempo Padrão Calculado (TP)
            </h2>
            <p className="text-xs text-slate-500">
              O Tempo Padrão incorpora as tolerâncias para necessidades pessoais, fadiga e esperas normatizadas.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {operations.map((op) => {
              const opStudy = studies.find((s) => s.operacaoId === op.id);
              const to = opStudy?.tempoMedio || op.tempoPadraoAtual * 0.85;
              const tp = op.tempoPadraoAtual;
              const diferenca = tp - to;

              return (
                <div key={op.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div>
                      <span className="font-mono font-bold text-blue-700 mr-2">{op.codigo}</span>
                      <strong className="text-slate-800">{op.nome}</strong>
                    </div>
                    <div className="flex items-center gap-4 font-mono">
                      <span>TO Médio: <strong>{formatTimeInSeconds(to)}</strong></span>
                      <span className="text-blue-700 font-bold">
                        TP Padrão: <strong>{formatTimeInSeconds(tp)}</strong>
                      </span>
                      <span className="text-emerald-700">
                        Tolerâncias: +{formatTimeInSeconds(diferenca)}
                      </span>
                    </div>
                  </div>

                  {/* Barras Comparativas */}
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <div className="text-slate-500 mb-0.5">Tempo Médio Cronometrado</div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-indigo-500 h-2 rounded-full"
                          style={{ width: `${Math.min((to / 150) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-blue-700 font-semibold mb-0.5">
                        Tempo Padrão Homologado (TP)
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min((tp / 150) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RELATÓRIO 3: Operações com Maior Tempo (Gargalos) */}
      {relatorioTab === 'gargalos' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4 print-card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Ranking de Operações com Maior Tempo (Principais Gargalos)
              </h2>
              <p className="text-xs text-slate-500">
                Ordenado do maior para o menor tempo padrão, indicando o gargalo restritor da capacidade de linha
              </p>
            </div>
            <span className="text-xs font-mono text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-200 font-semibold">
              Teoria das Restrições (TOC)
            </span>
          </div>

          <div className="space-y-3">
            {rankingGargalos.map((op, idx) => {
              const dept = departments.find((d) => d.id === op.setorId);
              const maxTime = rankingGargalos[0]?.tempoPadraoAtual || 100;
              const barPercent = (op.tempoPadraoAtual / maxTime) * 100;
              const isBottleneck = idx === 0;

              return (
                <div
                  key={op.id}
                  className={`p-3 rounded-lg border ${
                    isBottleneck
                      ? 'bg-rose-50/50 border-rose-300'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${
                          isBottleneck
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="font-mono font-bold text-slate-900">{op.codigo}</span>
                      <strong className="text-slate-800">{op.nome}</strong>
                      <span className="text-slate-400">· {dept?.nome}</span>
                    </div>

                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-base font-bold text-slate-900">
                        {formatTimeInSeconds(op.tempoPadraoAtual)}
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        ({op.tempoPadraoAtual > 0 ? Math.round(3600 / op.tempoPadraoAtual) : 0} un/h)
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full ${
                        isBottleneck ? 'bg-rose-600' : 'bg-blue-600'
                      }`}
                      style={{ width: `${barPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RELATÓRIO 4: Comparativo Antes e Depois da Melhoria */}
      {relatorioTab === 'melhorias' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4 print-card">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Comparativo Antes e Depois das Ações de Melhoria (Ganhos Kaizen)
            </h2>
            <p className="text-xs text-slate-500">
              Demonstração da redução de tempos operacionais e ganhos percentuais de produtividade obtidos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {melhoriasValidas.map((imp) => {
              const op = operations.find((o) => o.id === imp.operacaoId);
              const reducaoSegundos = imp.tempoAntes - (imp.tempoDepois || 0);

              return (
                <div
                  key={imp.id}
                  className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        {imp.codigo}
                      </span>
                      <h3 className="text-xs font-bold text-slate-900 mt-1">
                        {op?.codigo} - {op?.nome}
                      </h3>
                    </div>

                    <div className="text-right">
                      <span className="text-emerald-700 font-extrabold text-lg font-mono">
                        +{imp.ganhoPercentual}%
                      </span>
                      <span className="text-[10px] text-emerald-600 block">ganho de eficiência</span>
                    </div>
                  </div>

                  {/* Comparativo numérico */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-white rounded-lg border border-emerald-100 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">
                        Antes
                      </span>
                      <span className="font-mono font-bold text-slate-700">
                        {formatTimeInSeconds(imp.tempoAntes)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">
                        Depois
                      </span>
                      <span className="font-mono font-bold text-emerald-700">
                        {formatTimeInSeconds(imp.tempoDepois)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">
                        Economia
                      </span>
                      <span className="font-mono font-bold text-blue-700">
                        -{formatTimeInSeconds(reducaoSegundos)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    <strong>Ação:</strong> {imp.acaoMelhoria}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
