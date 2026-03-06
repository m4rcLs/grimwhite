<script lang="ts">
	let {
		label,
		color,
		checked = false,
		onchange
	}: {
		label: string;
		color: 'red' | 'violet';
		checked?: boolean;
		onchange?: () => void;
	} = $props();

	const colorClasses = {
		red: {
			border: 'border-red-700/50',
			checkbox: 'border-red-700 checked:bg-red-700',
			text: 'text-red-400',
			textMuted: 'text-red-400/50'
		},
		violet: {
			border: 'border-violet-700/50',
			checkbox: 'border-violet-700 checked:bg-violet-700',
			text: 'text-violet-400',
			textMuted: 'text-violet-400/50'
		}
	};

	const c = colorClasses[color];
</script>

<div class="col-span-2 flex flex-col items-center py-2">
	<div class="flex w-full items-center gap-2 px-4">
		<div class="h-0 flex-1 border-t border-dotted {c.border}"></div>
		{#if onchange}
			<label class="flex cursor-pointer items-center gap-2">
				<input
					type="checkbox"
					{checked}
					{onchange}
					class="h-4 w-4 cursor-pointer appearance-none rounded border-2 {c.checkbox} transition"
					style="background-color: var(--bg-base);"
				/>
				<span class="text-xs font-semibold tracking-wide {c.text} uppercase">{label}</span>
			</label>
		{:else}
			<span class="text-xs font-semibold tracking-wide {c.textMuted} uppercase">{label}</span>
		{/if}
		<div class="h-0 flex-1 border-t border-dotted {c.border}"></div>
	</div>
</div>
