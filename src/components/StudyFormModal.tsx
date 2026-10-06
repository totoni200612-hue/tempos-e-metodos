import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TimeStudy, CycleItem } from '../types';
import { LiveStopwatch } from './LiveStopwatch';
import { calculateStudyMetrics, formatTimeInSeconds } from '../utils/calculations';
import {
  X,
  Plus,
  Trash2,
  Save,
  Calculator,
  Timer,
  Info,
  CheckCircle2,
  Sliders,
} from 'lucide-react';

interface StudyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  studyToEdit?: TimeStudy | null;
}

export const StudyFormModal: React.FC<StudyFormModalProps> = ({
  isOpen,
  onClose,
  studyToEdit,
}) => {
  const {
    operations,
    departments,
    products,
    employees,
    currentUser,
    saveStudy,
    addToast,
  } = useApp();

  const [codigoOperacao, setCodigoOperacao] = useState('');
  const [nomeOperacao, setNomeOperacao] = useState('');
  const [operacaoId, setOperacaoId] = useState('');
  const [produto, setProduto] = useState('');
  const [setor, setSetor] = useState('');
  const [maquina, setMaquina] = useState('');
  const [operadorId, setOperadorId] = useState('');
  const [nomeOperador, setNomeOperador] = useState('');
  const [dataEstudo, setDataEstudo] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [responsavel, setResponsavel] = useState(currentUser.nome);
  const [observacoes, setObservacoes] = useState('');
  const [fatorRitmo, setFatorRitmo] = useState(100);
  const [percentualTolerancia, setPercentualTolerancia] = useState(14);
  const [status, setStatus] = useState<'concluido' | 'em_andamento'>('concluido');
  const [showStopwatch, setShowStopwatch] = useState(false);

  // Ciclos observados (pelo menos 5 iniciais)
  const [ciclos, setCiclos] = useState<CycleItem[]>([
    { id: '1', numeroCiclo: 1, tempoSegundos: 0, observacao: '' },
    { id: '2', numeroCiclo: 2, tempoSegundos: 0, observacao: '' },
    { id: '3', numeroCiclo: 3, tempoSegundos: 0, observacao: '' },
    { id: '4', numeroCiclo: 4, tempoSegundos: 0, observacao: '' },
    { id: '5', numeroCiclo: 5, tempoSegundos: 0, observacao: '' },
  ]);

  // Carregar dados caso seja edição
  useEffect(() => {
    if (studyToEdit) {
      setCodigoOperacao(studyToEdit.codigoOperacao || '');
      setNomeOperacao(studyToEdit.nomeOperacao || '');
      setOperacaoId(studyToEdit.operacaoId || '');
      setProduto(studyToEdit.produto || '');
      setSetor(studyToEdit.setor || '');
      setMaquina(studyToEdit.maquina || '');
      setOperadorId(studyToEdit.operadorId || '');
      setNomeOperador(studyToEdit.nomeOperador || '');
      setDataEstudo(studyToEdit.dataEstudo || new Date().toISOString().split('T')[0]);
      setResponsavel(studyToEdit.responsavel || currentUser.nome);
      setObservacoes(studyToEdit.observacoes || '');
      setFatorRitmo(studyToEdit.fatorRitmo ?? 100);
      setPercentualTolerancia(studyToEdit.percentualTolerancia ?? 14);
      setStatus(studyToEdit.status || 'concluido');

      if (studyToEdit.ciclos && studyToEdit.ciclos.length > 0) {
        setCiclos(studyToEdit.ciclos);
      } else {
        setCiclos([
          { id: '1', numeroCiclo: 1, tempoSegundos: 0 },
          { id: '2', numeroCiclo: 2, tempoSegundos: 0 },
          { id: '3', numeroCiclo: 3, tempoSegundos: 0 },
          { id: '4', numeroCiclo: 4, tempoSegundos: 0 },
          { id: '5', numeroCiclo: 5, tempoSegundos: 0 },
        ]);
      }
    } else {
      // Novo estudo limpo
      if (operations.length > 0) {
        const op = operations[0];
        setOperacaoId(op.id);
        setCodigoOperacao(op.codigo);
        setNomeOperacao(op.nome);
        setMaquina(op.maquina);
        const dep = departments.find((d) => d.id === op.setorId);
        if (dep) setSetor(dep.nome);
        const prd = products.find((p) => p.id === op.produtoId);
        if (prd) setProduto(prd.nome);
      }
      if (employees.length > 0) {
        setOperadorId(employees[0].id);
        setNomeOperador(employees[0].nome);
      }
      setDataEstudo(new Date().toISOString().split('T')[0]);
      setResponsavel(currentUser.nome);
      setObservacoes('');
      setFatorRitmo(100);
      setPercentualTolerancia(14);
      setStatus('concluido');
      setCiclos([
        { id: '1', numeroCiclo: 1, tempoSegundos: 0 },
        { id: '2', numeroCiclo: 2, tempoSegundos: 0 },
        { id: '3', numeroCiclo: 3, tempoSegundos: 0 },
        { id: '4', numeroCiclo: 4, tempoSegundos: 0 },
        { id: '5', numeroCiclo: 5, tempoSegundos: 0 },
      ]);
    }
  }, [studyToEdit, isOpen]);

  // Quando o usuário seleciona uma operação existente na lista suspensa
  const handleSelectOperation = (opId: string) => {
    setOperacaoId(opId);
    const op = operations.find((o) => o.id === opId);
    if (op) {
      setCodigoOperacao(op.codigo);
      setNomeOperacao(op.nome);
      setMaquina(op.maquina);
      const dep = departments.find((d) => d.id === op.setorId);
      if (dep) setSetor(dep.nome);
      const prd = products.find((p) => p.id === op.produtoId);
      if (prd) setProduto(prd.nome);
    }
  };

  const handleSelectEmployee = (empId: string) => {
    setOperadorId(empId);
    const emp = employees.find((e) => e.id === empId);
    if (emp) {
      setNomeOperador(emp.nome);
    }
  };

  // Gerenciamento de ciclos
  const handleAddCycle = () => {
    const nextNumber = ciclos.length + 1;
    setCiclos((prev) => [
      ...prev,
      {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 4),
        numeroCiclo: nextNumber,
        tempoSegundos: 0,
        observacao: '',
      },
    ]);
  };

  const handleRemoveCycle = (indexToRemove: number) => {
    if (ciclos.length <= 1) {
      addToast('warning', 'Atenção', 'É necessário manter pelo menos 1 ciclo.');
      return;
    }
    const updated = ciclos.filter((_, idx) => idx !== indexToRemove);
    // Renumerar ciclos
    const renumbered = updated.map((c, idx) => ({ ...c, numeroCiclo: idx + 1 }));
    setCiclos(renumbered);
  };

  const handleCycleTimeChange = (index: number, val: string) => {
    const num = parseFloat(val.replace(',', '.'));
    setCiclos((prev) =>
      prev.map((c, idx) =>
        idx === index ? { ...c, tempoSegundos: isNaN(num) ? 0 : num } : c
      )
    );
  };

  const handleCycleObsChange = (index: number, val: string) => {
    setCiclos((prev) =>
      prev.map((c, idx) => (idx === index ? { ...c, observacao: val } : c))
    );
  };

  // Callback do Cronômetro ao vivo
  const handleStopwatchAddCycle = (seconds: number) => {
    // Procura o primeiro ciclo vazio (tempo = 0), ou adiciona um novo
    const emptyIndex = ciclos.findIndex((c) => !c.tempoSegundos || c.tempoSegundos === 0);
    if (emptyIndex !== -1) {
      setCiclos((prev) =>
        prev.map((c, idx) =>
          idx === emptyIndex
            ? { ...c, tempoSegundos: seconds, observacao: 'Capturado via cronômetro' }
            : c
        )
      );
    } else {
      const nextNumber = ciclos.length + 1;
      setCiclos((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          numeroCiclo: nextNumber,
          tempoSegundos: seconds,
          observacao: 'Capturado via cronômetro',
        },
      ]);
    }
  };

  const handleImportAllLaps = (laps: number[]) => {
    const newCycles: CycleItem[] = laps.map((lap, idx) => ({
      id: Date.now().toString() + idx,
      numeroCiclo: idx + 1,
      tempoSegundos: lap,
      observacao: 'Importado de cronômetro',
    }));
    setCiclos(newCycles);
    addToast('success', 'Ciclos Atualizados', `${laps.length} voltas carregadas.`);
  };

  // Cálculo das métricas em tempo real
  const metrics = calculateStudyMetrics(ciclos, fatorRitmo, percentualTolerancia);

  // Submissão do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomeOperacao.trim()) {
      addToast('warning', 'Campo Obrigatório', 'Informe o nome da operação.');
      return;
    }

    const validCount = ciclos.filter((c) => c.tempoSegundos > 0).length;
    if (validCount === 0) {
      addToast(
        'warning',
        'Ciclos Vazios',
        'Informe o tempo de pelo menos um ciclo observado (em segundos).'
      );
      return;
    }

    const studyPayload: Partial<TimeStudy> = {
      id: studyToEdit ? studyToEdit.id : undefined,
      codigoEstudo: studyToEdit ? studyToEdit.codigoEstudo : undefined,
      operacaoId: operacaoId || 'op-custom',
      codigoOperacao: codigoOperacao || 'OP-001',
      nomeOperacao,
      produto: produto || 'Produto Geral',
      setor: setor || 'Geral',
      maquina: maquina || 'Bancada',
      operadorId: operadorId || 'emp-1',
      nomeOperador: nomeOperador || 'Operador',
      dataEstudo,
      responsavel,
      numeroCiclos: ciclos.length,
      observacoes,
      fatorRitmo,
      percentualTolerancia,
      ciclos,
      status,
    };

    const result = saveStudy(studyPayload);
    if (result.success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in-50 zoom-in-95">
        {/* Header do Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                {studyToEdit ? 'Edição de Estudo' : 'Novo Estudo de Cronometragem'}
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-xs text-slate-500">
                {studyToEdit?.codigoEstudo || 'Formulário Padrão'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              {studyToEdit ? `Editar Estudo ${studyToEdit.codigoEstudo}` : 'Registrar Estudo de Tempos'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowStopwatch(!showStopwatch)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                showStopwatch
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
            >
              <Timer className="w-4 h-4" />
              {showStopwatch ? 'Ocultar Cronômetro' : 'Abrir Cronômetro'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Corpo com Scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Cronômetro ao Vivo Opcional */}
          {showStopwatch && (
            <div className="border border-blue-200 rounded-xl overflow-hidden shadow-xs">
              <LiveStopwatch
                onAddCycleTime={handleStopwatchAddCycle}
                onImportAllLaps={handleImportAllLaps}
              />
            </div>
          )}

          <form id="study-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Bloco 1: Identificação da Operação & Equipamento */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  1. Identificação do Processo & Operação
                </h3>
                {operations.length > 0 && (
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span>Vincular operação existente:</span>
                    <select
                      value={operacaoId}
                      onChange={(e) => handleSelectOperation(e.target.value)}
                      className="border border-slate-200 rounded px-2 py-1 bg-white text-xs text-slate-800 font-medium"
                    >
                      <option value="">(Nova operação avulsa)</option>
                      {operations.map((op) => (
                        <option key={op.id} value={op.id}>
                          {op.codigo} - {op.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Código da Operação *
                  </label>
                  <input
                    type="text"
                    required
                    value={codigoOperacao}
                    onChange={(e) => setCodigoOperacao(e.target.value)}
                    placeholder="Ex: OP-010"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome da Operação *
                  </label>
                  <input
                    type="text"
                    required
                    value={nomeOperacao}
                    onChange={(e) => setNomeOperacao(e.target.value)}
                    placeholder="Ex: Usinagem de Acabamento e Faceamento"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Produto
                  </label>
                  <input
                    type="text"
                    value={produto}
                    onChange={(e) => setProduto(e.target.value)}
                    placeholder="Ex: Eixo Cardan 45mm"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Setor Industrial
                  </label>
                  <input
                    type="text"
                    value={setor}
                    onChange={(e) => setSetor(e.target.value)}
                    placeholder="Ex: Usinagem de Precisão"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Máquina / Equipamento
                  </label>
                  <input
                    type="text"
                    value={maquina}
                    onChange={(e) => setMaquina(e.target.value)}
                    placeholder="Ex: Torno CNC Mazak QT-250"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Bloco 2: Dados do Observador & Operador */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                2. Equipe & Metadados do Estudo
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Operador Observado
                  </label>
                  {employees.length > 0 ? (
                    <select
                      value={operadorId}
                      onChange={(e) => handleSelectEmployee(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    >
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.nome} ({emp.cargo})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={nomeOperador}
                      onChange={(e) => setNomeOperador(e.target.value)}
                      placeholder="Nome do Operador"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data do Estudo *
                  </label>
                  <input
                    type="date"
                    required
                    value={dataEstudo}
                    onChange={(e) => setDataEstudo(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Responsável pelo Estudo *
                  </label>
                  <input
                    type="text"
                    required
                    value={responsavel}
                    onChange={(e) => setResponsavel(e.target.value)}
                    placeholder="Engenheiro / Analista"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status do Estudo
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="concluido">Concluído</option>
                    <option value="em_andamento">Em Andamento</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bloco 3: Registro dos Ciclos Observados */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    3. Tempos Cronometrados por Ciclo ({ciclos.length} ciclos)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Insira o tempo de cada ciclo em segundos (ex: 45.2). Pode adicionar novos ciclos livremente.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddCycle}
                  className="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Ciclo
                </button>
              </div>

              {/* Tabela de Ciclos */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 w-16 text-center font-semibold">Ciclo</th>
                      <th className="py-2.5 px-3 w-36 font-semibold">Tempo (segundos) *</th>
                      <th className="py-2.5 px-3 font-semibold">Observações do Ciclo</th>
                      <th className="py-2.5 px-3 w-14 text-center font-semibold">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ciclos.map((ciclo, idx) => (
                      <tr key={ciclo.id || idx} className="hover:bg-slate-50/60">
                        <td className="py-2 px-3 text-center font-bold text-slate-600 font-mono">
                          #{ciclo.numeroCiclo}
                        </td>
                        <td className="py-2 px-3">
                          <div className="relative">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={ciclo.tempoSegundos || ''}
                              onChange={(e) => handleCycleTimeChange(idx, e.target.value)}
                              placeholder="0.00"
                              className="w-full px-2.5 py-1.5 font-mono text-xs font-bold text-slate-900 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                            <span className="absolute right-2 top-2 text-[10px] text-slate-400 font-mono">
                              s
                            </span>
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={ciclo.observacao || ''}
                            onChange={(e) => handleCycleObsChange(idx, e.target.value)}
                            placeholder="Ex: Ritmo estável, sem interferência"
                            className="w-full px-2.5 py-1.5 text-xs text-slate-700 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveCycle(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Remover este ciclo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bloco 4: Parâmetros de Avaliação de Ritmo & Tolerâncias */}
            <div className="space-y-4 pt-3 border-t border-slate-100 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  4. Parâmetros de Avaliação de Ritmo & Tolerâncias (OIT / Westinghouse)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Avaliação de Ritmo do Operador */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      Fator de Ritmo (FR):
                      <span className="font-mono text-blue-700 text-sm font-extrabold tabular-nums">
                        {fatorRitmo}%
                      </span>
                    </label>
                    <span className="text-[11px] text-slate-500 font-mono">
                      (x{(fatorRitmo / 100).toFixed(2)})
                    </span>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="140"
                    step="1"
                    value={fatorRitmo}
                    onChange={(e) => setFatorRitmo(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                    <span>70% (Lento)</span>
                    <span className="font-bold text-slate-600">100% (Normal)</span>
                    <span>140% (Muito Rápido)</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {[90, 95, 100, 105, 110].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setFatorRitmo(v)}
                        className={`px-2 py-0.5 text-[10px] rounded border font-medium ${
                          fatorRitmo === v
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {v}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Percentual de Tolerância */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      Percentual de Tolerância:
                      <span className="font-mono text-emerald-700 text-sm font-extrabold tabular-nums">
                        {percentualTolerancia}%
                      </span>
                    </label>
                    <span className="text-[11px] text-slate-500 font-mono">
                      (+{(percentualTolerancia / 100).toFixed(2)})
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="1"
                    value={percentualTolerancia}
                    onChange={(e) => setPercentualTolerancia(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                    <span>5% (Mínima)</span>
                    <span className="font-bold text-slate-600">14% (Média OIT)</span>
                    <span>30% (Severa)</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {[10, 12, 14, 16, 18].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setPercentualTolerancia(v)}
                        className={`px-2 py-0.5 text-[10px] rounded border font-medium ${
                          percentualTolerancia === v
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {v}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bloco 5: Cálculos Automáticos em Tempo Real (Exigidos no Ponto 3) */}
            <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    5. Cálculos Automáticos de Tempos e Métodos
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {metrics.ciclosValidos} ciclos válidos computados
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-center">
                <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                  <div className="text-[10px] text-slate-400 font-medium uppercase">
                    Tempo Médio (TO)
                  </div>
                  <div className="text-lg font-mono font-bold text-slate-100 tabular-nums">
                    {formatTimeInSeconds(metrics.tempoMedio)}
                  </div>
                  <div className="text-[10px] text-slate-500">Σ tempos / n</div>
                </div>

                <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                  <div className="text-[10px] text-slate-400 font-medium uppercase">
                    Fator de Ritmo
                  </div>
                  <div className="text-lg font-mono font-bold text-blue-300 tabular-nums">
                    {metrics.fatorRitmo}%
                  </div>
                  <div className="text-[10px] text-slate-500">FR = {metrics.fatorRitmoDecimal}</div>
                </div>

                <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                  <div className="text-[10px] text-slate-400 font-medium uppercase">
                    Tempo Normal (TN)
                  </div>
                  <div className="text-lg font-mono font-bold text-indigo-300 tabular-nums">
                    {formatTimeInSeconds(metrics.tempoNormal)}
                  </div>
                  <div className="text-[10px] text-slate-500">TO × FR</div>
                </div>

                <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                  <div className="text-[10px] text-slate-400 font-medium uppercase">
                    Tolerância (FT)
                  </div>
                  <div className="text-lg font-mono font-bold text-amber-300 tabular-nums">
                    +{metrics.percentualTolerancia}%
                  </div>
                  <div className="text-[10px] text-slate-500">Fadiga & Esperas</div>
                </div>

                <div className="col-span-2 sm:col-span-1 bg-blue-900/60 p-2.5 rounded-lg border border-blue-600/70">
                  <div className="text-[10px] text-blue-200 font-bold uppercase">
                    Tempo Padrão (TP)
                  </div>
                  <div className="text-xl font-mono font-extrabold text-white tabular-nums">
                    {formatTimeInSeconds(metrics.tempoPadrao)}
                  </div>
                  <div className="text-[10px] text-blue-200">TN × (1 + FT)</div>
                </div>
              </div>

              {/* Indicadores Adicionais de Capacidade & Variação */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-800 px-1 gap-2">
                <div>
                  Capacidade Estimada:{' '}
                  <span className="font-mono font-bold text-emerald-400">
                    {metrics.capacidadeHora} peças/hora
                  </span>{' '}
                  <span className="text-slate-500">·</span>{' '}
                  <span className="font-mono font-semibold text-slate-200">
                    {metrics.capacidadeTurno8h} peças/turno 8h
                  </span>
                </div>
                <div>
                  Variabilidade:{' '}
                  <span className="font-mono font-medium text-slate-300">
                    DP: {metrics.desvioPadrao}s (CV: {metrics.coeficienteVariacao}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Observações Gerais */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observações do Estudo / Condições Ambientais
              </label>
              <textarea
                rows={2}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Descreva particularidades do posto, iluminação, fadiga, temperatura, ruído ou desvios durante a coleta..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </form>
        </div>

        {/* Rodapé com Botões de Ação */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 rounded-lg transition-colors"
          >
            Cancelar
          </button>

          <button
            type="submit"
            form="study-form"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {studyToEdit ? 'Atualizar Estudo' : 'Salvar Estudo de Tempos'}
          </button>
        </div>
      </div>
    </div>
  );
};
