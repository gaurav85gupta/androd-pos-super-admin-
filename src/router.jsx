// src/router.jsx
//
// C.15 Performance -- Lazy Loading. Every page below the login screen is
// code-split via React.lazy, so the initial bundle only needs to include
// the login page + app shell; a Super Admin who only ever visits Dashboard
// and Restaurants never downloads the Activity Logs or Settings page code.

import { lazy, Suspense } from 'react';
import { createHashRouter, Navigate } from 'react-router-dom';
import { RequireAuth } from './auth/RequireAuth';
import { AppLayout } from './layout/AppLayout';
import { LoginPage } from './pages/login/LoginPage';
import { LoadingView } from './components/StateViews';

const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const RestaurantsListPage = lazy(() => import('./pages/restaurants/RestaurantsListPage').then((m) => ({ default: m.RestaurantsListPage })));
const RestaurantFormPage = lazy(() => import('./pages/restaurants/RestaurantFormPage').then((m) => ({ default: m.RestaurantFormPage })));
const RestaurantDetailPage = lazy(() => import('./pages/restaurants/RestaurantDetailPage').then((m) => ({ default: m.RestaurantDetailPage })));
const UsersPage = lazy(() => import('./pages/users/UsersPage').then((m) => ({ default: m.UsersPage })));
const DevicesPage = lazy(() => import('./pages/devices/DevicesPage').then((m) => ({ default: m.DevicesPage })));
const SubscriptionsPage = lazy(() => import('./pages/subscriptions/SubscriptionsPage').then((m) => ({ default: m.SubscriptionsPage })));
const FeaturesPage = lazy(() => import('./pages/features/FeaturesPage').then((m) => ({ default: m.FeaturesPage })));
const ActivityPage = lazy(() => import('./pages/activity/ActivityPage').then((m) => ({ default: m.ActivityPage })));
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })));

function LazyPage({ Component }) {
  return (
    <Suspense fallback={<LoadingView />}>
      <Component />
    </Suspense>
  );
}

export const router = createHashRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <LazyPage Component={DashboardPage} /> },
      { path: 'restaurants', element: <LazyPage Component={RestaurantsListPage} /> },
      { path: 'restaurants/new', element: <LazyPage Component={RestaurantFormPage} /> },
      { path: 'restaurants/:restaurantId', element: <LazyPage Component={RestaurantDetailPage} /> },
      { path: 'users', element: <LazyPage Component={UsersPage} /> },
      { path: 'devices', element: <LazyPage Component={DevicesPage} /> },
      { path: 'subscriptions', element: <LazyPage Component={SubscriptionsPage} /> },
      { path: 'features', element: <LazyPage Component={FeaturesPage} /> },
      { path: 'activity', element: <LazyPage Component={ActivityPage} /> },
      { path: 'settings', element: <LazyPage Component={SettingsPage} /> },
      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);
