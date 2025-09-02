
import React from "react";
import { Navigate, Outlet } from "react-router-dom";


const useAuth = () => {
	const accessToken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
	return Boolean(accessToken);
};

const ProtectedRouter: React.FC = () => {
	const isAuthenticated = useAuth();
	return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRouter;
