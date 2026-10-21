import { ChoiceChip } from './ChoiceChip'
import { ChoiceGroup } from './ChoiceGroup'

export interface ChipOption<T extends string> {
  value: T
  label: string
}

interface ChipToggleGroupProps<T extends string> {
  legend: string
  hint?: string
  error?: string
  options: ReadonlyArray<ChipOption<T>>
  selected: readonly T[]
  onChange: (selected: T[]) => void
}

/** Pick any number of options (vibe tags, filters). A group of checkboxes styled as chips. */
export function ChipToggleGroup<T extends string>({
  legend,
  hint,
  error,
  options,
  selected,
  onChange,
}: ChipToggleGroupProps<T>) {
  function toggle(value: T) {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value])
  }

  return (
    <ChoiceGroup legend={legend} hint={hint} error={error}>
      {options.map((option) => (
        <ChoiceChip
          key={option.value}
          type="checkbox"
          label={option.label}
          checked={selected.includes(option.value)}
          onChange={() => toggle(option.value)}
        />
      ))}
    </ChoiceGroup>
  )
}
