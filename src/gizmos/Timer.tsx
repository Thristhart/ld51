import { Canvas } from "~/components/Canvas";
import { TEN_SECONDS } from "~/constants";
import { useGameTime } from "~/Game";
import "./Timer.css";

export const Timer = () => {
    const time = useGameTime();
    return (
        <Canvas
            width={100}
            height={100}
            tick={(canvas, context) => {
                const period = time.value % TEN_SECONDS;

                context.clearRect(0, 0, canvas.width, canvas.height);
                context.beginPath();
                context.moveTo(canvas.width / 2, canvas.height / 2);
                context.arc(
                    canvas.width / 2,
                    canvas.height / 2,
                    canvas.width / 2,
                    0,
                    (period / TEN_SECONDS) * Math.PI * 2
                );
                context.closePath();
                context.fill();
            }}
            className="timer"
        />
    );
};
