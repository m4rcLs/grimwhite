/**
 * Miracle name generator — 50/50 between GrimWild and Knave2e methods.
 */

import { generateGrimWildMiracle } from './grimwild';
import { generateKnave2eMiracle } from './knave2e';

export function generateMiracleName(): string {
	return Math.random() < 0.5 ? generateGrimWildMiracle() : generateKnave2eMiracle();
}
