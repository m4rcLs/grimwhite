<script lang="ts">
	import { characterStore } from '$lib/stores/characterStore';
	import { onMount } from 'svelte';
	import type { Character } from '$lib/models/character';

	let characters: Character[] = $state([]);

	const unsubscribe = characterStore.subscribe((value) => {
		characters = value;
	});

	onMount(() => {
		return unsubscribe;
	});

	function removeCharacter(e: Event, id: string) {
		e.preventDefault();
		e.stopPropagation();
		characterStore.remove(id);
	}
</script>

<div class="min-h-screen bg-neutral-900 p-8 pl-16 text-neutral-200">
	<div class="mx-auto max-w-4xl">
		<h1 class="mb-6 text-3xl font-bold">Preserved Souls</h1>

		{#if characters.length === 0}
			<p class="text-neutral-400">No souls preserved yet.</p>
		{:else}
			<div class="space-y-4">
				{#each characters as character}
					<a
						href={`/characters/${character.id}`}
						class="group relative block rounded border border-neutral-700 bg-neutral-800 p-4 pr-12 transition hover:bg-neutral-700"
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

						<button
							onclick={(e) => removeCharacter(e, character.id)}
							class="absolute top-4 right-4 rounded p-1.5 text-neutral-600 opacity-0 transition group-hover:opacity-100 hover:bg-red-900/40 hover:text-red-400"
							title="Remove character"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-4 w-4"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
									clip-rule="evenodd"
								/>
							</svg>
						</button>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>
