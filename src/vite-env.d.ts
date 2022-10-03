/// <reference types="vite/client" />
/// <reference types="vite-plugin-comlink/client" />

declare module "*.glb" {
    const src: string;
    export default src;
}
