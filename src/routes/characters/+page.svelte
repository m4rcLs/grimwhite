<script lang="ts">
	import { characterStore } from '$lib/stores/characterStore';
	import { onMount } from 'svelte';
	import type { Character } from '$lib/models/character';

	let characters: Character[] = [];

	const unsubscribe = characterStore.subscribe((value) => {
		characters = value;
	});

	onMount(() => {
		return unsubscribe;
	});
</script>

<div class="min-h-screen bg-neutral-900 p-8 text-neutral-200">
	<div class="mx-auto max-w-4xl">
		<h1 class="mb-6 text-3xl font-bold">Preserved Souls</h1>

		{#if characters.length === 0}
			<p class="text-neutral-400">No souls preserved yet.</p>
		{:else}
			<div class="space-y-4">
				{#each characters as character}
					<a
						href={`/characters/${character.id}`}
						class="block rounded border border-neutral-700 bg-neutral-800 p-4 transition hover:bg-neutral-700"
					>
						<div class="text-xl font-semibold">
							{character.name}
						</div>

						<div class="text-sm text-neutral-400">
							{character.summary}
						</div>

						<div class="mt-2 text-xs tracking-wide text-amber-400 uppercase">
							Level {character.level} — {character.archetype}
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>
