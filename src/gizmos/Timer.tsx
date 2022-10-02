import { useSignal } from "@preact/signals";
import { Canvas } from "~/components/Canvas";
import { TEN_SECONDS } from "~/constants";
import { useGameTime } from "~/Game";
import "./Timer.css";

const hourglassPolygon = [
    [0.0, 0.0],
    [1, 0.0],
    [1, 0.0555],
    [0.95, 0.0555],
    [0.95, 0.28],
    [0.55, 0.46],
    [0.55, 0.54],
    [0.95, 0.72],
    [0.95, 0.9445],
    [1, 0.9445],
    [1, 1],
    [0.0, 1],
    [0.0, 0.9445],
    [0.05, 0.9445],
    [0.05, 0.72],
    [0.45, 0.54],
    [0.45, 0.46],
    [0.05, 0.28],
    [0.05, 0.0555],
    [0.0, 0.0555],
] as const;

const flipDuration = 1000;

const Hourglass = () => {
    const time = useGameTime();
    const hourGlassHeight = 640;
    const hourGlassWidth = 355;

    const left = 640 / 2 - hourGlassWidth / 2;

    let hasClipped = useSignal(false);

    return (
        <Canvas
            width={640}
            height={640}
            tick={(canvas, context) => {
                const period = time.value % TEN_SECONDS;

                let progress = (period - flipDuration) / (TEN_SECONDS - flipDuration);
                let flipProgress = period / flipDuration;
                if (progress < 0) {
                    progress = 1;
                    canvas.style.transform = `rotate(${flipProgress * 180}deg)`;
                } else if (canvas.style.transform) {
                    canvas.style.transform = "none";
                }

                context.clearRect(0, 0, canvas.width, canvas.height);

                context.fillStyle = "#737a8c55";

                context.beginPath();
                context.moveTo(left, 0);
                hourglassPolygon.forEach(([x, y]) => {
                    context.lineTo(left + hourGlassWidth * x, hourGlassHeight * y);
                });
                context.lineTo(left, 0);
                context.fill();
                if (!hasClipped.value) {
                    context.clip();
                    hasClipped.value = true;
                }

                context.fillStyle = "#fc6";
                // top
                context.fillRect(
                    0,
                    (canvas.height * progress) / 2,
                    canvas.width,
                    canvas.height / 2 - (canvas.height * progress) / 2
                );
                // pillar
                context.fillRect(
                    0.45 * hourGlassWidth + left,
                    canvas.height / 2,
                    0.1 * hourGlassWidth,
                    (canvas.height / 2) * (progress * 9)
                );
                // bottom
                context.beginPath();
                context.moveTo(left + hourGlassWidth * 0.45, canvas.height - (canvas.height / 2) * progress);
                context.lineTo(
                    left + hourGlassWidth * 0.05,
                    canvas.height - (canvas.height / 2) * progress + hourGlassHeight * 0.18
                );
                context.lineTo(left + hourGlassWidth * 0.05, canvas.height);
                context.lineTo(left + hourGlassWidth * 0.95, canvas.height);
                context.lineTo(
                    left + hourGlassWidth * 0.95,
                    canvas.height - (canvas.height / 2) * progress + hourGlassHeight * 0.18
                );
                context.lineTo(left + hourGlassWidth * 0.55, canvas.height - (canvas.height / 2) * progress);
                context.closePath();
                context.fill();

                // bases
                context.fillStyle = "#255ff4";
                context.fillRect(left, 0, hourGlassWidth, hourGlassHeight * 0.0555);
                context.fillRect(left, hourGlassHeight * 0.95, hourGlassWidth, hourGlassHeight * 0.0555);
            }}
        />
    );
};

export const Timer = () => {
    return <Hourglass />;
};
