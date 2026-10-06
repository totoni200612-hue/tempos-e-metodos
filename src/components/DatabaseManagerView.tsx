import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Table,
  Plus,
  Trash2,
  CheckCircle2,
  FileCode,
} from 'lucide-react';
import { formatTimeInSeconds } from '../utils/calculations';

export const DatabaseManagerView: React.FC = () => {
  const {
    departments,
    products,
    employees,
    operations,
    studies,
    improvements,
    currentUser,
    setUserRole,
    resetDatabase,
    exportDatabaseJSON,
    importDatabaseJSON,
    saveDepartment,
    deleteDepartment,
    saveProduct,
    deleteProduct,
    saveEmployee,
    deleteEmployee,
    addToast,
  } = useApp();

  const [activeTable, setActiveTable] = useState<
    'operacoes' | 'estudos' | 'ciclos' | 'produtos' | 'setores' | 'colaboradores' | 'melhorias'
  >('operacoes');

  // Modal para novos registros auxiliares
  const [showAuxModal, setShowAuxModal] = useState(false);
  const [auxType, setAuxType] = useState<'produto' | 'setor' | 'colaborador'>('produto');
  
  // Form states auxiliares
  const [nomeAux, setNomeAux] = useState('');
  const [codigoAux, setCodigoAux] = useState('');
  const [campoExtra1, setCampoExtra1] = useState('');
  const [campoExtra2, setCampoExtra2] = useState('');

  // Coleta de todos os ciclos cadastrados nos estudos
  const allCycles = studies.flatMap((s) =>
    (s.ciclos || []).map((c) => ({
      ...c,
      estudoCodigo: s.codigoEstudo,
      operacaoCodigo: s.codigoOperacao,
    }))
  );

  const tables = [
    { id: 'operacoes' as const, name: 'Operações', count: operations.length, desc: 'Catálogo de operações industriais' },
    { id: 'estudos' as const, name: 'Estudos de Tempos', count: studies.length, desc: 'Fichas completas de cronometragem' },
    { id: 'ciclos' as const, name: 'Ciclos', count: allCycles.length, desc: 'Amostras de voltas registradas' },
    { id: 'produtos' as const, name: 'Produtos', count: products.length, desc: 'Itens produzidos pela fábrica' },
    { id: 'setores' as const, name: 'Setores', count: departments.length, desc: 'Centros de custo e áreas fabris' },
    { id: 'colaboradores' as const, name: 'Colaboradores', count: employees.length, desc: 'Operadores e cronometristas' },
    { id: 'melhorias' as const, name: 'Melhorias', count: improvements.length, desc: 'Planos de ação e Kaizen' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importDatabaseJSON(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleOpenAddAux = (type: 'produto' | 'setor' | 'colaborador') => {
    setAuxType(type);
    setNomeAux('');
    setCodigoAux('');
    setCampoExtra1('');
    setCampoExtra2('');
    setShowAuxModal(true);
  };

  const handleSaveAux = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeAux.trim()) return;

    if (auxType === 'produto') {
      saveProduct({
        codigo: codigoAux || `PRD-${Date.now().toString().slice(-3)}`,
        nome: nomeAux,
        categoria: campoExtra1 || 'Geral',
        unidade: campoExtra2 || 'un',
      });
    } else if (auxType === 'setor') {
      saveDepartment({
        nome: nomeAux,
        centroDeCusto: codigoAux || 'CC-3000',
        responsavel: campoExtra1 || 'Supervisor',
      });
    } else if (auxType === 'colaborador') {
      saveEmployee({
        matricula: codigoAux || `COL-${Date.now().toString().slice(-4)}`,
        nome: nomeAux,
        cargo: campoExtra1 || 'Operador',
        setorId: departments[0]?.id || 'set-1',
        nivelHabilidade: 'Pleno',
      });
    }

    setShowAuxModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Estrutura do Banco de Dados & Níveis de Acesso
          </h1>
          <p className="text-xs text-slate-500">
            Gerenciamento das 7 tabelas relacionais do sistema e controle de perfis de segurança (RBAC)
          </p>
        </div>

        {currentUser.papel === 'Administrador' && (
          <div className="flex items-center gap-2">
            <label className="px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-4 h-4 text-blue-600" />
              Restaurar Backup JSON
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={exportDatabaseJSON}
              className="px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              Baixar Backup JSON
            </button>

            <button
              onClick={() => {
                if (window.confirm('Tem certeza que deseja resetar os dados para os valores de fábrica?')) {
                  resetDatabase();
                }
              }}
              className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              title="Resetar Banco de Dados"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Matriz de Níveis de Acesso e Segurança (Exigido no Ponto 8) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Níveis de Acesso & Controle de Permissões (RBAC)
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Perfil ativo: <strong className="text-blue-700 font-semibold">{currentUser.papel}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Administrador */}
          <div
            onClick={() => setUserRole('Administrador')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              currentUser.papel === 'Administrador'
                ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-900">Administrador</span>
              {currentUser.papel === 'Administrador' && (
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              )}
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Acesso total. Cadastra, edita e exclui operações, estudos, colaboradores, setores e executa backups do banco.
            </p>
          </div>

          {/* Analista */}
          <div
            onClick={() => setUserRole('Analista')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              currentUser.papel === 'Analista'
                ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-900">Analista</span>
              {currentUser.papel === 'Analista' && (
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              )}
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Cria e edita estudos de tempos, calcula tempos padrão, gerencia ações de melhoria e gera relatórios gerenciais.
            </p>
          </div>

          {/* Operador */}
          <div
            onClick={() => setUserRole('Operador')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              currentUser.papel === 'Operador'
                ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-900">Operador</span>
              {currentUser.papel === 'Operador' && (
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              )}
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Registra tempos de ciclos via cronômetro e consulta instruções das operações do seu posto.
            </p>
          </div>

          {/* Visualização */}
          <div
            onClick={() => setUserRole('Visualização')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              currentUser.papel === 'Visualização'
                ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-900">Visualização</span>
              {currentUser.papel === 'Visualização' && (
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              )}
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Somente leitura. Acesso aos dashboards, relatórios e fichas técnicas concluídas, sem alteração de dados.
            </p>
          </div>
        </div>
      </div>

      {/* Seletor das 7 Tabelas do Banco de Dados (Exigido no Ponto 7) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {tables.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTable(t.id)}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeTable === t.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[11px] font-bold uppercase truncate ${
                activeTable === t.id ? 'text-blue-100' : 'text-slate-500'
              }`}>
                {t.name}
              </span>
              <span className={`font-mono text-xs font-bold px-1.5 py-0.2 rounded ${
                activeTable === t.id ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {t.count}
              </span>
            </div>
            <div className={`text-[10px] truncate ${activeTable === t.id ? 'text-blue-200' : 'text-slate-400'}`}>
              {t.desc}
            </div>
          </button>
        ))}
      </div>

      {/* Visualização da Tabela Ativa */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Registros da Tabela: {tables.find((t) => t.id === activeTable)?.name}
            </h2>
          </div>

          {currentUser.papel === 'Administrador' && (activeTable === 'produtos' || activeTable === 'setores' || activeTable === 'colaboradores') && (
            <button
              onClick={() =>
                handleOpenAddAux(
                  activeTable === 'produtos'
                    ? 'produto'
                    : activeTable === 'setores'
                    ? 'setor'
                    : 'colaborador'
                )
              }
              className="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar Registro
            </button>
          )}
        </div>

        <div className="overflow-x-auto max-h-96">
          {/* TABELA 1: Operações */}
          {activeTable === 'operacoes' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Nome da Operação</th>
                  <th className="py-2.5 px-3">Máquina</th>
                  <th className="py-2.5 px-3 text-right">Tempo Padrão (s)</th>
                  <th className="py-2.5 px-3 text-right">Takt Time (s)</th>
                  <th className="py-2.5 px-3">Data Criação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {operations.map((op) => (
                  <tr key={op.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{op.codigo}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{op.nome}</td>
                    <td className="py-2.5 px-3 text-slate-600">{op.maquina}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">{op.tempoPadraoAtual}s</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">{op.taktTimeAlvo || 0}s</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{op.criadoEm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* TABELA 2: Estudos de Tempos */}
          {activeTable === 'estudos' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">Código Estudo</th>
                  <th className="py-2.5 px-3">Operação</th>
                  <th className="py-2.5 px-3">Operador</th>
                  <th className="py-2.5 px-3">Data</th>
                  <th className="py-2.5 px-3 text-right">Ciclos</th>
                  <th className="py-2.5 px-3 text-right">T. Médio</th>
                  <th className="py-2.5 px-3 text-right">T. Padrão</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studies.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{s.codigoEstudo}</td>
                    <td className="py-2.5 px-3">{s.codigoOperacao} - {s.nomeOperacao}</td>
                    <td className="py-2.5 px-3">{s.nomeOperador}</td>
                    <td className="py-2.5 px-3 font-mono">{s.dataEstudo}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{s.ciclos.length}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{formatTimeInSeconds(s.tempoMedio)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">{formatTimeInSeconds(s.tempoPadrao)}</td>
                    <td className="py-2.5 px-3 font-semibold text-emerald-700">{s.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* TABELA 3: Ciclos */}
          {activeTable === 'ciclos' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">Estudo</th>
                  <th className="py-2.5 px-3">Operação</th>
                  <th className="py-2.5 px-3 text-center">Nº Ciclo</th>
                  <th className="py-2.5 px-3 text-right">Tempo (segundos)</th>
                  <th className="py-2.5 px-3">Observação do Ciclo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allCycles.map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{c.estudoCodigo}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{c.operacaoCodigo}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-semibold">#{c.numeroCiclo}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">
                      {formatTimeInSeconds(c.tempoSegundos)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{c.observacao || 'Normal'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* TABELA 4: Produtos */}
          {activeTable === 'produtos' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Nome do Produto</th>
                  <th className="py-2.5 px-3">Categoria</th>
                  <th className="py-2.5 px-3">Unidade</th>
                  {currentUser.papel === 'Administrador' && <th className="py-2.5 px-3 text-right">Ação</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{p.codigo}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{p.nome}</td>
                    <td className="py-2.5 px-3 text-slate-600">{p.categoria}</td>
                    <td className="py-2.5 px-3 font-mono">{p.unidade}</td>
                    {currentUser.papel === 'Administrador' && (
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                          title="Excluir Produto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* TABELA 5: Setores */}
          {activeTable === 'setores' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">Setor Fabril</th>
                  <th className="py-2.5 px-3">Centro de Custo</th>
                  <th className="py-2.5 px-3">Responsável</th>
                  {currentUser.papel === 'Administrador' && <th className="py-2.5 px-3 text-right">Ação</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{d.nome}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{d.centroDeCusto}</td>
                    <td className="py-2.5 px-3 text-slate-600">{d.responsavel}</td>
                    {currentUser.papel === 'Administrador' && (
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => deleteDepartment(d.id)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                          title="Excluir Setor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* TABELA 6: Colaboradores */}
          {activeTable === 'colaboradores' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">Matrícula</th>
                  <th className="py-2.5 px-3">Nome</th>
                  <th className="py-2.5 px-3">Cargo</th>
                  <th className="py-2.5 px-3">Nível</th>
                  {currentUser.papel === 'Administrador' && <th className="py-2.5 px-3 text-right">Ação</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{emp.matricula}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{emp.nome}</td>
                    <td className="py-2.5 px-3 text-slate-600">{emp.cargo}</td>
                    <td className="py-2.5 px-3 font-mono">{emp.nivelHabilidade}</td>
                    {currentUser.papel === 'Administrador' && (
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => deleteEmployee(emp.id)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                          title="Excluir Colaborador"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* TABELA 7: Melhorias */}
          {activeTable === 'melhorias' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">Código Kaizen</th>
                  <th className="py-2.5 px-3">Problema</th>
                  <th className="py-2.5 px-3">Ação</th>
                  <th className="py-2.5 px-3">Responsável</th>
                  <th className="py-2.5 px-3 text-right">Ganho (%)</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {improvements.map((imp) => (
                  <tr key={imp.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{imp.codigo}</td>
                    <td className="py-2.5 px-3 text-slate-800 max-w-xs truncate">{imp.problema}</td>
                    <td className="py-2.5 px-3 text-slate-800 max-w-xs truncate">{imp.acaoMelhoria}</td>
                    <td className="py-2.5 px-3 text-slate-600">{imp.responsavel}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">
                      {imp.ganhoPercentual ? `+${imp.ganhoPercentual}%` : '-'}
                    </td>
                    <td className="py-2.5 px-3 font-semibold">{imp.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal para Adicionar Auxiliar */}
      {showAuxModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4 capitalize">
              Novo {auxType}
            </h3>

            <form onSubmit={handleSaveAux} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {auxType === 'produto'
                    ? 'Nome do Produto *'
                    : auxType === 'setor'
                    ? 'Nome do Setor Fabril *'
                    : 'Nome do Colaborador *'}
                </label>
                <input
                  type="text"
                  required
                  value={nomeAux}
                  onChange={(e) => setNomeAux(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {auxType === 'produto'
                    ? 'Código do Produto'
                    : auxType === 'setor'
                    ? 'Centro de Custo'
                    : 'Matrícula'}
                </label>
                <input
                  type="text"
                  value={codigoAux}
                  onChange={(e) => setCodigoAux(e.target.value)}
                  placeholder="Deixe em branco para gerar automático"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {auxType === 'produto'
                    ? 'Categoria'
                    : auxType === 'setor'
                    ? 'Responsável pelo Setor'
                    : 'Cargo'}
                </label>
                <input
                  type="text"
                  value={campoExtra1}
                  onChange={(e) => setCampoExtra1(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {auxType === 'produto' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unidade de Medida
                  </label>
                  <input
                    type="text"
                    value={campoExtra2}
                    onChange={(e) => setCampoExtra2(e.target.value)}
                    placeholder="Ex: un, peça, conjunto"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAuxModal(false)}
                  className="px-4 py-2 text-xs text-slate-700 hover:text-slate-900 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
