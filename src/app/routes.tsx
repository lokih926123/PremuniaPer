import { createBrowserRouter } from 'react-router';
import LandingPage from './pages/LandingPage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import PromoteAdmin from './pages/PromoteAdmin';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Leads from './pages/admin/Leads';
import Settings from './pages/admin/Settings';
import Automation from './pages/admin/Automation';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: LandingPage,
  },
  {
    path: '/signin',
    Component: SignIn,
  },
  {
    path: '/signup',
    Component: SignUp,
  },
  {
    path: '/promote-admin',
    Component: PromoteAdmin,
  },
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      {
        index: true,
        Component: Dashboard,
      },
      {
        path: 'leads',
        Component: Leads,
      },
      {
        path: 'settings',
        Component: Settings,
      },
      {
        path: 'automation',
        Component: Automation,
      },
    ],
  },
]);
