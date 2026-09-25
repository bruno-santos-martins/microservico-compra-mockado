import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';

interface CheckoutPayload {
  fullName: string;
  email: string;
  cpf: string;
  address: string;
  paymentMethod: 'pix' | 'card';
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CheckoutPayload>({
    fullName: '',
    email: '',
    cpf: '',
    address: '',
    paymentMethod: 'pix',
  });

  const total = subtotal + 24.9;

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post<{ orderId: string; trackingCode: string }>('/orders/checkout', {
        customer: form,
        items,
      });
      clearCart();
      navigate('/sucesso', { state: { trackingCode: data.trackingCode, orderId: data.orderId } });
    } catch {
      setError('Nao foi possivel finalizar o checkout. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <form onSubmit={onSubmit} className="glass space-y-4 rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-white">Checkout Transparente</h1>

        <Input label="Nome completo" value={form.fullName} onChange={(v) => setForm((p) => ({ ...p, fullName: v }))} />
        <Input label="E-mail" type="email" value={form.email} onChange={(v) => setForm((p) => ({ ...p, email: v }))} />
        <Input label="CPF" value={form.cpf} onChange={(v) => setForm((p) => ({ ...p, cpf: v }))} />
        <Input label="Endereco de entrega" value={form.address} onChange={(v) => setForm((p) => ({ ...p, address: v }))} />

        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Metodo de pagamento</span>
          <select
            value={form.paymentMethod}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, paymentMethod: e.target.value as CheckoutPayload['paymentMethod'] }))
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
          >
            <option value="pix">Pix Instantaneo</option>
            <option value="card">Cartao de Credito</option>
          </select>
        </label>

        <button
          disabled={loading || items.length === 0}
          className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
        >
          {loading ? 'Processando...' : 'Finalizar e Emitir Pedido'}
        </button>

        {error && <p className="text-sm text-rose-400">{error}</p>}
      </form>

      <aside className="glass rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white">Resumo</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-300">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>
                {item.name} x{item.quantity}
              </span>
              <span>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  item.price * item.quantity
                )}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-2 border-t border-slate-800 pt-4 text-sm">
          <p className="flex justify-between text-slate-400"><span>Subtotal</span><span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}</span></p>
          <p className="flex justify-between text-slate-400"><span>Frete</span><span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(24.9)}</span></p>
          <p className="flex justify-between text-lg font-bold text-emerald-400"><span>Total</span><span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span></p>
        </div>
      </aside>
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-slate-300">{label}</span>
      <input
        required
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
      />
    </label>
  );
}
