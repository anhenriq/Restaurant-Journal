import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import type { PriceLevel } from '@/types'
import { ChipToggleGroup } from './ChipToggleGroup'
import { PriceLevelPicker } from './PriceLevelPicker'
import { Select } from './Select'
import { Switch } from './Switch'
import { TextArea } from './TextArea'
import { TextField } from './TextField'

describe('TextField', () => {
  it('connects the label, hint and error to the input', () => {
    render(<TextField label="Name" hint="As on the menu" error="Name is required" />)
    const input = screen.getByRole('textbox', { name: 'Name' })
    expect(input).toBeInvalid()
    expect(input).toHaveAccessibleDescription('As on the menu Error: Name is required')
  })

  it('marks optional fields and is valid without an error', () => {
    render(<TextField label="Recommended by" optional />)
    const input = screen.getByRole('textbox', { name: 'Recommended by (optional)' })
    expect(input).toBeValid()
    expect(input).not.toHaveAttribute('aria-describedby')
  })

  it('passes native props through', async () => {
    const user = userEvent.setup()
    render(<TextField label="Name" required placeholder="e.g. Casa" />)
    const input = screen.getByRole('textbox', { name: 'Name' })
    expect(input).toBeRequired()
    await user.type(input, 'Casa Pelayo')
    expect(input).toHaveValue('Casa Pelayo')
  })
})

describe('TextArea and Select', () => {
  it('label and describe a textarea', () => {
    render(<TextArea label="Journal" hint="Write freely" journal />)
    expect(screen.getByRole('textbox', { name: 'Journal' })).toHaveAccessibleDescription('Write freely')
  })

  it('selects an option by label', async () => {
    const user = userEvent.setup()
    render(
      <Select label="Cuisine" defaultValue="a">
        <option value="a">Mexican</option>
        <option value="b">Italian</option>
      </Select>,
    )
    await user.selectOptions(screen.getByRole('combobox', { name: 'Cuisine' }), 'Italian')
    expect(screen.getByRole('combobox', { name: 'Cuisine' })).toHaveValue('b')
  })
})

describe('Switch', () => {
  function Harness() {
    const [on, setOn] = useState(false)
    return <Switch label="Would go back" checked={on} onChange={setOn} />
  }

  it('toggles by click on the switch, click on the label, or keyboard', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const toggle = screen.getByRole('switch', { name: /Would go back/ })
    expect(toggle).toHaveAttribute('aria-checked', 'false')

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-checked', 'true')

    await user.click(screen.getByText('Would go back'))
    expect(toggle).toHaveAttribute('aria-checked', 'false')

    toggle.focus()
    await user.keyboard(' ')
    expect(toggle).toHaveAttribute('aria-checked', 'true')
  })
})

describe('ChipToggleGroup', () => {
  const options = [
    { value: 'patio', label: 'Patio' },
    { value: 'quiet', label: 'Quiet' },
  ] as const

  function Harness() {
    const [selected, setSelected] = useState<Array<'patio' | 'quiet'>>(['patio'])
    return <ChipToggleGroup legend="Vibe" options={options} selected={selected} onChange={setSelected} />
  }

  it('is a labelled group of checkboxes that can be toggled', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const group = screen.getByRole('group', { name: 'Vibe' })
    expect(group).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Patio' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Quiet' })).not.toBeChecked()

    await user.click(screen.getByRole('checkbox', { name: 'Quiet' }))
    expect(screen.getByRole('checkbox', { name: 'Quiet' })).toBeChecked()
    await user.click(screen.getByRole('checkbox', { name: 'Patio' }))
    expect(screen.getByRole('checkbox', { name: 'Patio' })).not.toBeChecked()
  })
})

describe('PriceLevelPicker', () => {
  function Harness({ anyLabel }: { anyLabel?: string }) {
    const [value, setValue] = useState<PriceLevel | undefined>(2)
    return <PriceLevelPicker legend="Price" value={value} onChange={setValue} {...(anyLabel ? { anyLabel } : {})} />
  }

  it('is a radio group with descriptive names and one selection', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    expect(screen.getAllByRole('radio')).toHaveLength(4)
    expect(screen.getByRole('radio', { name: '$$ Moderate' })).toBeChecked()

    await user.click(screen.getByRole('radio', { name: '$$$$ Special occasion' }))
    expect(screen.getByRole('radio', { name: '$$$$ Special occasion' })).toBeChecked()
    expect(screen.getByRole('radio', { name: '$$ Moderate' })).not.toBeChecked()
  })

  it('can offer an "Any" option that clears the choice', async () => {
    const user = userEvent.setup()
    render(<Harness anyLabel="Any price" />)
    await user.click(screen.getByRole('radio', { name: 'Any price' }))
    expect(screen.getByRole('radio', { name: 'Any price' })).toBeChecked()
    expect(screen.getByRole('radio', { name: '$$ Moderate' })).not.toBeChecked()
  })
})
