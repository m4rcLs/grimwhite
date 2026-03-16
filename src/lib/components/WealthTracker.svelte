<script lang="ts">
	import { WEALTH_LABELS, type Wealth, type WealthLevel } from '$lib/models/character';

	let {
		wealth,
		editing = false,
		onprogresstoggle,
		onlevelchange,
		onincrease,
		ondecrease
	}: {
		wealth: Wealth;
		editing?: boolean;
		onprogresstoggle?: (index: number) => void;
		onlevelchange?: (level: WealthLevel) => void;
		onincrease?: () => void;
		ondecrease?: () => void;
	} = $props();

	const label = $derived(WEALTH_LABELS[wealth.level]);
	const isMaxLevel = $derived(wealth.level >= 5);
</script>

<div
	class="flex flex-1 flex-col gap-2 rounded-lg border p-3"
	style="background: radial-gradient(ellipse at 30% 30%, var(--bg-elevated), var(--bg-surface)); border-color: var(--border-color); box-shadow: inset 0 1px 0 rgba(184, 159, 93, 0.1), 0 2px 8px rgba(0,0,0,0.2);"
>
	<div class="flex items-center justify-between">
		<span
			class="text-xs font-semibold tracking-widest uppercase"
			style="font-family: var(--font-heading); color: var(--text-secondary);"
		>
			Wealth
		</span>
		<div class="flex items-center gap-1.5">
			{#if editing && onlevelchange}
				<button
					onclick={() => onlevelchange?.(Math.max(1, wealth.level - 1) as WealthLevel)}
					class="flex h-4 w-4 items-center justify-center rounded text-[10px] font-bold transition hover:opacity-80"
					style="background-color: var(--bg-elevated); color: var(--text-secondary); border: 1px solid var(--border-color);"
					disabled={wealth.level <= 1}
				>
					−
				</button>
			{/if}
			<span
				class="text-xs font-bold"
				style="color: var(--color-gold);"
			>
				{label}
			</span>
			{#if editing && onlevelchange}
				<button
					onclick={() => onlevelchange?.(Math.min(5, wealth.level + 1) as WealthLevel)}
					class="flex h-4 w-4 items-center justify-center rounded text-[10px] font-bold transition hover:opacity-80"
					style="background: linear-gradient(135deg, var(--color-gold), var(--color-gold-dark)); color: var(--bg-base);"
					disabled={isMaxLevel}
				>
					+
				</button>
			{/if}
		</div>
	</div>

	<!-- Wealth level pips with +/- buttons -->
	<div class="flex items-center justify-center gap-1.5">
		{#if ondecrease}
			<button
				onclick={ondecrease}
				class="flex h-5 w-5 items-center justify-center rounded text-xs font-bold transition hover:opacity-80"
				style="background-color: var(--bg-elevated); color: var(--text-secondary); border: 1px solid var(--border-color);"
				disabled={wealth.level <= 1 && wealth.progress <= 0}
				title="Decrease wealth"
			>
				−
			</button>
		{/if}
		<div class="flex gap-1">
			{#each [1, 2, 3, 4, 5] as level}
				<div
					class="h-2 w-5 rounded-sm transition"
					style="
						background: {level <= wealth.level
							? 'linear-gradient(135deg, var(--color-gold), var(--color-gold-dark))'
							: 'var(--bg-base)'};
						border: 1px solid var(--color-gold-dark);
						box-shadow: {level <= wealth.level ? '0 0 4px rgba(184, 159, 93, 0.3)' : 'inset 0 1px 2px rgba(0,0,0,0.3)'};
					"
					title="{level} — {WEALTH_LABELS[level as WealthLevel]}"
				></div>
			{/each}
		</div>
		{#if onincrease}
			<button
				onclick={onincrease}
				class="flex h-5 w-5 items-center justify-center rounded text-xs font-bold transition hover:opacity-80"
				style="background: linear-gradient(135deg, var(--color-gold), var(--color-gold-dark)); color: var(--bg-base);"
				disabled={isMaxLevel}
				title="Increase wealth"
			>
				+
			</button>
		{/if}
	</div>

	<!-- Progress track (10 slots) -->
	{#if !isMaxLevel}
		<div class="flex flex-col items-center gap-1">
			<span class="text-[9px] tracking-wide uppercase" style="color: var(--text-muted);">
				→ {WEALTH_LABELS[Math.min(5, wealth.level + 1) as WealthLevel]}
			</span>
			<div class="flex gap-0.5">
				{#each Array(10) as _, i}
					<button
						onclick={() => onprogresstoggle?.(i)}
						class="progress-pip flex h-4 w-4 items-center justify-center rounded-sm border text-[9px] transition"
						style="
							border-color: var(--color-gold-dark);
							background: {i < wealth.progress
								? 'linear-gradient(135deg, var(--color-gold), var(--color-gold-dark))'
								: 'var(--bg-base)'};
							color: {i < wealth.progress ? 'var(--bg-base)' : 'var(--text-muted)'};
							cursor: pointer;
							box-shadow: {i < wealth.progress ? '0 0 3px rgba(184, 159, 93, 0.3)' : 'inset 0 1px 2px rgba(0,0,0,0.2)'};
						"
						title="Coin {i + 1}/10"
					>
						{#if i < wealth.progress}
							¢
						{/if}
					</button>
				{/each}
			</div>
		</div>
	{:else}
		<div class="text-center">
			<span class="text-[10px] italic" style="color: var(--text-muted);">Maximum wealth</span>
		</div>
	{/if}
</div>

<style>
	.progress-pip:hover {
		opacity: 0.85;
		transform: scale(1.1);
	}
</style>
