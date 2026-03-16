export type AttributeName = 'brawns' | 'agility' | 'wits' | 'presence';

export type Archetype = 'strong' | 'deft' | 'wise';

export type Gender = 'male' | 'female';

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
	description?: string;
	active?: boolean;
}

export interface MoveSlot {
	id: string;
	type: 'maneuver' | 'technique' | 'miracle';
	moves: Move[];
}

export type WealthLevel = 1 | 2 | 3 | 4 | 5;

export const WEALTH_LABELS: Record<WealthLevel, string> = {
	1: 'Poor',
	2: 'Modest',
	3: 'Comfortable',
	4: 'Wealthy',
	5: 'Rich'
};

export interface Wealth {
	level: WealthLevel;
	progress: number; // 0-9 progress toward next level
}

export interface Character {
	id: string;
	name: string;
	gender: Gender;
	level: number;
	archetype: Archetype;

	attributes: Record<AttributeName, number>;

	grit: number;
	resolve: number;
	bloodied: boolean;
	rattled: boolean;
	markedAttributes: AttributeName[];
	spark: [boolean, boolean];

	ancestry: Trait;
	vocation: Trait;
	affiliations: Trait[];

	experiences: Experience[];
	moves: MoveSlot[];
	essence?: { max: number; current: number };

	xp: number;
	coins: number; // 0-4
	wealth: Wealth;
	notes: string;
	portrait?: string;
	summary?: string;
	createdAt: number;
}
