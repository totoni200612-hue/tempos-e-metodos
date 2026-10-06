import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ImprovementAction } from '../types';
import { formatTimeInSeconds } from '../utils/calculations';
import {
  TrendingUp,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Edit,
  Trash2,
  X,
  ArrowRight,
  Zap,
} from 'lucide-react';

export const ImprovementsView: React.FC = () => {
  const {
    improvements,
    operations,
    currentUser,
    saveImprovement,
    deleteImprovement,
    addToast,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingImp, setEditingImp] = useState<ImprovementAction | null>(null);

  // Form states
  const [codigo, setCodigo] = useState('');
  const [operacaoId, setOperacaoId] = useState('');
  const [problema, setProblema] = useState('');
  const [causaProvavel, setCausaProvavel] = useState('');
  const [acaoMelhoria, setAcaoMelhoria] = useState('');
  const [responsavel, setResponsavel] = useState(currentUser.nome);
  const [dataPrevista, setDataPrevista] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [status, setStatus] = useState<
    'planejada' | 'em_andamento' | 'concluida' | 'cancelada'
  >('planejada');
  const [resultado, setResultado] = useState('');
  const [tempoAntes, setTempoAntes] = useState<number>(0);
  const [tempoDepois, setTempoDepois] = useState<number | undefined>(undefined);

  const handleOpenNew = () => {
    setEditingImp(null);
    setCodigo(`KZN-${new Date().getFullYear()}-${String(improvements.length + 1).padStart(2, '0')}`);
    setOperacaoId(operations[0]?.id || '');
    setProblema('');
    setCausaProvavel('');
    setAcaoMelhoria('');
    setResponsavel(currentUser.nome);
    setDataPrevista(new Date().toISOString().split('T')[0]);
    setStatus('planejada');
    setResultado('');
    const op = operations[0];
    setTempoAntes(op ? op.tempoPadraoAtual : 0);
    setTempoDepois(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (imp: ImprovementAction) => {
    setEditingImp(imp);
    setCodigo(imp.codigo);
    setOperacaoId(imp.operacaoId);
    setProblema(imp.problema);
    setCausaProvavel(imp.causaProvavel);
    setAcaoMelhoria(imp.acaoMelhoria);
    setResponsavel(imp.responsavel);
    setDataPrevista(imp.dataPrevista);
    setStatus(imp.status);
    setResultado(imp.resultado || '');
    setTempoAntes(imp.tempoAntes);
    setTempoDepois(imp.tempoDepois);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!problema.trim() || !acaoMelhoria.trim()) {
      addToast('warning', 'Campos Obrigatórios', 'Problema e Ação de Melhoria devem ser informados.');
      return;
    }

    const res = saveImprovement({
      id: editingImp ? editingImp.id : undefined,
      codigo,
      operacaoId,
      problema: problema.trim(),
      causaProvavel: causaProvavel.trim(),
      acaoMelhoria: acaoMelhoria.trim(),
      responsavel: responsavel.trim(),
      dataPrevista,
      status,
      resultado: resultado.trim(),
      tempoAntes: Number(tempoAntes) || 0,
      tempoDepois: tempoDepois !== undefined && tempoDepois !== null ? Number(tempoDepois) : undefined,
    });

    if (res.success) {
      setIsModalOpen(false);
    }
  };

  const handleDelete = (imp: ImprovementAction) => {
    if (window.confirm(`Deseja remover a ação de melhoria ${imp.codigo}?`)) {
      deleteImprovement(imp.id);
    }
  };

  const filtered = improvements.filter((imp) => {
    const matchSearch =
      imp.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imp.problema.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imp.acaoMelhoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imp.responsavel.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = filterStatus === 'todos' || imp.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (st: ImprovementAction['status']) => {
    switch (st) {
      case 'concluida':
        return (
          <span className="text-emerald-700 text-xs font-semibold flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Concluída
          </span>
        );
      case 'em_andamento':
        return (
          <span className="text-blue-700 text-xs font-semibold flex items-center gap-1 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md">
            <Clock className="w-3.5 h-3.5 text-blue-600" /> Em Andamento
          </span>
        );
      case 'planejada':
        return (
          <span className="text-amber-700 text-xs font-semibold flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Planejada
          </span>
        );
      case 'cancelada':
        return (
          <span className="text-slate-600 text-xs font-semibold flex items-center gap-1 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
            <XCircle className="w-3.5 h-3.5 text-slate-500" /> Cancelada
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Ações de Melhoria & Kaizen Industrial
          </h1>
          <p className="text-xs text-slate-500">
            Registro de problemas, causas-raiz, planos 5W2H e mensuração de ganhos antes e depois
          </p>
        </div>

        {currentUser.papel !== 'Visualização' && (
          <button
            onClick={handleOpenNew}
            className="px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            Nova Ação de Melhoria
          </button>
        )}
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por problema, causa, ação, responsável..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2">
          <span className="text-xs text-slate-500 whitespace-nowrap">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-slate-700 font-medium"
          >
            <option value="todos">Todos os Status</option>
            <option value="planejada">Planejada</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="concluida">Concluída</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      </div>

      {/* Lista de Ações de Melhoria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((imp) => {
          const op = operations.find((o) => o.id === imp.operacaoId);
          const ganho = imp.ganhoPercentual || 0;

          return (
            <div
              key={imp.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Header do Card */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      {imp.codigo}
                    </span>
                    <span className="text-xs text-slate-500 ml-2">
                      {op ? `${op.codigo} - ${op.nome}` : 'Operação Fabril'}
                    </span>
                  </div>

                  <div>{getStatusBadge(imp.status)}</div>
                </div>

                {/* Problema Identificado */}
                <div className="mb-3">
                  <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block mb-0.5">
                    Problema Identificado
                  </span>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {imp.problema}
                  </p>
                </div>

                {/* Causa Provável */}
                {imp.causaProvavel && (
                  <div className="mb-3">
                    <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block mb-0.5">
                      Causa Provável (Ishikawa / 5 Porquês)
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {imp.causaProvavel}
                    </p>
                  </div>
                )}

                {/* Ação de Melhoria */}
                <div className="mb-3">
                  <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block mb-0.5">
                    Ação de Melhoria (5W2H)
                  </span>
                  <p className="text-xs text-slate-800 leading-relaxed">
                    {imp.acaoMelhoria}
                  </p>
                </div>

                {/* Comparativo de Tempo Antes e Depois (se houver) */}
                {imp.tempoAntes > 0 && (
                  <div className="my-3 p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                          Tempo Antes
                        </span>
                        <span className="font-mono font-bold text-slate-700">
                          {formatTimeInSeconds(imp.tempoAntes)}
                        </span>
                      </div>

                      <ArrowRight className="w-4 h-4 text-slate-400" />

                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                          Tempo Depois
                        </span>
                        <span className="font-mono font-bold text-emerald-700">
                          {imp.tempoDepois ? formatTimeInSeconds(imp.tempoDepois) : 'Em medição'}
                        </span>
                      </div>

                      {ganho > 0 && (
                        <div className="text-right">
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                            Ganho Produtivo
                          </span>
                          <span className="font-mono font-extrabold text-emerald-600 text-sm">
                            +{ganho.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Resultado após melhoria */}
                {imp.resultado && (
                  <div className="mt-2 text-xs bg-emerald-50/60 border border-emerald-200/80 p-2.5 rounded-lg text-emerald-950">
                    <span className="font-bold block text-[10px] uppercase text-emerald-800 mb-0.5">
                      Resultado Alcançado:
                    </span>
                    <p className="leading-relaxed">{imp.resultado}</p>
                  </div>
                )}
              </div>

              {/* Rodapé do Card */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div>
                  <span>Resp: <strong>{imp.responsavel}</strong></span>
                  <span className="mx-1">·</span>
                  <span>Previsto: {imp.dataPrevista}</span>
                </div>

                <div className="flex items-center gap-1">
                  {currentUser.papel !== 'Visualização' && (
                    <button
                      onClick={() => handleOpenEdit(imp)}
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-blue-700 transition-colors"
                      title="Editar Ação"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}

                  {currentUser.papel === 'Administrador' && (
                    <button
                      onClick={() => handleDelete(imp)}
                      className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Excluir Ação"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Cadastro / Edição de Ação Kaizen */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  Melhoria Contínua
                </span>
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  {editingImp ? `Editar Ação ${editingImp.codigo}` : 'Registrar Nova Ação de Melhoria'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Código da Ação *
                  </label>
                  <input
                    type="text"
                    required
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Operação Vinculada *
                  </label>
                  <select
                    value={operacaoId}
                    onChange={(e) => {
                      setOperacaoId(e.target.value);
                      const op = operations.find((o) => o.id === e.target.value);
                      if (op && !tempoAntes) setTempoAntes(op.tempoPadraoAtual);
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                  >
                    {operations.map((op) => (
                      <option key={op.id} value={op.id}>
                        {op.codigo} - {op.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Problema Identificado (O Que Está Ocorrendo?) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={problema}
                  onChange={(e) => setProblema(e.target.value)}
                  placeholder="Descreva o atraso, desvio, espera, movimentação desnecessária ou retrabalho..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Causa Provável (Por Que Ocorre?)
                </label>
                <textarea
                  rows={2}
                  value={causaProvavel}
                  onChange={(e) => setCausaProvavel(e.target.value)}
                  placeholder="Causa raiz investigada através de 5 Porquês ou Diagrama de Causa e Efeito..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ação de Melhoria (O Que Fazer?) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={acaoMelhoria}
                  onChange={(e) => setAcaoMelhoria(e.target.value)}
                  placeholder="Solução proposta: novo dispositivo, readequação de layout, treinamento, alteração de parâmetros..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Responsável *
                  </label>
                  <input
                    type="text"
                    required
                    value={responsavel}
                    onChange={(e) => setResponsavel(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data Prevista *
                  </label>
                  <input
                    type="date"
                    required
                    value={dataPrevista}
                    onChange={(e) => setDataPrevista(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status da Ação
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                  >
                    <option value="planejada">Planejada</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="concluida">Concluída</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              </div>

              {/* Medição Antes x Depois */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tempo Antes (s)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={tempoAntes || ''}
                    onChange={(e) => setTempoAntes(Number(e.target.value))}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tempo Depois (s)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={tempoDepois !== undefined ? tempoDepois : ''}
                    onChange={(e) =>
                      setTempoDepois(e.target.value ? Number(e.target.value) : undefined)
                    }
                    placeholder="0.00 (após melhoria)"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resultado Após Melhoria
                </label>
                <textarea
                  rows={2}
                  value={resultado}
                  onChange={(e) => setResultado(e.target.value)}
                  placeholder="Ganhos quantitativos e qualitativos obtidos na prática..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-700 hover:text-slate-900 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Salvar Ação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
