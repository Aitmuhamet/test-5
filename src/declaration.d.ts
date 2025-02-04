// src/declaration.d.ts
declare module '*.png' {
    const value: string;
    export default value;
}

declare module '*.png?w=800&format=webp' {
    const value: string;
    export default value;
}

declare module '*.jpg' {
    const value: string;
    export default value;
}

declare module '*.jpeg' {
    const value: string;
    export default value;
}