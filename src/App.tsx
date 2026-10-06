import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { StudiesListView } from './components/StudiesListView';
import { OperationsView } from './components/OperationsView';
import { ProcessAnalysisView } from './components/ProcessAnalysisView';
import { ImprovementsView } from './components/ImprovementsView';
import { ReportsView } from './components/ReportsView';
import { DatabaseManagerView } from './components/DatabaseManagerView';
import { StudyFormModal } from './components/StudyFormModal';
import { StudyDetailModal } from './components/StudyDetailModal';
import { ToastContainer } from './components/Toast';
import { Menu } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    activeTab,
    isStudyFormOpen,
    setIsStudyFormOpen,
    isStudyDetailOpen,
    setIsStudyDetailOpen,
    selectedStudyForModal,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderCurrentView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'consultar_estudos':
        return <StudiesListView />;
      case 'operacoes':
        return <OperationsView />;
      case 'analise':
        return <ProcessAnalysisView />;
      case 'melhorias':
        return <ImprovementsView />;
      case 'relatorios':
        return <ReportsView />;
      case 'banco_dados':
        return <DatabaseManagerView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar de Navegação */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      {/* Área Principal */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Mobile Header Bar com botão de menu */}
        <div className="md:hidden flex items-center justify-between px-4 py-2.5 bg-slate-900 text-white border-b border-slate-800 no-print">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
            aria-label="Abrir Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold tracking-tight">APP Tempos e Métodos</span>
          <div className="w-5" /> {/* Espaçador para centralizar */}
        </div>

        {/* Header Principal */}
        <Header />

        {/* Viewport de Conteúdo com Scroll */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderCurrentView()}
          </div>
        </main>
      </div>

      {/* Modais Globais */}
      <StudyFormModal
        isOpen={isStudyFormOpen}
        onClose={() => setIsStudyFormOpen(false)}
        studyToEdit={selectedStudyForModal}
      />

      <StudyDetailModal
        isOpen={isStudyDetailOpen}
        onClose={() => setIsStudyDetailOpen(false)}
        study={selectedStudyForModal}
      />

      {/* Notificações Toast */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
