<script lang="ts">
	import type { Character, AttributeName } from '$lib/models/character';
	import {
		canIncreaseAttribute,
		levelUpSummary,
		applyAttributeIncrease,
		type LevelUpResult
	} from '$lib/generator/leveling';
	import { EXPERIENCES } from '$lib/content/experiences';
	import { STRONG_PREFIX, STRONG_SUFFIX } from '$lib/content/moves/strong';
	import { DEFT_PREFIX, DEFT_SUFFIX } from '$lib/content/moves/deft';
	import { WISE_PREFIX, WISE_SUFFIX } from '$lib/content/moves/wise';

	let {
		open = false,
		character,
		levelUpResult,
		onconfirm,
		onrandom,
		oncancel
	}: {
		open?: boolean;
		character: Character | null;
		levelUpResult: LevelUpResult | null;
		onconfirm?: (selectedAttribute: AttributeName | null) => void;
		onrandom?: () => void;
		oncancel?: () => void;
	} = $props();

	const ATTRIBUTE_NAMES: AttributeName[] = ['brawns', 'agility', 'wits', 'presence'];

	const attributeLabels: Record<AttributeName, string> = {
		brawns: 'Brawns',
		agility: 'Agility',
		wits: 'Wits',
		presence: 'Presence'
	};

	let selectedAttribute: AttributeName | null = $state(null);

	$effect(() => {
		if (open) {
			selectedAttribute = null;
		}
	});

	function handleConfirm() {
		if (!onconfirm) return;
		onconfirm(selectedAttribute);
	}
</script>

{#if open && levelUpResult && character}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
		onclick={(e) => {
			if (e.target === e.currentTarget && oncancel) oncancel();
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
				{#if oncancel}
					<button
						onclick={oncancel}
						class="rounded px-4 py-2 text-sm transition"
						style="background: var(--bg-elevated); color: var(--text-secondary);"
					>
						Cancel
					</button>
				{/if}
				{#if onrandom}
					<button
						onclick={onrandom}
						class="rounded border px-4 py-2 text-sm font-semibold transition"
						style="border-color: var(--color-gold-dark); background: var(--bg-surface); color: var(--color-gold);"
					>
						🎲 Random
					</button>
				{/if}
				<button
					onclick={handleConfirm}
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
