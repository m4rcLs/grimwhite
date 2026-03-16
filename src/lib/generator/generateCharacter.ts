import type { Character, AttributeName, Archetype, Gender } from '../models/character';

import {
	randomFrom,
	randomUnique,
	generateId,
	capitalize,
	prepositionForExperience
} from './utils';
import { generateName } from './generateName';

import { EXPERIENCES } from '../content/experiences';
import { ANCESTRIES, ancestryAsTrait, RARE_ANCESTRIES, type Ancestry } from '../content/ancestries';
import { VOCATIONS } from '../content/vocations';
import { AFFILIATIONS } from '../content/affiliations';

import { STRONG_PREFIX, STRONG_SUFFIX, STRONG_WEAPON } from '../content/moves/strong';
import { DEFT_PREFIX, DEFT_SUFFIX } from '../content/moves/deft';
import { generateMiracleName } from '../content/moves/miracles';

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

function generateMoveName(prefix: string[], suffix: string[], weapon?: string[]) {
	if (weapon && Math.random() < 0.4) {
		return `${randomFrom(prefix)} ${randomFrom(weapon)} ${randomFrom(suffix)}`;
	}
	return `${randomFrom(prefix)} ${randomFrom(suffix)}`;
}

export function generateMoveSlot(archetype: Archetype) {
	if (archetype === 'strong') {
		return {
			id: generateId(),
			type: 'maneuver' as const,
			moves: [
				{
					id: generateId(),
					name: generateMoveName(STRONG_PREFIX, STRONG_SUFFIX, STRONG_WEAPON)
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
				name: generateMiracleName(),
				active: true
			},
			{
				id: generateId(),
				name: generateMiracleName(),
				active: false
			}
		]
	};
}

function generateAncestry(): Ancestry {
	const rareChance = Math.random() < 0.2;
	const defaultAncestry = ANCESTRIES.find((a) => a.isDefault);
	let chosen = defaultAncestry;
	if (rareChance) {
		chosen = randomFrom(RARE_ANCESTRIES);
	} else {
		chosen = randomFrom(ANCESTRIES);
	}

	if (chosen.isDefault) {
		return {
			name: chosen.name,
			isDefault: true,
			assignedAttributes: assignRandomAttributes(chosen.attributeCount ?? 0)
		};
	}

	return {
		name: chosen.isTransformation ? generateAncestry().name + ' ' + chosen.name : chosen.name,
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
	const summary = `A ${archetype} ${ancestry ? ancestry : ''} ${vocation} of ${affiliation} who ${preposition} ${experience.toLowerCase()}.`;
	return summary;
}

const GENDERS: Gender[] = ['male', 'female'];

export function generateCharacter(): Character {
	const archetype = randomFrom(ARCHETYPES);
	const gender = randomFrom(GENDERS);
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
		name: generateName(gender),
		gender,
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
		resolve: 1,
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
		xp: 0,
		coins: 0,
		wealth: { level: 1, progress: 0 },
		notes: '',
		bloodied: false,
		rattled: false,
		markedAttributes: [],
		spark: [false, false],
		createdAt: Date.now()
	};

	return character;
}
