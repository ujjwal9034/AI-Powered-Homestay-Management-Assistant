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
import useDocumentTitle from '../hooks/useDocumentTitle'

export default function Dashboard() {
  const { user } = useAuth()
  useDocumentTitle(
    user?.role === 'owner'
      ? 'Host Dashboard'
      : user?.role === 'admin'
      ? 'Admin Dashboard'
      : 'Guest Dashboard'
  )

  if (user?.role === 'admin') {
    return <AdminDashboard />
  }

  if (user?.role === 'owner') {
    return <OwnerDashboard />
  }

  // Fallback to customer dashboard for all guests/customers
  return <CustomerDashboard />
}
