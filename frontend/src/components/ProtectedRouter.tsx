
import React from "react";
import { Navigate, Outlet } from "react-router-dom";


const useAuth = () => {
	
	return Boolean(localStorage.getItem("token"));
};

const ProtectedRouter: React.FC = () => {
	const isAuthenticated = useAuth();
	return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRouter;
