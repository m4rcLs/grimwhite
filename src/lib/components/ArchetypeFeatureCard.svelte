<script lang="ts">
	import { marked } from 'marked';

	let {
		name,
		description
	}: {
		name: string;
		description: string;
	} = $props();
</script>

<div
	class="mb-8 rounded-lg p-5"
	style="background: var(--bg-surface); border: 1px solid var(--border-color);"
>
	<h3
		class="mb-2 text-lg font-semibold"
		style="color: var(--color-gold); font-family: var(--font-heading);"
	>
		{name}
	</h3>
	<div class="prose prose-sm max-w-none">
		{@html marked(description)}
	</div>
</div>
