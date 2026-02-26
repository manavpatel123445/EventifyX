import { Routes, Route } from 'react-router-dom';
import PaymentLogsPage from '../admin/Pages/PaymentLogsPage';
import PaymentLogSidebar from './PaymentLogSidebar';

const PaymentLogRoutes = () => (
  <div className="flex min-h-screen">
    <PaymentLogSidebar />
    <div className="flex-1">
      <Routes>
        <Route path="/admin/payment-logs" element={<PaymentLogsPage />} />
        {/* Add more routes as needed */}
      </Routes>
    </div>
  </div>
);

export default PaymentLogRoutes;
