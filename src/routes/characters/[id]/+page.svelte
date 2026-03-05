<script lang="ts">
	import { marked } from 'marked';
	import {
		type Character,
		type AttributeName,
		type MoveSlot,
		type Experience,
		MoveNames
	} from '$lib/models/character';
	import { ARCHETYPES } from '$lib/content/archetypes';
	import { ANCESTRIES } from '$lib/content/ancestries';
	import { EXPERIENCES } from '$lib/content/experiences';
	import { STRONG_PREFIX, STRONG_SUFFIX } from '$lib/content/moves/strong';
	import { DEFT_PREFIX, DEFT_SUFFIX } from '$lib/content/moves/deft';
	import { WISE_PREFIX, WISE_SUFFIX } from '$lib/content/moves/wise';
	import { characterStore } from '$lib/stores/characterStore';
	import {
		canLevelUp,
		levelUp,
		applyAttributeIncrease,
		levelUpSummary,
		levelGrantsAttributeIncrease,
		canIncreaseAttribute,
		MAX_LEVEL
	} from '$lib/generator/leveling';
	import { goto } from '$app/navigation';
	import { untrack } from 'svelte';

	let { params } = $props();

	let character: Character | null = $state(null);
	let notFound = $state(false);
	let editing = $state(false);
	let draft: Character | null = $state(null);

	const ATTRIBUTE_NAMES: AttributeName[] = ['brawns', 'agility', 'wits', 'presence'];

	const attributeLabels: Record<AttributeName, string> = {
		brawns: 'Brawns',
		agility: 'Agility',
		wits: 'Wits',
		presence: 'Presence'
	};

	$effect(() => {
		const id = params.id;
		// Reset state when navigating to a different character
		untrack(() => {
			editing = false;
			notFound = false;
		});

		const unsubscribe = characterStore.subscribe((chars) => {
			const found = chars.find((c) => c.id === id);
			if (found) {
				character = found;
				untrack(() => {
					if (!editing) draft = JSON.parse(JSON.stringify(found));
				});
			} else {
				notFound = true;
			}
		});
		return unsubscribe;
	});

	function startEditing() {
		if (!character) return;
		draft = JSON.parse(JSON.stringify(character));
		editing = true;
	}

	function cancelEditing() {
		if (!character) return;
		draft = JSON.parse(JSON.stringify(character));
		editing = false;
	}

	function saveEdits() {
		if (!draft) return;
		characterStore.updateCharacter(draft);
		editing = false;
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

	const TRAIT_ATTRIBUTE_LIMITS: Record<string, number> = {
		ancestry: 2,
		vocation: 1,
		affiliation: 1
	};

	function getAncestryAttributeLimit(name: string): number {
		const found = ANCESTRIES.find((a) => a.name === name);
		return found?.attributeCount ?? 2;
	}

	// Trait attribute editing helpers
	function toggleTraitAttribute(
		trait: 'ancestry' | 'vocation' | 'affiliation',
		attr: AttributeName
	) {
		if (!draft) return;
		let target =
			trait === 'ancestry'
				? draft.ancestry
				: trait === 'vocation'
					? draft.vocation
					: draft.affiliations[0];
		if (!target) return;

		const max =
			trait === 'ancestry' ? getAncestryAttributeLimit(target.name) : TRAIT_ATTRIBUTE_LIMITS[trait];
		const idx = target.assignedAttributes.indexOf(attr);
		if (idx >= 0) {
			target.assignedAttributes = target.assignedAttributes.filter((a) => a !== attr);
		} else if (target.assignedAttributes.length < max) {
			target.assignedAttributes = [...target.assignedAttributes, attr];
		}
	}

	function addExperience() {
		if (!draft) return;
		draft.experiences = [...draft.experiences, { name: '' }];
	}

	function removeExperience(index: number) {
		if (!draft) return;
		draft.experiences = draft.experiences.filter((_, i) => i !== index);
	}

	let confirmingDelete = $state(false);
	let notesOpen = $state(false);
	let notesDraft = $state('');
	let levelUpOpen = $state(false);
	let levelUpResult: import('$lib/generator/leveling').LevelUpResult | null = $state(null);
	let selectedAttribute: AttributeName | null = $state(null);

	function removeCharacter() {
		if (!character) return;
		characterStore.remove(character.id);
		goto('/');
	}

	function openLevelUp() {
		if (!character || !canLevelUp(character)) return;
		const result = levelUp(character);
		levelUpResult = result;
		selectedAttribute = null;
		levelUpOpen = true;
	}

	function confirmLevelUp() {
		if (!levelUpResult) return;
		if (levelUpResult.grantsAttribute) {
			if (!selectedAttribute) return;
			const withAttr = applyAttributeIncrease(levelUpResult.character, selectedAttribute);
			characterStore.updateCharacter(withAttr);
		} else {
			characterStore.updateCharacter(levelUpResult.character);
		}
		levelUpOpen = false;
		levelUpResult = null;
		selectedAttribute = null;
	}

	function cancelLevelUp() {
		levelUpOpen = false;
		levelUpResult = null;
		selectedAttribute = null;
	}

	function randomFrom<T>(arr: T[]): T {
		return arr[Math.floor(Math.random() * arr.length)];
	}

	function randomMoveName(archetype: string): string {
		if (archetype === 'strong') return `${randomFrom(STRONG_PREFIX)} ${randomFrom(STRONG_SUFFIX)}`;
		if (archetype === 'deft') return `${randomFrom(DEFT_PREFIX)} ${randomFrom(DEFT_SUFFIX)}`;
		return `${randomFrom(WISE_PREFIX)} ${randomFrom(WISE_SUFFIX)}`;
	}

	function randomLevelUp() {
		if (!levelUpResult || !character) return;
		let updated = JSON.parse(JSON.stringify(levelUpResult.character)) as Character;

		// Random attribute
		if (levelUpResult.grantsAttribute) {
			const eligible = ATTRIBUTE_NAMES.filter((a) =>
				canIncreaseAttribute(character!, a, updated.level)
			);
			if (eligible.length > 0) {
				updated = applyAttributeIncrease(updated, randomFrom(eligible));
			}
		}

		// Random experience names for new slots
		if (levelUpResult.grantsExperience) {
			const existing = new Set(character.experiences.map((e) => e.name));
			for (let i = 0; i < updated.experiences.length; i++) {
				if (updated.experiences[i].name === '(new experience)') {
					const available = EXPERIENCES.filter((e) => !existing.has(e));
					if (available.length > 0) {
						const picked = randomFrom(available);
						updated.experiences[i] = { name: picked };
						existing.add(picked);
					}
				}
			}
		}

		// Random move names for new slots
		if (levelUpResult.grantsMoveSlot) {
			for (const slot of updated.moves) {
				for (const move of slot.moves) {
					if (move.name.startsWith('(new ')) {
						move.name = randomMoveName(updated.archetype);
					}
				}
			}
		}

		characterStore.updateCharacter(updated);
		levelUpOpen = false;
		levelUpResult = null;
		selectedAttribute = null;
	}

	function openNotes() {
		if (!character) return;
		notesDraft = character.notes ?? '';
		notesOpen = true;
	}

	function saveNotes() {
		if (!character) return;
		characterStore.updateCharacter({ ...character, notes: notesDraft });
		notesOpen = false;
	}

	function cancelNotes() {
		notesOpen = false;
	}

	function toggleMarkedAttribute(attr: AttributeName) {
		if (editing && draft) {
			const marks = draft.markedAttributes ?? [];
			draft.markedAttributes = marks.includes(attr)
				? marks.filter((a) => a !== attr)
				: [...marks, attr];
		} else if (character) {
			const marks = character.markedAttributes ?? [];
			characterStore.updateCharacter({
				...character,
				markedAttributes: marks.includes(attr) ? marks.filter((a) => a !== attr) : [...marks, attr]
			});
		}
	}

	function toggleSpark(index: 0 | 1) {
		if (editing && draft) {
			const spark: [boolean, boolean] = [...(draft.spark ?? [false, false])] as [boolean, boolean];
			spark[index] = !spark[index];
			draft.spark = spark;
		} else if (character) {
			const spark: [boolean, boolean] = [...(character.spark ?? [false, false])] as [
				boolean,
				boolean
			];
			spark[index] = !spark[index];
			characterStore.updateCharacter({ ...character, spark });
		}
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
{:else if character && draft}
	{@const displayChar = editing ? draft : character}
	{@const feature = getArchetypeFeature(displayChar.archetype)}
	{@const essence = essencePool(displayChar)}

	<div class="min-h-screen bg-neutral-900 p-8 pl-16 text-neutral-200">
		<div class="mx-auto max-w-4xl">
			<!-- Action Bar -->
			<div
				class="sticky top-0 z-10 -mx-8 mb-6 flex gap-2 border-b border-neutral-700 bg-neutral-900/95 px-8 py-3 backdrop-blur"
			>
				{#if editing}
					<button
						onclick={saveEdits}
						class="rounded bg-amber-700 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-600"
					>
						Save
					</button>
					<button
						onclick={cancelEditing}
						class="rounded bg-neutral-700 px-4 py-2 text-sm transition hover:bg-neutral-600"
					>
						Cancel
					</button>
				{:else}
					<button
						onclick={startEditing}
						class="rounded border border-neutral-600 px-4 py-2 text-sm text-neutral-300 transition hover:border-amber-500 hover:text-amber-400"
					>
						Edit
					</button>
					<button
						onclick={openNotes}
						class="rounded border border-neutral-600 px-4 py-2 text-sm text-neutral-300 transition hover:border-amber-500 hover:text-amber-400"
					>
						Notes
					</button>
					{#if canLevelUp(character)}
						<button
							onclick={openLevelUp}
							class="rounded border border-amber-700 bg-amber-900/20 px-4 py-2 text-sm font-semibold text-amber-400 transition hover:bg-amber-800/30"
						>
							Level Up → {character.level + 1}
						</button>
					{/if}
				{/if}
			</div>

			<!-- Header -->
			<div class="mb-8">
				{#if editing}
					<input
						type="text"
						bind:value={draft.name}
						class="mb-1 w-full border-b-2 border-amber-600 bg-transparent text-4xl font-bold text-neutral-200 outline-none focus:border-amber-400"
					/>
				{:else}
					<h1 class="mb-1 text-4xl font-bold">{character.name}</h1>
				{/if}
				<p class="text-lg tracking-wide text-amber-400 uppercase">
					Level {displayChar.level} — {displayChar.archetype}
				</p>
				{#if editing}
					<input
						type="text"
						bind:value={draft.summary}
						placeholder="One-line summary…"
						class="mt-2 w-full border-b border-neutral-600 bg-transparent text-neutral-400 italic outline-none focus:border-amber-400"
					/>
				{:else if displayChar.summary}
					<p class="mt-2 text-neutral-400 italic">{displayChar.summary}</p>
				{/if}
			</div>

			<!-- Portrait -->
			<div class="mb-8 flex items-center gap-6">
				<div
					class="flex h-28 w-28 shrink-0 items-center justify-center rounded border border-neutral-700 bg-neutral-800"
				>
					{#if displayChar.portrait}
						<img
							src={displayChar.portrait}
							alt={displayChar.name}
							class="h-full w-full rounded object-cover"
						/>
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-12 w-12 text-neutral-600"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path
								d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"
							/>
						</svg>
					{/if}
				</div>
				<div class="text-sm text-neutral-500">Portrait — image upload coming soon</div>
			</div>

			<!-- Attributes -->
			<div class="mb-8">
				<div class="grid grid-cols-2 gap-x-8 gap-y-0 md:grid-cols-[1fr_1fr_auto_1fr_1fr]">
					<!-- Brawns -->
					<div class="rounded border border-neutral-700 bg-neutral-800 p-4 text-center">
						<div class="text-sm tracking-wide text-neutral-400 uppercase">
							{attributeLabels.brawns}
						</div>
						{#if editing}
							<input
								type="number"
								min="0"
								max="4"
								bind:value={draft.attributes.brawns}
								class="mx-auto mt-1 w-16 rounded border border-neutral-600 bg-neutral-900 text-center text-3xl font-bold text-amber-400 outline-none focus:border-amber-400"
							/>
						{:else}
							<div class="text-3xl font-bold text-amber-400">
								{displayChar.attributes.brawns}
							</div>
						{/if}
						{#if displayChar.level >= 5}
							<label class="mt-2 flex cursor-pointer items-center justify-center gap-1">
								<input
									type="checkbox"
									checked={(displayChar.markedAttributes ?? []).includes('brawns')}
									onchange={() => toggleMarkedAttribute('brawns')}
									class="h-3.5 w-3.5 cursor-pointer appearance-none rounded border-2 border-amber-600 bg-neutral-900 transition checked:bg-amber-600"
								/>
								<span class="text-[10px] tracking-wide text-neutral-500 uppercase">Marked</span>
							</label>
						{/if}
					</div>
					<!-- Agility -->
					<div class="rounded border border-neutral-700 bg-neutral-800 p-4 text-center">
						<div class="text-sm tracking-wide text-neutral-400 uppercase">
							{attributeLabels.agility}
						</div>
						{#if editing}
							<input
								type="number"
								min="0"
								max="4"
								bind:value={draft.attributes.agility}
								class="mx-auto mt-1 w-16 rounded border border-neutral-600 bg-neutral-900 text-center text-3xl font-bold text-amber-400 outline-none focus:border-amber-400"
							/>
						{:else}
							<div class="text-3xl font-bold text-amber-400">
								{displayChar.attributes.agility}
							</div>
						{/if}
						{#if displayChar.level >= 5}
							<label class="mt-2 flex cursor-pointer items-center justify-center gap-1">
								<input
									type="checkbox"
									checked={(displayChar.markedAttributes ?? []).includes('agility')}
									onchange={() => toggleMarkedAttribute('agility')}
									class="h-3.5 w-3.5 cursor-pointer appearance-none rounded border-2 border-amber-600 bg-neutral-900 transition checked:bg-amber-600"
								/>
								<span class="text-[10px] tracking-wide text-neutral-500 uppercase">Marked</span>
							</label>
						{/if}
					</div>
					<!-- Spacer (desktop only) -->
					<div class="hidden md:block"></div>
					<!-- Wits -->
					<div class="rounded border border-neutral-700 bg-neutral-800 p-4 text-center">
						<div class="text-sm tracking-wide text-neutral-400 uppercase">
							{attributeLabels.wits}
						</div>
						{#if editing}
							<input
								type="number"
								min="0"
								max="4"
								bind:value={draft.attributes.wits}
								class="mx-auto mt-1 w-16 rounded border border-neutral-600 bg-neutral-900 text-center text-3xl font-bold text-amber-400 outline-none focus:border-amber-400"
							/>
						{:else}
							<div class="text-3xl font-bold text-amber-400">
								{displayChar.attributes.wits}
							</div>
						{/if}
						{#if displayChar.level >= 5}
							<label class="mt-2 flex cursor-pointer items-center justify-center gap-1">
								<input
									type="checkbox"
									checked={(displayChar.markedAttributes ?? []).includes('wits')}
									onchange={() => toggleMarkedAttribute('wits')}
									class="h-3.5 w-3.5 cursor-pointer appearance-none rounded border-2 border-amber-600 bg-neutral-900 transition checked:bg-amber-600"
								/>
								<span class="text-[10px] tracking-wide text-neutral-500 uppercase">Marked</span>
							</label>
						{/if}
					</div>
					<!-- Presence -->
					<div class="rounded border border-neutral-700 bg-neutral-800 p-4 text-center">
						<div class="text-sm tracking-wide text-neutral-400 uppercase">
							{attributeLabels.presence}
						</div>
						{#if editing}
							<input
								type="number"
								min="0"
								max="4"
								bind:value={draft.attributes.presence}
								class="mx-auto mt-1 w-16 rounded border border-neutral-600 bg-neutral-900 text-center text-3xl font-bold text-amber-400 outline-none focus:border-amber-400"
							/>
						{:else}
							<div class="text-3xl font-bold text-amber-400">
								{displayChar.attributes.presence}
							</div>
						{/if}
						{#if displayChar.level >= 5}
							<label class="mt-2 flex cursor-pointer items-center justify-center gap-1">
								<input
									type="checkbox"
									checked={(displayChar.markedAttributes ?? []).includes('presence')}
									onchange={() => toggleMarkedAttribute('presence')}
									class="h-3.5 w-3.5 cursor-pointer appearance-none rounded border-2 border-amber-600 bg-neutral-900 transition checked:bg-amber-600"
								/>
								<span class="text-[10px] tracking-wide text-neutral-500 uppercase">Marked</span>
							</label>
						{/if}
					</div>

					<!-- Bloodied row: spans first 2 cols -->
					<div class="col-span-2 flex flex-col items-center py-2">
						<div class="flex w-full items-center gap-2 px-4">
							<div class="h-0 flex-1 border-t border-dotted border-red-700/50"></div>
							<label class="flex cursor-pointer items-center gap-2">
								<input
									type="checkbox"
									checked={displayChar.bloodied}
									onchange={() => {
										if (editing && draft) {
											draft.bloodied = !draft.bloodied;
										} else if (character) {
											characterStore.updateCharacter({
												...character,
												bloodied: !character.bloodied
											});
										}
									}}
									class="h-4 w-4 cursor-pointer appearance-none rounded border-2 border-red-700 bg-neutral-900 transition checked:bg-red-700"
								/>
								<span class="text-xs font-semibold tracking-wide text-red-400 uppercase"
									>Bloodied</span
								>
							</label>
							<div class="h-0 flex-1 border-t border-dotted border-red-700/50"></div>
						</div>
					</div>
					<!-- Spacer (desktop only) -->
					<div class="hidden md:block"></div>
					<!-- Rattled row: spans last 2 cols -->
					<div class="col-span-2 flex flex-col items-center py-2">
						<div class="flex w-full items-center gap-2 px-4">
							<div class="h-0 flex-1 border-t border-dotted border-violet-700/50"></div>
							<label class="flex cursor-pointer items-center gap-2">
								<input
									type="checkbox"
									checked={displayChar.rattled}
									onchange={() => {
										if (editing && draft) {
											draft.rattled = !draft.rattled;
										} else if (character) {
											characterStore.updateCharacter({ ...character, rattled: !character.rattled });
										}
									}}
									class="h-4 w-4 cursor-pointer appearance-none rounded border-2 border-violet-700 bg-neutral-900 transition checked:bg-violet-700"
								/>
								<span class="text-xs font-semibold tracking-wide text-violet-400 uppercase"
									>Rattled</span
								>
							</label>
							<div class="h-0 flex-1 border-t border-dotted border-violet-700/50"></div>
						</div>
					</div>

					<!-- Spark row: full width, level 5+ only -->
					{#if displayChar.level >= 5}
						<div class="col-span-2 flex flex-col items-center pt-3 md:col-span-5">
							<div class="flex items-center gap-3">
								<span class="text-xs font-semibold tracking-wide text-yellow-400 uppercase"
									>Spark</span
								>
								{#each [0, 1] as i}
									<label class="cursor-pointer">
										<input
											type="checkbox"
											checked={(displayChar.spark ?? [false, false])[i]}
											onchange={() => toggleSpark(i as 0 | 1)}
											class="h-5 w-5 cursor-pointer appearance-none rounded-full border-2 border-yellow-500 bg-neutral-900 transition checked:bg-yellow-500"
										/>
									</label>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>

			<!-- Grit, Sanity & Essence -->
			<div class="mb-8 flex flex-wrap gap-6">
				<div class="rounded border border-neutral-700 bg-neutral-800 px-5 py-3">
					<span class="text-sm text-neutral-400">Grit</span>
					{#if editing}
						<input
							type="number"
							min="0"
							bind:value={draft.grit}
							class="ml-2 w-12 rounded border border-neutral-600 bg-neutral-900 text-center text-xl font-bold text-amber-400 outline-none focus:border-amber-400"
						/>
					{:else}
						<span class="ml-2 text-xl font-bold text-amber-400">{displayChar.grit}</span>
					{/if}
				</div>
				<div class="rounded border border-neutral-700 bg-neutral-800 px-5 py-3">
					<span class="text-sm text-neutral-400">Sanity</span>
					{#if editing}
						<input
							type="number"
							min="0"
							bind:value={draft.sanity}
							class="ml-2 w-12 rounded border border-neutral-600 bg-neutral-900 text-center text-xl font-bold text-amber-400 outline-none focus:border-amber-400"
						/>
					{:else}
						<span class="ml-2 text-xl font-bold text-amber-400">{displayChar.sanity}</span>
					{/if}
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
				<!-- Ancestry -->
				<div>
					<div class="font-semibold text-neutral-400">Ancestry</div>
					<div class="flex items-center gap-3">
						{#if editing}
							<input
								type="text"
								bind:value={draft.ancestry.name}
								class="rounded border border-neutral-600 bg-neutral-900 px-2 py-1 text-neutral-200 outline-none focus:border-amber-400"
							/>
							{@const ancestryLimit = getAncestryAttributeLimit(draft.ancestry.name)}
							{#if ancestryLimit === 0}
								<span class="text-xs text-neutral-500 italic">No attribute bonuses</span>
							{:else}
								<div class="flex gap-1">
									{#each ATTRIBUTE_NAMES as attr}
										<button
											onclick={() => toggleTraitAttribute('ancestry', attr)}
											class={`rounded px-2 py-1 text-xs uppercase transition ${
												draft.ancestry.assignedAttributes.includes(attr)
													? 'bg-amber-800 text-amber-200'
													: draft.ancestry.assignedAttributes.length >= ancestryLimit
														? 'cursor-not-allowed bg-neutral-800 text-neutral-600'
														: 'bg-neutral-700 text-neutral-500 hover:bg-neutral-600'
											}`}
										>
											{attributeLabels[attr]}
										</button>
									{/each}
								</div>
							{/if}
						{:else}
							<span>{displayChar.ancestry.name}</span>
							{#each displayChar.ancestry.assignedAttributes as attr}
								<span class="rounded bg-amber-800 px-2 py-1 text-xs uppercase">
									{attributeLabels[attr]}
								</span>
							{/each}
						{/if}
					</div>
				</div>

				<!-- Vocation -->
				<div>
					<div class="font-semibold text-neutral-400">Vocation</div>
					<div class="flex items-center gap-3">
						{#if editing}
							<input
								type="text"
								bind:value={draft.vocation.name}
								class="rounded border border-neutral-600 bg-neutral-900 px-2 py-1 text-neutral-200 outline-none focus:border-amber-400"
							/>
							{#if draft.archetype === 'deft'}
								<span class="text-xs text-neutral-500 italic">Applies to any attribute</span>
							{:else}
								<div class="flex gap-1">
									{#each ATTRIBUTE_NAMES as attr}
										<button
											onclick={() => toggleTraitAttribute('vocation', attr)}
											class={`rounded px-2 py-1 text-xs uppercase transition ${
												draft.vocation.assignedAttributes.includes(attr)
													? 'bg-amber-800 text-amber-200'
													: draft.vocation.assignedAttributes.length >=
														  TRAIT_ATTRIBUTE_LIMITS.vocation
														? 'cursor-not-allowed bg-neutral-800 text-neutral-600'
														: 'bg-neutral-700 text-neutral-500 hover:bg-neutral-600'
											}`}
										>
											{attributeLabels[attr]}
										</button>
									{/each}
								</div>
							{/if}
						{:else}
							<span>{displayChar.vocation.name}</span>
							{#if displayChar.archetype === 'deft'}
								<span class="text-xs text-neutral-500 italic">Applies to any attribute</span>
							{:else}
								{#each displayChar.vocation.assignedAttributes as attr}
									<span class="rounded bg-amber-800 px-2 py-1 text-xs uppercase">
										{attributeLabels[attr]}
									</span>
								{/each}
							{/if}
						{/if}
					</div>
				</div>

				<!-- Affiliation -->
				<div>
					<div class="font-semibold text-neutral-400">Affiliation</div>
					<div class="flex items-center gap-3">
						{#if editing}
							<input
								type="text"
								bind:value={draft.affiliations[0].name}
								class="rounded border border-neutral-600 bg-neutral-900 px-2 py-1 text-neutral-200 outline-none focus:border-amber-400"
							/>
							<div class="flex gap-1">
								{#each ATTRIBUTE_NAMES as attr}
									<button
										onclick={() => toggleTraitAttribute('affiliation', attr)}
										class={`rounded px-2 py-1 text-xs uppercase transition ${
											draft.affiliations[0]?.assignedAttributes.includes(attr)
												? 'bg-amber-800 text-amber-200'
												: (draft.affiliations[0]?.assignedAttributes.length ?? 0) >=
													  TRAIT_ATTRIBUTE_LIMITS.affiliation
													? 'cursor-not-allowed bg-neutral-800 text-neutral-600'
													: 'bg-neutral-700 text-neutral-500 hover:bg-neutral-600'
										}`}
									>
										{attributeLabels[attr]}
									</button>
								{/each}
							</div>
						{:else}
							<span>{displayChar.affiliations[0]?.name}</span>
							{#each displayChar.affiliations[0]?.assignedAttributes ?? [] as attr}
								<span class="rounded bg-amber-800 px-2 py-1 text-xs uppercase">
									{attributeLabels[attr]}
								</span>
							{/each}
						{/if}
					</div>
				</div>
			</div>

			<!-- Archetype Feature -->
			{#if feature}
				<div class="mb-8 rounded border border-neutral-700 bg-neutral-800 p-5">
					<h3 class="mb-2 text-lg font-semibold text-amber-400">{feature.name}</h3>
					<div class="prose prose-sm max-w-none prose-invert prose-amber">
						{@html marked(feature.description)}
					</div>
				</div>
			{/if}

			<!-- Moves -->
			<div class="mb-8">
				<h3 class="mb-3 text-xl font-semibold text-amber-400">
					{MoveNames[displayChar.archetype]}
				</h3>

				<div class="space-y-4">
					{#each displayChar.moves as slot, slotIndex}
						<div class="rounded border border-neutral-700 bg-neutral-900 p-4">
							<div class="mb-2 text-sm tracking-wide text-neutral-500 uppercase">
								{slot.type}
							</div>

							{#each slot.moves as move, moveIndex}
								<div
									class={`mb-2 flex items-center gap-2 rounded px-3 py-2 ${
										move.active === true
											? 'bg-amber-700 text-black'
											: move.active === false
												? 'bg-neutral-800 text-neutral-400'
												: 'bg-neutral-800'
									}`}
								>
									{#if editing}
										<input
											type="text"
											bind:value={draft.moves[slotIndex].moves[moveIndex].name}
											class="flex-1 rounded border border-neutral-600 bg-neutral-900 px-2 py-1 text-sm text-neutral-200 outline-none focus:border-amber-400"
										/>
										{#if move.active !== undefined}
											<button
												onclick={() => {
													if (!draft) return;
													const activating = !draft.moves[slotIndex].moves[moveIndex].active;
													if (activating) {
														// Deactivate all other moves in this slot
														for (const m of draft.moves[slotIndex].moves) {
															m.active = false;
														}
													}
													draft.moves[slotIndex].moves[moveIndex].active = activating;
												}}
												class={`rounded px-2 py-1 text-xs uppercase transition ${
													draft.moves[slotIndex].moves[moveIndex].active
														? 'bg-amber-600 text-black'
														: 'bg-neutral-700 text-neutral-400 hover:bg-neutral-600'
												}`}
											>
												{draft.moves[slotIndex].moves[moveIndex].active ? 'Active' : 'Inactive'}
											</button>
										{/if}
									{:else}
										<span class="flex-1">{move.name}</span>
										{#if move.active !== undefined}
											<span class="text-xs tracking-wide uppercase">
												{move.active ? 'Active' : 'Inactive'}
											</span>
										{/if}
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
				{#if editing}
					<div class="space-y-2">
						{#each draft.experiences as exp, i}
							<div class="flex items-center gap-2">
								<input
									type="text"
									bind:value={draft.experiences[i].name}
									class="flex-1 rounded border border-neutral-600 bg-neutral-900 px-3 py-2 text-neutral-200 outline-none focus:border-amber-400"
								/>
								<button
									onclick={() => removeExperience(i)}
									class="rounded p-2 text-neutral-600 transition hover:bg-red-900/40 hover:text-red-400"
									title="Remove experience"
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
							</div>
						{/each}
						<button
							onclick={addExperience}
							class="rounded border border-dashed border-neutral-600 px-3 py-2 text-sm text-neutral-500 transition hover:border-amber-500 hover:text-amber-400"
						>
							+ Add Experience
						</button>
					</div>
				{:else}
					<ul class="list-inside list-disc text-neutral-300">
						{#each displayChar.experiences as exp}
							<li>{exp.name}</li>
						{/each}
					</ul>
				{/if}
			</div>

			<!-- Notes -->
			<div class="mb-8">
				<h3 class="mb-3 text-xl font-semibold text-amber-400">Notes</h3>
				{#if editing}
					<textarea
						bind:value={draft.notes}
						rows="6"
						placeholder="Freeform notes, items, secrets…"
						class="w-full rounded border border-neutral-600 bg-neutral-900 px-4 py-3 text-neutral-200 placeholder-neutral-600 outline-none focus:border-amber-400"
					></textarea>
				{:else}
					<p class="whitespace-pre-wrap text-neutral-300">
						{#if displayChar.notes}
							{displayChar.notes}
						{:else}
							<span class="text-neutral-500 italic">No notes yet.</span>
						{/if}
					</p>
				{/if}
			</div>

			<!-- Delete -->
			<div class="border-t border-neutral-700 pt-6">
				{#if confirmingDelete}
					<div class="flex items-center gap-4">
						<span class="text-sm text-red-400">Banish this soul forever?</span>
						<button
							onclick={removeCharacter}
							class="rounded bg-red-700 px-4 py-2 text-sm font-semibold transition hover:bg-red-600"
						>
							Yes, Banish
						</button>
						<button
							onclick={() => (confirmingDelete = false)}
							class="rounded bg-neutral-700 px-4 py-2 text-sm transition hover:bg-neutral-600"
						>
							Cancel
						</button>
					</div>
				{:else}
					<button
						onclick={() => (confirmingDelete = true)}
						class="rounded border border-red-800 px-4 py-2 text-sm text-red-400 transition hover:bg-red-900/30"
					>
						Banish This Soul
					</button>
				{/if}
			</div>
		</div>
	</div>
	<!-- Level Up Modal -->
	{#if levelUpOpen && levelUpResult && character}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
			onclick={(e) => {
				if (e.target === e.currentTarget) cancelLevelUp();
			}}
			role="dialog"
			aria-modal="true"
			aria-label="Level Up"
		>
			<div
				class="mx-4 w-full max-w-lg rounded-lg border border-amber-700 bg-neutral-900 p-6 shadow-2xl"
			>
				<h2 class="mb-1 text-2xl font-bold text-amber-400">
					Level Up to {levelUpResult.character.level}
				</h2>
				<p class="mb-4 text-sm text-neutral-400">
					Gains: {levelUpSummary(levelUpResult.character.level).join(', ')}
				</p>

				{#if levelUpResult.grantsAttribute}
					<p class="mb-4 text-sm text-neutral-300">Choose an attribute to increase:</p>
					<div class="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
						{#each ATTRIBUTE_NAMES as attr}
							{@const canIncrease = canIncreaseAttribute(
								character,
								attr,
								levelUpResult.character.level
							)}
							<button
								onclick={() => {
									if (canIncrease) selectedAttribute = attr;
								}}
								disabled={!canIncrease}
								class={`rounded border p-3 text-center transition ${
									selectedAttribute === attr
										? 'border-amber-400 bg-amber-700/30 ring-2 ring-amber-400'
										: canIncrease
											? 'border-amber-600 bg-neutral-800 hover:bg-amber-700/20 hover:text-amber-400'
											: 'cursor-not-allowed border-neutral-700 bg-neutral-800 text-neutral-600'
								}`}
							>
								<div class="text-xs tracking-wide uppercase">
									{attributeLabels[attr]}
								</div>
								<div class="text-2xl font-bold text-amber-400">
									{character.attributes[attr]}
								</div>
								{#if canIncrease}
									<div class="text-xs text-amber-500">→ {character.attributes[attr] + 1}</div>
								{:else}
									<div class="text-xs text-neutral-600">max</div>
								{/if}
							</button>
						{/each}
					</div>
				{/if}

				<div class="flex justify-end gap-3">
					<button
						onclick={cancelLevelUp}
						class="rounded bg-neutral-700 px-4 py-2 text-sm transition hover:bg-neutral-600"
					>
						Cancel
					</button>
					<button
						onclick={randomLevelUp}
						class="rounded border border-amber-700 bg-neutral-800 px-4 py-2 text-sm font-semibold text-amber-400 transition hover:bg-amber-700/20"
					>
						🎲 Random
					</button>
					<button
						onclick={confirmLevelUp}
						disabled={levelUpResult.grantsAttribute && !selectedAttribute}
						class={`rounded px-4 py-2 text-sm font-semibold transition ${
							levelUpResult.grantsAttribute && !selectedAttribute
								? 'cursor-not-allowed bg-neutral-700 text-neutral-500'
								: 'bg-amber-700 text-black hover:bg-amber-600'
						}`}
					>
						Confirm Level Up
					</button>
				</div>
			</div>
		</div>
	{/if}
	<!-- Notes Modal -->
	{#if notesOpen && character}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
			onclick={(e) => {
				if (e.target === e.currentTarget) cancelNotes();
			}}
			role="dialog"
			aria-modal="true"
			aria-label="Edit Notes"
		>
			<div
				class="mx-4 flex w-full max-w-lg flex-col rounded-lg border border-amber-700 bg-neutral-900 p-6 shadow-2xl"
			>
				<h2 class="mb-4 text-2xl font-bold text-amber-400">Notes</h2>
				<textarea
					bind:value={notesDraft}
					rows="10"
					placeholder="Freeform notes, items, secrets…"
					class="mb-4 w-full flex-1 rounded border border-neutral-600 bg-neutral-800 px-4 py-3 text-neutral-200 placeholder-neutral-600 outline-none focus:border-amber-400"
				></textarea>
				<div class="flex justify-end gap-3">
					<button
						onclick={cancelNotes}
						class="rounded bg-neutral-700 px-4 py-2 text-sm transition hover:bg-neutral-600"
					>
						Cancel
					</button>
					<button
						onclick={saveNotes}
						class="rounded bg-amber-700 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-600"
					>
						Save Notes
					</button>
				</div>
			</div>
		</div>
	{/if}
{:else}
	<div class="flex min-h-screen items-center justify-center bg-neutral-900 text-neutral-200">
		<p class="text-neutral-400">Loading...</p>
	</div>
{/if}
