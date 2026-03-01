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

export function generateId() {
	return crypto.randomUUID();
}
