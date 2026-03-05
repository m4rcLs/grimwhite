<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import { generateKnave2eMiracle } from '$lib/content/moves/miracles/knave2e';
	import { onMount } from 'svelte';

	generateKnave2eMiracle();

	let miracleNames: string[] = $state(new Array(10));

	function generateNewKnaveMiracles() {
		const newMiracleNames: string[] = new Array(10);
		for (let i = 0; i < miracleNames.length; ++i) {
			newMiracleNames[i] = generateKnave2eMiracle();
		}
		miracleNames = newMiracleNames;
	}

	onMount(() => {
		generateKnave2eMiracle();
	});
</script>

<div>
	<h2>Generate Knave2e Miracles</h2>
	<Button onclick={generateNewKnaveMiracles} text="Generate"></Button>
	<ul>
		{#each miracleNames as name}
			<li>{name}</li>
		{/each}
	</ul>
</div>
