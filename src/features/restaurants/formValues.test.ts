import { describe, expect, it } from 'vitest'
import {
  DEFAULT_PRICE_LEVEL,
  toFormValues,
  toRestaurantInput,
  validateRestaurant,
} from './formValues'

describe('restaurant form helpers', () => {
  it('starts empty with a moderate price', () => {
    expect(toFormValues()).toEqual({
      name: '',
      neighborhood: '',
      cuisine: '',
      recommendedBy: '',
      whySaved: '',
      vibeTags: [],
      priceLevel: DEFAULT_PRICE_LEVEL,
    })
  })

  it('requires a name and neighborhood, ignoring whitespace', () => {
    expect(validateRestaurant(toFormValues())).toEqual({
      name: "Enter the restaurant's name.",
      neighborhood: 'Enter a neighborhood or city.',
    })
    expect(validateRestaurant({ ...toFormValues(), name: '   ', neighborhood: 'Tempe' })).toEqual({
      name: "Enter the restaurant's name.",
    })
    expect(validateRestaurant({ ...toFormValues(), name: 'Casa', neighborhood: 'Tempe' })).toEqual({})
  })

  it('trims values and omits a blank "recommended by"', () => {
    const input = toRestaurantInput({
      ...toFormValues(),
      name: '  Casa Pelayo ',
      neighborhood: ' Guadalupe',
      recommendedBy: '   ',
      vibeTags: ['patio'],
      priceLevel: 1,
    })
    expect(input).toEqual({
      name: 'Casa Pelayo',
      neighborhood: 'Guadalupe',
      cuisine: '',
      whySaved: '',
      vibeTags: ['patio'],
      priceLevel: 1,
    })
    expect('recommendedBy' in input).toBe(false)
  })

  it('round-trips an existing restaurant through the form', () => {
    const existing = {
      name: 'Brick & Vine',
      neighborhood: 'Tempe',
      cuisine: 'Italian',
      recommendedBy: 'Jess',
      whySaved: 'Nice courtyard',
      vibeTags: ['patio' as const],
      priceLevel: 2 as const,
    }
    expect(toRestaurantInput(toFormValues(existing))).toEqual(existing)
  })
})
