import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TimeStudy } from '../types';
import { formatTimeInSeconds, exportToCSV } from '../utils/calculations';
import {
  Search,
  Filter,
  PlusCircle,
  FileSpreadsheet,
  Eye,
  Edit,
  Trash2,
  Copy,
  Clock,
  CheckCircle2,
  Activity,
  ArrowUpDown,
} from 'lucide-react';

export const StudiesListView: React.FC = () => {
  const {
    studies,
    departments,
    currentUser,
    setSelectedStudyForModal,
    setIsStudyFormOpen,
    setIsStudyDetailOpen,
    deleteStudy,
    duplicateStudy,
    addToast,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSetor, setSelectedSetor] = useState('todos');
  const [selectedStatus, setSelectedStatus] = useState('todos');
  const [sortBy, setSortBy] = useState<'data' | 'tempoPadrao' | 'codigo'>('data');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filtros combinados
  const filteredStudies = studies
    .filter((study) => {
      const matchSearch =
        study.codigoEstudo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        study.codigoOperacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        study.nomeOperacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        study.produto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        study.nomeOperador.toLowerCase().includes(searchTerm.toLowerCase());

      const matchSetor =
        selectedSetor === 'todos' || study.setor.toLowerCase() === selectedSetor.toLowerCase();

      const matchStatus =
        selectedStatus === 'todos' || study.status === selectedStatus;

      return matchSearch && matchSetor && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'data') {
        const valA = new Date(a.dataEstudo).getTime();
        const valB = new Date(b.dataEstudo).getTime();
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      if (sortBy === 'tempoPadrao') {
        const valA = a.tempoPadrao || 0;
        const valB = b.tempoPadrao || 0;
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      if (sortBy === 'codigo') {
        return sortOrder === 'asc'
          ? a.codigoEstudo.localeCompare(b.codigoEstudo)
          : b.codigoEstudo.localeCompare(a.codigoEstudo);
      }
      return 0;
    });

  const handleExportAll = () => {
    if (filteredStudies.length === 0) {
      addToast('warning', 'Sem Dados', 'Nenhum estudo corresponde aos filtros atuais.');
      return;
    }

    const rows = filteredStudies.map((s) => ({
      'Código Estudo': s.codigoEstudo,
      'Código Operação': s.codigoOperacao,
      'Operação': s.nomeOperacao,
      'Produto': s.produto,
      'Setor': s.setor,
      'Máquina': s.maquina,
      'Operador': s.nomeOperador,
      'Data': s.dataEstudo,
      'Responsável': s.responsavel,
      'Ciclos Observados': s.ciclos.length,
      'Tempo Médio (s)': s.tempoMedio || 0,
      'Fator Ritmo (%)': s.fatorRitmo,
      'Tolerância (%)': s.percentualTolerancia,
      'Tempo Padrão (s)': s.tempoPadrao || 0,
      'Status': s.status === 'concluido' ? 'Concluído' : 'Em Andamento',
    }));

    exportToCSV(`estudos_tempos_metodos_${new Date().toISOString().split('T')[0]}`, rows);
    addToast('success', 'Relatório Exportado', `${rows.length} estudos exportados para Excel/CSV.`);
  };

  const handleDelete = (id: string, codigo: string) => {
    if (window.confirm(`Confirma a exclusão permanente do estudo ${codigo}?`)) {
      deleteStudy(id);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header com Título e Botões de Ação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Consulta de Estudos de Tempos
          </h1>
          <p className="text-xs text-slate-500">
            Gerenciamento e histórico completo de cronometragens e tempos padrão
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportAll}
            className="px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Exportar Excel
          </button>

          {currentUser.papel !== 'Visualização' && (
            <button
              onClick={() => {
                setSelectedStudyForModal(null);
                setIsStudyFormOpen(true);
              }}
              className="px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              Novo Estudo
            </button>
          )}
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Busca textual */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por código, operação, operador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Filtro por Setor */}
          <div>
            <select
              value={selectedSetor}
              onChange={(e) => setSelectedSetor(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-slate-700 font-medium"
            >
              <option value="todos">Todos os Setores</option>
              {departments.map((d) => (
                <option key={d.id} value={d.nome}>
                  {d.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-slate-700 font-medium"
            >
              <option value="todos">Todos os Status</option>
              <option value="concluido">Concluídos</option>
              <option value="em_andamento">Em Andamento</option>
            </select>
          </div>

          {/* Ordenação */}
          <div className="flex items-center gap-1.5">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-slate-700 font-medium"
            >
              <option value="data">Ordenar por Data</option>
              <option value="tempoPadrao">Ordenar por Tempo Padrão</option>
              <option value="codigo">Ordenar por Código</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
              title="Inverter Ordem"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Exibindo <strong className="text-slate-800">{filteredStudies.length}</strong> de{' '}
            {studies.length} estudos registrados
          </span>
          {(searchTerm || selectedSetor !== 'todos' || selectedStatus !== 'todos') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSetor('todos');
                setSelectedStatus('todos');
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Tabela de Estudos */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredStudies.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">Nenhum estudo encontrado</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Nenhum registro corresponde aos critérios pesquisados. Tente ajustar os filtros ou cadastre um novo estudo.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="py-3 px-3.5 font-semibold">Código Estudo</th>
                  <th className="py-3 px-3.5 font-semibold">Operação / Produto</th>
                  <th className="py-3 px-3.5 font-semibold">Setor / Máquina</th>
                  <th className="py-3 px-3.5 font-semibold">Operador & Data</th>
                  <th className="py-3 px-3.5 font-semibold text-right">Ciclos</th>
                  <th className="py-3 px-3.5 font-semibold text-right">T. Médio</th>
                  <th className="py-3 px-3.5 font-semibold text-right">Ritmo / Tol.</th>
                  <th className="py-3 px-3.5 font-semibold text-right">Tempo Padrão</th>
                  <th className="py-3 px-3.5 font-semibold">Status</th>
                  <th className="py-3 px-3.5 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudies.map((study) => (
                  <tr key={study.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Código */}
                    <td className="py-3 px-3.5 font-bold font-mono text-slate-900 whitespace-nowrap">
                      {study.codigoEstudo}
                    </td>

                    {/* Operação */}
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-slate-900 leading-tight">
                        {study.nomeOperacao}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {study.codigoOperacao} · {study.produto}
                      </div>
                    </td>

                    {/* Setor & Máquina */}
                    <td className="py-3 px-3.5">
                      <div className="text-slate-800 font-medium">{study.setor}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                        {study.maquina}
                      </div>
                    </td>

                    {/* Operador & Data */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="text-slate-800 font-medium">{study.nomeOperador}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{study.dataEstudo}</div>
                    </td>

                    {/* Ciclos */}
                    <td className="py-3 px-3.5 text-right font-mono font-medium text-slate-700">
                      {study.ciclos.length}
                    </td>

                    {/* Tempo Médio */}
                    <td className="py-3 px-3.5 text-right font-mono text-slate-700">
                      {formatTimeInSeconds(study.tempoMedio)}
                    </td>

                    {/* Ritmo / Tol */}
                    <td className="py-3 px-3.5 text-right font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {study.fatorRitmo}% / +{study.percentualTolerancia}%
                    </td>

                    {/* Tempo Padrão */}
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-sm text-blue-700 whitespace-nowrap">
                      {formatTimeInSeconds(study.tempoPadrao)}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {study.status === 'concluido' ? (
                        <span className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Concluído
                        </span>
                      ) : (
                        <span className="text-amber-700 font-semibold text-[11px] flex items-center gap-1">
                          <Activity className="w-3 h-3 text-amber-600" /> Em andamento
                        </span>
                      )}
                    </td>

                    {/* Ações */}
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setSelectedStudyForModal(study);
                            setIsStudyDetailOpen(true);
                          }}
                          className="p-1.5 rounded text-slate-600 hover:text-blue-700 hover:bg-slate-100 transition-colors"
                          title="Visualizar Ficha Completa"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {currentUser.papel !== 'Visualização' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedStudyForModal(study);
                                setIsStudyFormOpen(true);
                              }}
                              className="p-1.5 rounded text-slate-600 hover:text-blue-700 hover:bg-slate-100 transition-colors"
                              title="Editar Estudo"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => duplicateStudy(study.id)}
                              className="p-1.5 rounded text-slate-600 hover:text-blue-700 hover:bg-slate-100 transition-colors"
                              title="Duplicar Estudo"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {currentUser.papel === 'Administrador' && (
                          <button
                            onClick={() => handleDelete(study.id, study.codigoEstudo)}
                            className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Excluir Estudo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
