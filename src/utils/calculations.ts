import { CycleItem } from '../types';

export interface CalculatedStudyResult {
  ciclosValidos: number;
  tempoMedio: number; // segundos
  fatorRitmo: number; // %
  fatorRitmoDecimal: number;
  tempoNormal: number; // segundos
  percentualTolerancia: number; // %
  tempoPadrao: number; // segundos
  tempoMinimo: number;
  tempoMaximo: number;
  amplitude: number;
  desvioPadrao: number;
  coeficienteVariacao: number; // %
  capacidadeHora: number; // pecas/h
  capacidadeTurno8h: number; // pecas/turno 8h (85% eficiencia)
}

export function calculateStudyMetrics(
  ciclos: CycleItem[],
  fatorRitmo: number = 100,
  percentualTolerancia: number = 14
): CalculatedStudyResult {
  // Filtrar ciclos válidos (tempo > 0 e não desconsiderados)
  const validCycles = ciclos.filter(
    (c) => !c.desconsiderar && typeof c.tempoSegundos === 'number' && c.tempoSegundos > 0
  );

  if (validCycles.length === 0) {
    return {
      ciclosValidos: 0,
      tempoMedio: 0,
      fatorRitmo,
      fatorRitmoDecimal: fatorRitmo / 100,
      tempoNormal: 0,
      percentualTolerancia,
      tempoPadrao: 0,
      tempoMinimo: 0,
      tempoMaximo: 0,
      amplitude: 0,
      desvioPadrao: 0,
      coeficienteVariacao: 0,
      capacidadeHora: 0,
      capacidadeTurno8h: 0,
    };
  }

  const tempos = validCycles.map((c) => c.tempoSegundos);
  const soma = tempos.reduce((acc, t) => acc + t, 0);
  
  // 1. Tempo Médio = soma dos tempos / quantidade de ciclos
  const tempoMedio = soma / tempos.length;

  // 2. Tempo Normal = tempo médio * fator de ritmo (convertido de % para decimal)
  const frDecimal = (fatorRitmo || 100) / 100;
  const tempoNormal = tempoMedio * frDecimal;

  // 3. Tempo Padrão = tempo normal * (1 + tolerância)
  const tolDecimal = (percentualTolerancia || 0) / 100;
  const tempoPadrao = tempoNormal * (1 + tolDecimal);

  // Estatísticas adicionais
  const tempoMinimo = Math.min(...tempos);
  const tempoMaximo = Math.max(...tempos);
  const amplitude = tempoMaximo - tempoMinimo;

  // Desvio padrão amostral
  let desvioPadrao = 0;
  if (tempos.length > 1) {
    const variancia =
      tempos.reduce((acc, t) => acc + Math.pow(t - tempoMedio, 2), 0) /
      (tempos.length - 1);
    desvioPadrao = Math.sqrt(variancia);
  }

  const coeficienteVariacao = tempoMedio > 0 ? (desvioPadrao / tempoMedio) * 100 : 0;

  // Capacidade por hora (3600s / tempoPadrao)
  const capacidadeHora = tempoPadrao > 0 ? 3600 / tempoPadrao : 0;
  
  // Capacidade turno de 8h (28.800s totais com 85% de eficiência operacional líquida = 24.480s)
  const segundosUteisTurno8h = 8 * 3600 * 0.85;
  const capacidadeTurno8h = tempoPadrao > 0 ? segundosUteisTurno8h / tempoPadrao : 0;

  return {
    ciclosValidos: tempos.length,
    tempoMedio: Number(tempoMedio.toFixed(2)),
    fatorRitmo,
    fatorRitmoDecimal: Number(frDecimal.toFixed(3)),
    tempoNormal: Number(tempoNormal.toFixed(2)),
    percentualTolerancia,
    tempoPadrao: Number(tempoPadrao.toFixed(2)),
    tempoMinimo: Number(tempoMinimo.toFixed(2)),
    tempoMaximo: Number(tempoMaximo.toFixed(2)),
    amplitude: Number(amplitude.toFixed(2)),
    desvioPadrao: Number(desvioPadrao.toFixed(2)),
    coeficienteVariacao: Number(coeficienteVariacao.toFixed(1)),
    capacidadeHora: Math.round(capacidadeHora),
    capacidadeTurno8h: Math.round(capacidadeTurno8h),
  };
}

export function formatTimeInSeconds(seconds: number | undefined): string {
  if (seconds === undefined || isNaN(seconds) || seconds === null) return '0.00s';
  return `${seconds.toFixed(2)}s`;
}

export function formatMinutesAndSeconds(totalSeconds: number | undefined): string {
  if (!totalSeconds || isNaN(totalSeconds)) return '00:00.0';
  const mins = Math.floor(totalSeconds / 60);
  const secs = (totalSeconds % 60).toFixed(1);
  return `${String(mins).padStart(2, '0')}:${String(Number(secs) < 10 ? '0' + secs : secs)}`;
}

export function formatDM(seconds: number | undefined): string {
  // Deci-Minutos industriais (1 min = 100 DM)
  if (!seconds || isNaN(seconds)) return '0.000 DM';
  const dm = (seconds / 60) * 100;
  return `${dm.toFixed(2)} DM`;
}

/**
 * Utilitário para exportar dados para arquivo Excel / CSV compatível
 */
export function exportToCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows || rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(';'),
    ...rows.map((row) =>
      headers
        .map((fieldName) => {
          const val = row[fieldName] !== undefined && row[fieldName] !== null ? String(row[fieldName]) : '';
          // Escapar aspas e pontos e vírgulas
          return `"${val.replace(/"/g, '""')}"`;
        })
        .join(';')
    ),
  ].join('\r\n');

  // Adicionar BOM para suporte a acentos no Excel em português
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
