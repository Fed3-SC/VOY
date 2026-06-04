import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import BookingPage from './pages/BookingPage';
import AuthPage from './pages/AuthPage';
import PaymentPage from './pages/PaymentPage';
import ConfirmationPage from './pages/ConfirmationPage';
import MyTripsPage from './pages/MyTripsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminFeaturesPage from './pages/AdminFeaturesPage';
// BUG-003a: Páginas de soporte
import HelpCenterPage from './pages/HelpCenterPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import ContactPage from './pages/ContactPage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BookingProvider>
          <div className="app">
            <Navbar />
            <main className="app-main">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/resultados" element={<SearchResultsPage />} />
                <Route path="/reserva/:id" element={<BookingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/pago" element={<PaymentPage />} />
                <Route path="/confirmacion" element={<ConfirmationPage />} />
                <Route path="/mis-viajes" element={<MyTripsPage />} />
                <Route path="/perfil" element={<ProfilePage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/features" element={<AdminFeaturesPage />} />
                {/* BUG-003a: Rutas de páginas de soporte */}
                <Route path="/ayuda" element={<HelpCenterPage />} />
                <Route path="/terminos" element={<TermsPage />} />
                <Route path="/privacidad" element={<PrivacyPage />} />
                <Route path="/contacto" element={<ContactPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BookingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
