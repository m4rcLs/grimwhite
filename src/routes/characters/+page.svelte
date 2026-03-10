<script lang="ts">
	import { characterStore } from '$lib/stores/characterStore';
	import { onMount } from 'svelte';
	import type { Character } from '$lib/models/character';
	import CharacterListCard from '$lib/components/CharacterListCard.svelte';

	let characters: Character[] = $state([]);
	let importMessage: string = $state('');
	let fileInput: HTMLInputElement;

	const unsubscribe = characterStore.subscribe((value) => {
		characters = value;
	});

	onMount(() => {
		return unsubscribe;
	});

	function handleImport(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = () => {
			try {
				const { added, skipped } = characterStore.importCharacters(reader.result as string);
				importMessage = `Imported ${added} character${added !== 1 ? 's' : ''}${skipped ? `, ${skipped} skipped` : ''}`;
			} catch {
				importMessage = 'Invalid file format';
			}
			setTimeout(() => (importMessage = ''), 3000);
			input.value = '';
		};
		reader.readAsText(file);
	}
</script>

<div class="min-h-screen p-8" style="color: var(--text-primary);">
	<div class="mx-auto max-w-4xl">
		<div class="mb-6 flex items-center gap-3">
			<h1
				class="text-3xl font-bold"
				style="font-family: var(--font-heading); color: var(--color-gold);"
			>
				Preserved Souls
			</h1>
			<div class="ml-auto flex items-center gap-2">
				{#if importMessage}
					<span class="text-sm" style="color: var(--color-gold);">{importMessage}</span>
				{/if}
				<input
					bind:this={fileInput}
					type="file"
					accept=".json"
					class="hidden"
					onchange={handleImport}
				/>
				<button
					onclick={() => fileInput.click()}
					class="rounded border px-4 py-2 text-sm transition hover:opacity-80"
					style="font-family: var(--font-heading); border-color: var(--border-color); color: var(--text-secondary);"
				>
					Import
				</button>
				{#if characters.length > 0}
					<button
						onclick={() => characterStore.exportAll(characters)}
						class="rounded border px-4 py-2 text-sm transition hover:opacity-80"
						style="font-family: var(--font-heading); border-color: var(--border-color); color: var(--text-secondary);"
					>
						Export All
					</button>
				{/if}
			</div>
		</div>

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
