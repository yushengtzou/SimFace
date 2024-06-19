declare module 'kd-tree-javascript' {
    interface Node<T> {
        obj: T;
        left: Node<T> | null;
        right: Node<T> | null;
        parent: Node<T> | null;
        dimension: number;
    }

    interface KdTree<T> {
        root: Node<T> | null;
        countNodes: () => number;
        inorderTraversal: () => T[];
        isBalanced: () => boolean;
        isValid: () => boolean;
        nearest: (point: T, maxNodes: number, maxDistance?: number) => [T, number][];
        insert: (point: T) => void;
        remove: (point: T) => void;
        balanceFactor: () => number;
    }

    class kdTree<T> implements KdTree<T> {
        constructor(points: T[], metric: (a: T, b: T) => number, dimensions: (keyof T)[]);
        root: Node<T> | null;
        countNodes: () => number;
        inorderTraversal: () => T[];
        isBalanced: () => boolean;
        isValid: () => boolean;
        nearest: (point: T, maxNodes: number, maxDistance?: number) => [T, number][];
        insert: (point: T) => void;
        remove: (point: T) => void;
        balanceFactor: () => number;
    }
}

