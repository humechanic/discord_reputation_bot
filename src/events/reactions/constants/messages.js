import { TRACKED_EMOJI } from "./trackEmojiMap.js";

const BASE_THUMBS_UP_MESSAGE = 'Спасибо за поддержку';
const BASE_THUMBS_DOWN_MESSAGE = 'О, похоже, тебе не понравилось';

export const EMOJI_MESSAGES_MAP = new Map([
    [TRACKED_EMOJI.THUMBS_UP.DEFAULT, `${BASE_THUMBS_UP_MESSAGE}!`],
    [TRACKED_EMOJI.THUMBS_UP.LIGHT, `${BASE_THUMBS_UP_MESSAGE} ariets blednokozhiy!`],
    [TRACKED_EMOJI.THUMBS_UP.MEDIUM_LIGHT, `${BASE_THUMBS_UP_MESSAGE}!`],
    [TRACKED_EMOJI.THUMBS_UP.MEDIUM, `${BASE_THUMBS_UP_MESSAGE}, smuglyanka moldovanka!`],
    [TRACKED_EMOJI.THUMBS_UP.MEDIUM_DARK, `${BASE_THUMBS_UP_MESSAGE}, ebaniy tsigan!`],
    [TRACKED_EMOJI.THUMBS_UP.DARK, `${BASE_THUMBS_UP_MESSAGE}, nigga!`],
    [TRACKED_EMOJI.THUMBS_DOWN.DEFAULT, `${BASE_THUMBS_DOWN_MESSAGE}, kak zhal shto vsem pohui`],
    [TRACKED_EMOJI.THUMBS_DOWN.LIGHT, `${BASE_THUMBS_DOWN_MESSAGE}, kak zhal shto vsem pohui`],
    [TRACKED_EMOJI.THUMBS_DOWN.MEDIUM_LIGHT, `${BASE_THUMBS_DOWN_MESSAGE}, smugliy`],
    [TRACKED_EMOJI.THUMBS_DOWN.MEDIUM, `${BASE_THUMBS_DOWN_MESSAGE}, da i pohui`],
    [TRACKED_EMOJI.THUMBS_DOWN.MEDIUM_DARK, `${BASE_THUMBS_DOWN_MESSAGE}, kak zhal shto vsem pohui tsigan ebaniy`],
    [TRACKED_EMOJI.THUMBS_DOWN.DARK, `${BASE_THUMBS_DOWN_MESSAGE}, unlucky nigga`],
    [TRACKED_EMOJI.REGULAR.BEERS, 'Ну, шо лец го'],
    [TRACKED_EMOJI.REGULAR.CANDLE, 'Помянем...'],
    [TRACKED_EMOJI.CUSTOM.ALCOHOLIC, 'ГыЫГЫГ... ЫЫы бля алкаш штоль'],
    [TRACKED_EMOJI.CUSTOM.FEELSGOOD, 'Oo.. kak mne ohuenno бля заебись...'],
]);