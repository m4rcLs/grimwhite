<script lang="ts">
	import { type Character, type AttributeName, MoveNames } from '$lib/models/character';
	import { generateCharacter } from '$lib/generator/generateCharacter';

	let character: Character | null = null;

	function birth() {
		character = generateCharacter();
	}

	function preserve() {
		if (!character) return;
		characterStore.add(character);
		character = null;
	}

	const attributeLabels: Record<AttributeName, string> = {
		brawns: 'Brawns',
		agility: 'Agility',
		wits: 'Wits',
		presence: 'Presence'
	};
</script>

<div class="min-h-screen bg-neutral-900 p-8 text-neutral-200">
	<div class="mx-auto max-w-4xl">
		<h1 class="mb-6 text-4xl font-bold tracking-wide">Random Character Generator</h1>

		<button
			on:click={birth}
			class="rounded bg-amber-700 px-6 py-3 text-lg font-semibold transition hover:bg-amber-600"
		>
			BIRTH THE WRETCH
		</button>

		{#if character}
			<div class="mt-8 flex gap-4">
				<button
					on:click={preserve}
					class="rounded bg-green-700 px-5 py-2 font-semibold hover:bg-green-600"
				>
					Preserve This Soul
				</button>
			</div>
			<div class="mt-10 rounded border border-neutral-700 bg-neutral-800 p-6">
				<!-- Name -->
				<h2 class="mb-2 text-3xl font-bold">
					{character.name}
				</h2>

				<!-- Archetype -->
				<p class="mb-4 text-lg tracking-wide text-amber-400 uppercase">
					{character.archetype}
				</p>

				<!-- Summary -->
				{#if (character as any).summary}
					<p class="mb-6 text-neutral-400 italic">
						{(character as any).summary}
					</p>
				{/if}

				<!-- Attributes -->
				<div class="mb-8 grid grid-cols-2 gap-6 md:grid-cols-4">
					{#each Object.entries(character.attributes) as [key, value]}
						<div class="rounded border border-neutral-700 p-4 text-center">
							<div class="text-sm tracking-wide text-neutral-400 uppercase">
								{attributeLabels[key as AttributeName]}
							</div>
							<div class="text-3xl font-bold text-amber-400">
								{value}
							</div>
						</div>
					{/each}
				</div>

				<!-- Traits -->
				<div class="mb-8 space-y-4">
					<!-- Ancestry -->
					<div>
						<div class="font-semibold text-neutral-400">Ancestry</div>
						<div class="flex items-center gap-3">
							<span>{character.ancestry.name}</span>
							{#each character.ancestry.assignedAttributes as attr}
								<span class="rounded bg-amber-800 px-2 py-1 text-xs uppercase">
									{attributeLabels[attr]}
								</span>
							{/each}
						</div>
					</div>

					<!-- Vocation -->
					<div>
						<div class="font-semibold text-neutral-400">Vocation</div>
						<div class="flex items-center gap-3">
							<span>{character.vocation.name}</span>
							{#each character.vocation.assignedAttributes as attr}
								<span class="rounded bg-amber-800 px-2 py-1 text-xs uppercase">
									{attributeLabels[attr]}
								</span>
							{/each}
						</div>
					</div>

					<!-- Affiliation -->
					<div>
						<div class="font-semibold text-neutral-400">Affiliation</div>
						<div class="flex items-center gap-3">
							<span>{character.affiliations[0]?.name}</span>
							{#each character.affiliations[0]?.assignedAttributes ?? [] as attr}
								<span class="rounded bg-amber-800 px-2 py-1 text-xs uppercase">
									{attributeLabels[attr]}
								</span>
							{/each}
						</div>
					</div>
				</div>

				<!-- Moves -->
				<!-- Moves -->
				<div class="mb-8">
					<h3 class="mb-3 text-xl font-semibold text-amber-400">
						{MoveNames[character.archetype]}
					</h3>

					<div class="space-y-4">
						{#each character.moves as slot}
							<div class="rounded border border-neutral-700 bg-neutral-900 p-4">
								<div class="mb-2 text-sm tracking-wide text-neutral-500 uppercase">
									{slot.type}
								</div>

								{#each slot.moves as move}
									<div
										class={`mb-2 rounded px-3 py-2 ${
											move.active === true
												? 'bg-amber-700 text-black'
												: move.active === false
													? 'bg-neutral-800 text-neutral-400'
													: 'bg-neutral-800'
										}`}
									>
										{move.name}

										{#if move.active !== undefined}
											<span class="ml-2 text-xs tracking-wide uppercase">
												{move.active ? 'Active' : 'Inactive'}
											</span>
										{/if}
									</div>
								{/each}
							</div>
						{/each}
					</div>
				</div>

				<!-- Experiences -->
				<div class="mb-8">
					<h3 class="mb-3 text-xl font-semibold text-amber-400">Experiences</h3>

					<ul class="list-inside list-disc text-neutral-300">
						{#each character.experiences as exp}
							<li>{exp.name}</li>
						{/each}
					</ul>
				</div>

				<!-- Grit & Sanity -->
				<div class="flex gap-6 text-neutral-300">
					<div>
						<span class="font-semibold">Grit:</span>
						{character.grit}
					</div>
					<div>
						<span class="font-semibold">Sanity:</span>
						{character.sanity}
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
