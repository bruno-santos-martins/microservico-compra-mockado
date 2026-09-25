import { useLocation, useNavigate } from 'react-router-dom';
import { SuccessModal } from '../components/checkout/SuccessModal';

interface SuccessState {
  trackingCode?: string;
  orderId?: string;
}

export function SuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state ?? {}) as SuccessState;

  if (!state.trackingCode) {
    return (
      <div className="glass mx-auto max-w-lg rounded-2xl p-6 text-center">
        <p className="text-slate-300">Nenhuma compra confirmada nesta sessao.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white"
        >
          Voltar ao Catalogo
        </button>
      </div>
    );
  }

  return <SuccessModal trackingCode={state.trackingCode} />;
}
