import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdminModeProvider } from './contexts/AdminModeContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/layout/Layout';
import { AdminLayout } from './components/layout/AdminLayout';
import { HomePage } from './pages/HomePage';
import { ProgramsPage } from './pages/ProgramsPage';
import { ProgramDetailPage } from './pages/ProgramDetailPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { ShopPage } from './pages/ShopPage';
import { AboutPage } from './pages/AboutPage';
import { BookSessionPage } from './pages/BookSessionPage';
import { LoginPage } from './pages/LoginPage';
import { PurchaseSuccessPage } from './pages/PurchaseSuccessPage';
import BlogIndexPage from './pages/BlogIndexPage';
import BlogPostDetailPage from './pages/BlogPostDetailPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import AboutPageManagementPage from './pages/admin/AboutPageManagementPage';
import { BlogManagementPage } from './pages/admin/BlogManagementPage';
import { BlogPostEditorPage } from './pages/admin/BlogPostEditorPage';
import { ProgramManagementPage } from './pages/admin/ProgramManagementPage';
import { ResourceManagementPage } from './pages/admin/ResourceManagementPage';
import { SessionManagementPage } from './pages/admin/SessionManagementPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { ThemeDesignPage } from './pages/admin/ThemeDesignPage';
import { SubscribersPage } from './pages/admin/SubscribersPage';
import { ScrollToTop } from './components/shared/ScrollToTop';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AdminModeProvider>
          <Router>
            <ScrollToTop />
            <Routes>
            {/* Public Routes with Layout */}
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route path="/programs" element={<Layout><ProgramsPage /></Layout>} />
            <Route path="/programs/:slug" element={<Layout><ProgramDetailPage /></Layout>} />
            <Route path="/resources" element={<Layout><ResourcesPage /></Layout>} />
            <Route path="/blog" element={<Layout><BlogIndexPage /></Layout>} />
            <Route path="/blog/:slug" element={<Layout><BlogPostDetailPage /></Layout>} />
            <Route path="/shop" element={<Layout><ShopPage /></Layout>} />
            <Route path="/about" element={<Layout><AboutPage /></Layout>} />
            <Route path="/book-session" element={<Layout><BookSessionPage /></Layout>} />
            <Route path="/login" element={<Layout><LoginPage /></Layout>} />
            <Route path="/purchase/success" element={<Layout><PurchaseSuccessPage /></Layout>} />

            {/* Admin Routes with AdminLayout */}
            <Route path="/admin/dashboard" element={<AdminLayout><AdminDashboardPage /></AdminLayout>} />
            <Route path="/admin/about" element={<AdminLayout><AboutPageManagementPage /></AdminLayout>} />
            <Route path="/admin/blog" element={<AdminLayout><BlogManagementPage /></AdminLayout>} />
            <Route path="/admin/blog/:id" element={<AdminLayout><BlogPostEditorPage /></AdminLayout>} />
            <Route path="/admin/programs" element={<AdminLayout><ProgramManagementPage /></AdminLayout>} />
            <Route path="/admin/subscribers" element={<AdminLayout><SubscribersPage /></AdminLayout>} />
            <Route path="/admin/resources" element={<AdminLayout><ResourceManagementPage /></AdminLayout>} />
            <Route path="/admin/sessions" element={<AdminLayout><SessionManagementPage /></AdminLayout>} />
            <Route path="/admin/users" element={<AdminLayout><UserManagementPage /></AdminLayout>} />
            <Route path="/admin/settings" element={<AdminLayout><SettingsPage /></AdminLayout>} />
            <Route path="/admin/settings/theme" element={<AdminLayout><ThemeDesignPage /></AdminLayout>} />
          </Routes>
        </Router>
      </AdminModeProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
