import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import SignUpLogin from './pages/Signup-Login.tsx'

const router = createBrowserRouter([{
  path: '/auth',
  element: <SignUpLogin />
},
{
  path: '/',
  element: <Navigate to={'/auth'} replace/>
},
{ path: '/chat',
  element: <App />
}]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
