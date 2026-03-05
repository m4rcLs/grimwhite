import { writable } from 'svelte/store';

const STORAGE_KEY = 'grimwhite-theme';

function getInitialTheme(): 'dark' | 'light' {
	if (typeof localStorage === 'undefined') return 'dark';
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === 'light' || stored === 'dark') return stored;
	return 'dark';
}

function createThemeStore() {
	const { subscribe, set } = writable<'dark' | 'light'>(getInitialTheme());

	return {
		subscribe,
		toggle() {
			let current: 'dark' | 'light' = 'dark';
			subscribe((v) => (current = v))();
			const next = current === 'dark' ? 'light' : 'dark';
			set(next);
			if (typeof localStorage !== 'undefined') {
				localStorage.setItem(STORAGE_KEY, next);
			}
			if (typeof document !== 'undefined') {
				document.documentElement.classList.toggle('dark', next === 'dark');
			}
		},
		init() {
			const theme = getInitialTheme();
			set(theme);
			if (typeof document !== 'undefined') {
				document.documentElement.classList.toggle('dark', theme === 'dark');
			}
		}
	};
}

export const themeStore = createThemeStore();
