<script lang="ts">
	import type { Character } from '$lib/models/character';
	import { MAX_LEVEL, XP_THRESHOLDS } from '$lib/generator/leveling';

	let {
		character,
		editing = false,
		onadjustxp,
		onfillxp
	}: {
		character: Character;
		editing?: boolean;
		onadjustxp?: (delta: number) => void;
		onfillxp?: () => void;
	} = $props();

	function xpForNextLevel(char: Character): number | null {
		if (char.level >= MAX_LEVEL) return null;
		return XP_THRESHOLDS[char.level + 1] ?? null;
	}

	const nextThreshold = $derived(xpForNextLevel(character));
	const currentXp = $derived(character.xp ?? 0);
	const canFill = $derived(nextThreshold !== null && currentXp < (nextThreshold ?? 0));
</script>

<div
	class="flex shrink-0 flex-col items-center gap-1 rounded-lg border p-3"
	style="background: radial-gradient(ellipse at 30% 30%, var(--bg-elevated), var(--bg-surface)); border-color: var(--border-color); box-shadow: inset 0 1px 0 rgba(184, 159, 93, 0.1), 0 2px 8px rgba(0,0,0,0.2);"
>
	<span
		class="text-xs font-semibold tracking-widest uppercase"
		style="font-family: var(--font-heading); color: var(--text-secondary);"
	>
		XP
	</span>
	<div class="flex items-center gap-2">
		{#if !editing && onadjustxp}
			<button
				onclick={() => onadjustxp(-1)}
				class="flex h-6 w-6 items-center justify-center rounded text-sm font-bold transition hover:opacity-80"
				style="background-color: var(--bg-elevated); color: var(--text-secondary); border: 1px solid var(--border-color);"
				disabled={currentXp <= 0}
			>
				−
			</button>
		{/if}
		<span
			class="text-2xl font-bold"
			style="color: var(--color-gold); text-shadow: 0 0 12px rgba(184, 159, 93, 0.3);"
		>
			{currentXp}
		</span>
		{#if !editing && onadjustxp}
			<button
				onclick={() => onadjustxp(1)}
				class="flex h-6 w-6 items-center justify-center rounded text-sm font-bold transition hover:opacity-80"
				style="background: linear-gradient(135deg, var(--color-gold), var(--color-gold-dark)); color: var(--bg-base);"
			>
				+
			</button>
		{/if}
	</div>
	{#if nextThreshold !== null}
		<span class="text-xs" style="color: var(--text-muted);">
			/ {nextThreshold}
		</span>
	{:else}
		<span class="text-xs" style="color: var(--text-muted);">MAX</span>
	{/if}
	{#if !editing && canFill && onfillxp}
		<button
			onclick={onfillxp}
			class="mt-1 flex h-6 items-center justify-center rounded px-1.5 text-xs font-bold transition hover:opacity-80"
			style="background-color: var(--bg-elevated); color: var(--color-gold); border: 1px solid var(--border-color);"
			title="Fill XP to next level threshold"
		>
			⇈
		</button>
	{/if}
</div>
