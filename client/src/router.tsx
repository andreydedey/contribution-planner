import { createBrowserRouter, type RouteObject, RouterProvider } from 'react-router'
import { AppLayout } from '@/components/layout/app-layout'
import { paths } from '@/config/paths'
import { PlanPage } from '@/pages/plan-page'
import { PortfolioPage } from '@/pages/portfolio-page'

export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      { path: paths.portfolio, element: <PortfolioPage /> },
      { path: paths.plan, element: <PlanPage /> },
    ],
  },
]

const router = createBrowserRouter(routes)

export function AppRouter() {
  return <RouterProvider router={router} />
}
