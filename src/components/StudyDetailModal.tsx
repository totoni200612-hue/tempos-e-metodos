import React from 'react';
import { useApp } from '../context/AppContext';
import { TimeStudy } from '../types';
import { calculateStudyMetrics, formatTimeInSeconds, exportToCSV } from '../utils/calculations';
import {
  X,
  Printer,
  FileSpreadsheet,
  Edit,
  Copy,
  TrendingUp,
  CheckCircle2,
  Calendar,
  User,
  Clock,
  Factory,
  Layers,
} from 'lucide-react';

interface StudyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  study: TimeStudy | null;
}

export const StudyDetailModal: React.FC<StudyDetailModalProps> = ({
  isOpen,
  onClose,
  study,
}) => {
  const {
    currentUser,
    setIsStudyFormOpen,
    setSelectedStudyForModal,
    duplicateStudy,
    setActiveTab,
    saveImprovement,
    addToast,
  } = useApp();

  if (!isOpen || !study) return null;

  const metrics = calculateStudyMetrics(
    study.ciclos || [],
    study.fatorRitmo ?? 100,
    study.percentualTolerancia ?? 14
  );

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const rows = (study.ciclos || []).map((c) => ({
      'Código Estudo': study.codigoEstudo,
      'Operação': `${study.codigoOperacao} - ${study.nomeOperacao}`,
      'Produto': study.produto,
      'Setor': study.setor,
      'Máquina': study.maquina,
      'Operador': study.nomeOperador,
      'Data': study.dataEstudo,
      'Responsável': study.responsavel,
      'Ciclo': c.numeroCiclo,
      'Tempo (s)': c.tempoSegundos,
      'Observação': c.observacao || '',
      'Tempo Médio (s)': metrics.tempoMedio,
      'Fator Ritmo (%)': metrics.fatorRitmo,
      'Tempo Normal (s)': metrics.tempoNormal,
      'Tolerância (%)': metrics.percentualTolerancia,
      'Tempo Padrão (s)': metrics.tempoPadrao,
      'Capacidade (un/h)': metrics.capacidadeHora,
    }));

    exportToCSV(`estudo_${study.codigoEstudo}`, rows);
    addToast('success', 'Exportação Concluída', `Estudo ${study.codigoEstudo} exportado para Excel/CSV.`);
  };

  const handleEdit = () => {
    setSelectedStudyForModal(study);
    onClose();
    setIsStudyFormOpen(true);
  };

  const handleDuplicate = () => {
    duplicateStudy(study.id);
    onClose();
  };

  const handleCreateImprovementFromStudy = () => {
    onClose();
    setActiveTab('melhorias');
    addToast(
      'info',
      'Nova Ação Kaizen',
      `Vinculando ação de melhoria à operação ${study.codigoOperacao}.`
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in-50 zoom-in-95 print-card">
        {/* Header - Apenas em tela */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 no-print">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                Ficha Técnica de Cronometragem
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-xs font-bold text-slate-700">{study.codigoEstudo}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              {study.nomeOperacao}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Imprimir / PDF
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conteúdo da Ficha Técnica - Pronto para Tela e Impressão */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Cabeçalho da Ficha */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block mb-0.5">Código da Operação</span>
                <span className="font-bold text-slate-900 font-mono text-sm">
                  {study.codigoOperacao}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Produto Fabricado</span>
                <span className="font-semibold text-slate-900">{study.produto}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Setor / Linha</span>
                <span className="font-semibold text-slate-900">{study.setor}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Máquina / Equipamento</span>
                <span className="font-semibold text-slate-900">{study.maquina}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Operador Observado</span>
                <span className="font-semibold text-slate-900">{study.nomeOperador}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Data do Estudo</span>
                <span className="font-semibold text-slate-900">{study.dataEstudo}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Responsável (Analista)</span>
                <span className="font-semibold text-slate-900">{study.responsavel}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Status do Estudo</span>
                <span className="font-bold text-emerald-700 uppercase text-[11px]">
                  {study.status === 'concluido' ? 'Concluído / Aprovado' : 'Em Andamento'}
                </span>
              </div>
            </div>
          </div>

          {/* Tabela de Ciclos Cronometrados */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Registro dos Ciclos Observados ({study.ciclos?.length || 0} ciclos)
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-16 text-center font-semibold">Ciclo</th>
                    <th className="py-2.5 px-3 w-32 font-semibold">Tempo Observado</th>
                    <th className="py-2.5 px-3 font-semibold">Observações / Desvios do Ciclo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(study.ciclos || []).map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700">
                        #{c.numeroCiclo}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900 text-sm">
                        {formatTimeInSeconds(c.tempoSegundos)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {c.observacao || 'Ritmo nominal regular'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quadro de Cálculos de Engenharia de Tempos e Métodos */}
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-300 mb-3 border-b border-slate-800 pb-2">
              Resultados e Fórmulas Calculadas
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <span className="text-[10px] text-slate-400 block uppercase font-medium">
                  Tempo Médio (TO)
                </span>
                <span className="text-xl font-bold font-mono text-white tabular-nums block mt-1">
                  {formatTimeInSeconds(metrics.tempoMedio)}
                </span>
                <span className="text-[10px] text-slate-500">Σ tempos ÷ {metrics.ciclosValidos}</span>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <span className="text-[10px] text-slate-400 block uppercase font-medium">
                  Fator de Ritmo (FR)
                </span>
                <span className="text-xl font-bold font-mono text-blue-300 tabular-nums block mt-1">
                  {metrics.fatorRitmo}%
                </span>
                <span className="text-[10px] text-slate-500">Mult: {metrics.fatorRitmoDecimal}</span>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <span className="text-[10px] text-slate-400 block uppercase font-medium">
                  Tempo Normal (TN)
                </span>
                <span className="text-xl font-bold font-mono text-indigo-300 tabular-nums block mt-1">
                  {formatTimeInSeconds(metrics.tempoNormal)}
                </span>
                <span className="text-[10px] text-slate-500">TO × FR</span>
              </div>

              <div className="bg-blue-900/60 p-3 rounded-lg border border-blue-500/60">
                <span className="text-[10px] text-blue-200 block uppercase font-bold">
                  Tempo Padrão (TP)
                </span>
                <span className="text-2xl font-extrabold font-mono text-white tabular-nums block mt-1">
                  {formatTimeInSeconds(metrics.tempoPadrao)}
                </span>
                <span className="text-[10px] text-blue-200">
                  TN × (1 + {metrics.percentualTolerancia}%)
                </span>
              </div>
            </div>

            {/* Painel de Capacidade Fabril */}
            <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400">Capacidade Teórica por Hora:</span>{' '}
                <span className="font-mono font-bold text-emerald-400">
                  {metrics.capacidadeHora} peças/hora
                </span>
              </div>
              <div>
                <span className="text-slate-400">Capacidade por Turno (8h úteis):</span>{' '}
                <span className="font-mono font-bold text-white">
                  {metrics.capacidadeTurno8h} peças/turno
                </span>
              </div>
              <div>
                <span className="text-slate-400">Estabilidade Amostral:</span>{' '}
                <span className="font-mono text-blue-300">
                  CV = {metrics.coeficienteVariacao}%
                </span>
              </div>
            </div>
          </div>

          {/* Observações da Operação */}
          {study.observacoes && (
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Observações Técnicas e Ergonomia
              </span>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {study.observacoes}
              </p>
            </div>
          )}

          {/* Assinaturas para laudo impresso */}
          <div className="pt-8 border-t border-slate-200 hidden print:block">
            <div className="grid grid-cols-2 gap-8 text-center text-xs">
              <div>
                <div className="border-b border-slate-400 pb-8 mb-2"></div>
                <div className="font-bold">{study.responsavel}</div>
                <div className="text-slate-500">Analista de Tempos e Métodos</div>
              </div>
              <div>
                <div className="border-b border-slate-400 pb-8 mb-2"></div>
                <div className="font-bold">Gerência de Produção / Engenharia Industrial</div>
                <div className="text-slate-500">Aprovação do Tempo Padrão</div>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé com Ações - Apenas tela */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 no-print">
          <div className="flex items-center gap-2">
            {currentUser.papel !== 'Visualização' && (
              <>
                <button
                  onClick={handleEdit}
                  className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" /> Editar
                </button>
                <button
                  onClick={handleDuplicate}
                  className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" /> Duplicar
                </button>
                <button
                  onClick={handleCreateImprovementFromStudy}
                  className="px-3 py-1.5 text-xs font-medium bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg text-emerald-800 flex items-center gap-1.5 transition-colors"
                >
                  <TrendingUp className="w-3.5 h-3.5" /> Abrir Ação Kaizen
                </button>
              </>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
