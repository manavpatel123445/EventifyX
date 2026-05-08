import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import store from './app/store';
import { Toaster } from 'react-hot-toast';
import './App.css';

// Lazy load components
const Home = lazy(() => import('./pages/Home'));
const EventPage = lazy(() => import('./pages/EventPage'));
const Eventdetail = lazy(() => import('./pages/Eventdetail'));
const CreateEventpage = lazy(() => import('./pages/CreateEventpage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const CheckoutSuccessPage = lazy(() => import('./pages/CheckoutSuccessPage'));
const Loginpage = lazy(() => import('./pages/Loginpage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPassword = lazy(() => import('./pages/ForgotPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const MyEventRequests = lazy(() => import('./pages/MyEventRequests'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const MyTicketsPage = lazy(() => import('./pages/MyTicketsPage'));
const EventManagerRequestPage = lazy(() => import('./pages/EventManagerRequestPage'));
const PageNotFound = lazy(() => import('./pages/PageNotFound').then(module => ({ default: module.PageNotFound })));

// Admin components
const AdminDashboard = lazy(() => import('./admin/Pages/AdminDashboard'));
const EventListPage = lazy(() => import('./admin/Pages/EventListPage'));
const UserListPage = lazy(() => import('./admin/Pages/UserListPage'));
const RevenueAnalyticsPage = lazy(() => import('./admin/Pages/RevenueAnalyticsPage'));
const AdminPaymentLogsPage = lazy(() => import('./admin/Pages/PaymentLogsPage'));
const AdminProfilePage = lazy(() => import('./admin/Pages/AdminProfilePage'));

// Manager components
const ManagerDashbord = lazy(() => import('./EventManager/Page/ManagerDashbord'));
const ManagerProfile = lazy(() => import('./EventManager/Page/ManagerProfile'));
const EventList = lazy(() => import('./EventManager/Page/ManagerEventList'));
const ManagerPaymentLogsPage = lazy(() => import('./manager/Pages/PaymentLogsPage'));
const SaleRevenue = lazy(() => import('./EventManager/Page/SaleRevenue'));

// Demo components
const EventViewDemo = lazy(() => import('./components/EventViewDemo'));

// Helper components
const RoleProtectedRoute = lazy(() => import('./components/RoleProtectedRoute'));

import ScrollToTop from './components/ScrollToTop';
import AnimatedRoutes from './components/AnimatedRoutes';

// Premium Page Loader
const PageLoader = () => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
    <div className="relative">
      <div className="w-24 h-24 rounded-full border-4 border-purple-500/20 border-t-purple-600 animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 animate-pulse shadow-lg shadow-purple-500/50" />
      </div>
    </div>
    <div className="absolute bottom-12 left-0 right-0 text-center">
      <p className="text-xs font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">Syncing with Universe</p>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Router>
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
              <AnimatedRoutes>
                <Route path="/" element={<Home />} />
                <Route path="/events" element={<EventPage />} />
                <Route path="/events/:id" element={<Eventdetail />} />
                <Route path="/demo/event-view" element={<EventViewDemo />} />
                <Route path="/create-event" element={<RoleProtectedRoute allowedRoles={['user', 'event_manager']}><CreateEventpage /></RoleProtectedRoute>} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/checkout-success" element={<CheckoutSuccessPage />} />
                <Route path="/login" element={<Loginpage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/ForgotPassword" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/eventdetail" element={<Eventdetail />} />
                <Route path="/myEventRequests" element={<RoleProtectedRoute allowedRoles={['user', 'event_manager']}><MyEventRequests /></RoleProtectedRoute>} />
                <Route path="/profile" element={<RoleProtectedRoute allowedRoles={["user", "event_manager"]}><ProfilePage /></RoleProtectedRoute>} />
                <Route path="/my-tickets" element={<RoleProtectedRoute allowedRoles={['user', 'event_manager']}><MyTicketsPage /></RoleProtectedRoute>} />

                {/* Event Manager Request Route */}
                <Route
                  path="/request-manager-role"
                  element={
                    <RoleProtectedRoute requiredRole="user" allowedRoles={["user"]}>
                      <EventManagerRequestPage />
                    </RoleProtectedRoute>
                  }
                />

                {/* Protected User Routes */}
                <Route
                  path="/my-events"
                  element={
                    <RoleProtectedRoute requiredRole="user" allowedRoles={["user", "event_manager"]}>
                      <MyEventRequests />
                    </RoleProtectedRoute>
                  }
                />
                {/* Admin Routes */}
                <Route path="/admin" element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </RoleProtectedRoute>
                } />
                <Route path="/admin/events" element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <EventListPage />
                  </RoleProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <UserListPage />
                  </RoleProtectedRoute>
                } />
                <Route path="/admin/revenue" element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <RevenueAnalyticsPage />
                  </RoleProtectedRoute>
                } />
                <Route path="/admin/payments" element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <AdminPaymentLogsPage />
                  </RoleProtectedRoute>
                } />
                <Route path="/admin/profile" element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <AdminProfilePage />
                  </RoleProtectedRoute>
                } />

                {/* Event Manager Routes */}
                <Route path="/manager" element={
                  <RoleProtectedRoute allowedRoles={['event_manager']}>
                    <ManagerDashbord />
                  </RoleProtectedRoute>
                } />
                <Route path="/manager/eventlist" element={
                  <RoleProtectedRoute allowedRoles={['event_manager']}>
                    <EventList />
                  </RoleProtectedRoute>
                } />
                <Route path="/manager/sale-revenue" element={
                  <RoleProtectedRoute allowedRoles={['event_manager']}>
                    <SaleRevenue/>
                  </RoleProtectedRoute>
                } />
                <Route path="/manager/payments" element={
                  <RoleProtectedRoute allowedRoles={['event_manager']}>
                    <ManagerPaymentLogsPage />
                  </RoleProtectedRoute>
                } />
                
                <Route path="/manager/profile" element={
                  <RoleProtectedRoute allowedRoles={['event_manager']}>
                    <ManagerProfile />
                  </RoleProtectedRoute>
                } />

                <Route path="*" element={<PageNotFound />} />
              </AnimatedRoutes>
            </Suspense>
          </Router>
          
          {/* Global Grain Overlay for Premium Feel */}
          <div className="grain-overlay" />
          
          {/* Toast notifications */}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 5000,
              style: {
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                borderRadius: '1.5rem',
                color: '#1e293b',
                fontWeight: 'bold',
                padding: '1rem 1.5rem',
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
              },
              success: {
                iconTheme: {
                  primary: '#8b5cf6',
                  secondary: '#fff',
                },
              },
            }}
          />
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App
