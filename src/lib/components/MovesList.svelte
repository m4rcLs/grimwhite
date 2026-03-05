<script lang="ts">
	import type { Character } from "$lib/models/character";
	import { MoveNames } from "$lib/models/character";

    const {displayChar, editing, draft}:{displayChar: Character, editing: boolean, draft: Character} = $props()
</script>
			<div class="mb-8">
				<h3
					class="mb-3 text-xl font-semibold"
					style="color: var(--color-gold); font-family: var(--font-heading);"
				>
					{MoveNames[displayChar.archetype]}
				</h3>

				<div class="space-y-4">
					{#each displayChar.moves as slot, slotIndex}
						<div
							class="rounded-lg p-4"
							style="background: var(--bg-elevated); border: 1px solid var(--border-color);"
						>
							<div class="mb-2 text-sm tracking-wide uppercase" style="color: var(--text-muted);">
								{slot.type}
							</div>

							{#each slot.moves as move, moveIndex}
								<div
									class="mb-2 flex items-center gap-2 rounded px-3 py-2"
									style={move.active === true
										? 'background: linear-gradient(135deg, var(--color-gold-dark), var(--color-gold)); color: var(--bg-base);'
										: move.active === false
											? `background: var(--bg-surface); color: var(--text-muted);`
											: `background: var(--bg-surface); color: var(--text-primary);`}
								>
									{#if editing}
										<input
											type="text"
											bind:value={draft.moves[slotIndex].moves[moveIndex].name}
											class="flex-1 rounded border bg-transparent px-2 py-1 text-sm outline-none"
											style="border-color: var(--border-color); color: var(--text-primary);"
										/>
										{#if move.active !== undefined}
											<button
												onclick={() => {
													if (!draft) return;
													const activating = !draft.moves[slotIndex].moves[moveIndex].active;
													if (activating) {
														// Deactivate all other moves in this slot
														for (const m of draft.moves[slotIndex].moves) {
															m.active = false;
														}
													}
													draft.moves[slotIndex].moves[moveIndex].active = activating;
												}}
												class="rounded px-2 py-1 text-xs uppercase transition"
												style={draft.moves[slotIndex].moves[moveIndex].active
													? 'background: var(--color-gold); color: var(--bg-base);'
													: 'background: var(--bg-elevated); color: var(--text-secondary);'}
											>
												{draft.moves[slotIndex].moves[moveIndex].active ? 'Active' : 'Inactive'}
											</button>
										{/if}
									{:else}
										<span class="flex-1">{move.name}</span>
										{#if move.active !== undefined}
											<span class="text-xs tracking-wide uppercase">
												{move.active ? 'Active' : 'Inactive'}
											</span>
										{/if}
									{/if}
								</div>
							{/each}
						</div>
					{/each}
				</div>
			</div>