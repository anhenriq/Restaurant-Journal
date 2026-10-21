import { Link, NavLink } from 'react-router'
import { Icon } from '@/components/ui/Icon'
import { NAV_ITEMS } from './navItems'

/** Primary navigation on tablet and desktop. Hidden on phones, where BottomTabBar is used. */
export function SideNav() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-8 border-r border-border bg-surface-raised px-4 py-8 md:flex">
      <Link
        to="/"
        className="flex min-h-touch items-center px-3 font-serif text-xl font-semibold text-ink"
      >
        Restaurant Journal
      </Link>
      <nav aria-label="Main">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex min-h-touch items-center gap-3 rounded px-3 text-base font-medium ${
                    isActive
                      ? 'bg-accent-soft text-accent-hover'
                      : 'text-ink-muted hover:bg-surface-sunken hover:text-ink'
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
    </aside>
  )
}
