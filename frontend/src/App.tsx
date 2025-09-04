import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import EventPage from './pages/EventPage';
import './App.css';
import CreateEventpage from './pages/CreateEventpage';
import CheckoutPage from './pages/CheckoutPage';
import Loginpage from './pages/Loginpage';
import RegisterPage from './pages/RegisterPage';
import ForgotPassword from './pages/ForgotPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ContectPage from './pages/ContectPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import store from './app/store';
import Eventdetail from './pages/Eventdetail';
import { Toaster } from 'react-hot-toast';
import AdminDashboard from './admin/Pages/AdminDashboard';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import MyEventRequests from './pages/MyEventRequests';
import ProfilePage from './pages/ProfilePage';
import EventListPage from './admin/Pages/EventListPage';
import ManagerDashbord from './EventManager/Page/ManagerDashbord';
import UserListPage from './admin/Pages/UserListPage';
import ManagerProfile from './EventManager/Page/ManagerProfile';
import EventList from './EventManager/Page/ManagerEventList';
import EventViewDemo from './components/EventViewDemo';
import AdminProfilePage from './admin/Pages/AdminProfilePage';
import EventManagerRequestPage from './pages/EventManagerRequestPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import MyTicketsPage from './pages/MyTicketsPage';
import SaleRevanue from './EventManager/Page/SaleRevanue';


const queryClient = new QueryClient();


function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<EventPage />} />
            <Route path="/events/:id" element={<Eventdetail />} />
            <Route path="/demo/event-view" element={<EventViewDemo />} />
            <Route path="/create-event" element={<CreateEventpage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/checkout-success" element={<CheckoutSuccessPage />} />
            <Route path="/login" element={<Loginpage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/ForgotPassword" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/contact" element={<ContectPage />} />
            <Route path="/eventdetail" element={<Eventdetail />} />
            <Route path="/myEventRequests" element={<MyEventRequests />} />
            <Route path="/profile" element={<RoleProtectedRoute requiredRole="user"><ProfilePage /></RoleProtectedRoute>} />
            <Route path="/my-tickets" element={<RoleProtectedRoute requiredRole="user"><MyTicketsPage /></RoleProtectedRoute>} />

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
                <RoleProtectedRoute requiredRole="user" allowedRoles={["user", "event_manager", "admin"]}>
                  <MyEventRequests />
                </RoleProtectedRoute>
              }
            />
            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <RoleProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin/eventlist"
              element={
                <RoleProtectedRoute requiredRole="admin">
                  <EventListPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin/userlist"
              element={
                <RoleProtectedRoute requiredRole="admin">
                  <UserListPage />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/admin/profile"
              element={
                <RoleProtectedRoute requiredRole="admin">
                  <AdminProfilePage />
                </RoleProtectedRoute>
              }
            />



            {/* Event Manager Routes */}

            <Route
              path="/manager/dashboard"
              element={
                <RoleProtectedRoute requiredRole="event_manager">
                  <ManagerDashbord />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/manager/eventlist"
              element={
                <RoleProtectedRoute requiredRole="event_manager">
                  <EventList />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/manager/managersale"
              element={
                <RoleProtectedRoute requiredRole="event_manager">
                  <SaleRevanue />
                </RoleProtectedRoute>
              }
            />


            <Route
              path="/manager/profile"
              element={
                <RoleProtectedRoute requiredRole="event_manager">
                  <ManagerProfile />
                </RoleProtectedRoute>
              }
            />

            <Route path="*" element={<Home />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Router>
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#333',
            },
            success: {
              style: {
                background: '#10b981',
                color: '#fff',
              },
            },
            error: {
              style: {
                background: '#ef4444',
                color: '#fff',
              },
            },
          }}
        />
      </QueryClientProvider>
    </Provider>
  );
}

export default App
