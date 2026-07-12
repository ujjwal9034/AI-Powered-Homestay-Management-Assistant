/**
 * Dashboard Router component.
 * Directs the user to the correct dashboard layout based on their role:
 *   - admin    => <AdminDashboard />
 *   - owner    => <OwnerDashboard />
 *   - customer => <CustomerDashboard />
 */
import { useAuth } from '../context/AuthContext'
import CustomerDashboard from './CustomerDashboard'
import OwnerDashboard from './OwnerDashboard'
import AdminDashboard from './AdminDashboard'

export default function Dashboard() {
  const { user } = useAuth()

  if (user?.role === 'admin') {
    return <AdminDashboard />
  }

  if (user?.role === 'owner') {
    return <OwnerDashboard />
  }

  // Fallback to customer dashboard for all guests/customers
  return <CustomerDashboard />
}
