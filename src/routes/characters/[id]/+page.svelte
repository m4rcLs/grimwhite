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
	import TiptapEditor from '$lib/components/TiptapEditor.svelte';
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

	// Portrait upload/crop state
	let portraitModalOpen = $state(false);
	let portraitImg: HTMLImageElement | null = $state(null);
	let cropCanvas: HTMLCanvasElement | null = $state(null);
	let cropOffsetX = $state(0);
	let cropOffsetY = $state(0);
	let cropScale = $state(1);
	let isDragging = $state(false);
	let dragStartX = $state(0);
	let dragStartY = $state(0);
	let dragStartOffsetX = $state(0);
	let dragStartOffsetY = $state(0);

	const PORTRAIT_SIZE = 256;

	// Redraw canvas whenever crop params or canvas ref change
	$effect(() => {
		if (cropCanvas && portraitImg) {
			void cropOffsetX;
			void cropOffsetY;
			void cropScale;
			drawCropPreview();
		}
	});

	function openPortraitModal() {
		portraitModalOpen = true;
		portraitImg = null;
		cropOffsetX = 0;
		cropOffsetY = 0;
		cropScale = 1;
	}

	function handlePortraitFile(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			const img = new Image();
			img.onload = () => {
				portraitImg = img;
				// Fit image so the shorter side fills the frame
				const minDim = Math.min(img.width, img.height);
				cropScale = PORTRAIT_SIZE / minDim;
				cropOffsetX = (PORTRAIT_SIZE - img.width * cropScale) / 2;
				cropOffsetY = (PORTRAIT_SIZE - img.height * cropScale) / 2;
				drawCropPreview();
			};
			img.src = reader.result as string;
		};
		reader.readAsDataURL(file);
	}

	function drawCropPreview() {
		if (!cropCanvas || !portraitImg) return;
		const ctx = cropCanvas.getContext('2d');
		if (!ctx) return;
		ctx.clearRect(0, 0, PORTRAIT_SIZE, PORTRAIT_SIZE);
		ctx.fillStyle = '#1a1a1a';
		ctx.fillRect(0, 0, PORTRAIT_SIZE, PORTRAIT_SIZE);
		ctx.drawImage(
			portraitImg,
			cropOffsetX,
			cropOffsetY,
			portraitImg.width * cropScale,
			portraitImg.height * cropScale
		);
	}

	function onCropWheel(e: WheelEvent) {
		e.preventDefault();
		if (!portraitImg) return;
		const delta = e.deltaY > 0 ? 0.95 : 1.05;
		const newScale = Math.max(0.1, Math.min(10, cropScale * delta));
		// Zoom towards center
		const cx = PORTRAIT_SIZE / 2;
		const cy = PORTRAIT_SIZE / 2;
		cropOffsetX = cx - ((cx - cropOffsetX) / cropScale) * newScale;
		cropOffsetY = cy - ((cy - cropOffsetY) / cropScale) * newScale;
		cropScale = newScale;
		drawCropPreview();
	}

	function onCropPointerDown(e: PointerEvent) {
		isDragging = true;
		dragStartX = e.clientX;
		dragStartY = e.clientY;
		dragStartOffsetX = cropOffsetX;
		dragStartOffsetY = cropOffsetY;
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
	}

	function onCropPointerMove(e: PointerEvent) {
		if (!isDragging) return;
		cropOffsetX = dragStartOffsetX + (e.clientX - dragStartX);
		cropOffsetY = dragStartOffsetY + (e.clientY - dragStartY);
		drawCropPreview();
	}

	function onCropPointerUp() {
		isDragging = false;
	}

	function savePortrait() {
		if (!cropCanvas) return;
		const dataUrl = cropCanvas.toDataURL('image/webp', 0.85);
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
	{@const essence = essencePool(displayChar)}

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
				<button
					class="group relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border transition"
					style="border-color: var(--border-color); background-color: var(--bg-surface);"
					onclick={() => {
						if (editing) openPortraitModal();
					}}
					disabled={!editing}
					type="button"
				>
					{#if displayChar.portrait}
						<img
							src={displayChar.portrait}
							alt={displayChar.name}
							class="h-full w-full object-cover"
						/>
					{:else}
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
					{/if}
					{#if editing}
						<div
							class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-6 w-6"
								style="color: var(--color-gold);"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.414-1.414A1 1 0 0011.586 3H8.414a1 1 0 00-.707.293L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
								/>
							</svg>
						</div>
					{/if}
				</button>

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
			</div>

			<!-- Attributes -->
			<div class="mb-8">
				<div class="grid grid-cols-2 gap-x-8 gap-y-0 md:grid-cols-[1fr_1fr_auto_1fr_1fr]">
					<!-- Brawns -->
					<div
						class="wax-seal rounded-lg p-4 text-center"
						style="background: radial-gradient(ellipse at 30% 30%, var(--bg-elevated), var(--bg-surface)); border: 1px solid var(--border-color); box-shadow: inset 0 1px 0 rgba(184, 159, 93, 0.1), inset 0 -2px 4px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.3);"
					>
						<div
							class="text-xs font-semibold tracking-widest uppercase"
							style="font-family: var(--font-heading); color: var(--text-secondary);"
						>
							{attributeLabels.brawns}
						</div>
						{#if editing}
							<input
								type="number"
								min="0"
								max="4"
								bind:value={draft.attributes.brawns}
								class="mx-auto mt-1 w-16 rounded border bg-transparent text-center text-3xl font-bold outline-none"
								style="border-color: var(--border-color); color: var(--color-gold);"
							/>
						{:else}
							<div
								class="text-3xl font-bold"
								style="color: var(--color-gold); text-shadow: 0 0 12px rgba(184, 159, 93, 0.3);"
							>
								{displayChar.attributes.brawns}
							</div>
						{/if}
						{#if displayChar.level >= 5}
							<label class="mt-2 flex cursor-pointer items-center justify-center gap-1">
								<input
									type="checkbox"
									checked={(displayChar.markedAttributes ?? []).includes('brawns')}
									onchange={() => toggleMarkedAttribute('brawns')}
									class="h-3.5 w-3.5 cursor-pointer appearance-none rounded border-2 transition"
									style="border-color: var(--color-gold); background-color: var(--bg-base);"
								/>
								<span class="text-[10px] tracking-wide uppercase" style="color: var(--text-muted);"
									>Marked</span
								>
							</label>
						{/if}
					</div>
					<!-- Agility -->
					<div
						class="wax-seal rounded-lg p-4 text-center"
						style="background: radial-gradient(ellipse at 30% 30%, var(--bg-elevated), var(--bg-surface)); border: 1px solid var(--border-color); box-shadow: inset 0 1px 0 rgba(184, 159, 93, 0.1), inset 0 -2px 4px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.3);"
					>
						<div
							class="text-xs font-semibold tracking-widest uppercase"
							style="font-family: var(--font-heading); color: var(--text-secondary);"
						>
							{attributeLabels.agility}
						</div>
						{#if editing}
							<input
								type="number"
								min="0"
								max="4"
								bind:value={draft.attributes.agility}
								class="mx-auto mt-1 w-16 rounded border bg-transparent text-center text-3xl font-bold outline-none"
								style="border-color: var(--border-color); color: var(--color-gold);"
							/>
						{:else}
							<div
								class="text-3xl font-bold"
								style="color: var(--color-gold); text-shadow: 0 0 12px rgba(184, 159, 93, 0.3);"
							>
								{displayChar.attributes.agility}
							</div>
						{/if}
						{#if displayChar.level >= 5}
							<label class="mt-2 flex cursor-pointer items-center justify-center gap-1">
								<input
									type="checkbox"
									checked={(displayChar.markedAttributes ?? []).includes('agility')}
									onchange={() => toggleMarkedAttribute('agility')}
									class="h-3.5 w-3.5 cursor-pointer appearance-none rounded border-2 transition"
									style="border-color: var(--color-gold); background-color: var(--bg-base);"
								/>
								<span class="text-[10px] tracking-wide uppercase" style="color: var(--text-muted);"
									>Marked</span
								>
							</label>
						{/if}
					</div>
					<!-- Spacer (desktop only) -->
					<div class="hidden md:block"></div>
					<!-- Wits -->
					<div
						class="wax-seal rounded-lg p-4 text-center"
						style="background: radial-gradient(ellipse at 30% 30%, var(--bg-elevated), var(--bg-surface)); border: 1px solid var(--border-color); box-shadow: inset 0 1px 0 rgba(184, 159, 93, 0.1), inset 0 -2px 4px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.3);"
					>
						<div
							class="text-xs font-semibold tracking-widest uppercase"
							style="font-family: var(--font-heading); color: var(--text-secondary);"
						>
							{attributeLabels.wits}
						</div>
						{#if editing}
							<input
								type="number"
								min="0"
								max="4"
								bind:value={draft.attributes.wits}
								class="mx-auto mt-1 w-16 rounded border bg-transparent text-center text-3xl font-bold outline-none"
								style="border-color: var(--border-color); color: var(--color-gold);"
							/>
						{:else}
							<div
								class="text-3xl font-bold"
								style="color: var(--color-gold); text-shadow: 0 0 12px rgba(184, 159, 93, 0.3);"
							>
								{displayChar.attributes.wits}
							</div>
						{/if}
						{#if displayChar.level >= 5}
							<label class="mt-2 flex cursor-pointer items-center justify-center gap-1">
								<input
									type="checkbox"
									checked={(displayChar.markedAttributes ?? []).includes('wits')}
									onchange={() => toggleMarkedAttribute('wits')}
									class="h-3.5 w-3.5 cursor-pointer appearance-none rounded border-2 transition"
									style="border-color: var(--color-gold); background-color: var(--bg-base);"
								/>
								<span class="text-[10px] tracking-wide uppercase" style="color: var(--text-muted);"
									>Marked</span
								>
							</label>
						{/if}
					</div>
					<!-- Presence -->
					<div
						class="wax-seal rounded-lg p-4 text-center"
						style="background: radial-gradient(ellipse at 30% 30%, var(--bg-elevated), var(--bg-surface)); border: 1px solid var(--border-color); box-shadow: inset 0 1px 0 rgba(184, 159, 93, 0.1), inset 0 -2px 4px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.3);"
					>
						<div
							class="text-xs font-semibold tracking-widest uppercase"
							style="font-family: var(--font-heading); color: var(--text-secondary);"
						>
							{attributeLabels.presence}
						</div>
						{#if editing}
							<input
								type="number"
								min="0"
								max="4"
								bind:value={draft.attributes.presence}
								class="mx-auto mt-1 w-16 rounded border bg-transparent text-center text-3xl font-bold outline-none"
								style="border-color: var(--border-color); color: var(--color-gold);"
							/>
						{:else}
							<div
								class="text-3xl font-bold"
								style="color: var(--color-gold); text-shadow: 0 0 12px rgba(184, 159, 93, 0.3);"
							>
								{displayChar.attributes.presence}
							</div>
						{/if}
						{#if displayChar.level >= 5}
							<label class="mt-2 flex cursor-pointer items-center justify-center gap-1">
								<input
									type="checkbox"
									checked={(displayChar.markedAttributes ?? []).includes('presence')}
									onchange={() => toggleMarkedAttribute('presence')}
									class="h-3.5 w-3.5 cursor-pointer appearance-none rounded border-2 transition"
									style="border-color: var(--color-gold); background-color: var(--bg-base);"
								/>
								<span class="text-[10px] tracking-wide uppercase" style="color: var(--text-muted);"
									>Marked</span
								>
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
									class="h-4 w-4 cursor-pointer appearance-none rounded border-2 border-red-700 transition checked:bg-red-700"
									style="background-color: var(--bg-base);"
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
									class="h-4 w-4 cursor-pointer appearance-none rounded border-2 border-violet-700 transition checked:bg-violet-700"
									style="background-color: var(--bg-base);"
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
				<div
					class="rounded px-5 py-3"
					style="background: var(--bg-surface); border: 1px solid var(--border-color);"
				>
					<span
						class="text-sm"
						style="color: var(--text-secondary); font-family: var(--font-heading);">Grit</span
					>
					{#if editing}
						<input
							type="number"
							min="0"
							bind:value={draft.grit}
							class="ml-2 w-12 rounded border bg-transparent text-center text-xl font-bold outline-none"
							style="border-color: var(--border-color); color: var(--color-gold);"
						/>
					{:else}
						<span class="ml-2 text-xl font-bold" style="color: var(--color-gold);"
							>{displayChar.grit}</span
						>
					{/if}
				</div>
				<div
					class="rounded px-5 py-3"
					style="background: var(--bg-surface); border: 1px solid var(--border-color);"
				>
					<span
						class="text-sm"
						style="color: var(--text-secondary); font-family: var(--font-heading);">Sanity</span
					>
					{#if editing}
						<input
							type="number"
							min="0"
							bind:value={draft.sanity}
							class="ml-2 w-12 rounded border bg-transparent text-center text-xl font-bold outline-none"
							style="border-color: var(--border-color); color: var(--color-gold);"
						/>
					{:else}
						<span class="ml-2 text-xl font-bold" style="color: var(--color-gold);"
							>{displayChar.sanity}</span
						>
					{/if}
				</div>
				{#if essence !== null}
					<div
						class="rounded px-5 py-3"
						style="background: var(--bg-surface); border: 1px solid var(--border-color);"
					>
						<span
							class="text-sm"
							style="color: var(--text-secondary); font-family: var(--font-heading);"
							>Essence Pool</span
						>
						<span class="ml-2 text-xl font-bold" style="color: var(--color-gold);">{essence}</span>
					</div>
				{/if}
			</div>

			<!-- Traits -->
			<div class="mb-8 space-y-4">
				<!-- Ancestry -->
				<div>
					<div
						class="font-semibold"
						style="color: var(--text-secondary); font-family: var(--font-heading);"
					>
						Ancestry
					</div>
					<div class="flex items-center gap-3">
						{#if editing}
							<input
								type="text"
								bind:value={draft.ancestry.name}
								class="rounded border bg-transparent px-2 py-1 outline-none"
								style="border-color: var(--border-color); color: var(--text-primary);"
							/>
							{@const ancestryLimit = getAncestryAttributeLimit(draft.ancestry.name)}
							{#if ancestryLimit === 0}
								<span class="text-xs italic" style="color: var(--text-muted);"
									>No attribute bonuses</span
								>
							{:else}
								<div class="flex gap-1">
									{#each ATTRIBUTE_NAMES as attr}
										<button
											onclick={() => toggleTraitAttribute('ancestry', attr)}
											class="rounded px-2 py-1 text-xs uppercase transition"
											style={draft.ancestry.assignedAttributes.includes(attr)
												? 'background: linear-gradient(135deg, var(--color-gold-dark), var(--color-gold)); color: var(--bg-base);'
												: draft.ancestry.assignedAttributes.length >= ancestryLimit
													? 'background: var(--bg-surface); color: var(--text-muted); cursor: not-allowed;'
													: 'background: var(--bg-elevated); color: var(--text-secondary);'}
										>
											{attributeLabels[attr]}
										</button>
									{/each}
								</div>
							{/if}
						{:else}
							<span>{displayChar.ancestry.name}</span>
							{#each displayChar.ancestry.assignedAttributes as attr}
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

				<!-- Vocation -->
				<div>
					<div
						class="font-semibold"
						style="color: var(--text-secondary); font-family: var(--font-heading);"
					>
						Vocation
					</div>
					<div class="flex items-center gap-3">
						{#if editing}
							<input
								type="text"
								bind:value={draft.vocation.name}
								class="rounded border bg-transparent px-2 py-1 outline-none"
								style="border-color: var(--border-color); color: var(--text-primary);"
							/>
							{#if draft.archetype === 'deft'}
								<span class="text-xs italic" style="color: var(--text-muted);"
									>Applies to any attribute</span
								>
							{:else}
								<div class="flex gap-1">
									{#each ATTRIBUTE_NAMES as attr}
										<button
											onclick={() => toggleTraitAttribute('vocation', attr)}
											class="rounded px-2 py-1 text-xs uppercase transition"
											style={draft.vocation.assignedAttributes.includes(attr)
												? 'background: linear-gradient(135deg, var(--color-gold-dark), var(--color-gold)); color: var(--bg-base);'
												: draft.vocation.assignedAttributes.length >=
													  TRAIT_ATTRIBUTE_LIMITS.vocation
													? 'background: var(--bg-surface); color: var(--text-muted); cursor: not-allowed;'
													: 'background: var(--bg-elevated); color: var(--text-secondary);'}
										>
											{attributeLabels[attr]}
										</button>
									{/each}
								</div>
							{/if}
						{:else}
							<span>{displayChar.vocation.name}</span>
							{#if displayChar.archetype === 'deft'}
								<span class="text-xs italic" style="color: var(--text-muted);"
									>Applies to any attribute</span
								>
							{:else}
								{#each displayChar.vocation.assignedAttributes as attr}
									<span
										class="rounded px-2 py-1 text-xs uppercase"
										style="background: linear-gradient(135deg, var(--color-gold-dark), var(--color-gold)); color: var(--bg-base);"
									>
										{attributeLabels[attr]}
									</span>
								{/each}
							{/if}
						{/if}
					</div>
				</div>

				<!-- Affiliation -->
				<div>
					<div
						class="font-semibold"
						style="color: var(--text-secondary); font-family: var(--font-heading);"
					>
						Affiliation
					</div>
					<div class="flex items-center gap-3">
						{#if editing}
							<input
								type="text"
								bind:value={draft.affiliations[0].name}
								class="rounded border bg-transparent px-2 py-1 outline-none"
								style="border-color: var(--border-color); color: var(--text-primary);"
							/>
							<div class="flex gap-1">
								{#each ATTRIBUTE_NAMES as attr}
									<button
										onclick={() => toggleTraitAttribute('affiliation', attr)}
										class="rounded px-2 py-1 text-xs uppercase transition"
										style={draft.affiliations[0]?.assignedAttributes.includes(attr)
											? 'background: linear-gradient(135deg, var(--color-gold-dark), var(--color-gold)); color: var(--bg-base);'
											: (draft.affiliations[0]?.assignedAttributes.length ?? 0) >=
												  TRAIT_ATTRIBUTE_LIMITS.affiliation
												? 'background: var(--bg-surface); color: var(--text-muted); cursor: not-allowed;'
												: 'background: var(--bg-elevated); color: var(--text-secondary);'}
									>
										{attributeLabels[attr]}
									</button>
								{/each}
							</div>
						{:else}
							<span>{displayChar.affiliations[0]?.name}</span>
							{#each displayChar.affiliations[0]?.assignedAttributes ?? [] as attr}
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
			</div>

			<!-- Archetype Feature -->
			{#if feature}
				<div
					class="mb-8 rounded-lg p-5"
					style="background: var(--bg-surface); border: 1px solid var(--border-color);"
				>
					<h3
						class="mb-2 text-lg font-semibold"
						style="color: var(--color-gold); font-family: var(--font-heading);"
					>
						{feature.name}
					</h3>
					<div class="prose prose-sm max-w-none">
						{@html marked(feature.description)}
					</div>
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
						<div
							class="rounded-lg p-4"
							style="background: var(--bg-elevated); border: 1px solid var(--border-color);"
						>
							<div class="mb-2 text-sm tracking-wide uppercase" style="color: var(--text-muted);">
								{slot.type}
							</div>

							{#each slot.moves as move, moveIndex}
								<div
									class="mb-2 flex items-center gap-2 rounded px-3 py-2"
									style={move.active === true
										? 'background: linear-gradient(135deg, var(--color-gold-dark), var(--color-gold)); color: var(--bg-base);'
										: move.active === false
											? `background: var(--bg-surface); color: var(--text-muted);`
											: `background: var(--bg-surface); color: var(--text-primary);`}
								>
									{#if editing}
										<input
											type="text"
											bind:value={draft.moves[slotIndex].moves[moveIndex].name}
											class="flex-1 rounded border bg-transparent px-2 py-1 text-sm outline-none"
											style="border-color: var(--border-color); color: var(--text-primary);"
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
												class="rounded px-2 py-1 text-xs uppercase transition"
												style={draft.moves[slotIndex].moves[moveIndex].active
													? 'background: var(--color-gold); color: var(--bg-base);'
													: 'background: var(--bg-elevated); color: var(--text-secondary);'}
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
				class="mx-4 w-full max-w-lg rounded-lg p-6 shadow-2xl"
				style="background: var(--bg-base); border: 1px solid var(--color-gold-dark);"
			>
				<h2
					class="mb-1 text-2xl font-bold"
					style="color: var(--color-gold); font-family: var(--font-heading);"
				>
					Level Up to {levelUpResult.character.level}
				</h2>
				<p class="mb-4 text-sm" style="color: var(--text-secondary);">
					Gains: {levelUpSummary(levelUpResult.character.level).join(', ')}
				</p>

				{#if levelUpResult.grantsAttribute}
					<p class="mb-4 text-sm" style="color: var(--text-primary);">
						Choose an attribute to increase:
					</p>
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
								class="rounded p-3 text-center transition"
								style={selectedAttribute === attr
									? `border: 2px solid var(--color-gold); background: rgba(184,159,93,0.15); box-shadow: 0 0 8px rgba(184,159,93,0.3);`
									: canIncrease
										? `border: 1px solid var(--color-gold-dark); background: var(--bg-surface);`
										: `border: 1px solid var(--border-color); background: var(--bg-surface); color: var(--text-muted); cursor: not-allowed;`}
							>
								<div
									class="text-xs tracking-wide uppercase"
									style="font-family: var(--font-heading);"
								>
									{attributeLabels[attr]}
								</div>
								<div class="text-2xl font-bold" style="color: var(--color-gold);">
									{character.attributes[attr]}
								</div>
								{#if canIncrease}
									<div class="text-xs" style="color: var(--color-gold-light);">
										→ {character.attributes[attr] + 1}
									</div>
								{:else}
									<div class="text-xs" style="color: var(--text-muted);">max</div>
								{/if}
							</button>
						{/each}
					</div>
				{/if}

				<div class="flex justify-end gap-3">
					<button
						onclick={cancelLevelUp}
						class="rounded px-4 py-2 text-sm transition"
						style="background: var(--bg-elevated); color: var(--text-secondary);"
					>
						Cancel
					</button>
					<button
						onclick={randomLevelUp}
						class="rounded border px-4 py-2 text-sm font-semibold transition"
						style="border-color: var(--color-gold-dark); background: var(--bg-surface); color: var(--color-gold);"
					>
						🎲 Random
					</button>
					<button
						onclick={confirmLevelUp}
						disabled={levelUpResult.grantsAttribute && !selectedAttribute}
						class="rounded px-4 py-2 text-sm font-semibold transition"
						style={levelUpResult.grantsAttribute && !selectedAttribute
							? `background: var(--bg-elevated); color: var(--text-muted); cursor: not-allowed;`
							: `background: linear-gradient(135deg, var(--color-gold-dark), var(--color-gold)); color: var(--bg-base);`}
					>
						Confirm Level Up
					</button>
				</div>
			</div>
		</div>
	{/if}
	<!-- Portrait Upload Modal -->
	{#if portraitModalOpen}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
			onclick={(e) => {
				if (e.target === e.currentTarget) cancelPortraitModal();
			}}
			role="dialog"
			aria-modal="true"
			aria-label="Upload Portrait"
		>
			<div
				class="mx-4 w-full max-w-md rounded-lg p-6 shadow-2xl"
				style="background: var(--bg-base); border: 1px solid var(--color-gold-dark);"
			>
				<h2
					class="mb-4 text-2xl font-bold"
					style="color: var(--color-gold); font-family: var(--font-heading);"
				>
					Portrait
				</h2>

				{#if !portraitImg}
					<label
						class="flex h-48 cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed transition"
						style="border-color: var(--border-color);"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="mb-2 h-10 w-10"
							style="color: var(--text-muted);"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
								clip-rule="evenodd"
							/>
						</svg>
						<span class="text-sm" style="color: var(--text-secondary);"
							>Click to select an image</span
						>
						<input type="file" accept="image/*" class="hidden" onchange={handlePortraitFile} />
					</label>
				{:else}
					<div class="flex flex-col items-center gap-3">
						<p class="text-xs" style="color: var(--text-muted);">
							Drag to reposition. Scroll to zoom.
						</p>
						<div
							class="overflow-hidden rounded-lg"
							style="width: {PORTRAIT_SIZE}px; height: {PORTRAIT_SIZE}px; border: 1px solid var(--border-color);"
						>
							<canvas
								bind:this={cropCanvas}
								width={PORTRAIT_SIZE}
								height={PORTRAIT_SIZE}
								class="cursor-grab active:cursor-grabbing"
								onwheel={onCropWheel}
								onpointerdown={onCropPointerDown}
								onpointermove={onCropPointerMove}
								onpointerup={onCropPointerUp}
								onpointercancel={onCropPointerUp}
							></canvas>
						</div>
						<label class="cursor-pointer text-xs underline" style="color: var(--color-gold);">
							Choose different image
							<input type="file" accept="image/*" class="hidden" onchange={handlePortraitFile} />
						</label>
					</div>
				{/if}

				<div class="mt-4 flex justify-end gap-3">
					{#if displayChar.portrait}
						<button
							onclick={removePortrait}
							class="mr-auto rounded bg-red-900/30 px-4 py-2 text-sm text-red-400 transition hover:bg-red-900/50"
						>
							Remove
						</button>
					{/if}
					<button
						onclick={cancelPortraitModal}
						class="rounded px-4 py-2 text-sm transition"
						style="background: var(--bg-elevated); color: var(--text-secondary);"
					>
						Cancel
					</button>
					<button
						onclick={savePortrait}
						disabled={!portraitImg}
						class="rounded px-4 py-2 text-sm font-semibold transition"
						style={portraitImg
							? 'background: linear-gradient(135deg, var(--color-gold-dark), var(--color-gold)); color: var(--bg-base);'
							: 'background: var(--bg-elevated); color: var(--text-muted); cursor: not-allowed;'}
					>
						Save Portrait
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
				class="mx-4 flex w-full max-w-lg flex-col rounded-lg p-6 shadow-2xl"
				style="background: var(--bg-base); border: 1px solid var(--color-gold-dark);"
			>
				<h2
					class="mb-4 text-2xl font-bold"
					style="color: var(--color-gold); font-family: var(--font-heading);"
				>
					Notes
				</h2>
				<div class="mb-4">
					<TiptapEditor
						content={notesDraft}
						onupdate={(md) => {
							notesDraft = md;
						}}
					/>
				</div>
				<div class="flex justify-end gap-3">
					<button
						onclick={cancelNotes}
						class="rounded px-4 py-2 text-sm transition"
						style="background: var(--bg-elevated); color: var(--text-secondary);"
					>
						Cancel
					</button>
					<button
						onclick={saveNotes}
						class="rounded px-4 py-2 text-sm font-semibold transition"
						style="background: linear-gradient(135deg, var(--color-gold-dark), var(--color-gold)); color: var(--bg-base);"
					>
						Save Notes
					</button>
				</div>
			</div>
		</div>
	{/if}
{:else}
	<div class="flex min-h-screen items-center justify-center" style="color: var(--text-secondary);">
		<p style="color: var(--text-muted);">Loading...</p>
	</div>
{/if}
