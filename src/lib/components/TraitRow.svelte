<script lang="ts">
	import type { AttributeName, Trait } from '$lib/models/character';
	import AttributeBadge from './AttributeBadge.svelte';

	const ATTRIBUTE_NAMES: AttributeName[] = ['brawns', 'agility', 'wits', 'presence'];

	const attributeLabels: Record<AttributeName, string> = {
		brawns: 'Brawns',
		agility: 'Agility',
		wits: 'Wits',
		presence: 'Presence'
	};

	let {
		label,
		trait,
		editing = false,
		maxAttributes = 1,
		noAttributeText = '',
		onnamechange,
		ontoggleattribute
	}: {
		label: string;
		trait: Trait;
		editing?: boolean;
		maxAttributes?: number;
		noAttributeText?: string;
		onnamechange?: (name: string) => void;
		ontoggleattribute?: (attr: AttributeName) => void;
	} = $props();
</script>

<div>
	<div
		class="font-semibold"
		style="color: var(--text-secondary); font-family: var(--font-heading);"
	>
		{label}
	</div>
	<div class="flex items-center gap-3">
		{#if editing && onnamechange}
			<input
				type="text"
				value={trait.name}
				oninput={(e) => onnamechange(e.currentTarget.value)}
				class="rounded border bg-transparent px-2 py-1 outline-none"
				style="border-color: var(--border-color); color: var(--text-primary);"
			/>
			{#if maxAttributes === 0}
				<span class="text-xs italic" style="color: var(--text-muted);">No attribute bonuses</span>
			{:else if noAttributeText}
				<span class="text-xs italic" style="color: var(--text-muted);">{noAttributeText}</span>
			{:else if ontoggleattribute}
				<div class="flex gap-1">
					{#each ATTRIBUTE_NAMES as attr}
						<button
							onclick={() => ontoggleattribute(attr)}
							class="rounded px-2 py-1 text-xs uppercase transition"
							style={trait.assignedAttributes.includes(attr)
								? 'background: linear-gradient(135deg, var(--color-gold-dark), var(--color-gold)); color: var(--bg-base);'
								: trait.assignedAttributes.length >= maxAttributes
									? 'background: var(--bg-surface); color: var(--text-muted); cursor: not-allowed;'
									: 'background: var(--bg-elevated); color: var(--text-secondary);'}
						>
							{attributeLabels[attr]}
						</button>
					{/each}
				</div>
			{/if}
		{:else}
			<span>{trait.name}</span>
			{#if noAttributeText && !editing}
				<span class="text-xs italic" style="color: var(--text-muted);">{noAttributeText}</span>
			{:else}
				{#each trait.assignedAttributes as attr}
					<AttributeBadge attribute={attr} />
				{/each}
			{/if}
		{/if}
	</div>
</div>
