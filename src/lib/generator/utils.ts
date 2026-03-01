import nlp from 'compromise';

export function randomFrom<T>(array: T[]): T {
	return array[Math.floor(Math.random() * array.length)];
}

export function randomUnique<T>(array: T[], count: number): T[] {
	const copy = [...array];
	const result: T[] = [];

	for (let i = 0; i < count && copy.length > 0; i++) {
		const index = Math.floor(Math.random() * copy.length);
		result.push(copy.splice(index, 1)[0]);
	}

	return result;
}

export function capitalize(text: string) {
	return text.charAt(0).toLocaleUpperCase() + text.slice(1);
}


function startsWithVowel(word: string): boolean {
  return /^[aeiou]/i.test(word);
}

export function prepositionForExperience(sentence: string): string {
	const doc = nlp(sentence);

	const firstWord = doc.termList()[0].text;
	const firstWordDoc = nlp(firstWord);
	let preposition = 'was'
	if (firstWordDoc.nouns().length > 0) {
		preposition = 'is a'
	} else if (firstWordDoc.verbs().length === 0){
		preposition = 'is a'
	} else {
		const firstVerb = doc.verbs(0)
		preposition =  firstVerb.toPastTense().text() === firstVerb.text() ? 'was' : 'is a'
	}

	if (preposition === 'is a' && startsWithVowel(firstWord)) {
		preposition = 'is an'
	}
	return preposition
}

export function generateId() {
	return crypto.randomUUID();
}
