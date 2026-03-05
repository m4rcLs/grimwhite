<script lang="ts">
	import { marked } from 'marked';
	import { type Character, type AttributeName, MoveNames } from '$lib/models/character';
	import { ARCHETYPES } from '$lib/content/archetypes';
	import { generateCharacter } from '$lib/generator/generateCharacter';
	import { characterStore } from '$lib/stores/characterStore';
	import { goto } from '$app/navigation';

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

	const attributeLabels: Record<AttributeName, string> = {
		brawns: 'Brawns',
		agility: 'Agility',
		wits: 'Wits',
		presence: 'Presence'
	};
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
					class="rounded border px-5 py-2 text-sm font-semibold transition hover:opacity-80"
					style="font-family: var(--font-heading); border-color: #22543d; background: rgba(34, 84, 61, 0.2); color: #68d391;"
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
				<!-- Portrait placeholder -->
				<div
					class="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border"
					style="border-color: var(--border-color); background-color: var(--bg-surface);"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-10 w-10"
						style="color: var(--text-muted);"
						viewBox="0 0 24 24"
						fill="currentColor"
					>
						<path
							d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"
						/>
					</svg>
				</div>

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
						<div
							class="wax-seal rounded-lg p-4 text-center"
							style="background: radial-gradient(ellipse at 30% 30%, var(--bg-elevated), var(--bg-surface)); border: 1px solid var(--border-color); box-shadow: inset 0 1px 0 rgba(184, 159, 93, 0.1), inset 0 -2px 4px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.3);"
						>
							<div
								class="text-xs font-semibold tracking-widest uppercase"
								style="font-family: var(--font-heading); color: var(--text-secondary);"
							>
								{attributeLabels[attr as AttributeName]}
							</div>
							<div
								class="text-3xl font-bold"
								style="color: var(--color-gold); text-shadow: 0 0 12px rgba(184, 159, 93, 0.3);"
							>
								{character.attributes[attr as AttributeName]}
							</div>
						</div>
					{/each}
					<div class="hidden md:block"></div>
					{#each ['wits', 'presence'] as attr}
						<div
							class="wax-seal rounded-lg p-4 text-center"
							style="background: radial-gradient(ellipse at 30% 30%, var(--bg-elevated), var(--bg-surface)); border: 1px solid var(--border-color); box-shadow: inset 0 1px 0 rgba(184, 159, 93, 0.1), inset 0 -2px 4px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.3);"
						>
							<div
								class="text-xs font-semibold tracking-widest uppercase"
								style="font-family: var(--font-heading); color: var(--text-secondary);"
							>
								{attributeLabels[attr as AttributeName]}
							</div>
							<div
								class="text-3xl font-bold"
								style="color: var(--color-gold); text-shadow: 0 0 12px rgba(184, 159, 93, 0.3);"
							>
								{character.attributes[attr as AttributeName]}
							</div>
						</div>
					{/each}

					<!-- Bloodied row -->
					<div class="col-span-2 flex flex-col items-center py-2">
						<div class="flex w-full items-center gap-2 px-4">
							<div class="h-0 flex-1 border-t border-dotted border-red-700/50"></div>
							<span class="text-xs font-semibold tracking-wide text-red-400/50 uppercase"
								>Bloodied</span
							>
							<div class="h-0 flex-1 border-t border-dotted border-red-700/50"></div>
						</div>
					</div>
					<div class="hidden md:block"></div>
					<!-- Rattled row -->
					<div class="col-span-2 flex flex-col items-center py-2">
						<div class="flex w-full items-center gap-2 px-4">
							<div class="h-0 flex-1 border-t border-dotted border-violet-700/50"></div>
							<span class="text-xs font-semibold tracking-wide text-violet-400/50 uppercase"
								>Rattled</span
							>
							<div class="h-0 flex-1 border-t border-dotted border-violet-700/50"></div>
						</div>
					</div>
				</div>
			</div>

			<!-- Grit, Sanity & Essence -->
			<div class="mb-8 flex flex-wrap gap-6">
				<div
					class="rounded border px-5 py-3"
					style="border-color: var(--border-color); background-color: var(--bg-surface);"
				>
					<span class="text-sm" style="color: var(--text-secondary);">Grit</span>
					<span class="ml-2 text-xl font-bold" style="color: var(--color-gold);"
						>{character.grit}</span
					>
				</div>
				<div
					class="rounded border px-5 py-3"
					style="border-color: var(--border-color); background-color: var(--bg-surface);"
				>
					<span class="text-sm" style="color: var(--text-secondary);">Sanity</span>
					<span class="ml-2 text-xl font-bold" style="color: var(--color-gold);"
						>{character.sanity}</span
					>
				</div>
				{#if essence !== null}
					<div
						class="rounded border px-5 py-3"
						style="border-color: var(--border-color); background-color: var(--bg-surface);"
					>
						<span class="text-sm" style="color: var(--text-secondary);">Essence Pool</span>
						<span class="ml-2 text-xl font-bold" style="color: var(--color-gold);">{essence}</span>
					</div>
				{/if}
			</div>

			<!-- Traits -->
			<div class="mb-8 space-y-4">
				<div>
					<div
						class="font-semibold"
						style="font-family: var(--font-heading); color: var(--text-secondary);"
					>
						Ancestry
					</div>
					<div class="flex items-center gap-3">
						<span>{character.ancestry.name}</span>
						{#each character.ancestry.assignedAttributes as attr}
							<span
								class="rounded px-2 py-1 text-xs uppercase"
								style="background: linear-gradient(135deg, var(--color-gold-dark), var(--color-gold)); color: var(--bg-base);"
							>
								{attributeLabels[attr]}
							</span>
						{/each}
					</div>
				</div>

				<div>
					<div
						class="font-semibold"
						style="font-family: var(--font-heading); color: var(--text-secondary);"
					>
						Vocation
					</div>
					<div class="flex items-center gap-3">
						<span>{character.vocation.name}</span>
						{#if character.archetype === 'deft'}
							<span class="text-xs italic" style="color: var(--text-muted);"
								>Applies to any attribute</span
							>
						{:else}
							{#each character.vocation.assignedAttributes as attr}
								<span
									class="rounded px-2 py-1 text-xs uppercase"
									style="background: linear-gradient(135deg, var(--color-gold-dark), var(--color-gold)); color: var(--bg-base);"
								>
									{attributeLabels[attr]}
								</span>
							{/each}
						{/if}
					</div>
				</div>

				<div>
					<div
						class="font-semibold"
						style="font-family: var(--font-heading); color: var(--text-secondary);"
					>
						Affiliation
					</div>
					<div class="flex items-center gap-3">
						<span>{character.affiliations[0]?.name}</span>
						{#each character.affiliations[0]?.assignedAttributes ?? [] as attr}
							<span
								class="rounded px-2 py-1 text-xs uppercase"
								style="background: linear-gradient(135deg, var(--color-gold-dark), var(--color-gold)); color: var(--bg-base);"
							>
								{attributeLabels[attr]}
							</span>
						{/each}
					</div>
				</div>
			</div>

			<!-- Archetype Feature -->
			{#if feature}
				<div
					class="mb-8 rounded-lg border p-5"
					style="border-color: var(--border-color); background-color: var(--bg-surface);"
				>
					<h3 class="mb-2 text-lg font-semibold" style="color: var(--color-gold);">
						{feature.name}
					</h3>
					<div class="prose prose-sm max-w-none prose-invert prose-amber">
						{@html marked(feature.description)}
					</div>
				</div>
			{/if}

			<!-- Moves -->
			<div class="mb-8">
				<h3 class="mb-3 text-xl font-semibold" style="color: var(--color-gold);">
					{MoveNames[character.archetype]}
				</h3>

				<div class="space-y-4">
					{#each character.moves as slot}
						<div
							class="rounded-lg border p-4"
							style="border-color: var(--border-color); background: var(--bg-elevated);"
						>
							<div
								class="mb-2 text-sm tracking-wide uppercase"
								style="font-family: var(--font-heading); color: var(--text-muted);"
							>
								{slot.type}
							</div>

							{#each slot.moves as move}
								<div
									class="mb-2 flex items-center gap-2 rounded px-3 py-2"
									style={move.active === true
										? `background: linear-gradient(135deg, var(--color-gold-dark), var(--color-gold)); color: var(--bg-base);`
										: move.active === false
											? `background-color: var(--bg-surface); color: var(--text-muted);`
											: `background-color: var(--bg-surface);`}
								>
									<span class="flex-1">{move.name}</span>
									{#if move.active !== undefined}
										<span class="text-xs tracking-wide uppercase">
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
