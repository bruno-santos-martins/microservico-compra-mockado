import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';

type GatewayErrorPayload = {
  message?: string | string[];
  detail?:
    | string
    | {
        message?: string | string[];
        error?: string;
      };
};

function normalizeGatewayErrorMessage(payload: GatewayErrorPayload | undefined): string | null {
  if (!payload) return null;

  const detailMessage = payload.detail;
  if (typeof detailMessage === 'string' && detailMessage.trim().length > 0) {
    return detailMessage;
  }

  if (typeof detailMessage === 'object' && detailMessage) {
    if (Array.isArray(detailMessage.message) && detailMessage.message.length > 0) {
      return detailMessage.message.join(' | ');
    }

    if (typeof detailMessage.message === 'string' && detailMessage.message.trim().length > 0) {
      return detailMessage.message;
    }

    if (typeof detailMessage.error === 'string' && detailMessage.error.trim().length > 0) {
      return detailMessage.error;
    }
  }

  if (Array.isArray(payload.message) && payload.message.length > 0) {
    return payload.message.join(' | ');
  }

  if (typeof payload.message === 'string' && payload.message.trim().length > 0) {
    return payload.message;
  }

  return null;
}

export function CartPage() {
  const { items, subtotal, updateQty, removeItem, setPrescriptionForItem, allPrescriptionsAttached } = useCart();
  const [uploadingByItem, setUploadingByItem] = useState<Record<string, boolean>>({});
  const [uploadErrorByItem, setUploadErrorByItem] = useState<Record<string, string>>({});

  const uploadPrescription = async (itemId: string, file: File | null) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setUploadingByItem((prev) => ({ ...prev, [itemId]: true }));
    setUploadErrorByItem((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });

    try {
      const { data } = await api.post<{ prescriptionUrl: string }>('/prescriptions/upload', formData);
      setPrescriptionForItem(itemId, data.prescriptionUrl, file.name);
    } catch (error) {
      const payload = (error as { response?: { data?: GatewayErrorPayload } })?.response?.data;
      const normalizedMessage = normalizeGatewayErrorMessage(payload);
      setUploadErrorByItem((prev) => ({
        ...prev,
        [itemId]: normalizedMessage ?? 'Falha no upload. Tente novamente com PDF/JPG/PNG.',
      }));
    } finally {
      setUploadingByItem((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const total = subtotal;

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Carrinho & Receita Regulada</h1>

      {items.length === 0 ? (
        <div className="glass rounded-2xl p-6 text-slate-300">
          Seu carrinho esta vazio. <Link className="text-emerald-400" to="/">Voltar ao catalogo</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <article key={item.id} className="glass grid gap-4 rounded-2xl p-4 lg:grid-cols-[1fr_auto]">
              <div>
                <h2 className="text-lg font-semibold text-white">{item.name}</h2>
                <p className="mt-1 text-sm text-slate-400">{item.description}</p>

                <div className="mt-3 flex items-center gap-3">
                  <button
                    className="rounded border border-slate-700 px-2 py-1"
                    onClick={() => updateQty(item.id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span className="min-w-8 text-center">{item.quantity}</span>
                  <button
                    className="rounded border border-slate-700 px-2 py-1"
                    onClick={() => updateQty(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                  <button className="text-sm text-rose-400" onClick={() => removeItem(item.id)}>
                    Remover
                  </button>
                </div>

                <p className="mt-2 text-sm text-slate-300">
                  Subtotal:{' '}
                  <strong>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      item.price * item.quantity
                    )}
                  </strong>
                </p>
              </div>

              <div className="w-full rounded-xl border border-slate-700 bg-slate-950/70 p-3 lg:w-80">
                <p className="text-sm font-semibold text-slate-100">Validacao Anvisa</p>
                <p className="mt-1 text-xs text-slate-400">Anexe receita ou laudo para este item.</p>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="mt-3 w-full text-xs text-slate-300 file:mr-3 file:rounded file:border-0 file:bg-emerald-600 file:px-3 file:py-2 file:text-white"
                  disabled={uploadingByItem[item.id] === true}
                  onChange={(e) => uploadPrescription(item.id, e.target.files?.[0] ?? null)}
                />
                {uploadingByItem[item.id] && (
                  <p className="mt-3 text-xs font-semibold text-slate-300">Enviando arquivo...</p>
                )}
                {!item.prescriptionUrl ? (
                  <p className="mt-3 text-xs font-semibold text-amber-400">[Pendente Envio]</p>
                ) : (
                  <a
                    href={item.prescriptionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 block text-xs font-semibold text-emerald-400"
                  >
                    [Arquivo Vinculado: {item.prescriptionFileName ?? 'receita.pdf'}]
                  </a>
                )}
                {uploadErrorByItem[item.id] && (
                  <p className="mt-2 text-xs font-semibold text-rose-400">{uploadErrorByItem[item.id]}</p>
                )}
              </div>
            </article>
          ))}

          <div className="glass rounded-2xl p-5">
            <p className="text-slate-300">
              Total do pedido:{' '}
              <strong className="text-emerald-400">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
              </strong>
            </p>
            {!allPrescriptionsAttached && (
              <p className="mt-2 text-sm text-amber-400">
                Obrigatorio anexar a receita para cada medicamento controlado antes de prosseguir.
              </p>
            )}
            <Link
              to="/checkout"
              className={`mt-4 inline-flex rounded-lg px-4 py-2 font-semibold ${
                allPrescriptionsAttached
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                  : 'pointer-events-none bg-slate-700 text-slate-400'
              }`}
            >
              Avancar para Checkout
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
