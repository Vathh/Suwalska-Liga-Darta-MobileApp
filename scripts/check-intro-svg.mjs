import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const svgPath = path.join(root, 'assets', 'intro-logotyp.svg');
const outPath = path.join(root, 'assets', 'introLogotypXml.js');

const svg = fs.readFileSync(svgPath, 'utf8');
const banner =
	'// Generated from intro-logotyp.svg - do not edit by hand.\n' +
	'// Refresh: npm run embed:intro-svg\n';
const expected = `${banner}export default ${JSON.stringify(svg)};\n`;

const actual = fs.existsSync(outPath) ? fs.readFileSync(outPath, 'utf8') : null;

if (actual !== expected) {
	console.error(
		'assets/introLogotypXml.js is out of date with assets/intro-logotyp.svg.\n' +
			'Run `npm run embed:intro-svg` and commit the result.',
	);
	process.exit(1);
}

console.log('assets/introLogotypXml.js is up to date.');
