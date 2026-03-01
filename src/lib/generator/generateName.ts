import { randomFrom } from './utils';

const NAME_PREFIX = ['Al', 'Mor', 'Kael', 'Ser', 'Vael', 'Thorn', 'Eld', 'Rav', 'Mal', 'Isen'];

const NAME_SUFFIX = ['ric', 'wyn', 'dan', 'mir', 'eth', 'grim', 'var', 'ros', 'vane', 'dred'];

export function generateName() {
	return randomFrom(NAME_PREFIX) + randomFrom(NAME_SUFFIX);
}
