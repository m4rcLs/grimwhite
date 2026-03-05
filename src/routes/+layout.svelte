<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
	import { themeStore } from '$lib/stores/themeStore';
	import { onMount } from 'svelte';

	let { children } = $props();

	const currentPath = $derived(page.url.pathname);
	let isDark = $state(true);

	themeStore.subscribe((v) => {
		isDark = v === 'dark';
	});

	onMount(() => {
		themeStore.init();
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<!-- Global Nav Bar -->
<nav
	class="sticky top-0 z-50 flex items-center gap-6 border-b px-6 py-3 backdrop-blur"
	style="
		background-color: color-mix(in srgb, var(--bg-base) 92%, transparent);
		border-color: var(--border-color);
	"
>
	<!-- Logo -->
	<a href="/" class="font-title text-xl tracking-wider" style="color: var(--color-gold);">
		Grimwhite
	</a>

	<!-- Nav links -->
	<div class="flex items-center gap-4">
		<a
			href="/"
			class="text-sm font-semibold transition"
			style="font-family: var(--font-heading); color: {currentPath === '/'
				? 'var(--color-gold)'
				: 'var(--text-secondary)'};"
		>
			Generator
		</a>
		<a
			href="/characters"
			class="text-sm font-semibold transition"
			style="font-family: var(--font-heading); color: {currentPath.startsWith('/characters')
				? 'var(--color-gold)'
				: 'var(--text-secondary)'};"
		>
			Characters
		</a>
	</div>

	<!-- Spacer -->
	<div class="flex-1"></div>

	<!-- Theme toggle -->
	<button
		onclick={() => themeStore.toggle()}
		class="rounded p-2 transition"
		style="color: var(--text-secondary);"
		aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
	>
		{#if isDark}
			<!-- Sun icon -->
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5"
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path
					fill-rule="evenodd"
					d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
					clip-rule="evenodd"
				/>
			</svg>
		{:else}
			<!-- Moon icon -->
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5"
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
			</svg>
		{/if}
	</button>
</nav>

<!-- Main content -->
<div>
	{@render children()}
</div>
