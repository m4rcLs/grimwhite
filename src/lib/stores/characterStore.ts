import { writable } from 'svelte/store';
import type { Character } from '$lib/models/character';

const STORAGE_KEY = 'ttrpg-characters';

function loadInitial(): Character[] {
	if (typeof localStorage === 'undefined') return [];

	const raw = localStorage.getItem(STORAGE_KEY);
	if (!raw) return [];

	try {
		return JSON.parse(raw);
	} catch {
		return [];
	}
}

function downloadJson(data: unknown, filename: string) {
	const json = JSON.stringify(data, null, 2);
	const blob = new Blob([json], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

function sanitizeFilename(name: string): string {
	return name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
}

function createCharacterStore() {
	const { subscribe, set, update } = writable<Character[]>(loadInitial());

	return {
		subscribe,

		add: (character: Character) =>
			update((chars) => {
				const updated = [...chars, character];
				localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
				return updated;
			}),

		updateCharacter: (updatedCharacter: Character) =>
			update((chars) => {
				const updated = chars.map((c) => (c.id === updatedCharacter.id ? updatedCharacter : c));
				localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
				return updated;
			}),

		remove: (id: string) =>
			update((chars) => {
				const updated = chars.filter((c) => c.id !== id);
				localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
				return updated;
			}),

		clear: () => {
			localStorage.removeItem(STORAGE_KEY);
			set([]);
		},

		exportCharacter: (character: Character) => {
			downloadJson(character, `${sanitizeFilename(character.name)}.json`);
		},

		exportAll: (characters: Character[]) => {
			downloadJson(characters, 'grimwhite-characters.json');
		},

		importCharacters: (json: string): { added: number; skipped: number } => {
			const parsed = JSON.parse(json);
			const toImport: Character[] = Array.isArray(parsed) ? parsed : [parsed];

			let added = 0;
			let skipped = 0;

			const store = characterStore;
			let current: Character[] = [];
			const unsub = store.subscribe((v) => (current = v));
			unsub();

			const existingIds = new Set(current.map((c) => c.id));

			for (const char of toImport) {
				if (!char.id || !char.name || !char.archetype) continue;
				if (existingIds.has(char.id)) {
					char.id = crypto.randomUUID();
				}
				store.add(char);
				added++;
			}

			skipped = toImport.length - added;
			return { added, skipped };
		}
	};
}

export const characterStore = createCharacterStore();
