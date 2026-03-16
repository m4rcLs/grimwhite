<script lang="ts">
	let {
		coins,
		editing = false,
		ontogglecoin
	}: {
		coins: number;
		editing?: boolean;
		ontogglecoin?: (index: number) => void;
	} = $props();
</script>

<div
	class="flex shrink-0 flex-col items-center gap-2 rounded-lg border p-3"
	style="background: radial-gradient(ellipse at 30% 30%, var(--bg-elevated), var(--bg-surface)); border-color: var(--border-color); box-shadow: inset 0 1px 0 rgba(184, 159, 93, 0.1), 0 2px 8px rgba(0,0,0,0.2);"
>
	<span
		class="text-xs font-semibold tracking-widest uppercase"
		style="font-family: var(--font-heading); color: var(--text-secondary);"
	>
		Coins
	</span>
	<div class="grid grid-cols-2 gap-1.5">
		{#each [0, 1, 2, 3] as i}
			<button
				onclick={() => ontogglecoin?.(i)}
				class="coin-slot flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm transition"
				class:coin-filled={i < coins}
				style="
					border-color: var(--color-gold-dark);
					background: {i < coins ? 'linear-gradient(135deg, var(--color-gold), var(--color-gold-dark))' : 'var(--bg-base)'};
					color: {i < coins ? 'var(--bg-base)' : 'var(--text-muted)'};
					cursor: pointer;
					box-shadow: {i < coins ? '0 0 8px rgba(184, 159, 93, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)' : 'inset 0 2px 4px rgba(0,0,0,0.3)'};
				"
				title="Coin {i + 1}"
			>
				{#if i < coins}
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
						<circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5" fill="none" />
						<text x="10" y="14" text-anchor="middle" font-size="10" font-weight="bold" fill="currentColor">¢</text>
					</svg>
				{:else}
					<span class="text-xs opacity-40">○</span>
				{/if}
			</button>
		{/each}
	</div>
</div>

<style>
	.coin-slot:hover {
		opacity: 0.85;
		transform: scale(1.05);
	}
	.coin-filled {
		text-shadow: 0 1px 2px rgba(0,0,0,0.3);
	}
</style>
