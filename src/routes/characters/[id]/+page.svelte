<script lang="ts">
	import { marked } from 'marked';
	import {
		type Character,
		type AttributeName,
		MoveNames
	} from '$lib/models/character';
	import { ARCHETYPES } from '$lib/content/archetypes';
	import { ANCESTRIES } from '$lib/content/ancestries';
	import { EXPERIENCES } from '$lib/content/experiences';
	import { STRONG_PREFIX, STRONG_SUFFIX } from '$lib/content/moves/strong';
	import { DEFT_PREFIX, DEFT_SUFFIX } from '$lib/content/moves/deft';
	import { WISE_PREFIX, WISE_SUFFIX } from '$lib/content/moves/wise';
	import { characterStore } from '$lib/stores/characterStore';
	import TiptapEditor from '$lib/components/TiptapEditor.svelte';
	import WaxSealAttribute from '$lib/components/WaxSealAttribute.svelte';
	import StatBadge from '$lib/components/StatBadge.svelte';
	import StatusRow from '$lib/components/StatusRow.svelte';
	import TraitRow from '$lib/components/TraitRow.svelte';
	import MoveSlotCard from '$lib/components/MoveSlotCard.svelte';
	import CharacterPortrait from '$lib/components/CharacterPortrait.svelte';
	import XpTracker from '$lib/components/XpTracker.svelte';
	import ArchetypeFeatureCard from '$lib/components/ArchetypeFeatureCard.svelte';
	import PortraitUploadModal from '$lib/components/PortraitUploadModal.svelte';
	import LevelUpModal from '$lib/components/LevelUpModal.svelte';
	import NotesModal from '$lib/components/NotesModal.svelte';
	import {
		canLevelUp,
		levelUp,
		applyAttributeIncrease,
		canIncreaseAttribute,
		MAX_LEVEL,
		XP_THRESHOLDS
	} from '$lib/generator/leveling';
	import { goto } from '$app/navigation';
	import { untrack } from 'svelte';

	let { params } = $props();

	let character: Character | null = $state(null);
	let notFound = $state(false);
	let editing = $state(false);
	let currentEssence = $state(0);
	let maxEssence = $derived.by(() => {
		const char = editing ? draft : character;
		if (char?.archetype !== 'wise') return;
		const vocationAttr = char.vocation.assignedAttributes[0];
		let max = char.level + (char.attributes[vocationAttr] ?? 0);
		return max;
	});

	$effect(() => {
		const newEssence = Math.min(currentEssence, maxEssence ?? 0);
		if (newEssence >= currentEssence) return;
		currentEssence = newEssence;
	});

	let draft: Character | null = $state(null);

	const ATTRIBUTE_NAMES: AttributeName[] = ['brawns', 'agility', 'wits', 'presence'];

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
					currentEssence = character?.essence?.current ?? 0;
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
		draft.essence = { max: maxEssence ?? 0, current: currentEssence ?? 0 };
		characterStore.updateCharacter(draft);
		editing = false;
	}

	function getArchetypeFeature(archetype: string) {
		return ARCHETYPES.find((a) => a.id === archetype)?.feature ?? null;
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
	let levelUpOpen = $state(false);
	let levelUpResult: import('$lib/generator/leveling').LevelUpResult | null = $state(null);

	function removeCharacter() {
		if (!character) return;
		characterStore.remove(character.id);
		goto('/');
	}

	function openLevelUp() {
		if (!character || !canLevelUp(character)) return;
		const result = levelUp(character);
		levelUpResult = result;
		levelUpOpen = true;
	}

	function cancelLevelUp() {
		levelUpOpen = false;
		levelUpResult = null;
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
	}

	function openNotes() {
		if (!character) return;
		notesOpen = true;
	}

	function cancelNotes() {
		notesOpen = false;
	}

	let portraitModalOpen = $state(false);

	function openPortraitModal() {
		portraitModalOpen = true;
	}

	function savePortrait(dataUrl: string) {
		if (editing && draft) {
			draft.portrait = dataUrl;
		} else if (character) {
			characterStore.updateCharacter({ ...character, portrait: dataUrl });
		}
		portraitModalOpen = false;
	}

	function removePortrait() {
		if (editing && draft) {
			draft.portrait = undefined;
		} else if (character) {
			characterStore.updateCharacter({ ...character, portrait: undefined });
		}
		portraitModalOpen = false;
	}

	function cancelPortraitModal() {
		portraitModalOpen = false;
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

	function adjustXp(delta: number) {
		if (!character) return;
		const current = character.xp ?? 0;
		const newXp = Math.max(0, current + delta);
		characterStore.updateCharacter({ ...character, xp: newXp });
	}

	function fillXpToNextLevel() {
		if (!character) return;
		const nextLevel = character.level + 1;
		if (character.level >= MAX_LEVEL) return;
		const needed = XP_THRESHOLDS[nextLevel] ?? null;
		if (needed === null) return;
		characterStore.updateCharacter({ ...character, xp: needed });
	}
</script>

{#if notFound}
	<div class="flex min-h-screen items-center justify-center" style="color: var(--text-primary);">
		<div class="text-center">
			<h1 class="mb-4 text-3xl font-bold">Soul Not Found</h1>
			<p class="mb-6" style="color: var(--text-secondary);">
				This wretch has been lost to the void.
			</p>
			<a href="/characters" class="underline" style="color: var(--color-gold);">
				Return to Preserved Souls
			</a>
		</div>
	</div>
{:else if character && draft}
	{@const displayChar = editing ? draft : character}
	{@const feature = getArchetypeFeature(displayChar.archetype)}

	<div class="min-h-screen p-8" style="color: var(--text-primary);">
		<div class="mx-auto max-w-4xl">
			<!-- Action Bar -->
			<div
				class="sticky top-[49px] z-10 -mx-8 mb-6 flex gap-2 border-b px-8 py-3 backdrop-blur"
				style="background-color: color-mix(in srgb, var(--bg-base) 92%, transparent); border-color: var(--border-color);"
			>
				{#if editing}
					<button
						onclick={saveEdits}
						class="rounded px-4 py-2 text-sm font-semibold transition hover:opacity-80"
						style="font-family: var(--font-heading); background: linear-gradient(135deg, var(--color-gold), var(--color-gold-dark)); color: var(--bg-base);"
					>
						Save
					</button>
					<button
						onclick={cancelEditing}
						class="rounded px-4 py-2 text-sm transition hover:opacity-80"
						style="background-color: var(--bg-elevated); color: var(--text-secondary);"
					>
						Cancel
					</button>
				{:else}
					<button
						onclick={startEditing}
						class="rounded border px-4 py-2 text-sm transition hover:opacity-80"
						style="font-family: var(--font-heading); border-color: var(--border-color); color: var(--text-secondary);"
					>
						Edit
					</button>
					<button
						onclick={openNotes}
						class="rounded border px-4 py-2 text-sm transition hover:opacity-80"
						style="font-family: var(--font-heading); border-color: var(--border-color); color: var(--text-secondary);"
					>
						Notes
					</button>
					{#if canLevelUp(character)}
						<button
							onclick={openLevelUp}
							class="rounded border px-4 py-2 text-sm font-semibold transition hover:opacity-80"
							style="font-family: var(--font-heading); border-color: var(--color-gold-dark); background: rgba(184,159,93,0.1); color: var(--color-gold);"
						>
							Level Up → {character.level + 1}
						</button>
					{/if}
					<div class="ml-auto">
						{#if confirmingDelete}
							<div class="flex items-center gap-2">
								<span class="banish-text text-sm font-semibold">Banish forever?</span>
								<button
									onclick={removeCharacter}
									class="banish-btn-confirm rounded px-3 py-1.5 text-sm font-semibold transition hover:opacity-80"
								>
									Yes, Banish
								</button>
								<button
									onclick={() => (confirmingDelete = false)}
									class="rounded px-3 py-1.5 text-sm transition"
									style="background: var(--bg-elevated); color: var(--text-secondary);"
								>
									Cancel
								</button>
							</div>
						{:else}
							<button
								onclick={() => (confirmingDelete = true)}
								class="banish-btn rounded border px-4 py-2 text-sm transition hover:opacity-80"
								style="font-family: var(--font-heading);"
							>
								Banish This Soul
							</button>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Header with Portrait -->
			<div class="mb-8 flex items-start gap-5">
				<!-- Portrait -->
				<CharacterPortrait
					portrait={displayChar.portrait}
					name={displayChar.name}
					{editing}
					onclick={openPortraitModal}
				/>

				<!-- Name / Level / Summary -->
				<div class="min-w-0 flex-1">
					{#if editing}
						<input
							type="text"
							bind:value={draft.name}
							class="mb-1 w-full border-b-2 bg-transparent text-4xl font-bold outline-none"
							style="border-color: var(--color-gold); color: var(--text-primary);"
						/>
					{:else}
						<h1 class="mb-1 text-4xl font-bold">{character.name}</h1>
					{/if}
					<p class="text-lg tracking-wide uppercase" style="color: var(--color-gold);">
						Level {displayChar.level} — {displayChar.archetype}
					</p>
					{#if editing}
						<input
							type="text"
							bind:value={draft.summary}
							placeholder="One-line summary…"
							class="mt-2 w-full border-b bg-transparent italic outline-none"
							style="border-color: var(--border-color); color: var(--text-secondary);"
						/>
					{:else if displayChar.summary}
						<p class="mt-2 italic" style="color: var(--text-secondary);">{displayChar.summary}</p>
					{/if}
				</div>

				<!-- XP Tracker -->
				<XpTracker
					{character}
					{editing}
					onadjustxp={adjustXp}
					onfillxp={fillXpToNextLevel}
				/>
			</div>

			<!-- Attributes -->
			<div class="mb-8">
				<div class="grid grid-cols-2 gap-x-8 gap-y-0 md:grid-cols-[1fr_1fr_auto_1fr_1fr]">
					<WaxSealAttribute
						attribute="brawns"
						value={displayChar.attributes.brawns}
						{editing}
						level={displayChar.level}
						markedAttributes={displayChar.markedAttributes ?? []}
						onvaluechange={(v) => { if (draft) draft.attributes.brawns = v; }}
						ontogglemarked={toggleMarkedAttribute}
					/>
					<WaxSealAttribute
						attribute="agility"
						value={displayChar.attributes.agility}
						{editing}
						level={displayChar.level}
						markedAttributes={displayChar.markedAttributes ?? []}
						onvaluechange={(v) => { if (draft) draft.attributes.agility = v; }}
						ontogglemarked={toggleMarkedAttribute}
					/>
					<!-- Spacer (desktop only) -->
					<div class="hidden md:block"></div>
					<WaxSealAttribute
						attribute="wits"
						value={displayChar.attributes.wits}
						{editing}
						level={displayChar.level}
						markedAttributes={displayChar.markedAttributes ?? []}
						onvaluechange={(v) => { if (draft) draft.attributes.wits = v; }}
						ontogglemarked={toggleMarkedAttribute}
					/>
					<WaxSealAttribute
						attribute="presence"
						value={displayChar.attributes.presence}
						{editing}
						level={displayChar.level}
						markedAttributes={displayChar.markedAttributes ?? []}
						onvaluechange={(v) => { if (draft) draft.attributes.presence = v; }}
						ontogglemarked={toggleMarkedAttribute}
					/>

					<StatusRow
						label="Bloodied"
						color="red"
						checked={displayChar.bloodied}
						onchange={() => {
							if (editing && draft) {
								draft.bloodied = !draft.bloodied;
							} else if (character) {
								characterStore.updateCharacter({ ...character, bloodied: !character.bloodied });
							}
						}}
					/>
					<!-- Spacer (desktop only) -->
					<div class="hidden md:block"></div>
					<StatusRow
						label="Rattled"
						color="violet"
						checked={displayChar.rattled}
						onchange={() => {
							if (editing && draft) {
								draft.rattled = !draft.rattled;
							} else if (character) {
								characterStore.updateCharacter({ ...character, rattled: !character.rattled });
							}
						}}
					/>

					<!-- Spark row: full width, level 5+ only -->
					{#if displayChar.level >= 5}
						<div class="col-span-2 flex flex-col items-center pt-3 md:col-span-5">
							<div class="flex items-center gap-3">
								<span
									class="text-xs font-semibold tracking-wide uppercase"
									style="color: var(--color-gold);">Spark</span
								>
								{#each [0, 1] as i}
									<label class="cursor-pointer">
										<input
											type="checkbox"
											checked={(displayChar.spark ?? [false, false])[i]}
											onchange={() => toggleSpark(i as 0 | 1)}
											class="spark-dot h-5 w-5 cursor-pointer appearance-none rounded-full border-2 transition"
											style="border-color: var(--color-gold); background-color: var(--bg-base);"
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
				<StatBadge
					label="Grit"
					value={displayChar.grit}
					{editing}
					onvaluechange={(v) => { if (draft) draft.grit = v; }}
				/>
				<StatBadge
					label="Sanity"
					value={displayChar.sanity}
					{editing}
					onvaluechange={(v) => { if (draft) draft.sanity = v; }}
				/>
				{#if maxEssence && maxEssence > 0}
					<StatBadge
						label="Essence"
						value={editing && maxEssence > 0 ? currentEssence : `${currentEssence}/${maxEssence}`}
						{editing}
						onvaluechange={(v) => { currentEssence = v; }}
					/>
				{/if}
			</div>

			<!-- Traits -->
			<div class="mb-8 space-y-4">
				<TraitRow
					label="Ancestry"
					trait={displayChar.ancestry}
					{editing}
					maxAttributes={editing ? getAncestryAttributeLimit(draft.ancestry.name) : 2}
					onnamechange={(name) => { if (draft) draft.ancestry.name = name; }}
					ontoggleattribute={(attr) => toggleTraitAttribute('ancestry', attr)}
				/>
				<TraitRow
					label="Vocation"
					trait={displayChar.vocation}
					{editing}
					maxAttributes={TRAIT_ATTRIBUTE_LIMITS.vocation}
					noAttributeText={displayChar.archetype === 'deft' ? 'Applies to any attribute' : ''}
					onnamechange={(name) => { if (draft) draft.vocation.name = name; }}
					ontoggleattribute={(attr) => toggleTraitAttribute('vocation', attr)}
				/>
				<TraitRow
					label="Affiliation"
					trait={displayChar.affiliations[0] ?? { name: '', assignedAttributes: [] }}
					{editing}
					maxAttributes={TRAIT_ATTRIBUTE_LIMITS.affiliation}
					onnamechange={(name) => { if (draft) draft.affiliations[0].name = name; }}
					ontoggleattribute={(attr) => toggleTraitAttribute('affiliation', attr)}
				/>
			</div>

			<!-- Archetype Feature -->
			{#if feature}
				<div class="mb-8">
					<ArchetypeFeatureCard name={feature.name} description={feature.description} />
				</div>
			{/if}

			<!-- Moves -->
			<div class="mb-8">
				<h3
					class="mb-3 text-xl font-semibold"
					style="color: var(--color-gold); font-family: var(--font-heading);"
				>
					{MoveNames[displayChar.archetype]}
				</h3>

				<div class="space-y-4">
					{#each displayChar.moves as slot, slotIndex}
						<MoveSlotCard
							{slot}
							{editing}
							onmovechange={(moveIndex, name) => {
								if (!draft) return;
								draft.moves[slotIndex].moves[moveIndex].name = name;
							}}
							ontoggleactive={(moveIndex) => {
								if (!draft) return;
								const activating = !draft.moves[slotIndex].moves[moveIndex].active;
								if (activating) {
									for (const m of draft.moves[slotIndex].moves) {
										m.active = false;
									}
								}
								draft.moves[slotIndex].moves[moveIndex].active = activating;
							}}
						/>
					{/each}
				</div>
			</div>

			<!-- Experiences -->
			<div class="mb-8">
				<h3
					class="mb-3 text-xl font-semibold"
					style="color: var(--color-gold); font-family: var(--font-heading);"
				>
					Experiences
				</h3>
				{#if editing}
					<div class="space-y-2">
						{#each draft.experiences as exp, i}
							<div class="flex items-center gap-2">
								<input
									type="text"
									bind:value={draft.experiences[i].name}
									class="flex-1 rounded border bg-transparent px-3 py-2 outline-none"
									style="border-color: var(--border-color); color: var(--text-primary);"
								/>
								<button
									onclick={() => removeExperience(i)}
									class="rounded p-2 transition hover:bg-red-900/40 hover:text-red-400"
									style="color: var(--text-muted);"
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
							class="rounded border border-dashed px-3 py-2 text-sm transition"
							style="border-color: var(--border-color); color: var(--text-muted);"
						>
							+ Add Experience
						</button>
					</div>
				{:else}
					<ul class="list-inside list-disc" style="color: var(--text-secondary);">
						{#each displayChar.experiences as exp}
							<li>{exp.name}</li>
						{/each}
					</ul>
				{/if}
			</div>

			<!-- Notes -->
			<div class="mb-8">
				<h3
					class="mb-3 text-xl font-semibold"
					style="color: var(--color-gold); font-family: var(--font-heading);"
				>
					Notes
				</h3>
				{#if editing}
					<TiptapEditor
						content={draft.notes ?? ''}
						onupdate={(md) => {
							if (draft) draft.notes = md;
						}}
					/>
				{:else if displayChar.notes}
					<div class="prose prose-sm max-w-none">
						{@html marked(displayChar.notes)}
					</div>
				{:else}
					<p class="italic" style="color: var(--text-muted);">No notes yet.</p>
				{/if}
			</div>
		</div>
	</div>
	<!-- Level Up Modal -->
	<LevelUpModal
		open={levelUpOpen}
		{character}
		{levelUpResult}
		onconfirm={(attr) => {
			if (!levelUpResult) return;
			if (levelUpResult.grantsAttribute) {
				if (!attr) return;
				const withAttr = applyAttributeIncrease(levelUpResult.character, attr);
				characterStore.updateCharacter(withAttr);
			} else {
				characterStore.updateCharacter(levelUpResult.character);
			}
			levelUpOpen = false;
			levelUpResult = null;
		}}
		onrandom={randomLevelUp}
		oncancel={cancelLevelUp}
	/>
	<!-- Portrait Upload Modal -->
	<PortraitUploadModal
		open={portraitModalOpen}
		hasExistingPortrait={!!displayChar.portrait}
		onsave={savePortrait}
		onremove={removePortrait}
		oncancel={cancelPortraitModal}
	/>
	<!-- Notes Modal -->
	<NotesModal
		open={notesOpen}
		content={character.notes ?? ''}
		onsave={(md) => {
			if (!character) return;
			characterStore.updateCharacter({ ...character, notes: md });
			notesOpen = false;
		}}
		oncancel={cancelNotes}
	/>
{:else}
	<div class="flex min-h-screen items-center justify-center" style="color: var(--text-secondary);">
		<p style="color: var(--text-muted);">Loading...</p>
	</div>
{/if}
