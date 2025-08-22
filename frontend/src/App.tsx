

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import EventPage from './pages/EventPage';
import './App.css';
import CreateEventpage from './pages/CreateEventpage';
import CheckoutPage from './pages/CheckoutPage';
import Loginpage from './pages/Loginpage';
import RegisterPage from './pages/RegisterPage';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<EventPage />} />
        <Route path="/events/:id" element={<EventPage />} />
        <Route path="/create-event" element={<CreateEventpage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/login" element={<Loginpage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        
      </Routes>
    </Router>
  );
}

export default App
