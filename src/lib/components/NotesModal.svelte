<script lang="ts">
	import TiptapEditor from './TiptapEditor.svelte';

	let {
		open = false,
		content = '',
		onsave,
		oncancel
	}: {
		open?: boolean;
		content?: string;
		onsave?: (markdown: string) => void;
		oncancel?: () => void;
	} = $props();

	let draft = $state('');

	$effect(() => {
		if (open) {
			draft = content;
		}
	});
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
		onclick={(e) => {
			if (e.target === e.currentTarget && oncancel) oncancel();
		}}
		role="dialog"
		aria-modal="true"
		aria-label="Edit Notes"
	>
		<div
			class="mx-4 flex w-full max-w-lg flex-col rounded-lg p-6 shadow-2xl"
			style="background: var(--bg-base); border: 1px solid var(--color-gold-dark);"
		>
			<h2
				class="mb-4 text-2xl font-bold"
				style="color: var(--color-gold); font-family: var(--font-heading);"
			>
				Notes
			</h2>
			<div class="mb-4">
				<TiptapEditor
					content={draft}
					onupdate={(md) => {
						draft = md;
					}}
				/>
			</div>
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
				{#if onsave}
					<button
						onclick={() => onsave(draft)}
						class="rounded px-4 py-2 text-sm font-semibold transition"
						style="background: linear-gradient(135deg, var(--color-gold-dark), var(--color-gold)); color: var(--bg-base);"
					>
						Save Notes
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}
