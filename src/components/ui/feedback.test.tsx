import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'
import { ConfirmDialog } from './ConfirmDialog'
import { EmptyState } from './EmptyState'
import { ErrorMessage } from './ErrorMessage'
import { IconButton } from './IconButton'
import { PageHeader } from './PageHeader'
import { PriceDisplay } from './PriceDisplay'

describe('Button', () => {
  it('defaults to type="button" and fires onClick', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Save</Button>)
    const button = screen.getByRole('button', { name: 'Save' })
    expect(button).toHaveAttribute('type', 'button')
    await user.click(button)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('is disabled and marked busy while loading', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Save' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    await user.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })
})

describe('IconButton', () => {
  it('has an accessible name from its label', () => {
    render(<IconButton icon="trash" label="Delete place" />)
    expect(screen.getByRole('button', { name: 'Delete place' })).toBeInTheDocument()
  })
})

describe('ErrorMessage', () => {
  it('announces the message and offers retry', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(<ErrorMessage message="Storage is full" onRetry={onRetry} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Storage is full')
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })
})

describe('EmptyState', () => {
  it('shows a title, description and action', () => {
    render(<EmptyState title="Nothing here" description="Add something" action={<button type="button">Add</button>} />)
    expect(screen.getByRole('heading', { name: 'Nothing here' })).toBeInTheDocument()
    expect(screen.getByText('Add something')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
  })
})

describe('PageHeader', () => {
  it('renders the h1, subtitle, back link and actions', () => {
    render(
      <MemoryRouter>
        <PageHeader
          title="Brick & Vine"
          subtitle="Tempe"
          backTo={{ to: '/journal', label: 'Journal' }}
          actions={<button type="button">Edit</button>}
        />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Brick & Vine' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Journal' })).toHaveAttribute('href', '/journal')
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
  })
})

describe('PriceDisplay', () => {
  it('reads as words to screen readers', () => {
    render(<PriceDisplay level={3} />)
    expect(screen.getByText('Price: Pricey, 3 of 4')).toBeInTheDocument()
  })
})

describe('ConfirmDialog', () => {
  function Harness({ onConfirm }: { onConfirm: () => void }) {
    const [open, setOpen] = useState(false)
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>
          Delete
        </button>
        <ConfirmDialog
          open={open}
          title="Delete this place?"
          destructive
          confirmLabel="Delete place"
          onConfirm={() => {
            onConfirm()
            setOpen(false)
          }}
          onCancel={() => setOpen(false)}
        >
          This can't be undone.
        </ConfirmDialog>
      </>
    )
  }

  it('is hidden until opened, then confirms', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<Harness onConfirm={onConfirm} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog = screen.getByRole('dialog', { name: 'Delete this place?' })
    expect(dialog).toHaveTextContent("This can't be undone.")

    await user.click(screen.getByRole('button', { name: 'Delete place' }))
    expect(onConfirm).toHaveBeenCalledOnce()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('cancels with the Cancel button without confirming', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<Harness onConfirm={onConfirm} />)
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onConfirm).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('treats Escape as cancel', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<Harness onConfirm={onConfirm} />)
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    screen.getByRole('dialog').dispatchEvent(new Event('cancel', { cancelable: true }))
    await Promise.resolve()
    expect(await screen.findByRole('button', { name: 'Delete' })).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
