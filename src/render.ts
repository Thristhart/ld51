import { getGameState } from "~/gameWorkerWrapper";

export const canvas = document.querySelector("canvas") as HTMLCanvasElement;
const context = canvas.getContext("2d");
if (!context) {
    throw new Error("somehow couldn't get a 2d context");
}

let frameHandle: number;
export const animationFrame = async (_timestamp: number) => {
    const state = await getGameState();
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillText(state.counterValue.toString(), 10, 10);

    frameHandle = requestAnimationFrame(animationFrame);
};

export const setupRender = () => {
    frameHandle = requestAnimationFrame(animationFrame);
};

if (import.meta.hot) {
    import.meta.hot.accept((newModule) => {
        if (newModule) {
            cancelAnimationFrame(frameHandle);
            frameHandle = requestAnimationFrame(newModule.animationFrame);
        }
    });
}
