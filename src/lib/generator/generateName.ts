import { randomFrom } from './utils';
import type { Gender } from '../models/character';

const MALE_PREFIX = ['Al', 'Mor', 'Kael', 'Ser', 'Vael', 'Thorn', 'Eld', 'Rav', 'Mal', 'Isen'];
const MALE_SUFFIX = ['ric', 'wyn', 'dan', 'mir', 'eth', 'grim', 'var', 'ros', 'vane', 'dred'];

const FEMALE_PREFIX = ['Ae', 'Lil', 'Syl', 'Nym', 'Isa', 'Cel', 'Ari', 'Ves', 'Mir', 'Ela'];
const FEMALE_SUFFIX = ['ra', 'wen', 'ith', 'ael', 'ine', 'ora', 'ani', 'ess', 'rea', 'lyn'];

export function generateName(gender: Gender): string {
	if (gender === 'female') {
		return randomFrom(FEMALE_PREFIX) + randomFrom(FEMALE_SUFFIX);
	}
	return randomFrom(MALE_PREFIX) + randomFrom(MALE_SUFFIX);
}
