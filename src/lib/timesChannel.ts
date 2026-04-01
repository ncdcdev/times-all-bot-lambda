const TIMES_PREFIX = 'times-';

export function isTimesChannel(name: string): boolean {
	return name.startsWith(TIMES_PREFIX);
}
