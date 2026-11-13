// Counts are never hardcoded: tests compare spellings or pages against each other and the API.

/** Words used for the Cyrillic / Latin comparison (TC-S09). */
export const CROSS_SCRIPT_TERMS = ['буџет', 'Шабац', 'ваздух'] as const;

/** A Latin tag that many Cyrillic budget datasets carry (TC-S10). */
export const TAGGED_TERM = 'budzet';

export const NO_MATCH_TERM = 'qxzv-nepostojeci-pojam';

/**
 * A publisher with many datasets (TC-S12, TC-API09, TC-API12). Fixed, because the newest dataset
 * can come from a user account with no organization.
 */
export const SAMPLE_ORGANIZATION = 'grad-pirot';
