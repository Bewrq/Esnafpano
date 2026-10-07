import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ListingDetailPage from './pages/ListingDetailPage';
import CreateListingPage from './pages/CreateListingPage';
import MyListingsPage from './pages/MyListingsPage';
import StorePage from './pages/StorePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import MessagesPage from './pages/MessagesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LocationDetector from './components/LocationDetector';
import { IconSearch } from './components/Icons';

function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 page-enter">{children}</main>
      <Footer />
      <LocationDetector />
    </div>
  );
}

function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-brand-gray">
      {children}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Main Layout Routes */}
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/ilan/:id" element={<Layout><ListingDetailPage /></Layout>} />
          <Route path="/magaza/:id" element={<Layout><StorePage /></Layout>} />
          <Route path="/ilan-ver" element={<Layout><CreateListingPage /></Layout>} />
          <Route path="/ilanlarim" element={<Layout><MyListingsPage /></Layout>} />
          <Route path="/mesajlar" element={<Layout><MessagesPage /></Layout>} />
          <Route path="/admin" element={<AdminDashboardPage />} />

          {/* Auth Routes (no header/footer) */}
          <Route path="/giris" element={<AuthLayout><LoginPage /></AuthLayout>} />
          <Route path="/kayit" element={<AuthLayout><RegisterPage /></AuthLayout>} />

          {/* 404 */}
          <Route path="*" element={
            <Layout>
              <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-4 border border-amber-200">
                  <IconSearch size={32} color="#d97706" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 mb-2">Sayfa Bulunamadı</h1>
                <p className="text-gray-500 text-sm mb-6">Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
                <a href="/" className="btn-primary px-8 py-3 text-sm font-bold inline-block rounded-xl">
                  Ana Sayfaya Dön
                </a>
              </div>
            </Layout>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
