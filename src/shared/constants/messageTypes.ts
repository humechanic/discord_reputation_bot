export const MESSAGE_TYPES = {
    REPUTATION_CHANGE: 'reputation-change',
    RANK_INFO: 'rank-info',
    WELCOME: 'welcome',
    INFO: 'info',
    SERVICE: 'service'
} as const;

export type MessageType = typeof MESSAGE_TYPES[keyof typeof MESSAGE_TYPES];

export const MESSAGE_TYPE_MARKER = '-# || type:';
export const MESSAGE_TYPE_MARKER_END = ' ||'; 