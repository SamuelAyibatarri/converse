import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import SignUpLogin from '../pages/Signup-Login';
import CustomerDashboard from '@/pages/CustomerDashboard.tsx';
import Dashboard from '@/pages/Dashboard.tsx';
import { verifyJWT } from '@/lib/utils';

type AuthResult = {
  isLoggedIn: boolean;
  role: "agent" | "customer" | null;
  jwtVerified: boolean;
};

const getAuthStatus = async (): Promise<AuthResult> => {
  const rawData = localStorage.getItem("user_data");

  if (!rawData) {
    return { isLoggedIn: false, role: null, jwtVerified: false };
  }

  try {
    const data = JSON.parse(rawData);
    const role = data.userData ? data.userData.role : null;
    
    const jwtVerified = await verifyJWT();

    if (jwtVerified) {
      return {
        isLoggedIn: true,
        role: role,
        jwtVerified: true
      };
    }
  } catch (e) {
    console.error("Failed to parse user_data:", e);
  }

  return { isLoggedIn: false, role: null, jwtVerified: false };
};

const LoadingScreen = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-gray-500">Verifying credentials...</p>
    </div>
  </div>
);

export function AuthPageHandler() {
  const [isLoading, setIsLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState<AuthResult | null>(null);

  useEffect(() => {
    getAuthStatus().then((result) => {
      setAuthStatus(result);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) return <LoadingScreen />;

  if (authStatus?.isLoggedIn && authStatus?.jwtVerified) {
    return <Navigate to={'/dashboard'} replace />;
  }

  return <SignUpLogin />;
}

export function ProtectedRoute({ element }: { element: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    getAuthStatus().then((result) => {
      setIsAuthorized(result.isLoggedIn && result.jwtVerified);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) return <LoadingScreen />;

  if (isAuthorized) {
    return <>{element}</>;
  }

  return <Navigate to={'/auth'} replace />;
}

export function DashboardPageHandler() {
  const [isLoading, setIsLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState<AuthResult | null>(null);

  useEffect(() => {
    getAuthStatus().then((result) => {
      setAuthStatus(result);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) return <LoadingScreen />;

  // 1. Not Logged In -> Go to Login
  if (!authStatus?.isLoggedIn || !authStatus?.jwtVerified) {
    return <Navigate to={'/auth'} replace />;
  }

  // 2. Customer -> Customer Dashboard
  if (authStatus.role === 'customer') {
    return <CustomerDashboard />;
  }

  // 3. Agent -> Main Dashboard
  if (authStatus.role === 'agent') {
    return <Dashboard />;
  }

  // 4. Logged in but invalid role -> Safety Redirect
  console.warn(`Unknown role: ${authStatus.role}`);
  return <Navigate to={'/auth'} replace />;
}