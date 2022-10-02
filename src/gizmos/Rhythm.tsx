import { useComputed, useSignal, useSignalEffect } from "@preact/signals";
import { Howl } from "howler";
import { useEffect, useRef } from "preact/hooks";
import { Canvas } from "~/components/Canvas";
import { GizmoProps, useGameTime } from "~/Game";
import testPath from "../assets/audio/rhythm_test_lvl1.ogg";

enum Notes {
    Left,
    Right,
    Up,
    Down,
}

interface Beat {
    readonly time: number;
    readonly note: Notes;
    readonly hold: number;
}
type BeatMap = readonly Beat[];

interface Song {
    readonly howl: Howl;
    readonly beatMap: BeatMap;
}

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
            return 60;
        case Notes.Down:
            return 220;
        case Notes.Up:
            return 380;
        case Notes.Right:
            return 540;
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

function calculateMaximumPossibleScore(beatMap: BeatMap) {
    return beatMap.reduce((sum, beat) => sum + beat.hold, 0) * scorePerSecond;
}

const activeNoteColor = "white";
const inactiveNoteColor = "gray";
const beatMapNoteColor = "green";
const beatMapNoteHoldColor = "rgb(83 141 78 / 64%)";

const scorePerSecond = 1024;
const victoryPercentage = 0.75;

const songs: Song[] = [
    {
        howl: new Howl({
            src: testPath,
            volume: 0.1,
            sprite: {
                background: [0, 18330],
                pattern: [18330, 18000],
            },
        }),
        beatMap: [
            { time: 4, note: Notes.Left, hold: 2 },
            { time: 6, note: Notes.Up, hold: 1 },
            { time: 7, note: Notes.Down, hold: 1 },
            { time: 8, note: Notes.Up, hold: 2 },
            { time: 10, note: Notes.Right, hold: 1 },
            { time: 11, note: Notes.Left, hold: 1 },
            { time: 12, note: Notes.Up, hold: 2 },
        ],
    },
];

function getSongForLevel(level: number) {
    return songs[0];
}

export const Rhythm = ({ level }: GizmoProps) => {
    const song = useSignal<Song>(getSongForLevel(0));
    const audioPosition = useAudioPosition(song.value.howl);
    const beatMapHeight = 640 * 20;
    song.value.howl.once("end", () => {
        shouldBePlaying.value = false;
        if (score.value > target.value) {
            level.value = level.value + 1;
        }
        score.value = 0;
    });
    useSignalEffect(() => {
        song.value = getSongForLevel(level.value);
        target.value = victoryPercentage * calculateMaximumPossibleScore(song.value.beatMap);
    });

    const leftPressed = useSignal(false);
    const downPressed = useSignal(false);
    const upPressed = useSignal(false);
    const rightPressed = useSignal(false);

    const target = useSignal(victoryPercentage * calculateMaximumPossibleScore(song.value.beatMap));

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (e.code === "ArrowLeft") {
                leftPressed.value = true;
                shouldBePlaying.value = true;
            }
            if (e.code === "ArrowDown") {
                downPressed.value = true;
                shouldBePlaying.value = true;
            }
            if (e.code === "ArrowUp") {
                upPressed.value = true;
                shouldBePlaying.value = true;
            }
            if (e.code === "ArrowRight") {
                rightPressed.value = true;
                shouldBePlaying.value = true;
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
    const score = useSignal<number>(0);

    const audioPositionRef = useRef<number>(0);

    const shouldBePlaying = useSignal(false);
    useSignalEffect(() => {
        if (shouldBePlaying.value) {
            if (!song.value.howl.playing()) {
                bgSoundId.value = song.value.howl.play("background");
                patternSoundId.value = song.value.howl.play("pattern");
            }
        } else {
            song.value.howl.stop();
        }
    });

    return (
        <Canvas
            width={640}
            height={640}
            tick={(canvas, context) => {
                const dt = audioPosition.value - audioPositionRef.current;
                audioPositionRef.current = audioPosition.value;
                const duration = song.value.howl.duration();
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
                let accurateNotes: Notes[] = [];
                song.value.beatMap.forEach((beat) => {
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
                    let notePosition = noteY;
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
                            notePosition = 640;
                            song.value.howl.mute(false, patternSoundId.value);
                            accurateNotes.push(beat.note);
                            score.value = score.peek() + scorePerSecond * dt;
                        } else {
                            // miss
                            song.value.howl.mute(true, patternSoundId.value);
                            score.value = score.peek() - scorePerSecond * dt * 0.3;
                        }
                    }
                    drawArrow(context, beat.note, notePosition);
                });
                if (audioPosition.value > 1) {
                    if (leftPressed.value && !accurateNotes.includes(Notes.Left)) {
                        score.value = score.peek() - scorePerSecond * dt * 0.5;
                    }
                    if (downPressed.value && !accurateNotes.includes(Notes.Down)) {
                        score.value = score.peek() - scorePerSecond * dt * 0.5;
                    }
                    if (upPressed.value && !accurateNotes.includes(Notes.Up)) {
                        score.value = score.peek() - scorePerSecond * dt * 0.5;
                    }
                    if (rightPressed.value && !accurateNotes.includes(Notes.Right)) {
                        score.value = score.peek() - scorePerSecond * dt * 0.5;
                    }
                }
                if (
                    audioPosition.value >
                    song.value.beatMap[song.value.beatMap.length - 1].time +
                        song.value.beatMap[song.value.beatMap.length - 1].hold +
                        0.5
                ) {
                    if (score.value >= target.value) {
                        context.fillText("good work yay", 10, 320);
                    } else {
                        context.fillStyle = "#f00";
                        context.fillText("RIP", 10, 320);
                    }
                }

                context.fillStyle = "#fc6";
                context.font = "64px sans-serif";
                context.fillText(
                    score.value.toFixed(0).padStart(5) + " / " + target.value.toFixed(0).padStart(5),
                    10,
                    100
                );
            }}
            onClick={() => {
                shouldBePlaying.value = true;
            }}
        />
    );
};
