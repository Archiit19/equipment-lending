import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import NavBar from './components/NavBar.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import EquipmentForm from './pages/EquipmentForm.jsx'
import RequestCreate from './pages/RequestCreate.jsx'
import MyRequests from './pages/MyRequests.jsx'
import AdminRequests from './pages/AdminRequests.jsx'
import NotFound from './pages/NotFound.jsx'
import Notifications from './pages/notification.jsx';

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user)
      return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role))
      return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <NavBar />
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/equipment/new" element={<ProtectedRoute roles={['admin']}><EquipmentForm /></ProtectedRoute>} />
          <Route path="/equipment/:id/edit" element={<ProtectedRoute roles={['admin']}><EquipmentForm /></ProtectedRoute>} />
          <Route path="/request/:id" element={<ProtectedRoute><RequestCreate /></ProtectedRoute>} />
          <Route path="/requests" element={<ProtectedRoute><MyRequests /></ProtectedRoute>} />
          <Route path="/admin/requests" element={<ProtectedRoute roles={['staff','admin']}><AdminRequests /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>}/>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}
