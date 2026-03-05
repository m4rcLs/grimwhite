<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
	import { characterStore } from '$lib/stores/characterStore';
	import type { Character } from '$lib/models/character';

	let { children } = $props();

	let characters: Character[] = $state([]);
	let sidebarOpen = $state(false);

	characterStore.subscribe((value) => {
		characters = value;
	});

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}

	const currentPath = $derived(page.url.pathname);
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<!-- Sidebar toggle button -->
<button
	onclick={toggleSidebar}
	class="fixed top-4 left-4 z-50 rounded border border-neutral-700 bg-neutral-800 p-2 text-neutral-300 transition hover:bg-neutral-700 hover:text-amber-400"
	aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
>
	{#if sidebarOpen}
		<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
			<path
				fill-rule="evenodd"
				d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
				clip-rule="evenodd"
			/>
		</svg>
	{:else}
		<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
			<path
				fill-rule="evenodd"
				d="M3 5a1 1 0 011-1h12a1 1 0 010 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 010 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 010 2H4a1 1 0 01-1-1z"
				clip-rule="evenodd"
			/>
		</svg>
	{/if}
</button>

<!-- Backdrop -->
{#if sidebarOpen}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-30 bg-black/50 transition-opacity"
		onclick={toggleSidebar}
		onkeydown={(e) => e.key === 'Escape' && toggleSidebar()}
	></div>
{/if}

<!-- Sidebar -->
<aside
	class={`fixed top-0 left-0 z-40 flex h-full w-64 flex-col border-r border-neutral-700 bg-neutral-900 transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
>
	<div class="flex items-center justify-between border-b border-neutral-700 px-4 py-4">
		<span class="text-lg font-bold tracking-wide text-amber-400">Grimwhite</span>
	</div>

	<nav class="flex-1 overflow-y-auto px-3 py-4">
		<!-- Generator link -->
		<a
			href="/"
			onclick={toggleSidebar}
			class={`mb-1 flex items-center gap-2 rounded px-3 py-2 text-sm font-semibold transition ${
				currentPath === '/'
					? 'bg-amber-700/20 text-amber-400'
					: 'text-neutral-300 hover:bg-neutral-800 hover:text-amber-400'
			}`}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-4 w-4"
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path
					fill-rule="evenodd"
					d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
					clip-rule="evenodd"
				/>
			</svg>
			Birth a Wretch
		</a>

		<!-- Divider + Characters section -->
		<div class="mt-4 mb-2 px-3 text-xs font-semibold tracking-wider text-neutral-500 uppercase">
			Preserved Souls ({characters.length})
		</div>

		{#if characters.length === 0}
			<p class="px-3 text-xs text-neutral-500 italic">No souls preserved yet.</p>
		{:else}
			{#each characters as char}
				<a
					href={`/characters/${char.id}`}
					onclick={toggleSidebar}
					class={`mb-1 block rounded px-3 py-2 text-sm transition ${
						currentPath === `/characters/${char.id}`
							? 'bg-amber-700/20 text-amber-400'
							: 'text-neutral-300 hover:bg-neutral-800 hover:text-amber-400'
					}`}
				>
					<div class="font-medium">{char.name}</div>
					<div class="text-xs text-neutral-500">
						Lv {char.level} — {char.archetype}
					</div>
				</a>
			{/each}
		{/if}
	</nav>

	<!-- Footer -->
	<div class="border-t border-neutral-700 px-4 py-3">
		<a
			href="/characters"
			onclick={toggleSidebar}
			class={`text-xs transition ${
				currentPath === '/characters' ? 'text-amber-400' : 'text-neutral-400 hover:text-amber-400'
			}`}
		>
			View all characters →
		</a>
	</div>
</aside>

<!-- Main content -->
<div class="transition-all duration-200">
	{@render children()}
</div>
