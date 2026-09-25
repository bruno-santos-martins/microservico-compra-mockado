import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useDebounce } from '../hooks/useDebounce';
import { api } from '../services/api';
import type { Product } from '../types';

const PAGE_SIZE = 6;

interface ProductListResponse {
  items: Product[];
  total: number;
}

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    price: Number(product.price),
    cbdPercentage: Number(product.cbdPercentage),
    thcPercentage: Number(product.thcPercentage),
    stockQuantity: Number(product.stockQuantity),
  };
}

export function CatalogPage() {
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get<ProductListResponse>('/products', {
          params: {
            page,
            limit: PAGE_SIZE,
            search: debouncedQuery.trim() || undefined,
          },
        });
        setProducts((data.items ?? []).map(normalizeProduct));
        setTotal(Number(data.total ?? 0));
      } catch {
        setProducts([]);
        setTotal(0);
        setError('Nao foi possivel carregar os produtos do catalogo.');
      } finally {
        setLoading(false);
      }
    };

    void loadProducts();
  }, [page, debouncedQuery]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-white">Catalogo de Produtos</h1>
        <p className="mt-2 text-sm text-slate-400">
          Plataforma clinica com rastreabilidade para CBD, THC e Full Spectrum.
        </p>
      </header>

      <div className="glass rounded-2xl p-4">
        <label className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3">
          <Search size={18} className="text-emerald-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nome, composto ou dosagem"
            className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
          />
        </label>
      </div>

      {loading ? (
        <div className="glass rounded-2xl p-6 text-sm text-slate-300">Carregando produtos...</div>
      ) : error ? (
        <div className="glass rounded-2xl p-6 text-sm text-rose-300">{error}</div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article key={product.id} className="glass rounded-2xl p-5 shadow-glow">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={`Imagem de ${product.name}`}
                    className="mb-3 h-40 w-full rounded-xl border border-slate-700 object-cover"
                  />
                ) : null}
                <span className="inline-flex rounded-full border border-emerald-800/60 bg-emerald-950/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-400">
                  {product.cbdPercentage}% CBD / {product.thcPercentage}% THC
                </span>
                <h3 className="mt-3 text-lg font-semibold text-white">{product.name}</h3>
                <p className="mt-2 line-clamp-2 min-h-10 text-sm text-slate-400">{product.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Preco</p>
                    <p className="text-xl font-bold text-emerald-400">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(product.price)}
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs text-slate-300">
                    Estoque: {product.stockQuantity}
                  </span>
                </div>
                <button
                  onClick={() => addItem(product)}
                  disabled={product.stockQuantity <= 0}
                  className="mt-4 w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
                >
                  {product.stockQuantity > 0 ? 'Adicionar ao Carrinho' : 'Sem estoque'}
                </button>
              </article>
            ))}
          </div>

          {products.length === 0 && (
            <div className="glass rounded-2xl p-6 text-sm text-slate-300">
              Nenhum produto encontrado para os filtros informados.
            </div>
          )}

          <footer className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-300 disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="text-sm text-slate-400">
              Pagina {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-300 disabled:opacity-40"
            >
              Proximo
            </button>
          </footer>
        </>
      )}
    </section>
  );
}
