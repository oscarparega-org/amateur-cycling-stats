/**
 * Category Translation Utilities
 *
 * Provides helper functions to translate race category names, genders, and lengths
 * using the i18n map strategy.
 */

import { get } from 'svelte/store';
import { t } from '$lib/i18n';

/**
 * Translate a race category name (e.g., "ABS" -> "Absoluta" in Spanish)
 *
 * @param categoryName - The category name key (e.g., "ABS", "ELITE", "MA")
 * @returns The translated category name
 */
export function translateCategory(categoryName: string): string {
	const tFunction = get(t);
	return tFunction(`races.categories.${categoryName}`, { default: categoryName });
}

/**
 * Translate a race category gender (e.g., "MALE" -> "Masculino" in Spanish)
 *
 * @param genderName - The gender name key (e.g., "MALE", "FEMALE", "OPEN")
 * @returns The translated gender name
 */
export function translateGender(genderName: string): string {
	const tFunction = get(t);
	return tFunction(`races.genders.${genderName}`, { default: genderName });
}

/**
 * Translate a race category length (e.g., "LONG" -> "Larga" in Spanish)
 *
 * @param lengthName - The length name key (e.g., "LONG", "SHORT", "SPRINT", "UNIQUE")
 * @returns The translated length name
 */
export function translateLength(lengthName: string): string {
	const tFunction = get(t);
	return tFunction(`races.lengths.${lengthName}`, { default: lengthName });
}
