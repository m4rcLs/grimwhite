/**
 * Shared sub-table resolver for miracle name generation.
 *
 * Table entries can be:
 * - A plain string: used as-is
 * - An object `{ table: 'tableName' }`: recursively resolved from the provided tables map
 *
 * This allows entries in one table to reference another table for variety.
 */

export type TableEntry = string | { table?: string, generator?: () => string };
export type TableMap = Record<string, TableEntry[]>;

import { randomFrom } from '$lib/generator/utils';

/** Resolve a single entry — if it references a sub-table, recursively pick from that table. */
export function resolveEntry(entry: TableEntry, tables: TableMap, depth = 0): string {
	if (depth > 5) return typeof entry === 'string' ? entry : '???';
	if (typeof entry === 'string') return entry;

	if (entry.generator && typeof entry.generator === 'function') return entry.generator()
	if (!entry.table) return '???'
	const subTable = tables[entry.table];
	if (!subTable) return '???';
	return resolveEntry(randomFrom(subTable), tables, depth + 1);
}

/** Pick a random entry from a named table and resolve it. */
export function rollOn(tableName: string, tables: TableMap): string {
	const table = tables[tableName];
	if (!table) return '???';
	return resolveEntry(randomFrom(table), tables);
}
