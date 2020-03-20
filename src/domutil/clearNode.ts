export const clearNode = (node: Node): Node => {
    while (node.lastChild) {
        node.removeChild(node.lastChild);
    }
    return node;
};
