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
	// Absolute filled count across the full track: (level-1)*10 + progress
	const filledCount = $derived((wealth.level - 1) * 10 + wealth.progress);
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

	<!-- Continuous progress track (40 ticks) -->
	<div class="flex items-end justify-center gap-1.5">
		{#if ondecrease}
			<button
				onclick={ondecrease}
				class="flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-bold transition hover:opacity-80"
				style="background-color: var(--bg-elevated); color: var(--text-secondary); border: 1px solid var(--border-color);"
				disabled={wealth.level <= 1 && wealth.progress <= 0}
				title="Decrease wealth"
			>
				−
			</button>
		{/if}
		<div class="flex shrink-0 items-end">
			{#each Array(40) as _, i}
				{@const isMilestone = (i + 1) % 10 === 0}
				{@const filled = i < filledCount}
				<button
					onclick={() => onprogresstoggle?.(i)}
					class="tick shrink-0 transition"
					style="
						width: {isMilestone ? '7px' : '5px'};
						height: {isMilestone ? '16px' : '10px'};
						margin-left: {i === 0 ? '0' : isMilestone || i % 10 === 0 ? '3px' : '1.5px'};
						border-radius: 1px;
						background: {filled
							? isMilestone
								? 'var(--color-gold)'
								: 'linear-gradient(135deg, var(--color-gold), var(--color-gold-dark))'
							: 'var(--bg-base)'};
						border: 1px solid {isMilestone ? 'var(--color-gold)' : 'var(--color-gold-dark)'};
						cursor: pointer;
						box-shadow: {filled ? '0 0 3px rgba(184, 159, 93, 0.3)' : 'inset 0 1px 2px rgba(0,0,0,0.2)'};
					"
					title="{Math.floor(i / 10) + 1} — {WEALTH_LABELS[(Math.floor(i / 10) + 1) as WealthLevel]}: {(i % 10) + 1}/10"
				></button>
			{/each}
		</div>
		{#if onincrease}
			<button
				onclick={onincrease}
				class="flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-bold transition hover:opacity-80"
				style="background: linear-gradient(135deg, var(--color-gold), var(--color-gold-dark)); color: var(--bg-base);"
				disabled={isMaxLevel}
				title="Increase wealth"
			>
				+
			</button>
		{/if}
	</div>
</div>

<style>
	.tick:hover {
		opacity: 0.8;
		transform: scaleY(1.2);
	}
</style>
