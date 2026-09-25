import { CheckCircle2, Copy } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export function SuccessModal({ trackingCode }: { trackingCode: string }) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(trackingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1300);
  };

  return (
    <div className="glass mx-auto max-w-xl rounded-2xl p-6 text-center shadow-glow">
      <CheckCircle2 className="mx-auto text-emerald-400" size={54} />
      <h2 className="mt-3 text-2xl font-bold text-white">Pedido Aprovado com Sucesso!</h2>
      <p className="mt-2 text-sm text-slate-400">Codigo de rastreio emitido para acompanhamento em tempo real.</p>

      <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-900/20 p-4">
        <p className="text-xs uppercase tracking-widest text-emerald-300">Codigo</p>
        <p className="mt-1 text-2xl font-extrabold text-emerald-400">{trackingCode}</p>
        <button
          onClick={copyCode}
          className="mt-3 inline-flex items-center gap-2 rounded-md border border-emerald-500/30 px-3 py-2 text-sm text-emerald-300 hover:bg-emerald-500/10"
        >
          <Copy size={16} /> {copied ? 'Copiado' : 'Copiar Codigo'}
        </button>
      </div>

      <Link
        to={`/rastreio?code=${encodeURIComponent(trackingCode)}`}
        className="mt-5 inline-flex rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500"
      >
        Acompanhar Entrega em Tempo Real
      </Link>
    </div>
  );
}
