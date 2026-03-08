/**
 * Knave 2e miracle generation.
 *
 * Uses 12 formula templates, each combining different tables.
 * Tables: Element, Form, Effect, Quality, Wizard.
 * Some entries use `{ table: '...' }` to reference sub-tables for extra variety.
 */

import { rollOn } from './tables';
import { randomFrom } from '$lib/generator/utils';
import { KNAVE_TABLES } from '$lib/content/randomTables/tableMap';

const TABLES = KNAVE_TABLES;

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
