export type AttributeName = 'brawns' | 'agility' | 'wits' | 'presence';

export type Archetype = 'strong' | 'deft' | 'wise';

export const MoveNames = {
	strong: 'Combat Maneuver',
	deft: 'Special Techniques',
	wise: 'Miracles'
};

export interface Trait {
	name: string;
	assignedAttributes: AttributeName[];
}

export interface Experience {
	name: string;
}

export interface Move {
	id: string;
	name: string;
	active?: boolean;
}

export interface MoveSlot {
	id: string;
	type: 'maneuver' | 'technique' | 'miracle';
	moves: Move[];
}

export interface Character {
	id: string;
	name: string;
	level: number;
	archetype: Archetype;

	attributes: Record<AttributeName, number>;

	grit: number;
	sanity: number;
	bloodied: boolean;
	rattled: boolean;

	ancestry: Trait;
	vocation: Trait;
	affiliations: Trait[];

	experiences: Experience[];
	moves: MoveSlot[];

	notes: string;
	portrait?: string;
	summary?: string;
	createdAt: number;
}
