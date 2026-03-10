import type { AttributeName, Trait } from '$lib/models/character';

export interface Ancestry {
	name: string;
	attributeCount?: number;
	isDefault?: boolean;
	isTransformation?: boolean;
	assignedAttributes?: AttributeName[];
}

export function ancestryAsTrait(ancestry: Ancestry): Trait {
	return {
		name: ancestry.name,
		assignedAttributes: ancestry.assignedAttributes ?? []
	};
}

// Duplicate ancestries to reduce chance for Gnome and Orc
export const ANCESTRIES: Ancestry[] = [
	{ name: 'Human', attributeCount: 0, isDefault: true },
	{ name: 'Human', attributeCount: 0, isDefault: true },
	{ name: "Elf", attributeCount: 2 },
	{ name: "Elf", attributeCount: 2 },
	{ name: "Dwarf", attributeCount: 2 },
	{ name: "Dwarf", attributeCount: 2 },
	{ name: "Halfling", attributeCount: 2 },
	{ name: "Halfling", attributeCount: 2 },
	{ name: "Gnome", attributeCount: 2 },
	{ name: "Orc", attributeCount: 2 },
	{ name: "Goblin", attributeCount: 2 },
	{ name: "Goblin", attributeCount: 2 },
	{ name: "Vampire", attributeCount: 2, isTransformation: true },
	{ name: "Vampire", attributeCount: 2, isTransformation: true },
	{ name: "Revenant", attributeCount: 2, isTransformation: true },
	{ name: "Revenant", attributeCount: 2, isTransformation: true },
];

export const RARE_ANCESTRIES: Ancestry[] = [
	{ name: "Tabaxi", attributeCount: 2 },
	{ name: "Leonin", attributeCount: 2 },
	{ name: "Gnoll", attributeCount: 2 },
	{ name: "Minotaur", attributeCount: 2 },
	{ name: "Lizardfolk", attributeCount: 2 },
	{ name: "Kobold", attributeCount: 2 },
	{ name: "Dragonborn", attributeCount: 2 },
	{ name: "Yuan-Ti", attributeCount: 2 },
	{ name: "Strix", attributeCount: 2 },
	{ name: "Fairy", attributeCount: 2 },
	{ name: "Faun", attributeCount: 2 },
	{ name: "Satyr", attributeCount: 2 },
	{ name: "Centaur", attributeCount: 2 },
	{ name: "Dryad", attributeCount: 2 },
	{ name: "Treant-kin", attributeCount: 2 },
	{ name: "Goliath", attributeCount: 2 },
	{ name: "Ogre", attributeCount: 2 },
	{ name: "Troll", attributeCount: 2 },
	{ name: "Firbolg", attributeCount: 2 },
	{ name: "Tiefling", attributeCount: 2 },
	{ name: "Djinn", attributeCount: 2 },
	{ name: "Spectre", attributeCount: 2 },
	{ name: "Merfolk", attributeCount: 2 },
	{ name: "Nymph", attributeCount: 2 },
	{ name: "Lycanthrope", attributeCount: 2, isTransformation: true },
	{ name: "Warforged", attributeCount: 2 },
	{ name: "Golem", attributeCount: 2 },
	{ name: "Animated Armor", attributeCount: 2 },
]