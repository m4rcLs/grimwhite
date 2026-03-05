<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import { generateGrimWildMiracle } from '$lib/content/moves/miracles/grimwild';
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

	function generateNewGrimWild() {
		const newMiracleNames: string[] = new Array(10);
		for (let i = 0; i < miracleNames.length; ++i) {
			newMiracleNames[i] = generateGrimWildMiracle();
		}
		miracleNames = newMiracleNames;
	}
</script>

<div>
	<h2>Generate Knave2e Miracles</h2>

	<div class="mt-4 flex gap-4">
		<Button onclick={generateNewKnaveMiracles} text="Generate Knave2e"></Button>
		<Button onclick={generateNewGrimWild} text="Generate Grimwild"></Button>
	</div>
	<ul>
		{#each miracleNames as name}
			<li>{name}</li>
		{/each}
	</ul>
</div>
