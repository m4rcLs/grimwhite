<script lang="ts">
	import type { MoveSlot } from '$lib/models/character';

	let {
		slot,
		editing = false,
		onmovechange,
		ondescriptionchange,
		ontoggleactive,
		onrandomize
	}: {
		slot: MoveSlot;
		editing?: boolean;
		onmovechange?: (moveIndex: number, name: string) => void;
		ondescriptionchange?: (moveIndex: number, description: string) => void;
		ontoggleactive?: (moveIndex: number) => void;
		onrandomize?: () => void;
	} = $props();
</script>

<div
	class="rounded-lg p-4"
	style="background: var(--bg-elevated); border: 1px solid var(--border-color);"
>
	<div class="mb-2 flex items-center justify-between">
		<span class="text-sm tracking-wide uppercase" style="color: var(--text-muted);">
			{slot.type}
		</span>
		{#if editing && onrandomize}
			<button
				onclick={onrandomize}
				class="rounded p-1 transition hover:opacity-70"
				style="color: var(--text-muted);"
				title="Randomize this slot"
			>
				🎲
			</button>
		{/if}
	</div>

	{#each slot.moves as move, moveIndex}
		<div
			class="mb-2 rounded"
			style={move.active === true
				? 'background: linear-gradient(135deg, var(--color-gold-dark), var(--color-gold));'
				: move.active === false
					? `background: var(--bg-surface); color: var(--text-muted);`
					: `background: var(--bg-surface); color: var(--text-primary);`}
		>
			<div class="flex items-center gap-2 px-3 py-2">
				{#if editing && onmovechange}
					<input
						type="text"
						value={move.name}
						oninput={(e) => onmovechange(moveIndex, e.currentTarget.value)}
						class="flex-1 rounded border bg-transparent px-2 py-1 text-sm outline-none"
						style="border-color: var(--border-color); color: var(--text-primary);"
					/>
					{#if move.active !== undefined && ontoggleactive}
						<button
							onclick={() => ontoggleactive(moveIndex)}
							class="rounded px-2 py-1 text-xs uppercase transition"
							style={move.active
								? 'background: var(--color-gold); color: var(--bg-base);'
								: 'background: var(--bg-elevated); color: var(--text-secondary);'}
						>
							{move.active ? 'Active' : 'Inactive'}
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
			{#if editing && ondescriptionchange}
				<textarea
					value={move.description ?? ''}
					oninput={(e) => ondescriptionchange(moveIndex, e.currentTarget.value)}
					placeholder="Describe this move…"
					rows="2"
					class="mx-3 mb-2 w-[calc(100%-1.5rem)] rounded border bg-transparent px-3 py-2 text-sm outline-none"
					style="border-color: var(--border-color); color: var({move.active ? '--text-primary' : '--text-secondary'}); resize: vertical;"
				/>
			{:else if move.description}
				<p class="px-3 pb-2 text-sm italic" style="color: var({move.active ? '--text-primary' : '--text-secondary'});">
					{move.description}
				</p>
			{/if}
		</div>
	{/each}
</div>
