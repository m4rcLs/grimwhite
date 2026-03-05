<script lang="ts">
	import { type Character, type AttributeName, MoveNames } from '$lib/models/character';
	import { ARCHETYPES } from '$lib/content/archetypes';
	import { characterStore } from '$lib/stores/characterStore';
	import { onMount } from 'svelte';

	let { params } = $props();

	let character: Character | null = $state(null);
	let notFound = $state(false);

	const attributeLabels: Record<AttributeName, string> = {
		brawns: 'Brawns',
		agility: 'Agility',
		wits: 'Wits',
		presence: 'Presence'
	};

	onMount(() => {
		const unsubscribe = characterStore.subscribe((chars) => {
			const found = chars.find((c) => c.id === params.id);
			if (found) {
				character = found;
			} else {
				notFound = true;
			}
		});
		return unsubscribe;
	});

	function getArchetypeFeature(archetype: string) {
		return ARCHETYPES.find((a) => a.id === archetype)?.feature ?? null;
	}

	function essencePool(char: Character): number | null {
		if (char.archetype !== 'wise') return null;
		const vocationAttr = char.vocation.assignedAttributes[0];
		if (!vocationAttr) return char.level;
		return char.level + char.attributes[vocationAttr];
	}
</script>

{#if notFound}
	<div class="flex min-h-screen items-center justify-center bg-neutral-900 text-neutral-200">
		<div class="text-center">
			<h1 class="mb-4 text-3xl font-bold">Soul Not Found</h1>
			<p class="mb-6 text-neutral-400">This wretch has been lost to the void.</p>
			<a href="/characters" class="text-amber-400 underline hover:text-amber-300">
				Return to Preserved Souls
			</a>
		</div>
	</div>
{:else if character}
	{@const feature = getArchetypeFeature(character.archetype)}
	{@const essence = essencePool(character)}

	<div class="min-h-screen bg-neutral-900 p-8 text-neutral-200">
		<div class="mx-auto max-w-4xl">
			<!-- Navigation -->
			<div class="mb-6 flex items-center gap-4 text-sm text-neutral-400">
				<a href="/" class="hover:text-amber-400">Generator</a>
				<span>/</span>
				<a href="/characters" class="hover:text-amber-400">Preserved Souls</a>
				<span>/</span>
				<span class="text-neutral-200">{character.name}</span>
			</div>

			<!-- Header -->
			<div class="mb-8">
				<h1 class="mb-1 text-4xl font-bold">{character.name}</h1>
				<p class="text-lg tracking-wide text-amber-400 uppercase">
					Level {character.level} — {character.archetype}
				</p>
				{#if character.summary}
					<p class="mt-2 text-neutral-400 italic">{character.summary}</p>
				{/if}
			</div>

			<!-- Attributes -->
			<div class="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
				{#each Object.entries(character.attributes) as [key, value]}
					<div class="rounded border border-neutral-700 bg-neutral-800 p-4 text-center">
						<div class="text-sm tracking-wide text-neutral-400 uppercase">
							{attributeLabels[key as AttributeName]}
						</div>
						<div class="text-3xl font-bold text-amber-400">{value}</div>
					</div>
				{/each}
			</div>

			<!-- Grit, Sanity & Essence -->
			<div class="mb-8 flex flex-wrap gap-6">
				<div class="rounded border border-neutral-700 bg-neutral-800 px-5 py-3">
					<span class="text-sm text-neutral-400">Grit</span>
					<span class="ml-2 text-xl font-bold text-amber-400">{character.grit}</span>
				</div>
				<div class="rounded border border-neutral-700 bg-neutral-800 px-5 py-3">
					<span class="text-sm text-neutral-400">Sanity</span>
					<span class="ml-2 text-xl font-bold text-amber-400">{character.sanity}</span>
				</div>
				{#if essence !== null}
					<div class="rounded border border-neutral-700 bg-neutral-800 px-5 py-3">
						<span class="text-sm text-neutral-400">Essence Pool</span>
						<span class="ml-2 text-xl font-bold text-amber-400">{essence}</span>
					</div>
				{/if}
			</div>

			<!-- Traits -->
			<div class="mb-8 space-y-4">
				<div>
					<div class="font-semibold text-neutral-400">Ancestry</div>
					<div class="flex items-center gap-3">
						<span>{character.ancestry.name}</span>
						{#each character.ancestry.assignedAttributes as attr}
							<span class="rounded bg-amber-800 px-2 py-1 text-xs uppercase">
								{attributeLabels[attr]}
							</span>
						{/each}
					</div>
				</div>

				<div>
					<div class="font-semibold text-neutral-400">Vocation</div>
					<div class="flex items-center gap-3">
						<span>{character.vocation.name}</span>
						{#each character.vocation.assignedAttributes as attr}
							<span class="rounded bg-amber-800 px-2 py-1 text-xs uppercase">
								{attributeLabels[attr]}
							</span>
						{/each}
					</div>
				</div>

				<div>
					<div class="font-semibold text-neutral-400">Affiliation</div>
					<div class="flex items-center gap-3">
						<span>{character.affiliations[0]?.name}</span>
						{#each character.affiliations[0]?.assignedAttributes ?? [] as attr}
							<span class="rounded bg-amber-800 px-2 py-1 text-xs uppercase">
								{attributeLabels[attr]}
							</span>
						{/each}
					</div>
				</div>
			</div>

			<!-- Archetype Feature -->
			{#if feature}
				<div class="mb-8 rounded border border-neutral-700 bg-neutral-800 p-5">
					<h3 class="mb-2 text-lg font-semibold text-amber-400">{feature.name}</h3>
					<p class="text-sm whitespace-pre-line text-neutral-300">{feature.description}</p>
				</div>
			{/if}

			<!-- Moves -->
			<div class="mb-8">
				<h3 class="mb-3 text-xl font-semibold text-amber-400">
					{MoveNames[character.archetype]}
				</h3>

				<div class="space-y-4">
					{#each character.moves as slot}
						<div class="rounded border border-neutral-700 bg-neutral-900 p-4">
							<div class="mb-2 text-sm tracking-wide text-neutral-500 uppercase">
								{slot.type}
							</div>

							{#each slot.moves as move}
								<div
									class={`mb-2 rounded px-3 py-2 ${
										move.active === true
											? 'bg-amber-700 text-black'
											: move.active === false
												? 'bg-neutral-800 text-neutral-400'
												: 'bg-neutral-800'
									}`}
								>
									{move.name}

									{#if move.active !== undefined}
										<span class="ml-2 text-xs tracking-wide uppercase">
											{move.active ? 'Active' : 'Inactive'}
										</span>
									{/if}
								</div>
							{/each}
						</div>
					{/each}
				</div>
			</div>

			<!-- Experiences -->
			<div class="mb-8">
				<h3 class="mb-3 text-xl font-semibold text-amber-400">Experiences</h3>
				<ul class="list-inside list-disc text-neutral-300">
					{#each character.experiences as exp}
						<li>{exp.name}</li>
					{/each}
				</ul>
			</div>

			<!-- Notes -->
			<div class="mb-8">
				<h3 class="mb-3 text-xl font-semibold text-amber-400">Notes</h3>
				<p class="whitespace-pre-wrap text-neutral-300">
					{#if character.notes}
						{character.notes}
					{:else}
						<span class="text-neutral-500 italic">No notes yet.</span>
					{/if}
				</p>
			</div>
		</div>
	</div>
{:else}
	<div class="flex min-h-screen items-center justify-center bg-neutral-900 text-neutral-200">
		<p class="text-neutral-400">Loading...</p>
	</div>
{/if}
