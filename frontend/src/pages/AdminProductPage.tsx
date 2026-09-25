import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface ProductForm {
  name: string;
  description: string;
  imageUrl?: string;
  price: number;
  cbdPercentage: number;
  thcPercentage: number;
  stockQuantity: number;
}

const initialForm: ProductForm = {
  name: '',
  description: '',
  imageUrl: undefined,
  price: 0,
  cbdPercentage: 0,
  thcPercentage: 0,
  stockQuantity: 0,
};

interface UploadResponse {
  prescriptionUrl: string;
}

export function AdminProductPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setField = <K extends keyof ProductForm>(field: K, value: ProductForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);
    setMessage(null);

    try {
      const body = new FormData();
      body.append('file', file);
      const { data } = await api.post<UploadResponse>('/prescriptions/upload', body);
      setField('imageUrl', data.prescriptionUrl);
      setMessage('Imagem enviada com sucesso.');
    } catch {
      setError('Nao foi possivel enviar a imagem do produto.');
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await api.post('/products', form);
      setMessage('Produto cadastrado com sucesso. Redirecionando...');
      setForm(initialForm);
      setTimeout(() => navigate('/'), 900);
    } catch {
      setError('Nao foi possivel cadastrar o produto. Confira os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl space-y-5">
      <h1 className="text-3xl font-bold text-white">Cadastrar Produto</h1>
      <form onSubmit={onSubmit} className="glass space-y-4 rounded-2xl p-6">
        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Nome comercial</span>
          <input
            required
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Descricao clinica</span>
          <textarea
            required
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Imagem do produto</span>
          <input
            type="file"
            accept="image/*"
            onChange={onImageChange}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-300 outline-none file:mr-3 file:rounded-md file:border-0 file:bg-emerald-700 file:px-3 file:py-1 file:text-white"
          />
          <p className="mt-2 text-xs text-slate-400">
            {uploadingImage
              ? 'Enviando imagem...'
              : form.imageUrl
                ? 'Imagem pronta para cadastro do produto.'
                : 'Opcional: envie uma imagem para aparecer no catalogo.'}
          </p>
          {form.imageUrl && (
            <img
              src={form.imageUrl}
              alt="Preview da imagem do produto"
              className="mt-3 h-28 w-28 rounded-lg border border-slate-700 object-cover"
            />
          )}
        </label>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FieldNumber label="Preco (R$)" value={form.price} onChange={(v) => setField('price', v)} />
          <FieldNumber label="CBD (%)" value={form.cbdPercentage} onChange={(v) => setField('cbdPercentage', v)} />
          <FieldNumber label="THC (%)" value={form.thcPercentage} onChange={(v) => setField('thcPercentage', v)} />
          <FieldNumber label="Estoque" value={form.stockQuantity} onChange={(v) => setField('stockQuantity', v)} />
        </div>

        <button
          type="submit"
          disabled={loading || uploadingImage}
          className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
        >
          {loading ? 'Salvando...' : 'Cadastrar Medicamento'}
        </button>

        {message && <p className="text-sm text-emerald-400">{message}</p>}
        {error && <p className="text-sm text-rose-400">{error}</p>}
      </form>
    </section>
  );
}

function FieldNumber({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label>
      <span className="mb-2 block text-sm text-slate-300">{label}</span>
      <input
        type="number"
        required
        min={0}
        step="0.01"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
      />
    </label>
  );
}
