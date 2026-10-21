import type { IconName } from '@/components/ui/Icon'

export interface NavItem {
  to: string
  label: string
  icon: IconName
}

/** Shared by the mobile tab bar and the desktop side nav. */
export const NAV_ITEMS: readonly NavItem[] = [
  { to: '/want-to-go', label: 'Want to Go', icon: 'bookmark' },
  { to: '/places/new', label: 'Add a place', icon: 'plus' },
  { to: '/journal', label: 'Journal', icon: 'book' },
  { to: '/account', label: 'Account', icon: 'user' },
]
