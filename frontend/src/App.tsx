


import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import EventPage from './pages/EventPage';
import './App.css';
import CreateEventpage from './pages/CreateEventpage';
import CheckoutPage from './pages/CheckoutPage';
import Loginpage from './pages/Loginpage';
import RegisterPage from './pages/RegisterPage';
import { PageNotFound } from './pages/PageNotFound';
import ForgotPassword from './pages/ForgotPage';
import ContectPage from './pages/ContectPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Eventdetail from './pages/Eventdetail';



const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<EventPage />} />
          <Route path="/events/:id" element={<EventPage />} />
          <Route path="/create-event" element={<CreateEventpage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<Loginpage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/ForgotPassword" element={<ForgotPassword />} />
          <Route path="/contact" element={<ContectPage/>} />
          <Route path="*" element={<PageNotFound/>} />
          <Route path="/eventdetail" element={<Eventdetail/>} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App
