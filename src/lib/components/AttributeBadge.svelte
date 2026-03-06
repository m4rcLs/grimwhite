<script lang="ts">
	import type { AttributeName } from '$lib/models/character';

	const attributeLabels: Record<AttributeName, string> = {
		brawns: 'Brawns',
		agility: 'Agility',
		wits: 'Wits',
		presence: 'Presence'
	};

	let { attribute }: { attribute: AttributeName } = $props();
</script>

<span
	class="rounded px-2 py-1 text-xs uppercase"
	style="background: linear-gradient(135deg, var(--color-gold-dark), var(--color-gold)); color: var(--bg-base);"
>
	{attributeLabels[attribute]}
</span>
