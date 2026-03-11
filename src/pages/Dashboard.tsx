import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import PatientDashboard from '@/components/dashboards/PatientDashboard';
import DoctorDashboard from '@/components/dashboards/DoctorDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import { Navigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || !user) return <Navigate to="/login" />;

  return (
    <DashboardLayout>
      {user.role === 'patient' && <PatientDashboard />}
      {user.role === 'doctor' && <DoctorDashboard />}
      {user.role === 'admin' && <AdminDashboard />}
    </DashboardLayout>
  );
}
