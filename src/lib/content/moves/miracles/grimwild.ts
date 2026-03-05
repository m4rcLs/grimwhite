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
	'Blinding',
	'Hallowed',
	'Profane',
	'Whispered',
	'Eternal',
	'Smouldering',
	'Wailing',
	'Fractured',
	'Radiant',
	'Withering',
	'Creeping',
	'Thunderous',
	'Frozen',
	'Bleeding',
	'Voiceless',
	'Howling',
	'Ashen',
	'Luminous',
	'Venomous',
	'Shimmering',
	'Ghastly',
	'Searing',
	'Murmuring',
	'Devouring',
	'Dreaming'
];

const ESSENCE: TableEntry[] = [
	'Bone',
	'Shadow',
	'Flame',
	'Spirit',
	'Iron',
	'Thorn',
	'Grave',
	'Storm',
	'Moon',
	'Blood',
	'Dust',
	'Void',
	'Moss',
	'Ash',
	'Star',
	'Fog',
	'Root',
	'Worm',
	'Silk',
	'Salt',
	'Crow',
	'Rust',
	'Plague',
	'Amber',
	'Marrow'
];

const FORM: TableEntry[] = [
	'Curse',
	'Revelation',
	'Binding',
	'Lament',
	'Ward',
	'Sigil',
	'Hymn',
	'Shroud',
	'Herald',
	'Communion',
	'Tongue',
	'Veil',
	'Pyre',
	'Gate',
	'Obelisk',
	'Crown',
	'Mantle',
	'Requiem',
	'Covenant',
	'Effigy',
	'Rune',
	'Dirge',
	'Mirror',
	'Chalice',
	'Psalm'
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
