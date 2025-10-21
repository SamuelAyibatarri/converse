import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Dashboard from './pages/Dashboard.tsx'
import SignUpLogin from './pages/Signup-Login.tsx'

const userData = JSON.parse(localStorage.getItem("user_data") as string);

const router = createBrowserRouter([{
  path: '/auth',
  element: (userData.isLoggedIn === true) ? <Navigate to={'/dashboard'} replace /> : <SignUpLogin />
},
{
  path: '/',
  element: <Navigate to={'/auth'} replace/>
},
{ path: '/chat',
  element: <App />
},
{ 
  path: '/dashboard',
  element: (userData.isLoggedIn === true) ? <Dashboard /> : <Navigate to={'/auth'} replace />
}
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
