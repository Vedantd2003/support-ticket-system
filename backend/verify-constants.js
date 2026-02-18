import { CATEGORIES, PRIORITIES, STATUSES } from './src/config/constants.js';

console.log('Verifying Constants...');
if (!CATEGORIES.includes('billing')) throw new Error('Missing billing category');
if (!PRIORITIES.includes('critical')) throw new Error('Missing critical priority');
if (!STATUSES.includes('open')) throw new Error('Missing open status');

console.log('Constants Verified!');
