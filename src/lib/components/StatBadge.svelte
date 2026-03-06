<script lang="ts">
	let {
		label,
		value,
		editing = false,
		onvaluechange
	}: {
		label: string;
		value: number | string;
		editing?: boolean;
		onvaluechange?: (value: number) => void;
	} = $props();
</script>

<div
	class="rounded px-5 py-3"
	style="background: var(--bg-surface); border: 1px solid var(--border-color);"
>
	<span class="text-sm" style="color: var(--text-secondary); font-family: var(--font-heading);"
		>{label}</span
	>
	{#if editing && onvaluechange}
		<input
			type="number"
			min="0"
			value={typeof value === 'string' ? 0 : value}
			oninput={(e) => onvaluechange(Number(e.currentTarget.value))}
			class="ml-2 w-18 rounded border bg-transparent text-center text-xl font-bold outline-none"
			style="border-color: var(--border-color); color: var(--color-gold);"
		/>
	{:else}
		<span class="ml-2 text-xl font-bold" style="color: var(--color-gold);">{value}</span>
	{/if}
</div>
