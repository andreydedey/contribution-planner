import { Sprout } from 'lucide-react'
import { NavLink, Outlet } from 'react-router'
import { ThemeToggle } from '@/components/theme-toggle'
import { paths } from '@/config/paths'
import { cn } from '@/lib/utils'

const navItems = [
  { to: paths.portfolio, label: 'Carteira' },
  { to: paths.plan, label: 'Plano de aporte' },
]

export function AppLayout() {
  return (
    <div className="min-h-svh bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sprout className="size-5" />
            </span>
            <span className="hidden font-semibold text-lg sm:inline">Onde Aportar</span>
          </div>
          <nav className="flex rounded-lg bg-muted p-1" aria-label="Principal">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-1.5 font-medium text-sm transition-colors sm:px-4',
                    isActive
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex justify-end">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10">
        <Outlet />
      </main>
    </div>
  )
}
