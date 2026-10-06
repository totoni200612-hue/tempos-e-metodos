import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Department,
  Product,
  Employee,
  Operation,
  TimeStudy,
  ImprovementAction,
  UserRole,
  UserProfile,
  ActiveTab,
  CycleItem,
} from '../types';
import {
  initialDepartments,
  initialProducts,
  initialEmployees,
  initialOperations,
  initialStudies,
  initialImprovements,
} from '../data/initialData';
import { calculateStudyMetrics } from '../utils/calculations';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

interface AppContextType {
  // Navigation & UI
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedStudyForModal: TimeStudy | null;
  setSelectedStudyForModal: (study: TimeStudy | null) => void;
  isStudyFormOpen: boolean;
  setIsStudyFormOpen: (open: boolean) => void;
  isStudyDetailOpen: boolean;
  setIsStudyDetailOpen: (open: boolean) => void;
  
  // Security & User Profile
  currentUser: UserProfile;
  setUserRole: (role: UserRole) => void;
  
  // Entities
  departments: Department[];
  products: Product[];
  employees: Employee[];
  operations: Operation[];
  studies: TimeStudy[];
  improvements: ImprovementAction[];

  // Studies CRUD
  saveStudy: (studyData: Partial<TimeStudy>) => { success: boolean; error?: string };
  deleteStudy: (id: string) => { success: boolean; error?: string };
  duplicateStudy: (id: string) => void;

  // Operations CRUD
  saveOperation: (opData: Partial<Operation>) => { success: boolean; error?: string };
  deleteOperation: (id: string) => { success: boolean; error?: string };

  // Improvements CRUD
  saveImprovement: (impData: Partial<ImprovementAction>) => { success: boolean; error?: string };
  deleteImprovement: (id: string) => { success: boolean; error?: string };

