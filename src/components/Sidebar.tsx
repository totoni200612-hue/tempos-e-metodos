import React from 'react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';
import {
  LayoutDashboard,
  TimerReset,
  FileSearch,
  Cog,
  LineChart,
  TrendingUp,
  FileSpreadsheet,
  Database,
  X,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const {
    activeTab,
    setActiveTab,
    studies,
    operations,
    improvements,
    setIsStudyFormOpen,
    setSelectedStudyForModal,
  } = useApp();

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      id: 'novo_estudo' as ActiveTab,
      label: 'Novo Estudo',
      icon: TimerReset,
      action: () => {
        setSelectedStudyForModal(null);
        setIsStudyFormOpen(true);
      },
    },
    {
      id: 'consultar_estudos' as ActiveTab,
      label: 'Consultar Estudos',
      icon: FileSearch,
      count: studies.length,
    },
    {
      id: 'operacoes' as ActiveTab,
      label: 'Operações',
      icon: Cog,
      count: operations.length,
    },
    {
      id: 'analise' as ActiveTab,
      label: 'Análise do Processo',
      icon: LineChart,
      highlight: true,
    },
    {
      id: 'melhorias' as ActiveTab,
      label: 'Ações de Melhoria',
      icon: TrendingUp,
      count: improvements.length,
    },
    {
      id: 'relatorios' as ActiveTab,
      label: 'Relatórios & Exportação',
      icon: FileSpreadsheet,
    },
    {
      id: 'banco_dados' as ActiveTab,
      label: 'Banco de Dados (7 Tab.)',
      icon: Database,
    },
  ];

  const handleSelectTab = (item: (typeof navItems)[0]) => {
    if (item.action) {
      item.action();
    } else {
      setActiveTab(item.id);
    }
    setMobileOpen(false);
  };

  const content = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      {/* Top Drawer Title (Mobile only) */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-800">
        <span className="text-sm font-bold text-white tracking-wide">Menu Principal</span>
        <button
          onClick={() => setMobileOpen(false)}
          className="text-slate-400 hover:text-white p-1"
          aria-label="Fechar menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase px-3 mb-2">
          Módulos Principais
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id && !item.action;

          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.count !== undefined && (
                <span
                  className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info Box */}
      <div className="p-3.5 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-slate-300">Engenharia de Métodos</span>
          <span className="text-emerald-400 font-mono">v1.2</span>
        </div>
        <p className="text-slate-500 text-[10px] leading-relaxed">
          Padrões OIT & Barnes · Cálculo de Capacidade & Balanceamento
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 shrink-0 no-print">
        {content}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 z-40 md:hidden backdrop-blur-xs no-print"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 w-72 z-50 md:hidden transform transition-transform duration-200 ease-in-out no-print ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {content}
      </div>
    </>
  );
};
