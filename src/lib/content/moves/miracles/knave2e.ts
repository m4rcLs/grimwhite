/**
 * Knave 2e miracle generation.
 *
 * Uses 12 formula templates, each combining different tables.
 * Tables: Element, Form, Effect, Quality, Wizard.
 * Some entries use `{ table: '...' }` to reference sub-tables for extra variety.
 */

import type { TableEntry, TableMap } from './tables';
import { rollOn } from './tables';
import { randomFrom } from '$lib/generator/utils';

const ELEMENT: TableEntry[] = [
	'Fire',
	'Ice',
	'Lightning',
	'Stone',
	'Wind',
	'Water',
	'Shadow',
	'Light',
	'Bone',
	'Iron',
	'Acid',
	'Thunder',
	'Venom',
	'Crystal',
	'Sand',
	'Smoke',
	'Blood',
	'Amber',
	'Thorn',
	'Mist',
	'Silver',
	'Ash',
	'Obsidian',
	'Frost',
	{ table: 'compound_element' }
];

const COMPOUND_ELEMENT: TableEntry[] = [
	'Star-Fire',
	'Moon-Frost',
	'Black Iron',
	'Ghost Flame',
	'Witch-Salt',
	'Grave Dust',
	'Void Stone',
	'Wyrm Bile',
	'Blood Coral',
	'Storm Glass'
];

const FORM: TableEntry[] = [
	'Bolt',
	'Wall',
	'Blast',
	'Shield',
	'Cage',
	'Storm',
	'Sphere',
	'Wave',
	'Lance',
	'Rain',
	'Pillar',
	'Shroud',
	'Serpent',
	'Gate',
	'Crown',
	'Chain',
	'Swarm',
	'Vortex',
	'Sigil',
	'Sentinel',
	'Beam',
	'Ring',
	'Torrent',
	'Spire',
	{ table: 'compound_form' }
];

const COMPOUND_FORM: TableEntry[] = [
	'Death-Knell',
	'Soul-Cage',
	'War-Banner',
	'Mind-Trap',
	'Doom-Seal',
	'Spirit-Web',
	'Bone-Prison',
	'Night-Lantern',
	'Wrath-Engine',
	'Rune-Lock'
];

const EFFECT: TableEntry[] = [
	'Burning',
	'Freezing',
	'Banishing',
	'Binding',
	'Draining',
	'Shattering',
	'Mending',
	'Warping',
	'Summoning',
	'Warding',
	'Devouring',
	'Sealing',
	'Reflecting',
	'Silencing',
	'Hastening',
	'Slowing',
	'Revealing',
	'Concealing',
	'Corroding',
	'Petrifying',
	'Dominating',
	'Withering',
	'Empowering',
	'Rotting',
	{ table: 'compound_effect' }
];

const COMPOUND_EFFECT: TableEntry[] = [
	'Soul-Rending',
	'Mind-Searing',
	'Flesh-Knitting',
	'World-Bending',
	'Dream-Walking',
	'Time-Splitting',
	'Heart-Stopping',
	'Bone-Crushing',
	'Blood-Boiling',
	'Eye-Blinding'
];

const QUALITY: TableEntry[] = [
	'Greater',
	'Lesser',
	'Ancient',
	'Forbidden',
	'Infernal',
	'Celestial',
	'Volatile',
	'Perpetual',
	'Silent',
	'Ravenous',
	'Unstable',
	'Primordial',
	'Accursed',
	'Blessed',
	'Chaotic',
	'Inevitable',
	'Hollow',
	'Wrathful',
	'Merciful',
	'Terrible',
	'Glorious',
	'Dire',
	'Fleeting',
	'Utter',
	'Absolute'
];

const WIZARD: TableEntry[] = [
	'Mordak',
	'Valthune',
	'Zelphira',
	'Grothmar',
	'Sylvane',
	'Kethranor',
	'Blightveil',
	"Hadraxis'",
	'Thornweald',
	'Ulmira',
	'Vexmoor',
	'Ignathul',
	'Crynn',
	'Ashabel',
	"Drakthos'",
	"Nethys'",
	"Ozmanthus'",
	'Ravella',
	'Skuldreth',
	'Wyrmgast'
];

const TABLES: TableMap = {
	element: ELEMENT,
	compound_element: COMPOUND_ELEMENT,
	form: FORM,
	compound_form: COMPOUND_FORM,
	effect: EFFECT,
	compound_effect: COMPOUND_EFFECT,
	quality: QUALITY,
	wizard: WIZARD
};

type Formula = () => string;

const FORMULAS: Formula[] = [
	// [Element] [Form]
	() => `${rollOn('element', TABLES)} ${rollOn('form', TABLES)}`,
	// [Effect] [Form]
	() => `${rollOn('effect', TABLES)} ${rollOn('form', TABLES)}`,
	// [Effect] [Element]
	() => `${rollOn('effect', TABLES)} ${rollOn('element', TABLES)}`,
	// The [Quality] [Element] [Form]
	() => `The ${rollOn('quality', TABLES)} ${rollOn('element', TABLES)} ${rollOn('form', TABLES)}`,
	// The [Quality] [Effect] [Form]
	() => `The ${rollOn('quality', TABLES)} ${rollOn('effect', TABLES)} ${rollOn('form', TABLES)}`,
	// The [Quality] [Element] [Element]
	() =>
		`The ${rollOn('quality', TABLES)} ${rollOn('element', TABLES)} ${rollOn('element', TABLES)}`,
	// [Wizard's name] [Element] [Form]
	() => `${rollOnWizard()} ${rollOn('element', TABLES)} ${rollOn('form', TABLES)}`,
	// [Wizard's name] [Effect] [Form]
	() => `${rollOnWizard()} ${rollOn('effect', TABLES)} ${rollOn('form', TABLES)}`,
	// [Wizard's name] [Effect] [Element]
	() => `${rollOnWizard()} ${rollOn('effect', TABLES)} ${rollOn('element', TABLES)}`,
	// [Wizard's name] [Quality] [Element]
	() => `${rollOnWizard()} ${rollOn('quality', TABLES)} ${rollOn('element', TABLES)}`,
	// [Wizard's name] [Quality] [Effect] [Form]
	() =>
		`${rollOnWizard()} ${rollOn('quality', TABLES)} ${rollOn('effect', TABLES)} ${rollOn('form', TABLES)}`,
	// [Wizard's name] [Quality] [Effect] [Element]
	() =>
		`${rollOnWizard()} ${rollOn('quality', TABLES)} ${rollOn('effect', TABLES)} ${rollOn('element', TABLES)}`
];

function rollOnWizard() {
	return `${rollOn('wizard', TABLES)}'s`;
}

export function generateKnave2eMiracle(): string {
	return randomFrom(FORMULAS)();
}
