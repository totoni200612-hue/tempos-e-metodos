import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Operation } from '../types';
import { formatTimeInSeconds } from '../utils/calculations';
import {
  PlusCircle,
  Search,
  Cog,
  Edit,
  Trash2,
  Clock,
  PlayCircle,
  X,
  AlertTriangle,
  Layers,
} from 'lucide-react';

export const OperationsView: React.FC = () => {
  const {
    operations,
    departments,
    products,
    studies,
    currentUser,
    saveOperation,
    deleteOperation,
    setSelectedStudyForModal,
    setIsStudyFormOpen,
    addToast,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSetor, setSelectedSetor] = useState('todos');
  const [isOpModalOpen, setIsOpModalOpen] = useState(false);
  const [editingOp, setEditingOp] = useState<Operation | null>(null);

  // Form states
  const [formCodigo, setFormCodigo] = useState('');
  const [formNome, setFormNome] = useState('');
  const [formSetorId, setFormSetorId] = useState('');
  const [formProdutoId, setFormProdutoId] = useState('');
  const [formMaquina, setFormMaquina] = useState('');
  const [formDescricao, setFormDescricao] = useState('');
  const [formTaktTime, setFormTaktTime] = useState<number>(60);
  const [formTempoPadrao, setFormTempoPadrao] = useState<number>(0);

  const handleOpenNew = () => {
    setEditingOp(null);
    setFormCodigo(`OP-${String(operations.length * 10 + 10).padStart(3, '0')}`);
    setFormNome('');
    setFormSetorId(departments[0]?.id || '');
    setFormProdutoId(products[0]?.id || '');
    setFormMaquina('');
    setFormDescricao('');
    setFormTaktTime(60);
    setFormTempoPadrao(0);
    setIsOpModalOpen(true);
  };

  const handleOpenEdit = (op: Operation) => {
    setEditingOp(op);
    setFormCodigo(op.codigo);
    setFormNome(op.nome);
    setFormSetorId(op.setorId);
    setFormProdutoId(op.produtoId);
    setFormMaquina(op.maquina);
    setFormDescricao(op.descricao);
    setFormTaktTime(op.taktTimeAlvo || 60);
    setFormTempoPadrao(op.tempoPadraoAtual || 0);
    setIsOpModalOpen(true);
  };

  const handleSubmitOp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCodigo.trim() || !formNome.trim()) {
      addToast('warning', 'Campos Obrigatórios', 'Código e Nome da Operação são obrigatórios.');
      return;
    }

    const res = saveOperation({
      id: editingOp ? editingOp.id : undefined,
      codigo: formCodigo.trim(),
      nome: formNome.trim(),
      setorId: formSetorId,
      produtoId: formProdutoId,
      maquina: formMaquina.trim(),
      descricao: formDescricao.trim(),
      taktTimeAlvo: Number(formTaktTime),
      tempoPadraoAtual: Number(formTempoPadrao),
    });

    if (res.success) {
      setIsOpModalOpen(false);
    }
  };

  const handleDeleteOp = (op: Operation) => {
    if (window.confirm(`Deseja excluir a operação ${op.codigo} - ${op.nome}?`)) {
      deleteOperation(op.id);
    }
  };

  const handleStartStudyForOp = (op: Operation) => {
    setSelectedStudyForModal(null);
    setIsStudyFormOpen(true);
  };

  const filteredOps = operations.filter((op) => {
    const matchSearch =
      op.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.maquina.toLowerCase().includes(searchTerm.toLowerCase());

    const matchSetor = selectedSetor === 'todos' || op.setorId === selectedSetor;

    return matchSearch && matchSetor;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Catálogo de Operações Industriais
          </h1>
          <p className="text-xs text-slate-500">
            Mapeamento de postos de trabalho, máquinas e tempos padrão vigentes
          </p>
        </div>

        {currentUser.papel !== 'Visualização' && currentUser.papel !== 'Operador' && (
          <button
            onClick={handleOpenNew}
            className="px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            Cadastrar Operação
          </button>
        )}
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por código, operação, máquina..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2">
          <span className="text-xs text-slate-500 whitespace-nowrap">Setor:</span>
          <select
            value={selectedSetor}
            onChange={(e) => setSelectedSetor(e.target.value)}
            className="w-full sm:w-56 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-slate-700 font-medium"
          >
            <option value="todos">Todos os Setores</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid de Cards de Operações */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOps.map((op) => {
          const dept = departments.find((d) => d.id === op.setorId);
          const prod = products.find((p) => p.id === op.produtoId);
          const opStudies = studies.filter((s) => s.operacaoId === op.id);
          const isCritical = op.taktTimeAlvo && op.tempoPadraoAtual > op.taktTimeAlvo;
          const capacidadeHora = op.tempoPadraoAtual > 0 ? Math.round(3600 / op.tempoPadraoAtual) : 0;

          return (
            <div
              key={op.id}
              className={`bg-white rounded-xl border p-4 shadow-2xs transition-all hover:shadow-xs flex flex-col justify-between ${
                isCritical ? 'border-rose-200' : 'border-slate-200'
              }`}
            >
              <div>
                {/* Header do Card */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {op.codigo}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1 leading-snug">
                      {op.nome}
                    </h3>
                  </div>

                  {isCritical && (
                    <span className="text-rose-600 bg-rose-50 border border-rose-200 text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 shrink-0">
                      <AlertTriangle className="w-3 h-3" /> Gargalo
                    </span>
                  )}
                </div>

                {/* Detalhes de Máquina, Setor e Produto */}
                <div className="space-y-1 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Setor:</span>
                    <span className="font-medium text-slate-800">{dept?.nome || 'Geral'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Máquina:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[180px]">
                      {op.maquina}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Produto:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[180px]">
                      {prod?.nome || 'Padrão'}
                    </span>
                  </div>
                </div>

                {/* Métricas de Tempo e Capacidade */}
                <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 grid grid-cols-2 gap-2 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                      Tempo Padrão
                    </span>
                    <span className="text-base font-bold font-mono text-blue-700">
                      {formatTimeInSeconds(op.tempoPadraoAtual)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                      Capacidade / Hora
                    </span>
                    <span className="text-base font-bold font-mono text-emerald-700">
                      {capacidadeHora} un/h
                    </span>
                  </div>
                </div>

                {op.descricao && (
                  <p className="text-[11px] text-slate-500 mt-3 line-clamp-2 leading-relaxed">
                    {op.descricao}
                  </p>
                )}
              </div>

              {/* Ações do Card */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {opStudies.length} estudo(s)
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleStartStudyForOp(op)}
                    className="p-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors flex items-center gap-1"
                    title="Realizar cronometragem desta operação"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Cronometrar</span>
                  </button>

                  {currentUser.papel !== 'Visualização' && currentUser.papel !== 'Operador' && (
                    <button
                      onClick={() => handleOpenEdit(op)}
                      className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded"
                      title="Editar Operação"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}

                  {currentUser.papel === 'Administrador' && (
                    <button
                      onClick={() => handleDeleteOp(op)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                      title="Excluir Operação"
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

      {/* Modal de Cadastro / Edição de Operação */}
      {isOpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">
                {editingOp ? `Editar Operação ${editingOp.codigo}` : 'Cadastrar Nova Operação'}
              </h2>
              <button
                onClick={() => setIsOpModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitOp} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Código *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCodigo}
                    onChange={(e) => setFormCodigo(e.target.value)}
                    placeholder="Ex: OP-010"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Setor Fabril *
                  </label>
                  <select
                    value={formSetorId}
                    onChange={(e) => setFormSetorId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome da Operação *
                </label>
                <input
                  type="text"
                  required
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                  placeholder="Ex: Torneamento de Acabamento e Faceamento"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Produto
                  </label>
                  <select
                    value={formProdutoId}
                    onChange={(e) => setFormProdutoId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Máquina / Equipamento
                  </label>
                  <input
                    type="text"
                    value={formMaquina}
                    onChange={(e) => setFormMaquina(e.target.value)}
                    placeholder="Ex: Torno CNC Mazak"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Takt Time Alvo (segundos)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formTaktTime}
                    onChange={(e) => setFormTaktTime(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tempo Padrão Vigente (s)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formTempoPadrao}
                    onChange={(e) => setFormTempoPadrao(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descrição das Atividades
                </label>
                <textarea
                  rows={2}
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                  placeholder="Detalhamento das etapas de fabricação..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-700 hover:text-slate-900 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Salvar Operação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
