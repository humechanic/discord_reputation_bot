import { MESSAGE_TYPE_MARKER, MESSAGE_TYPE_MARKER_END, MessageType } from '../constants/messageTypes.js';

export function addMessageType(content: string, type: MessageType): string {
    return `${content}\n${MESSAGE_TYPE_MARKER}${type}${MESSAGE_TYPE_MARKER_END}`;
}

export function getMessageType(content: string): MessageType | null {
    const markerStart = content.lastIndexOf(MESSAGE_TYPE_MARKER);
    if (markerStart === -1) return null;

    const markerEnd = content.lastIndexOf(MESSAGE_TYPE_MARKER_END);
    if (markerEnd === -1) return null;

    const type = content.slice(
        markerStart + MESSAGE_TYPE_MARKER.length,
        markerEnd
    );

    return type as MessageType;
}

export function removeMessageType(content: string): string {
    const markerStart = content.lastIndexOf(MESSAGE_TYPE_MARKER);
    if (markerStart === -1) return content;

    return content.slice(0, markerStart).trim();
} 