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
		}
	};
}

export const characterStore = createCharacterStore();
