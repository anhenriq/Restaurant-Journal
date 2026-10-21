import { NavLink } from 'react-router'
import { Icon } from '@/components/ui/Icon'
import { NAV_ITEMS } from './navItems'

/** Primary navigation on phones. Hidden from md up, where SideNav takes over. */
export function BottomTabBar() {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-surface-raised pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto flex max-w-content">
        {NAV_ITEMS.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `flex min-h-[3.5rem] flex-col items-center justify-center gap-0.5 px-2 py-1.5 text-xs font-medium ${
                  isActive ? 'text-accent' : 'text-ink-muted'
                }`
              }
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
