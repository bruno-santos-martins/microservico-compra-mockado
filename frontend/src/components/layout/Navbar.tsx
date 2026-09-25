import { ShoppingCart } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
  }`;

export function Navbar() {
  const { totalItems } = useCart();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-3">
          <div className="rounded-lg border border-emerald-600/40 bg-emerald-900/30 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Medicinal
          </div>
          <div>
            <p className="text-xs text-slate-400">Click</p>
            <p className="text-sm font-bold tracking-[0.15em] text-white group-hover:text-emerald-300">
              CANNABIS
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <NavLink to="/" className={navLinkClass}>
            Catalogo
          </NavLink>
          <NavLink to="/admin/novo-produto" className={navLinkClass}>
            Cadastrar Produto
          </NavLink>
          <NavLink to="/rastreio" className={navLinkClass}>
            Rastreio
          </NavLink>
        </nav>

        <Link
          to="/carrinho"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-200 transition hover:border-emerald-500 hover:text-emerald-300"
          aria-label="Carrinho"
        >
          <ShoppingCart size={18} />
          {totalItems > 0 && (
            <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 animate-pulse items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-slate-950">
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
