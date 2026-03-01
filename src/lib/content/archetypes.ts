export const ARCHETYPES = [
	{
		id: 'strong',
		feature: {
			name: 'Consequences of Conflict',
			description: `
After a finished battle Strong characters can gain one of the following benefits as consequences of the fight:
- **Special interest**: The player notes an experience for this fight because of it's cultural or dramatic importance. This experience can also be used in future battles.
- **Substance**: If plausible, a character can harvest a rare and potent substance (like poison, acid, slime and such) of the fallen foes, that may provide bonuses in future battles.
- **Supernatural**: If the enemy had a non-combat ability and the Strong character killed it with his last attack, he may gain this ability.

A Strong Character can only have one of the 3 consequences active at any given time. After a new battle the previous choice can be replaced. The level when gaining the consequence ability determines the number of uses.
`
		}
	},
	{
		id: 'deft',
		feature: {
			name: 'One of the Best',
			description:
				'Once per session per Special Technique you can use it to grant an automatic Perfect on a roll, whenever this technique could be applied to that roll.'
		}
	},
	{
		id: 'wise',
		feature: null
	}
] as const;
