import { build } from 'esbuild';
import { nodeMajor } from './node-version.ts';

await build({
	entryPoints: ['src/handler.ts'],
	bundle: true,
	platform: 'node',
	target: `node${nodeMajor}`,
	external: ['@slack/bolt'],
	outfile: 'dist/index.js',
});
