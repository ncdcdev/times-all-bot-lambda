import { createRequire } from 'node:module';

const packageJson: typeof import('../package.json') = createRequire(
	import.meta.url,
)('../package.json');

const { name, version } = packageJson.devEngines.runtime;
const match = /^([1-9]\d*)\.x$/.exec(version);
if (name !== 'node' || !match?.[1]) {
	throw new Error(
		'devEngines.runtime must specify node with a <major>.x version',
	);
}
export const nodeMajor = Number(match[1]);

if (import.meta.main) {
	console.log(nodeMajor);
}
