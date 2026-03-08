/**
 * GrimWild miracle generation.
 *
 * A miracle name is formed by combining 2 of 3 tables: Style, Essence, Form.
 * The pair is chosen randomly, giving 3 possible patterns:
 *   Style + Essence, Style + Form, Essence + Form
 */

import type { TableEntry, TableMap } from './tables';
import { rollOn } from './tables';
import { randomFrom } from '$lib/generator/utils';

const STYLE: TableEntry[] = [
	'Binding',
	'Flaming',
	'Charming',
	'Cryptic',
	'Freezing',
	'Mesmerising',
	'Oozing',
	'Slow',
	'Silent',
	'Withering',
	'Seeping',
	'Unseen',
	'Shimmering',
	'Wrathful',
	'Dazzling',
	'Primal',
	'Ferocious',
	'Expanding',
	'Shielding',
	'Petrifying',
	'Piercing',
	'Screaming',
	'Grasping',
	'Swift',
	'Curious',
	'Hungry',
	'Jovial',
	'Thunderous',
	'Venomous',
	'Phantom',
	'Shadowy',
	'Majestic',
	'Frenzied',
	'Prismatic',
	'Sickening',
	'Terrible'
];

const ESSENCE: TableEntry[] = [
	'Oil',
	'Crystal',
	'Slime',
	'Light',
	'Doom',
	'Pain',
	'Earth',
	'Air',
	'Fungus',
	'Hex',
	'Smoke',
	'Energy',
	'Lore',
	'Fire',
	'Death',
	'Blight',
	'Sight',
	'Feeling',
	'Lightning',
	'Spirit',
	'Stasis',
	'Terror',
	'Mist',
	'Bone',
	'Ash',
	'Acid',
	'Sound',
	'Mind',
	'Vermin',
	'Flesh',
	'Thorn',
	'Vine',
	'Water',
	'Draught',
	'Wood',
	'Worm'
];

const FORM: TableEntry[] = [
	'Beacon',
	'Ring',
	'Chains',
	'Eye',
	'Cascade',
	'Bubble',
	'Servant',
	'Crown',
	'Word',
	'Aura',
	'Shield',
	'Hand',
	'Vision',
	'Disk',
	'Fang',
	'Gust',
	'Swarm',
	'Dance',
	'Sentinel',
	'Web',
	'Gate',
	'Whispers',
	'Pillar',
	'Explosion',
	'Ray',
	'Guide',
	'Wall',
	'Wings',
	'Claw',
	'Mask',
	'Poison',
	'Embers',
	'Dark',
	'Wave',
	'Dream',
	'Rot'
];

const TABLES: TableMap = {
	style: STYLE,
	essence: ESSENCE,
	form: FORM
};

type Pair = [string, string];

const PATTERNS: Pair[] = [
	['style', 'essence'],
	['style', 'form'],
	['essence', 'form']
];

export function generateGrimWildMiracle(): string {
	const [a, b] = randomFrom(PATTERNS);
	return `${rollOn(a, TABLES)} ${rollOn(b, TABLES)}`;
}
