import type { Character, AttributeName, Archetype } from '../models/character';

import {
	randomFrom,
	randomUnique,
	generateId,
	capitalize,
	prepositionForExperience
} from './utils';
import { generateName } from './generateName';

import { EXPERIENCES } from '../content/experiences';
import { ANCESTRIES, ancestryAsTrait, type Ancestry } from '../content/ancestries';
import { VOCATIONS } from '../content/vocations';
import { AFFILIATIONS } from '../content/affiliations';

import { STRONG_PREFIX, STRONG_SUFFIX } from '../content/moves/strong';
import { DEFT_PREFIX, DEFT_SUFFIX } from '../content/moves/deft';
import { WISE_PREFIX, WISE_SUFFIX } from '../content/moves/wise';

const ATTRIBUTES: AttributeName[] = ['brawns', 'agility', 'wits', 'presence'];

const ARCHETYPES: Archetype[] = ['strong', 'deft', 'wise'];

function baseAttributes() {
	return {
		brawns: 1,
		agility: 1,
		wits: 1,
		presence: 1
	};
}

function increaseRandomAttribute(attributes: Record<AttributeName, number>) {
	attributes[randomFrom(ATTRIBUTES)] += 1;
}

function assignRandomAttributes(count: number): AttributeName[] {
	return randomUnique(ATTRIBUTES, count);
}

function generateMoveName(prefix: string[], suffix: string[]) {
	return `${randomFrom(prefix)} ${randomFrom(suffix)}`;
}

function generateMoveSlot(archetype: Archetype) {
	if (archetype === 'strong') {
		return {
			id: generateId(),
			type: 'maneuver' as const,
			moves: [
				{
					id: generateId(),
					name: generateMoveName(STRONG_PREFIX, STRONG_SUFFIX)
				}
			]
		};
	}

	if (archetype === 'deft') {
		return {
			id: generateId(),
			type: 'technique' as const,
			moves: [
				{
					id: generateId(),
					name: generateMoveName(DEFT_PREFIX, DEFT_SUFFIX)
				}
			]
		};
	}

	// wise
	return {
		id: generateId(),
		type: 'miracle' as const,
		moves: [
			{
				id: generateId(),
				name: generateMoveName(WISE_PREFIX, WISE_SUFFIX),
				active: true
			},
			{
				id: generateId(),
				name: generateMoveName(WISE_PREFIX, WISE_SUFFIX),
				active: false
			}
		]
	};
}

function generateAncestry(): Ancestry {
	const defaultChance = Math.random() < 0.5;
	const defaultAncestry = ANCESTRIES.find((a) => a.isDefault);

	if (defaultChance && defaultAncestry) {
		return {
			name: defaultAncestry.name,
			isDefault: true,
			assignedAttributes: assignRandomAttributes(defaultAncestry.attributeCount ?? 0)
		};
	}

	const nonHumans = ANCESTRIES.filter((a) => !a.isDefault);
	const chosen = randomFrom(nonHumans);

	return {
		name: chosen.name,
		assignedAttributes: assignRandomAttributes(chosen.attributeCount ?? 0),
		isDefault: false
	};
}

function generateSummary(
	archetype: Archetype,
	vocation: string,
	affiliation: string,
	experience: string,
	ancestry: string
) {
	const preposition = prepositionForExperience(experience);
	const summary = `A ${archetype} ${ancestry ? ancestry : ''} ${vocation} of the ${affiliation} who ${preposition} ${experience.toLowerCase()}.`;
	return summary;
}

export function generateCharacter(): Character {
	const archetype = randomFrom(ARCHETYPES);
	const attributes = baseAttributes();
	increaseRandomAttribute(attributes);

	const ancestry = generateAncestry();

	const vocationName = capitalize(randomFrom(VOCATIONS));
	const affiliationName = randomFrom(AFFILIATIONS);

	const experiencesRaw = randomUnique(EXPERIENCES, 2);

	const experiences = experiencesRaw.map((e) => ({ name: e }));

	const moves = [generateMoveSlot(archetype), generateMoveSlot(archetype)];

	const character: Character = {
		id: generateId(),
		name: generateName(),
		summary: generateSummary(
			archetype,
			vocationName,
			affiliationName,
			experiencesRaw[0],
			ancestry.name
		),
		level: 1,
		archetype,
		attributes,
		grit: 1,
		sanity: 1,
		ancestry: ancestryAsTrait(ancestry),
		vocation: {
			name: vocationName,
			assignedAttributes: assignRandomAttributes(1)
		},
		affiliations: [
			{
				name: affiliationName,
				assignedAttributes: assignRandomAttributes(1)
			}
		],
		experiences,
		moves,
		notes: '',
		createdAt: Date.now()
	};

	return character;
}
