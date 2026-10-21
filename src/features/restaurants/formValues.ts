import type { PriceLevel, Restaurant, RestaurantInput, VibeTag } from '@/types'

/** What the form holds while the user is typing (all text fields as plain strings). */
export interface RestaurantFormValues {
  name: string
  neighborhood: string
  cuisine: string
  recommendedBy: string
  whySaved: string
  vibeTags: VibeTag[]
  priceLevel: PriceLevel
}

export type RestaurantFormErrors = Partial<Record<'name' | 'neighborhood', string>>

export const DEFAULT_PRICE_LEVEL: PriceLevel = 2

export function toFormValues(input?: RestaurantInput): RestaurantFormValues {
  return {
    name: input?.name ?? '',
    neighborhood: input?.neighborhood ?? '',
    cuisine: input?.cuisine ?? '',
    recommendedBy: input?.recommendedBy ?? '',
    whySaved: input?.whySaved ?? '',
    vibeTags: input?.vibeTags ?? [],
    priceLevel: input?.priceLevel ?? DEFAULT_PRICE_LEVEL,
  }
}

/** Name and neighborhood are required; everything else can be filled in later. */
export function validateRestaurant(values: RestaurantFormValues): RestaurantFormErrors {
  const errors: RestaurantFormErrors = {}
  if (!values.name.trim()) errors.name = "Enter the restaurant's name."
  if (!values.neighborhood.trim()) errors.neighborhood = 'Enter a neighborhood or city.'
  return errors
}

/** Trims text and leaves out "recommended by" when blank. */
export function toRestaurantInput(values: RestaurantFormValues): RestaurantInput {
  const recommendedBy = values.recommendedBy.trim()
  return {
    name: values.name.trim(),
    neighborhood: values.neighborhood.trim(),
    cuisine: values.cuisine.trim(),
    whySaved: values.whySaved.trim(),
    vibeTags: values.vibeTags,
    priceLevel: values.priceLevel,
    ...(recommendedBy ? { recommendedBy } : {}),
  }
}

/** The editable fields of a saved place, for pre-filling the edit form. */
export function pickRestaurantInput(restaurant: Restaurant): RestaurantInput {
  const { name, neighborhood, cuisine, recommendedBy, whySaved, vibeTags, priceLevel } = restaurant
  return {
    name,
    neighborhood,
    cuisine,
    whySaved,
    vibeTags,
    priceLevel,
    ...(recommendedBy ? { recommendedBy } : {}),
  }
}
