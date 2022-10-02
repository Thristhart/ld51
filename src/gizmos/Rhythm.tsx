import { useComputed, useSignal } from "@preact/signals";
import { Howl } from "howler";
import { useEffect } from "preact/hooks";
import { Canvas } from "~/components/Canvas";
import { GizmoProps, useGameTime } from "~/Game";
import testPath from "../assets/audio/rhythm_test_lvl1.ogg";

const test = new Howl({
    src: testPath,
    volume: 0.1,
    sprite: {
        background: [0, 18330],
        pattern: [18330, 18000],
    },
});

enum Notes {
    Left,
    Right,
    Up,
    Down,
}

const beatMap = [
    { time: 4, note: Notes.Left, hold: 2 },
    { time: 6, note: Notes.Up, hold: 1 },
    { time: 7, note: Notes.Down, hold: 1 },
    { time: 8, note: Notes.Up, hold: 2 },
    { time: 10, note: Notes.Right, hold: 1 },
    { time: 11, note: Notes.Left, hold: 1 },
    { time: 12, note: Notes.Up, hold: 2 },
];

function useAudioPosition(song: Howl) {
    const time = useGameTime();
    const audioPosition = useComputed(() => {
        const timeValue = time.value;
        return song.seek();
    });
    return audioPosition;
}
function getNotePosition(note: Notes) {
    switch (note) {
        case Notes.Left:
            return 0;
        case Notes.Down:
            return 160;
        case Notes.Up:
            return 320;
        case Notes.Right:
            return 480;
    }
}
const arrowWidth = 100;
const arrowHeight = 40;
function drawArrow(context: CanvasRenderingContext2D, note: Notes, baseY: number) {
    const x = getNotePosition(note);
    const y = baseY - arrowHeight;
    if (note === Notes.Left) {
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + arrowWidth / 2, y - arrowHeight);
        context.lineTo(x + arrowWidth / 2, y - arrowHeight / 4);
        context.lineTo(x + arrowWidth, y - arrowHeight / 4);
        context.lineTo(x + arrowWidth, y + arrowHeight / 4);
        context.lineTo(x + arrowWidth / 2, y + arrowHeight / 4);
        context.lineTo(x + arrowWidth / 2, y + arrowHeight);
        context.closePath();
        context.fill();
    } else if (note === Notes.Right) {
        context.beginPath();
        context.moveTo(x + arrowWidth, y);
        context.lineTo(x + arrowWidth / 2, y - arrowHeight);
        context.lineTo(x + arrowWidth / 2, y - arrowHeight / 4);
        context.lineTo(x, y - arrowHeight / 4);
        context.lineTo(x, y + arrowHeight / 4);
        context.lineTo(x + arrowWidth / 2, y + arrowHeight / 4);
        context.lineTo(x + arrowWidth / 2, y + arrowHeight);
        context.closePath();
        context.fill();
    } else if (note === Notes.Up) {
        context.beginPath();
        context.moveTo(x + arrowWidth / 2, y - arrowWidth / 2);
        context.lineTo(x - arrowHeight + arrowWidth / 2, y);
        context.lineTo(x - arrowHeight / 4 + arrowWidth / 2, y);
        context.lineTo(x - arrowHeight / 4 + arrowWidth / 2, y + arrowWidth / 2);
        context.lineTo(x + arrowHeight / 4 + arrowWidth / 2, y + arrowWidth / 2);
        context.lineTo(x + arrowHeight / 4 + arrowWidth / 2, y);
        context.lineTo(x + arrowHeight + arrowWidth / 2, y);
        context.closePath();
        context.fill();
    } else if (note === Notes.Down) {
        context.beginPath();
        context.moveTo(x + arrowWidth / 2, y + arrowWidth / 2);
        context.lineTo(x - arrowHeight + arrowWidth / 2, y);
        context.lineTo(x - arrowHeight / 4 + arrowWidth / 2, y);
        context.lineTo(x - arrowHeight / 4 + arrowWidth / 2, y - arrowWidth / 2);
        context.lineTo(x + arrowHeight / 4 + arrowWidth / 2, y - arrowWidth / 2);
        context.lineTo(x + arrowHeight / 4 + arrowWidth / 2, y);
        context.lineTo(x + arrowHeight + arrowWidth / 2, y);
        context.closePath();
        context.fill();
    }
}

const activeNoteColor = "white";
const inactiveNoteColor = "gray";
const beatMapNoteColor = "red";
const beatMapNoteHoldColor = "pink";

