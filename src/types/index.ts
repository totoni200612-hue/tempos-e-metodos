export type UserRole = 'Administrador' | 'Analista' | 'Operador' | 'Visualização';

export interface UserProfile {
  nome: string;
  papel: UserRole;
  cargo: string;
  email: string;
}

export interface Department {
  id: string;
  nome: string;
  centroDeCusto: string;
  responsavel: string;
}

export interface Product {
  id: string;
  codigo: string;
  nome: string;
  categoria: string;
  unidade: string;
}

export interface Employee {
  id: string;
  matricula: string;
  nome: string;
  cargo: string;
  setorId: string;
  nivelHabilidade: 'Júnior' | 'Pleno' | 'Sênior' | 'Especialista';
}

export interface Operation {
  id: string;
  codigo: string;
  nome: string;
  setorId: string;
  produtoId: string;
  maquina: string;
  descricao: string;
  taktTimeAlvo?: number; // em segundos
  tempoPadraoAtual: number; // em segundos
  criadoEm: string;
}

export interface CycleItem {
  id: string;
  numeroCiclo: number;
  tempoSegundos: number; // e.g. 45.2
  observacao?: string;
  desconsiderar?: boolean;
}

export interface TimeStudy {
  id: string;
  codigoEstudo: string;
  operacaoId: string;
  codigoOperacao: string;
  nomeOperacao: string;
  produto: string;
  setor: string;
  maquina: string;
  operadorId: string;
  nomeOperador: string;
  dataEstudo: string; // YYYY-MM-DD
  responsavel: string;
  numeroCiclos: number;
  observacoes: string;
  fatorRitmo: number; // e.g. 100 para 100%, 105 para 105%
  percentualTolerancia: number; // e.g. 14 para 14%
  ciclos: CycleItem[];
  status: 'em_andamento' | 'concluido';
  criadoEm: string;
  atualizadoEm: string;
  
  // Resultados calculados armazenados para consulta rápida
  tempoMedio?: number;
  tempoNormal?: number;
  tempoPadrao?: number;
}

export interface ImprovementAction {
  id: string;
  codigo: string;
  operacaoId: string;
  estudoId?: string;
  problema: string;
  causaProvavel: string;
  acaoMelhoria: string;
  responsavel: string;
  dataPrevista: string;
  status: 'planejada' | 'em_andamento' | 'concluida' | 'cancelada';
  resultado?: string;
  tempoAntes: number; // segundos
  tempoDepois?: number; // segundos
  ganhoPercentual?: number; // %
  dataConclusao?: string;
}

export type ActiveTab = 
  | 'dashboard'
  | 'novo_estudo'
  | 'consultar_estudos'
  | 'operacoes'
  | 'analise'
  | 'melhorias'
  | 'relatorios'
  | 'banco_dados';
