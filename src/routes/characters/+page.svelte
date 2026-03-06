<script lang="ts">
	import { characterStore } from '$lib/stores/characterStore';
	import { onMount } from 'svelte';
	import type { Character } from '$lib/models/character';
	import CharacterListCard from '$lib/components/CharacterListCard.svelte';

	let characters: Character[] = $state([]);

	const unsubscribe = characterStore.subscribe((value) => {
		characters = value;
	});

	onMount(() => {
		return unsubscribe;
	});
</script>

<div class="min-h-screen p-8" style="color: var(--text-primary);">
	<div class="mx-auto max-w-4xl">
		<h1
			class="mb-6 text-3xl font-bold"
			style="font-family: var(--font-heading); color: var(--color-gold);"
		>
			Preserved Souls
		</h1>

		{#if characters.length === 0}
			<p style="color: var(--text-muted);">No souls preserved yet.</p>
		{:else}
			<div class="space-y-4">
				{#each characters as character}
					<CharacterListCard {character} onremove={(id) => characterStore.remove(id)} />
				{/each}
			</div>
		{/if}
	</div>
</div>
