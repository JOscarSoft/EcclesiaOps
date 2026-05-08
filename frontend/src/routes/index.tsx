import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Login } from '../modules/auth/Login';
import { ChurchesList } from '../modules/churches/ChurchesList';
import { UsersList } from '../modules/users/UsersList';
import { CouncilsList } from '../modules/platform/CouncilsList';
import { RolesList } from '../modules/roles/RolesList';
import { MembersList } from '../modules/members/MembersList';
import { MemberDetail } from '../modules/members/MemberDetail';
import { MinistriesList } from '../modules/members/MinistriesList';
import { FinanceDashboard } from '../modules/finance/FinanceDashboard';
import { ActivitiesList } from '../modules/activities/ActivitiesList';
import { Dashboard } from '../modules/dashboard/Dashboard';
import { ExecutiveDashboard } from '../modules/dashboard/ExecutiveDashboard';

// Placeholder components for routes
const Settings = () => <div><h2>Configuración</h2></div>;

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: '/', element: <Dashboard /> },
      { path: '/churches', element: <ChurchesList /> },
      { path: '/members', element: <MembersList /> },
      { path: '/members/:id', element: <MemberDetail /> },
      { path: '/ministries', element: <MinistriesList /> },
      { path: '/finance', element: <FinanceDashboard /> },
      { path: '/platform-councils', element: <CouncilsList /> },
      { path: '/activities', element: <ActivitiesList /> },
      { path: '/analytics', element: <ExecutiveDashboard /> },
      { path: '/roles', element: <RolesList /> },
      { path: '/users', element: <UsersList /> },
      { path: '/settings', element: <Settings /> },
    ],
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
