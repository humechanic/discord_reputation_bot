const MAX_MESSAGE_LENGTH = 2000;
export const splitMessage = (content: string): string[] => {
    if (content.length <= MAX_MESSAGE_LENGTH) return [content];

    const messages: string[] = [];
    let currentMessage = '';

    // Split by newlines to keep logical chunks together
    const lines = content.split('\n');

    for (const line of lines) {
        // If adding this line would exceed the limit, start a new message
        if (currentMessage.length + line.length + 1 > MAX_MESSAGE_LENGTH) {
            messages.push(currentMessage);
            currentMessage = line;
        } else {
            currentMessage += (currentMessage ? '\n' : '') + line;
        }
    }

    // Add the last message if it's not empty
    if (currentMessage) {
        messages.push(currentMessage);
    }

    return messages;
};