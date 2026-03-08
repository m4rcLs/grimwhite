<script lang="ts">
	import { type Character, type AttributeName, MoveNames } from '$lib/models/character';
	import { ARCHETYPES } from '$lib/content/archetypes';
	import { generateCharacter } from '$lib/generator/generateCharacter';
	import { characterStore } from '$lib/stores/characterStore';
	import { goto } from '$app/navigation';
	import WaxSealAttribute from '$lib/components/WaxSealAttribute.svelte';
	import StatBadge from '$lib/components/StatBadge.svelte';
	import StatusRow from '$lib/components/StatusRow.svelte';
	import AttributeBadge from '$lib/components/AttributeBadge.svelte';
	import CharacterPortrait from '$lib/components/CharacterPortrait.svelte';
	import MoveSlotCard from '$lib/components/MoveSlotCard.svelte';
	import ArchetypeFeatureCard from '$lib/components/ArchetypeFeatureCard.svelte';
	import TraitRow from '$lib/components/TraitRow.svelte';

	let character: Character | null = $state(null);

	function birth() {
		character = generateCharacter();
	}

	function preserve() {
		if (!character) return;
		characterStore.add(character);
		const id = character.id;
		character = null;
		goto(`/characters/${id}`);
	}

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

<div class="min-h-screen p-8" style="color: var(--text-primary);">
	<div class="mx-auto max-w-4xl">
		<!-- Sticky Action Bar (attached below global nav) -->
		<div
			class="sticky top-[49px] z-10 -mx-8 mb-6 flex gap-2 border-b px-8 py-3 backdrop-blur"
			style="background-color: color-mix(in srgb, var(--bg-base) 92%, transparent); border-color: var(--border-color);"
		>
			<button
				onclick={birth}
				class="rounded px-5 py-2 text-sm font-semibold transition"
				style="font-family: var(--font-heading); background: linear-gradient(135deg, var(--color-gold), var(--color-gold-dark)); color: var(--bg-base);"
			>
				Birth A Wretch
			</button>
			{#if character}
				<button
					onclick={preserve}
					class="preserve-btn rounded border px-5 py-2 text-sm font-semibold transition hover:opacity-80"
					style="font-family: var(--font-heading);"
				>
					Preserve This Soul
				</button>
			{/if}
		</div>

		{#if !character}
			<div class="flex flex-col items-center justify-center gap-6 py-32 text-center">
				<h1 class="font-title text-6xl tracking-wider" style="color: var(--color-gold);">
					Grimwhite
				</h1>
				<p class="max-w-md text-lg" style="color: var(--text-secondary);">
					Random character generator. Press the button above to birth a wretch into the world.
				</p>
			</div>
		{:else}
			{@const feature = getArchetypeFeature(character.archetype)}
			{@const essence = essencePool(character)}

			<!-- Header with Portrait -->
			<div class="mb-8 flex items-start gap-5">
				<CharacterPortrait name={character.name} />

				<!-- Name / Level / Summary -->
				<div class="min-w-0 flex-1">
					<h1 class="mb-1 text-4xl font-bold">{character.name}</h1>
					<p class="text-lg tracking-wide uppercase" style="color: var(--color-gold);">
						Level {character.level} — {character.archetype}
					</p>
					{#if character.summary}
						<p class="mt-2 italic" style="color: var(--text-secondary);">{character.summary}</p>
					{/if}
				</div>
			</div>

			<!-- Attributes (wax-seal badges) -->
			<div class="mb-8">
				<div class="grid grid-cols-2 gap-x-8 gap-y-0 md:grid-cols-[1fr_1fr_auto_1fr_1fr]">
					{#each ['brawns', 'agility'] as attr}
						<WaxSealAttribute
							attribute={attr as AttributeName}
							value={character.attributes[attr as AttributeName]}
						/>
					{/each}
					<div class="hidden md:block"></div>
					{#each ['wits', 'presence'] as attr}
						<WaxSealAttribute
							attribute={attr as AttributeName}
							value={character.attributes[attr as AttributeName]}
						/>
					{/each}

					<!-- Bloodied row -->
					<StatusRow label="Bloodied" color="red" />
					<div class="hidden md:block"></div>
					<!-- Rattled row -->
					<StatusRow label="Rattled" color="violet" />
				</div>
			</div>

			<!-- Grit, Resolve & Essence -->
			<div class="mb-8 flex flex-wrap gap-6">
				<StatBadge label="Grit" value={character.grit} />
				<StatBadge label="Resolve" value={character.resolve} />
				{#if essence !== null}
					<StatBadge label="Essence Pool" value={essence} />
				{/if}
			</div>

			<!-- Traits -->
			<div class="mb-8 space-y-4">
				<TraitRow label="Ancestry" trait={character.ancestry} />
				<TraitRow
					label="Vocation"
					trait={character.vocation}
					noAttributeText={character.archetype === 'deft' ? 'Applies to any attribute' : ''}
				/>
				{#if character.affiliations[0]}
					<TraitRow label="Affiliation" trait={character.affiliations[0]} />
				{/if}
			</div>

			<!-- Archetype Feature -->
			{#if feature}
				<ArchetypeFeatureCard name={feature.name} description={feature.description} />
			{/if}

			<!-- Moves -->
			<div class="mb-8">
				<h3 class="mb-3 text-xl font-semibold" style="color: var(--color-gold);">
					{MoveNames[character.archetype]}
				</h3>

				<div class="space-y-4">
					{#each character.moves as slot}
						<MoveSlotCard {slot} />
					{/each}
				</div>
			</div>

			<!-- Experiences -->
			<div class="mb-8">
				<h3 class="mb-3 text-xl font-semibold" style="color: var(--color-gold);">Experiences</h3>
				<ul class="list-inside list-disc" style="color: var(--text-primary);">
					{#each character.experiences as exp}
						<li>{exp.name}</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
</div>
