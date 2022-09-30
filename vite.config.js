import { comlink } from "vite-plugin-comlink";
import tsconfigPaths from "vite-tsconfig-paths";

export default {
    plugins: [tsconfigPaths(), comlink()],
    worker: {
        plugins: [comlink()],
    },
};
