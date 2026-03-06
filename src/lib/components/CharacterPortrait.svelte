<script lang="ts">
	let {
		portrait,
		name = '',
		editing = false,
		onclick
	}: {
		portrait?: string;
		name?: string;
		editing?: boolean;
		onclick?: () => void;
	} = $props();
</script>

{#if editing && onclick}
	<button
		class="group relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border transition"
		style="border-color: var(--border-color); background-color: var(--bg-surface);"
		{onclick}
		type="button"
	>
		{#if portrait}
			<img src={portrait} alt={name} class="h-full w-full object-cover" />
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
	</button>
{:else}
	<div
		class="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border"
		style="border-color: var(--border-color); background-color: var(--bg-surface);"
	>
		{#if portrait}
			<img src={portrait} alt={name} class="h-full w-full object-cover" />
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
	</div>
{/if}