  // Support entities CRUD
  saveProduct: (prod: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  saveDepartment: (dept: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;
  saveEmployee: (emp: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  // Backup & Reset
  resetDatabase: () => void;
  exportDatabaseJSON: () => void;
  importDatabaseJSON: (jsonString: string) => boolean;

  // Toast notifications
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'app_tempos_metodos_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedStudyForModal, setSelectedStudyForModal] = useState<TimeStudy | null>(null);
  const [isStudyFormOpen, setIsStudyFormOpen] = useState(false);
  const [isStudyDetailOpen, setIsStudyDetailOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Perfil do usuário atual
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    return {
      nome: 'Lucas Silva',
      papel: 'Administrador',
      cargo: 'Engenheiro de Tempos e Métodos',
      email: 'lucas.silva@industria.com.br',
    };
  });

  const setUserRole = (role: UserRole) => {
    setCurrentUser((prev) => ({
      ...prev,
      papel: role,
      cargo:
        role === 'Administrador'
          ? 'Gerente Industrial / Admin'
          : role === 'Analista'
          ? 'Engenheiro de Tempos e Métodos'
          : role === 'Operador'
          ? 'Operador de Linha de Produção'
          : 'Consultor / Observador de Processos',
    }));
    addToast(
      'info',
      'Perfil Alterado',
      `Agora você está operando com permissões de ${role}.`
    );
  };

  // Helper para carregar do localStorage
  const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFIX + key);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn(`Erro ao carregar chave ${key} do localStorage`, e);
    }
    return defaultValue;
  };

  // States
  const [departments, setDepartments] = useState<Department[]>(() =>
    loadFromStorage('departments', initialDepartments)
  );
  const [products, setProducts] = useState<Product[]>(() =>
    loadFromStorage('products', initialProducts)
  );
  const [employees, setEmployees] = useState<Employee[]>(() =>
    loadFromStorage('employees', initialEmployees)
  );
  const [operations, setOperations] = useState<Operation[]>(() =>
    loadFromStorage('operations', initialOperations)
  );
  const [studies, setStudies] = useState<TimeStudy[]>(() =>
    loadFromStorage('studies', initialStudies)
  );
  const [improvements, setImprovements] = useState<ImprovementAction[]>(() =>
    loadFromStorage('improvements', initialImprovements)
  );

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'departments', JSON.stringify(departments));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'products', JSON.stringify(products));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'employees', JSON.stringify(employees));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'operations', JSON.stringify(operations));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'studies', JSON.stringify(studies));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'improvements', JSON.stringify(improvements));
    } catch (e) {
      console.error('Falha ao persistir no localStorage', e);
    }
  }, [departments, products, employees, operations, studies, improvements]);

  // Toast helper
  const addToast = (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // CRUD Estudos
  const saveStudy = (studyData: Partial<TimeStudy>): { success: boolean; error?: string } => {
    if (currentUser.papel === 'Visualização') {
      addToast('error', 'Acesso Negado', 'Usuário em modo Visualização não tem permissão para alterar dados.');
      return { success: false, error: 'Sem permissão' };
    }

    if (!studyData.nomeOperacao || !studyData.dataEstudo) {
      addToast('warning', 'Dados Incompletos', 'Preencha o nome da operação e a data do estudo.');
      return { success: false, error: 'Campos obrigatórios faltando' };
    }

    const rawCycles: CycleItem[] = studyData.ciclos || [];
    const fr = studyData.fatorRitmo ?? 100;
    const tol = studyData.percentualTolerancia ?? 14;

    // Calcular métricas automáticas
    const metrics = calculateStudyMetrics(rawCycles, fr, tol);

    const now = new Date().toISOString();

    if (studyData.id) {
      // Atualizar existente
      setStudies((prev) =>
        prev.map((s) => {
          if (s.id === studyData.id) {
            const updated: TimeStudy = {
              ...s,
              ...studyData,
              fatorRitmo: fr,
              percentualTolerancia: tol,
              ciclos: rawCycles,
              numeroCiclos: rawCycles.length,
              tempoMedio: metrics.tempoMedio,
              tempoNormal: metrics.tempoNormal,
              tempoPadrao: metrics.tempoPadrao,
              atualizadoEm: now,
            } as TimeStudy;
            return updated;
          }
          return s;
        })
      );

      // Se o estudo estiver concluído e vinculado a uma operação, atualizar o tempo padrão da operação
      if (studyData.status === 'concluido' && studyData.operacaoId && metrics.tempoPadrao > 0) {
        setOperations((prev) =>
          prev.map((op) =>
            op.id === studyData.operacaoId ? { ...op, tempoPadraoAtual: metrics.tempoPadrao } : op
          )
        );
      }

      addToast('success', 'Estudo Atualizado', `Estudo ${studyData.codigoEstudo || ''} salvo com sucesso!`);
      return { success: true };
    } else {
      // Criar novo estudo
      const nextNum = studies.length + 1;
      const codigoEstudo =
        studyData.codigoEstudo ||
        `EST-${new Date().getFullYear()}-${String(nextNum).padStart(3, '0')}`;

      const newStudy: TimeStudy = {
        id: 'est-' + Date.now(),
        codigoEstudo,
        operacaoId: studyData.operacaoId || 'op-custom',
        codigoOperacao: studyData.codigoOperacao || 'OP-NEW',
        nomeOperacao: studyData.nomeOperacao,
        produto: studyData.produto || 'Produto Padrão',
        setor: studyData.setor || 'Geral',
        maquina: studyData.maquina || 'Bancada Geral',
        operadorId: studyData.operadorId || 'emp-1',
        nomeOperador: studyData.nomeOperador || 'Operador Padrão',
        dataEstudo: studyData.dataEstudo,
        responsavel: studyData.responsavel || currentUser.nome,
        numeroCiclos: rawCycles.length,
        observacoes: studyData.observacoes || '',
        fatorRitmo: fr,
        percentualTolerancia: tol,
        ciclos: rawCycles,
        status: studyData.status || 'concluido',
        criadoEm: now,
        atualizadoEm: now,
        tempoMedio: metrics.tempoMedio,
        tempoNormal: metrics.tempoNormal,
        tempoPadrao: metrics.tempoPadrao,
      };

      setStudies((prev) => [newStudy, ...prev]);

      // Atualizar tempo padrão na operação vinculada
      if (newStudy.status === 'concluido' && newStudy.operacaoId && metrics.tempoPadrao > 0) {
        setOperations((prev) =>
          prev.map((op) =>
            op.id === newStudy.operacaoId ? { ...op, tempoPadraoAtual: metrics.tempoPadrao } : op
          )
        );
      }

      addToast('success', 'Estudo Cadastrado', `Estudo ${codigoEstudo} registrado com sucesso!`);
      return { success: true };
    }
  };

  const deleteStudy = (id: string): { success: boolean; error?: string } => {
    if (currentUser.papel !== 'Administrador') {
      addToast('error', 'Permissão Insuficiente', 'Apenas administradores podem excluir estudos arquivados.');
      return { success: false, error: 'Apenas administrador' };
    }

    setStudies((prev) => prev.filter((s) => s.id !== id));
    addToast('info', 'Estudo Excluído', 'O registro do estudo foi removido com sucesso.');
    return { success: true };
  };

  const duplicateStudy = (id: string) => {
    const original = studies.find((s) => s.id === id);
    if (!original) return;

    const nextNum = studies.length + 1;
    const duplicated: TimeStudy = {
      ...original,
      id: 'est-' + Date.now(),
      codigoEstudo: `EST-${new Date().getFullYear()}-${String(nextNum).padStart(3, '0')}`,
      dataEstudo: new Date().toISOString().split('T')[0],
      status: 'em_andamento',
      observacoes: `Cópia baseada no estudo ${original.codigoEstudo}. ` + original.observacoes,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };

    setStudies((prev) => [duplicated, ...prev]);
    addToast('success', 'Estudo Duplicado', `Criada cópia de trabalho: ${duplicated.codigoEstudo}`);
  };

  // CRUD Operações
  const saveOperation = (opData: Partial<Operation>): { success: boolean; error?: string } => {
    if (currentUser.papel === 'Visualização' || currentUser.papel === 'Operador') {
      addToast('error', 'Sem Permissão', 'Apenas Administradores ou Analistas podem alterar operações.');
      return { success: false, error: 'Sem permissão' };
    }

    if (!opData.codigo || !opData.nome) {
      addToast('warning', 'Atenção', 'Código e Nome da Operação são obrigatórios.');
      return { success: false, error: 'Campos obrigatórios' };
    }

    if (opData.id) {
      setOperations((prev) =>
        prev.map((op) => (op.id === opData.id ? { ...op, ...opData } as Operation : op))
      );
      addToast('success', 'Operação Atualizada', `Operação ${opData.codigo} atualizada com sucesso.`);
    } else {
      const newOp: Operation = {
        id: 'op-' + Date.now(),
        codigo: opData.codigo,
        nome: opData.nome,
        setorId: opData.setorId || departments[0]?.id || 'set-1',
        produtoId: opData.produtoId || products[0]?.id || 'prd-1',
        maquina: opData.maquina || 'Máquina Padrão',
        descricao: opData.descricao || '',
        taktTimeAlvo: opData.taktTimeAlvo || 60,
        tempoPadraoAtual: opData.tempoPadraoAtual || 0,
        criadoEm: new Date().toISOString().split('T')[0],
      };
      setOperations((prev) => [...prev, newOp]);
      addToast('success', 'Operação Criada', `Operação ${newOp.codigo} adicionada ao catálogo.`);
    }
    return { success: true };
  };

  const deleteOperation = (id: string): { success: boolean; error?: string } => {
    if (currentUser.papel !== 'Administrador') {
      addToast('error', 'Sem Permissão', 'Apenas Administradores podem excluir operações.');
      return { success: false, error: 'Sem permissão' };
    }

    // Verificar se há estudos vinculados
    const linkedStudies = studies.filter((s) => s.operacaoId === id);
    if (linkedStudies.length > 0) {
      addToast(
        'warning',
        'Operação com Estudos',
        `Existem ${linkedStudies.length} estudos vinculados a esta operação. Remova ou reatribua os estudos antes.`
      );
      return { success: false, error: 'Possui estudos vinculados' };
    }

    setOperations((prev) => prev.filter((op) => op.id !== id));
    addToast('info', 'Operação Removida', 'Operação excluída com sucesso.');
    return { success: true };
  };

  // CRUD Melhorias
  const saveImprovement = (impData: Partial<ImprovementAction>): { success: boolean; error?: string } => {
    if (currentUser.papel === 'Visualização') {
      addToast('error', 'Sem Permissão', 'Você está em modo de leitura.');
      return { success: false, error: 'Sem permissão' };
    }

    if (!impData.problema || !impData.acaoMelhoria) {
      addToast('warning', 'Campos Obrigatórios', 'Preencha o problema identificado e a ação de melhoria.');
      return { success: false, error: 'Campos obrigatórios' };
    }

    const tAntes = Number(impData.tempoAntes) || 0;
    const tDepois = impData.tempoDepois !== undefined && impData.tempoDepois !== null ? Number(impData.tempoDepois) : undefined;
    let ganho = 0;
    if (tAntes > 0 && tDepois !== undefined && tDepois > 0) {
      ganho = Number((((tAntes - tDepois) / tAntes) * 100).toFixed(2));
    }

    if (impData.id) {
      setImprovements((prev) =>
        prev.map((imp) =>
          imp.id === impData.id
            ? ({
                ...imp,
                ...impData,
                tempoAntes: tAntes,
                tempoDepois: tDepois,
                ganhoPercentual: ganho > 0 ? ganho : imp.ganhoPercentual,
                dataConclusao:
                  impData.status === 'concluida' && !imp.dataConclusao
                    ? new Date().toISOString().split('T')[0]
                    : imp.dataConclusao,
              } as ImprovementAction)
            : imp
        )
      );
      addToast('success', 'Ação Atualizada', 'Ação de melhoria atualizada com sucesso.');
    } else {
      const nextNum = improvements.length + 1;
      const newImp: ImprovementAction = {
        id: 'imp-' + Date.now(),
        codigo: impData.codigo || `KZN-${new Date().getFullYear()}-${String(nextNum).padStart(2, '0')}`,
        operacaoId: impData.operacaoId || operations[0]?.id || 'op-1',
        estudoId: impData.estudoId,
        problema: impData.problema,
        causaProvavel: impData.causaProvavel || '',
        acaoMelhoria: impData.acaoMelhoria,
        responsavel: impData.responsavel || currentUser.nome,
        dataPrevista: impData.dataPrevista || new Date().toISOString().split('T')[0],
        status: impData.status || 'planejada',
        resultado: impData.resultado || '',
        tempoAntes: tAntes,
        tempoDepois: tDepois,
        ganhoPercentual: ganho,
        dataConclusao: impData.status === 'concluida' ? new Date().toISOString().split('T')[0] : undefined,
      };
      setImprovements((prev) => [newImp, ...prev]);
      addToast('success', 'Ação Registrada', `Ação de melhoria ${newImp.codigo} cadastrada!`);
    }
    return { success: true };
  };

  const deleteImprovement = (id: string): { success: boolean; error?: string } => {
    if (currentUser.papel !== 'Administrador') {
      addToast('error', 'Sem Permissão', 'Apenas Administradores podem excluir ações de melhoria.');
      return { success: false, error: 'Sem permissão' };
    }
    setImprovements((prev) => prev.filter((i) => i.id !== id));
    addToast('info', 'Ação Removida', 'Ação de melhoria excluída.');
    return { success: true };
  };

  // Suporte entidades
  const saveProduct = (prod: Partial<Product>) => {
    if (prod.id) {
      setProducts((prev) => prev.map((p) => (p.id === prod.id ? { ...p, ...prod } as Product : p)));
    } else {
      const newP: Product = {
        id: 'prd-' + Date.now(),
        codigo: prod.codigo || `PRD-${Date.now().toString().slice(-3)}`,
        nome: prod.nome || 'Novo Produto',
        categoria: prod.categoria || 'Geral',
        unidade: prod.unidade || 'un',
      };
      setProducts((prev) => [...prev, newP]);
    }
    addToast('success', 'Produto Salvo', 'Catálogo de produtos atualizado.');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    addToast('info', 'Produto Removido', 'Produto excluído do banco.');
  };

  const saveDepartment = (dept: Partial<Department>) => {
    if (dept.id) {
      setDepartments((prev) => prev.map((d) => (d.id === dept.id ? { ...d, ...dept } as Department : d)));
    } else {
      const newD: Department = {
        id: 'set-' + Date.now(),
        nome: dept.nome || 'Novo Setor',
        centroDeCusto: dept.centroDeCusto || 'CC-9000',
        responsavel: dept.responsavel || 'Supervisor',
      };
      setDepartments((prev) => [...prev, newD]);
    }
    addToast('success', 'Setor Salvo', 'Setor da fábrica atualizado.');
  };

  const deleteDepartment = (id: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
    addToast('info', 'Setor Removido', 'Setor excluído do banco.');
  };

  const saveEmployee = (emp: Partial<Employee>) => {
    if (emp.id) {
      setEmployees((prev) => prev.map((e) => (e.id === emp.id ? { ...e, ...emp } as Employee : e)));
    } else {
      const newE: Employee = {
        id: 'emp-' + Date.now(),
        matricula: emp.matricula || `COL-${Date.now().toString().slice(-4)}`,
        nome: emp.nome || 'Novo Colaborador',
        cargo: emp.cargo || 'Operador',
        setorId: emp.setorId || departments[0]?.id || 'set-1',
        nivelHabilidade: emp.nivelHabilidade || 'Pleno',
      };
      setEmployees((prev) => [...prev, newE]);
    }
    addToast('success', 'Colaborador Salvo', 'Quadro de colaboradores atualizado.');
  };

  const deleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    addToast('info', 'Colaborador Removido', 'Colaborador removido da lista.');
  };

  // Reset e Backup
  const resetDatabase = () => {
    setDepartments(initialDepartments);
    setProducts(initialProducts);
    setEmployees(initialEmployees);
    setOperations(initialOperations);
    setStudies(initialStudies);
    setImprovements(initialImprovements);
    addToast('info', 'Banco Restaurado', 'Dados restaurados para o padrão de demonstração de fábrica.');
  };

  const exportDatabaseJSON = () => {
    const data = {
      version: '1.0',
      exportadoEm: new Date().toISOString(),
      departments,
      products,
      employees,
      operations,
      studies,
      improvements,
    };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_tempos_e_metodos_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast('success', 'Backup Concluído', 'Download do arquivo JSON efetuado com sucesso.');
  };

  const importDatabaseJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.departments && parsed.operations && parsed.studies) {
        setDepartments(parsed.departments || []);
        setProducts(parsed.products || []);
        setEmployees(parsed.employees || []);
        setOperations(parsed.operations || []);
        setStudies(parsed.studies || []);
        setImprovements(parsed.improvements || []);
        addToast('success', 'Backup Importado', 'Todos os dados foram restaurados a partir do arquivo.');
        return true;
      } else {
        addToast('error', 'Formato Inválido', 'O arquivo JSON não contém a estrutura esperada do sistema.');
        return false;
      }
    } catch (e) {
      addToast('error', 'Erro ao Importar', 'Não foi possível ler o arquivo JSON selecionado.');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedStudyForModal,
        setSelectedStudyForModal,
        isStudyFormOpen,
        setIsStudyFormOpen,
        isStudyDetailOpen,
        setIsStudyDetailOpen,
        currentUser,
        setUserRole,
        departments,
        products,
        employees,
        operations,
        studies,
        improvements,
        saveStudy,
        deleteStudy,
        duplicateStudy,
        saveOperation,
        deleteOperation,
        saveImprovement,
        deleteImprovement,
        saveProduct,
        deleteProduct,
        saveDepartment,
        deleteDepartment,
        saveEmployee,
        deleteEmployee,
        resetDatabase,
        exportDatabaseJSON,
        importDatabaseJSON,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser utilizado dentro de um AppProvider');
  }
  return context;
};
