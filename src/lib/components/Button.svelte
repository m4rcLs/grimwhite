<script lang="ts">
	const { onclick, text }: { onclick: () => void; text: string } = $props();
</script>

<button
	{onclick}
	class="rounded px-5 py-2 text-sm font-semibold transition"
	style="font-family: var(--font-heading); background: linear-gradient(135deg, var(--color-gold), var(--color-gold-dark)); color: var(--bg-base);"
>
	{text}
</button>
