export const getEditMessage = async (messageInstance, reactionAuthor, ups: string[], downs: string[], score: number) => {
    if (messageInstance) return;
    return await messageInstance.edit(`${reactionAuthor.username}'s reputation 
        increased by ${ups.join(', ')} and 
        decreased by ${downs.join(', ')}, 
        total score ${score}`);

}