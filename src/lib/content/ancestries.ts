import type { AttributeName, Trait } from '$lib/models/character';

export interface Ancestry {
	name: string;
	attributeCount?: number;
	isDefault?: boolean;
	assignedAttributes?: AttributeName[];
}

export function ancestryAsTrait(ancestry: Ancestry): Trait {
	return {
		name: ancestry.name,
		assignedAttributes: ancestry.assignedAttributes ?? []
	};
}

export const ANCESTRIES: Ancestry[] = [
	{ name: 'Human', attributeCount: 0, isDefault: true },
	{ name: 'Ashen-Blooded', attributeCount: 2 },
	{ name: 'Graveborn', attributeCount: 2 },
	{ name: 'Mirefolk', attributeCount: 2 },
	{ name: 'Storm-Touched', attributeCount: 2 }
];
