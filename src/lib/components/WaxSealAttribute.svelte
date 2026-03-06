<script lang="ts">
	import type { AttributeName } from '$lib/models/character';

	const attributeLabels: Record<AttributeName, string> = {
		brawns: 'Brawns',
		agility: 'Agility',
		wits: 'Wits',
		presence: 'Presence'
	};

	let {
		attribute,
		value,
		editing = false,
		level = 1,
		markedAttributes = [],
		onvaluechange,
		ontogglemarked
	}: {
		attribute: AttributeName;
		value: number;
		editing?: boolean;
		level?: number;
		markedAttributes?: AttributeName[];
		onvaluechange?: (value: number) => void;
		ontogglemarked?: (attr: AttributeName) => void;
	} = $props();
</script>

<div
	class="wax-seal rounded-lg p-4 text-center"
	style="background: radial-gradient(ellipse at 30% 30%, var(--bg-elevated), var(--bg-surface)); border: 1px solid var(--border-color); box-shadow: inset 0 1px 0 rgba(184, 159, 93, 0.1), inset 0 -2px 4px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.3);"
>
	<div
		class="text-xs font-semibold tracking-widest uppercase"
		style="font-family: var(--font-heading); color: var(--text-secondary);"
	>
		{attributeLabels[attribute]}
	</div>
	{#if editing && onvaluechange}
		<input
			type="number"
			min="0"
			max="4"
			{value}
			oninput={(e) => onvaluechange(Number(e.currentTarget.value))}
			class="mx-auto mt-1 w-16 rounded border bg-transparent text-center text-3xl font-bold outline-none"
			style="border-color: var(--border-color); color: var(--color-gold);"
		/>
	{:else}
		<div
			class="text-3xl font-bold"
			style="color: var(--color-gold); text-shadow: 0 0 12px rgba(184, 159, 93, 0.3);"
		>
			{value}
		</div>
	{/if}
	{#if level >= 5 && ontogglemarked}
		<label class="mt-2 flex cursor-pointer items-center justify-center gap-1">
			<input
				type="checkbox"
				checked={markedAttributes.includes(attribute)}
				onchange={() => ontogglemarked(attribute)}
				class="h-3.5 w-3.5 cursor-pointer appearance-none rounded border-2 transition"
				style="border-color: var(--color-gold); background-color: var(--bg-base);"
			/>
			<span class="text-[10px] tracking-wide uppercase" style="color: var(--text-muted);"
				>Marked</span
			>
		</label>
	{/if}
</div>