export const Rhythm = ({ level }: GizmoProps) => {
    const audioPosition = useAudioPosition(test);
    const beatMapHeight = 640 * 10;
    test.once("end", () => {
        level.value = level.value + 1;
    });

    const leftPressed = useSignal(false);
    const downPressed = useSignal(false);
    const upPressed = useSignal(false);
    const rightPressed = useSignal(false);

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (e.code === "ArrowLeft") {
                leftPressed.value = true;
            }
            if (e.code === "ArrowDown") {
                downPressed.value = true;
            }
            if (e.code === "ArrowUp") {
                upPressed.value = true;
            }
            if (e.code === "ArrowRight") {
                rightPressed.value = true;
            }
        }
        function onKeyUp(e: KeyboardEvent) {
            if (e.code === "ArrowLeft") {
                leftPressed.value = false;
            }
            if (e.code === "ArrowDown") {
                downPressed.value = false;
            }
            if (e.code === "ArrowUp") {
                upPressed.value = false;
            }
            if (e.code === "ArrowRight") {
                rightPressed.value = false;
            }
        }
        document.addEventListener("keydown", onKeyDown);
        document.addEventListener("keyup", onKeyUp);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.removeEventListener("keyup", onKeyUp);
        };
    }, []);

    const bgSoundId = useSignal<number | undefined>(undefined);
    const patternSoundId = useSignal<number | undefined>(undefined);

    return (
        <Canvas
            width={640}
            height={640}
            tick={(canvas, context) => {
                const duration = test.duration();
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.fillStyle = "#fc6";
                context.font = "64px sans-serif";
                if (audioPosition.value === 0) {
                    context.fillText("READY TO DANCE?", 10, 320);
                } else if (audioPosition.value < 4) {
                    context.fillText(Math.floor(5 - audioPosition.value).toString(), 10, 320);
                }

                if (leftPressed.value) {
                    context.fillStyle = activeNoteColor;
                } else {
                    context.fillStyle = inactiveNoteColor;
                }
                drawArrow(context, Notes.Left, 640);

                if (downPressed.value) {
                    context.fillStyle = activeNoteColor;
                } else {
                    context.fillStyle = inactiveNoteColor;
                }
                drawArrow(context, Notes.Down, 640);

                if (upPressed.value) {
                    context.fillStyle = activeNoteColor;
                } else {
                    context.fillStyle = inactiveNoteColor;
                }
                drawArrow(context, Notes.Up, 640);

                if (rightPressed.value) {
                    context.fillStyle = activeNoteColor;
                } else {
                    context.fillStyle = inactiveNoteColor;
                }
                drawArrow(context, Notes.Right, 640);
                const beatMapPosition = 640 - beatMapHeight + (audioPosition.value / duration) * beatMapHeight;
                beatMap.forEach((beat) => {
                    const beatHeight = (beat.hold / duration) * beatMapHeight;
                    const noteY = beatMapPosition + (beatMapHeight - (beat.time / duration) * beatMapHeight);
                    context.fillStyle = beatMapNoteHoldColor;
                    context.fillRect(
                        getNotePosition(beat.note),
                        noteY - beatHeight - arrowHeight,
                        arrowWidth,
                        beatHeight
                    );
                    context.fillStyle = beatMapNoteColor;
                    if (audioPosition.value > beat.time && audioPosition.value < beat.time + beat.hold) {
                        let wasHit = false;
                        if (
                            (beat.note === Notes.Left && leftPressed.value) ||
                            (beat.note === Notes.Down && downPressed.value) ||
                            (beat.note === Notes.Up && upPressed.value) ||
                            (beat.note === Notes.Right && rightPressed.value)
                        ) {
                            wasHit = true;
                        }
                        if (wasHit) {
                            drawArrow(context, beat.note, 640);
                            drawArrow(context, beat.note, noteY - beatHeight);
                            test.mute(false, patternSoundId.value);
                        } else {
                            test.mute(true, patternSoundId.value);
                        }
                    } else {
                        drawArrow(context, beat.note, noteY);
                        drawArrow(context, beat.note, noteY - beatHeight);
                    }
                });
                if (audioPosition.value > beatMap[beatMap.length - 1].time + beatMap[beatMap.length - 1].hold + 0.5) {
                    context.fillText("good work yay", 10, 320);
                }
            }}
            onClick={() => {
                if (!test.playing()) {
                    bgSoundId.value = test.play("background");
                    patternSoundId.value = test.play("pattern");
                } else {
                    test.pause();
                }
            }}
        />
    );
};
