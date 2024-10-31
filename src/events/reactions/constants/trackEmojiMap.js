export const TRACKED_EMOJI = {
    THUMBS_UP: {
        DEFAULT: '👍',
        LIGHT: '👍🏻',
        MEDIUM_LIGHT: '👍🏼',
        MEDIUM: '👍🏽',
        MEDIUM_DARK: '👍🏾',
        DARK: '👍🏿'
    },
    THUMBS_DOWN: {
        DEFAULT: '👎',
        LIGHT: '👎🏻',
        MEDIUM_LIGHT: '👎🏼',
        MEDIUM: '👎🏽',
        MEDIUM_DARK: '👎🏾',
        DARK: '👎🏿'
    },
    REGULAR: {
        BEERS: '🍻',
        CANDLE: '🕯️'
    },
    CUSTOM: {
        ALCOHOLIC: 'alkashbuldiga',
        FEELSGOOD: 'feelsgood',
    }

};

export const TARGET_EMOJIES = [
    ...Object.values(TRACKED_EMOJI.THUMBS_UP),
    ...Object.values(TRACKED_EMOJI.THUMBS_DOWN),
    ...Object.values(TRACKED_EMOJI.REGULAR),
    ...Object.values(TRACKED_EMOJI.CUSTOM),
];