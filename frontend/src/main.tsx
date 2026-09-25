import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { CartProvider } from './context/CartContext';
import { AdminProductPage } from './pages/AdminProductPage';
import { CartPage } from './pages/CartPage';
import { CatalogPage } from './pages/CatalogPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { SuccessPage } from './pages/SuccessPage';
import { TrackingPage } from './pages/TrackingPage';
import './styles.css';

function AppShell() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-950 bg-radial-sheen text-slate-100">
          <Navbar />
          <main className="mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<CatalogPage />} />
              <Route path="/admin/novo-produto" element={<AdminProductPage />} />
              <Route path="/carrinho" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/sucesso" element={<SuccessPage />} />
              <Route path="/rastreio" element={<TrackingPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppShell />
  </React.StrictMode>
);
