import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { PlusCircle, ShieldCheck, Factory } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    setUserRole,
    setIsStudyFormOpen,
    setSelectedStudyForModal,
    activeTab,
    setActiveTab,
  } = useApp();

  const handleOpenNewStudy = () => {
    setSelectedStudyForModal(null);
    setIsStudyFormOpen(true);
  };

  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Visão Geral / Indicadores';
      case 'novo_estudo':
        return 'Estudos de Tempos / Novo Registro';
      case 'consultar_estudos':
        return 'Engenharia / Consulta de Estudos';
      case 'operacoes':
        return 'Processos / Catálogo de Operações';
      case 'analise':
        return 'Análise de Capacidade / Gargalos';
      case 'melhorias':
        return 'Melhoria Contínua / Ações Kaizen';
      case 'relatorios':
        return 'Relatórios e Produtividade / Exportações';
      case 'banco_dados':
        return 'Administração / Tabelas do Banco';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 no-print">
      <div className="flex items-center justify-between gap-4">
        {/* Zone 1: Brand title single text element */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 text-left group focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <Factory className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors block leading-tight">
                APP Tempos e Métodos
              </span>
              <span className="text-[11px] text-slate-500 hidden sm:block leading-tight">
                Controle & Melhoria de Processos Industriais
              </span>
            </div>
          </button>

          <span className="hidden md:inline text-slate-300 font-light mx-1">|</span>
          <span className="hidden md:inline text-xs font-medium text-slate-500">
            {getBreadcrumb()}
          </span>
        </div>

        {/* Zone 3: Security Role Switcher & Primary Action */}
        <div className="flex items-center gap-3">
          {/* Seletor de Perfil de Acesso */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="text-slate-500 hidden lg:inline">Perfil:</span>
            <select
              value={currentUser.papel}
              onChange={(e) => setUserRole(e.target.value as UserRole)}
              className="bg-transparent font-semibold text-slate-800 text-xs focus:outline-none cursor-pointer"
              aria-label="Selecionar Nível de Acesso"
            >
              <option value="Administrador">Administrador</option>
              <option value="Analista">Analista</option>
              <option value="Operador">Operador</option>
              <option value="Visualização">Visualização</option>
            </select>
          </div>

          {/* Botão de Ação Primária */}
          {currentUser.papel !== 'Visualização' && (
            <button
              onClick={handleOpenNewStudy}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Estudo</span>
              <span className="sm:hidden">Estudo</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
