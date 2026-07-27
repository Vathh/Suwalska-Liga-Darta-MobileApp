/**
 * Re-export — kanoniczna ścieżka: helpers/cricket/
 */
export * from '../cricket/cricketReducer.js';
export {
	isSegmentClosed,
	allSegmentsClosed as allClosed,
	CRICKET_SEGMENTS,
} from '../cricket/cricketRules.js';
