import type { ReactNode } from 'react'

/** Class for the one link inside a CardItem; it stretches to make the whole card clickable. */
export const CARD_LINK_CLASS = "after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"

interface CardItemProps {
  children: ReactNode
}

/**
 * A list item styled as a card. Put one <Link className={CARD_LINK_CLASS}> inside (usually
 * around the heading) so the whole card is clickable while the link text stays meaningful.
 */
export function CardItem({ children }: CardItemProps) {
  return (
    <li className="relative rounded-lg border border-border bg-surface-raised p-4 shadow-card transition-shadow hover:shadow-raised has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus">
      {children}
    </li>
  )
}
