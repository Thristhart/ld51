import path from "path";
import { comlink } from "vite-plugin-comlink";

export default {
    resolve: {
        alias: {
            "~": path.resolve(__dirname, "src"),
        },
    },
    plugins: [comlink()],
    worker: {
        plugins: [comlink()],
    },
    base: "/ld51/",
};
