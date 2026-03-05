import type { Character, AttributeName, Archetype, MoveSlot } from '../models/character';
import { generateId } from './utils';

// --- Level progression tables ---

/** Levels at which an attribute increase is granted (user picks which attribute) */
export const ATTRIBUTE_INCREASE_LEVELS = [3, 5, 7, 9, 10];

/** Levels at which a new move slot is granted */
export const NEW_MOVE_SLOT_LEVELS = [2, 4, 6, 8, 10];

/** Levels at which a new experience slot is granted */
export const NEW_EXPERIENCE_LEVELS = [4, 8, 10];

/** Max attribute value for levels 1-9 */
export const ATTRIBUTE_CAP_NORMAL = 3;

/** Max attribute value allowed for ONE attribute at level 10 */
export const ATTRIBUTE_CAP_LEVEL_10 = 4;

/** Required total of all attributes at level 10 */
export const LEVEL_10_ATTRIBUTE_TOTAL = 10;

/** Max character level */
export const MAX_LEVEL = 10;

// --- Derived stat formulas ---

/** Grit & Sanity = 1 + floor((level - 1) / 2) */
export function calculateGritSanity(level: number): number {
	return 1 + Math.floor((level - 1) / 2);
}

// --- Level-up checks ---

export function canLevelUp(character: Character): boolean {
	return character.level < MAX_LEVEL;
}

export function levelGrantsAttributeIncrease(level: number): boolean {
	return ATTRIBUTE_INCREASE_LEVELS.includes(level);
}

export function levelGrantsNewMoveSlot(level: number): boolean {
	return NEW_MOVE_SLOT_LEVELS.includes(level);
}

export function levelGrantsNewExperience(level: number): boolean {
	return NEW_EXPERIENCE_LEVELS.includes(level);
}

// --- Validation ---

export function getAttributeCap(level: number): number {
	return level >= 10 ? ATTRIBUTE_CAP_LEVEL_10 : ATTRIBUTE_CAP_NORMAL;
}

export function canIncreaseAttribute(
	character: Character,
	attr: AttributeName,
	newLevel: number
): boolean {
	const currentValue = character.attributes[attr];
	const cap = newLevel >= 10 ? ATTRIBUTE_CAP_LEVEL_10 : ATTRIBUTE_CAP_NORMAL;
	return currentValue < cap;
}

export interface LevelUpResult {
	character: Character;
	grantsAttribute: boolean;
	grantsMoveSlot: boolean;
	grantsExperience: boolean;
}

/**
 * Create an empty move slot for the character's archetype.
 * Moves are left empty — the user fills them in via editing.
 */
export function createEmptyMoveSlot(archetype: Archetype): MoveSlot {
	const typeMap = {
		strong: 'maneuver' as const,
		deft: 'technique' as const,
		wise: 'miracle' as const
	};

	const slot: MoveSlot = {
		id: generateId(),
		type: typeMap[archetype],
		moves:
			archetype === 'wise'
				? [
						{ id: generateId(), name: '(new miracle)', active: true },
						{ id: generateId(), name: '(new miracle)', active: false }
					]
				: [{ id: generateId(), name: `(new ${typeMap[archetype]})` }]
	};

	return slot;
}

/**
 * Level up a character by one level.
 *
 * - Increments level
 * - Recalculates grit & sanity
 * - Adds a new move slot if applicable
 * - Adds an empty experience slot if applicable
 * - If an attribute increase is granted, the caller must handle
 *   the attribute selection UI separately, then call `applyAttributeIncrease()`.
 *
 * Returns a deep copy — does NOT mutate the original.
 */
export function levelUp(character: Character): LevelUpResult {
	if (!canLevelUp(character)) {
		throw new Error(`Character is already at max level (${MAX_LEVEL})`);
	}

	const newLevel = character.level + 1;
	const updated: Character = JSON.parse(JSON.stringify(character));
	updated.level = newLevel;

	// Recalculate grit & sanity
	const gs = calculateGritSanity(newLevel);
	updated.grit = gs;
	updated.sanity = gs;

	const grantsMoveSlot = levelGrantsNewMoveSlot(newLevel);
	const grantsExperience = levelGrantsNewExperience(newLevel);
	const grantsAttribute = levelGrantsAttributeIncrease(newLevel);

	// Add move slot
	if (grantsMoveSlot) {
		updated.moves = [...updated.moves, createEmptyMoveSlot(updated.archetype)];
	}

	// Add empty experience
	if (grantsExperience) {
		updated.experiences = [...updated.experiences, { name: '(new experience)' }];
	}

	return {
		character: updated,
		grantsAttribute,
		grantsMoveSlot,
		grantsExperience
	};
}

/**
 * Apply an attribute increase to a character (after user selection).
 * Validates the cap. Returns a deep copy.
 */
export function applyAttributeIncrease(character: Character, attr: AttributeName): Character {
	if (!canIncreaseAttribute(character, attr, character.level)) {
		throw new Error(`Cannot increase ${attr} beyond cap (${getAttributeCap(character.level)})`);
	}

	const updated: Character = JSON.parse(JSON.stringify(character));
	updated.attributes[attr] += 1;
	return updated;
}

/**
 * Summary of what a level-up to `newLevel` grants.
 */
export function levelUpSummary(newLevel: number): string[] {
	const parts: string[] = [];
	if (levelGrantsAttributeIncrease(newLevel)) parts.push('+1 Attribute');
	if (levelGrantsNewMoveSlot(newLevel)) parts.push('+1 Move Slot');
	if (levelGrantsNewExperience(newLevel)) parts.push('+1 Experience');

	const gs = calculateGritSanity(newLevel);
	const prevGs = calculateGritSanity(newLevel - 1);
	if (gs > prevGs) parts.push(`Grit & Sanity → ${gs}`);

	return parts;
}
