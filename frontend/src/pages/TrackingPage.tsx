import { CheckCircle2, Clock, Search } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTrackingSocket } from '../hooks/useTrackingSocket';
import { api } from '../services/api';
import type { TrackingCheckpoint, TrackingOrder } from '../types';

export function TrackingPage() {
  const [params, setParams] = useSearchParams();
  const [codeInput, setCodeInput] = useState(params.get('code') ?? '');
  const [order, setOrder] = useState<TrackingOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trackingCode = params.get('code') ?? '';

  const loadTracking = useCallback(async (code: string) => {
    if (!code) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<TrackingOrder>(`/orders/tracking/${encodeURIComponent(code)}`);
      setOrder(data);
    } catch {
      setOrder(null);
      setError('Nao foi possivel buscar o rastreio. Verifique o codigo e tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useTrackingSocket(trackingCode, (checkpoint) => {
    setOrder((prev) => {
      if (!prev) return prev;
      return { ...prev, checkpoints: [checkpoint, ...prev.checkpoints] };
    });
  });

  const checkpoints = useMemo(() => order?.checkpoints ?? [], [order]);

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Portal de Rastreabilidade</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setParams({ code: codeInput });
          void loadTracking(codeInput);
        }}
        className="glass flex flex-wrap items-center gap-3 rounded-2xl p-4"
      >
        <label className="flex min-w-72 flex-1 items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2">
          <Search size={16} className="text-emerald-400" />
          <input
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder="Digite o codigo CK-2026-XXXX"
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>
        <button className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500">
          Rastrear
        </button>
      </form>

      {loading && <div className="text-sm text-slate-400">Buscando dados de rastreio...</div>}
      {error && <div className="text-sm text-rose-400">{error}</div>}

      {order && (
        <>
          <header className="glass rounded-2xl p-4">
            <p className="text-sm text-slate-400">Paciente</p>
            <p className="text-xl font-semibold text-white">{order.patientName}</p>
            <p className="mt-2 text-sm text-emerald-400">Codigo: {order.trackingCode}</p>
            {order.prescriptionUrl && (
              <a
                href={order.prescriptionUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex rounded-md border border-emerald-500/30 px-3 py-2 text-sm text-emerald-300 hover:bg-emerald-500/10"
              >
                Baixar Receita Medica & Autorizacao Anvisa (S3)
              </a>
            )}
          </header>

          <div className="glass rounded-2xl p-6">
            <div className="space-y-6 border-l-2 border-slate-800 pl-6">
              {checkpoints.map((cp) => (
                <article key={cp.id} className="relative">
                  <span className="absolute -left-[35px] top-0 rounded-full border border-slate-700 bg-slate-900 p-1">
                    {cp.status === 'done' ? (
                      <CheckCircle2 className="text-emerald-400" size={16} />
                    ) : (
                      <Clock className="text-amber-400" size={16} />
                    )}
                  </span>
                  <p className="text-xs text-slate-500">
                    {new Date(cp.createdAt).toLocaleDateString('pt-BR')} {new Date(cp.createdAt).toLocaleTimeString('pt-BR')}
                  </p>
                  <h3 className="text-lg font-semibold text-white">{cp.title}</h3>
                  <p className="text-sm text-emerald-300">{cp.location}</p>
                  <p className="mt-1 text-sm text-slate-400">{cp.details}</p>
                </article>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
