import preact from "@preact/preset-vite";
import path from "path";

export default {
    resolve: {
        alias: {
            "~": path.resolve(__dirname, "src"),
        },
    },
    base: "/ld51/",
    plugins: [preact({ devtoolsInProd: true })],
};
