import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flag, Check, Timer } from 'lucide-react';
import { formatMinutesAndSeconds } from '../utils/calculations';

interface LiveStopwatchProps {
  onAddCycleTime: (seconds: number) => void;
  onImportAllLaps?: (laps: number[]) => void;
}

export const LiveStopwatch: React.FC<LiveStopwatchProps> = ({
  onAddCycleTime,
  onImportAllLaps,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [laps, setLaps] = useState<{ id: number; lapTime: number; splitTime: number }[]>([]);
  const lastLapTimeRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now() - elapsedMs;
      timerRef.current = window.setInterval(() => {
        setElapsedMs(performance.now() - startTimeRef.current);
      }, 33); // ~30 fps para suavidade de centésimos
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedMs(0);
    setLaps([]);
    lastLapTimeRef.current = 0;
  };

  const handleLap = () => {
    const currentTotalSec = elapsedMs / 1000;
    const lapSeconds = currentTotalSec - lastLapTimeRef.current;
    
    if (lapSeconds <= 0.2) return; // evitar duplo clique acidental

    const newLapItem = {
      id: laps.length + 1,
      lapTime: Number(lapSeconds.toFixed(2)),
      splitTime: Number(currentTotalSec.toFixed(2)),
    };

    setLaps((prev) => [newLapItem, ...prev]);
    lastLapTimeRef.current = currentTotalSec;

    // Notificar callback para adicionar direto na tabela de ciclos
    onAddCycleTime(newLapItem.lapTime);
  };

  const currentSeconds = elapsedMs / 1000;
  const currentLapDuration = currentSeconds - lastLapTimeRef.current;

  return (
    <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm border border-slate-800">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Cronômetro Industrial Chão de Fábrica
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Modo Contínuo / Volta
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        {/* Mostrador Digital */}
        <div className="text-center sm:text-left">
          <div className="text-3xl sm:text-4xl font-mono font-bold tracking-tight text-white tabular-nums">
            {formatMinutesAndSeconds(currentSeconds)}
            <span className="text-lg text-blue-400 font-normal">
              .{Math.floor((elapsedMs % 1000) / 10).toString().padStart(2, '0')}
            </span>
          </div>

          <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span>Ciclo Atual:</span>
            <span className="font-mono text-emerald-400 font-semibold tabular-nums">
              {currentLapDuration > 0 ? `${currentLapDuration.toFixed(2)}s` : '0.00s'}
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Total Ciclos: {laps.length}</span>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-center sm:justify-end gap-2">
          <button
            type="button"
            onClick={handleStartPause}
            className={`px-4 py-2 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" /> Pausar
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Iniciar
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleLap}
            disabled={!isRunning && elapsedMs === 0}
            className="px-3.5 py-2 rounded-lg font-medium text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Flag className="w-4 h-4" /> Registrar Ciclo
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={isRunning || elapsedMs === 0}
            className="p-2 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition-colors"
            title="Zerar Cronômetro"
            aria-label="Zerar"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Histórico recente de voltas */}
      {laps.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
            <span>Últimos Ciclos Capturados:</span>
            {onImportAllLaps && laps.length > 0 && (
              <button
                type="button"
                onClick={() => onImportAllLaps(laps.map((l) => l.lapTime).reverse())}
                className="text-blue-400 hover:text-blue-300 text-[11px] flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Reimportar Todos ({laps.length})
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {laps.slice(0, 8).map((lap) => (
              <div
                key={lap.id}
                className="px-2 py-1 rounded bg-slate-800/80 border border-slate-700 text-[11px] font-mono flex items-center gap-1.5"
              >
                <span className="text-slate-400">#{lap.id}:</span>
                <span className="text-emerald-300 font-semibold">{lap.lapTime.toFixed(2)}s</span>
              </div>
            ))}
            {laps.length > 8 && (
              <span className="text-[11px] text-slate-500 self-center">
                +{laps.length - 8} mais
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
