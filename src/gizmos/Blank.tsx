import { Canvas } from "~/components/Canvas";
import "./Blank.css";

export const Blank = () => {
    return (
        <Canvas
            class="blank"
            width={640}
            height={640}
            tick={(canvas, context) => {
                // Background
                context.fillStyle = "#0d1117";
                context.fillRect(0, 0, canvas.width, canvas.height);
            }}
        />
    );
};
