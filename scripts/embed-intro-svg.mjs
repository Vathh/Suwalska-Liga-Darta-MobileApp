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

fs.writeFileSync(outPath, `${banner}export default ${JSON.stringify(svg)};\n`, 'utf8');
console.log(`Wrote ${path.relative(root, outPath)} (${fs.statSync(outPath).size} bytes)`);
