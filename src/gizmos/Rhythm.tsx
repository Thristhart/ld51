import { useComputed, useSignal, useSignalEffect } from "@preact/signals";
import { Howl } from "howler";
import { useEffect, useRef } from "preact/hooks";
import { Canvas } from "~/components/Canvas";
import { GizmoProps, useGameTime } from "~/Game";
import level1Path from "../assets/audio/rhythm_lvl1.ogg";
import level2Path from "../assets/audio/rhythm_lvl2.ogg";
import level3Path from "../assets/audio/rhythm_lvl3.ogg";
import level4Path from "../assets/audio/rhythm_lvl4.ogg";
import level5Path from "../assets/audio/rhythm_lvl5.ogg";

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
        time.value;
        return song.seek();
    });
    return audioPosition;
}
function getNotePosition(note: Notes) {
    switch (note) {
        case Notes.Left:
            return 48;
        case Notes.Down:
            return 196;
        case Notes.Up:
            return 344;
        case Notes.Right:
            return 492;
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
const textColor = "green";
const faceColor = "green";

const scorePerSecond = 1024;
const victoryPercentage = 0.65;

const songs: Song[] = [
    {
        howl: new Howl({
            src: level1Path,
            volume: 0.1,
            sprite: {
                background: [0, 20470],
                pattern: [20470, 18010],
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
    {
        howl: new Howl({
            src: level2Path,
            volume: 0.1,
            sprite: {
                background: [0, 20470],
                pattern: [20470, 18010],
            },
        }),
        beatMap: [
            { time: 4, note: Notes.Left, hold: 1 },
            { time: 5, note: Notes.Up, hold: 1 },
            { time: 6, note: Notes.Down, hold: 1 },
            { time: 7, note: Notes.Up, hold: 0.5 },
            { time: 7.5, note: Notes.Right, hold: 0.5 },
            { time: 8, note: Notes.Down, hold: 1 },
            { time: 9, note: Notes.Right, hold: 1 },
            { time: 10, note: Notes.Up, hold: 0.5 },
            { time: 10.5, note: Notes.Down, hold: 0.5 },
            { time: 11, note: Notes.Left, hold: 0.5 },
            { time: 11.5, note: Notes.Down, hold: 0.5 },
            { time: 12, note: Notes.Up, hold: 2 },
        ],
    },
    {
        howl: new Howl({
            src: level3Path,
            volume: 0.1,
            sprite: {
                background: [0, 20470],
                pattern: [20470, 18010],
            },
        }),
        beatMap: [
            { time: 4, hold: 1, note: Notes.Up },
            { time: 5, hold: 0.5, note: Notes.Left },
            { time: 6, hold: 0.5, note: Notes.Right },
            { time: 6.5, hold: 0.5, note: Notes.Down },
            { time: 7, hold: 0.5, note: Notes.Up },
            { time: 7.5, hold: 0.5, note: Notes.Right },
            { time: 8, hold: 0.5, note: Notes.Left },
            { time: 9, hold: 0.5, note: Notes.Right },
            { time: 10, hold: 0.5, note: Notes.Left },
            { time: 10.5, hold: 0.5, note: Notes.Right },
            { time: 11, hold: 0.5, note: Notes.Up },
            { time: 11.5, hold: 0.5, note: Notes.Down },
            { time: 12, hold: 2, note: Notes.Left },
        ],
    },
    {
        howl: new Howl({
            src: level4Path,
            volume: 0.1,
            sprite: {
                background: [0, 20470],
                pattern: [20470, 18010],
            },
        }),
        beatMap: [
            { time: 4, hold: 1, note: Notes.Up },
            { time: 5, hold: 0.5, note: Notes.Left },
            { time: 6, hold: 0.5, note: Notes.Right },
            { time: 6.5, hold: 0.5, note: Notes.Down },
            { time: 7, hold: 0.25, note: Notes.Up },
            { time: 7.25, hold: 0.25, note: Notes.Right },
            { time: 7.5, hold: 0.5, note: Notes.Left },
            { time: 8, hold: 1, note: Notes.Right },
            { time: 9.5, hold: 0.25, note: Notes.Left },
            { time: 9.75, hold: 0.25, note: Notes.Right },
            { time: 10, hold: 0.5, note: Notes.Up },
            { time: 10.5, hold: 0.5, note: Notes.Down },
            { time: 11, hold: 0.5, note: Notes.Left },
            { time: 11.5, hold: 0.25, note: Notes.Up },
            { time: 11.75, hold: 0.25, note: Notes.Down },
            { time: 12, hold: 2, note: Notes.Left },
        ],
    },
    {
        howl: new Howl({
            src: level5Path,
            volume: 0.1,
            sprite: {
                background: [0, 20470],
                pattern: [20470, 18010],
            },
        }),
        beatMap: [
            { time: 4, hold: 1, note: Notes.Left },
            { time: 5, hold: 0.25, note: Notes.Up },
            { time: 5.25, hold: 0.25, note: Notes.Right },
            { time: 5.5, hold: 0.5, note: Notes.Up },
            { time: 6, hold: 0.25, note: Notes.Down },
            { time: 6.25, hold: 0.25, note: Notes.Up },
            { time: 6.5, hold: 0.25, note: Notes.Right },
            { time: 6.75, hold: 0.25, note: Notes.Up },
            { time: 7, hold: 0.25, note: Notes.Left },
            { time: 7.25, hold: 0.25, note: Notes.Down },
            { time: 7.5, hold: 0.5, note: Notes.Up },
            { time: 8, hold: 0.5, note: Notes.Left },
            { time: 9, hold: 0.5, note: Notes.Up },
            { time: 10, hold: 0.25, note: Notes.Left },
            { time: 10.25, hold: 0.25, note: Notes.Down },
            { time: 10.5, hold: 0.25, note: Notes.Left },
            { time: 10.75, hold: 0.25, note: Notes.Up },
            { time: 11, hold: 0.25, note: Notes.Right },
            { time: 11.25, hold: 0.25, note: Notes.Up },
            { time: 11.5, hold: 0.25, note: Notes.Down },
            { time: 11.75, hold: 0.25, note: Notes.Left },
            { time: 12, hold: 1, note: Notes.Up },
            { time: 13, hold: 0.25, note: Notes.Down },
            { time: 13.25, hold: 0.5, note: Notes.Up },
        ],
    },
];

function getSongForLevel(level: number) {
    return songs[level - 1];
}

const arrowPosition = 620;

const hitFudge = 0.1;

export const Rhythm = ({ level }: GizmoProps) => {
    const song = useSignal<Song>(getSongForLevel(level.value));
    const audioPosition = useAudioPosition(song.value.howl);
    const beatMapHeight = 640 * 20;
    const isEnded = useSignal(false);
    useSignalEffect(() => {
        if (isEnded.value) {
            shouldBePlaying.value = false;
            if (score.value > target.value) {
                if (level.value < 5) {
                    level.value = level.value + 1;
                }
            }
            score.value = 0;
            isEnded.value = false;
        }
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
                const bgId = song.value.howl.play("background");
                bgSoundId.value = bgId;
                const patternId = song.value.howl.play("pattern");
                patternSoundId.value = patternId;
                song.value.howl.once(
                    "end",
                    () => {
                        isEnded.value = true;
                    },
                    patternId
                );
            }
        } else {
            song.value.howl.stop();
        }
    });

    const timeSinceLastNonMiss = useSignal(0);

    return (
        <div className="rhythm">
            <Canvas
                width={640}
                height={640}
                tick={(canvas, context) => {
                    const dt = audioPosition.value - audioPositionRef.current;
                    audioPositionRef.current = audioPosition.value;
                    const duration = song.value.howl.duration();
                    context.clearRect(0, 0, canvas.width, canvas.height);

                    let expression = "neutral";
                    let accurateNotes: Notes[] = [];
                    song.value.beatMap.forEach((beat) => {
                        if (
                            audioPosition.value > beat.time - hitFudge &&
                            audioPosition.value < beat.time + beat.hold + hitFudge
                        ) {
                            let wasHit = false;
                            if (beat.note === Notes.Left && leftPressed.value) {
                                wasHit = true;
                                expression = "left";
                            }
                            if (beat.note === Notes.Down && downPressed.value) {
                                wasHit = true;
                                expression = "down";
                            }
                            if (beat.note === Notes.Up && upPressed.value) {
                                wasHit = true;
                                expression = "up";
                            }
                            if (beat.note === Notes.Right && rightPressed.value) {
                                wasHit = true;
                                expression = "right";
                            }
                            const isFudgeTime =
                                audioPosition.value < beat.time || audioPosition.value > beat.time + beat.hold;

                            if (wasHit) {
                                song.value.howl.mute(false, patternSoundId.value);
                                accurateNotes.push(beat.note);
                                score.value = score.peek() + scorePerSecond * dt;
                            } else if (!isFudgeTime) {
                                // miss
                                song.value.howl.mute(true, patternSoundId.value);
                                score.value = score.peek() - scorePerSecond * dt * 0.3;
                                expression = "miss";
                            }
                        }
                    });

                    if (audioPosition.value > 1) {
                        if (leftPressed.value && !accurateNotes.includes(Notes.Left)) {
                            score.value = score.peek() - scorePerSecond * dt * 0.5;
                            expression = "miss";
                        }
                        if (downPressed.value && !accurateNotes.includes(Notes.Down)) {
                            score.value = score.peek() - scorePerSecond * dt * 0.5;
                            expression = "miss";
                        }
                        if (upPressed.value && !accurateNotes.includes(Notes.Up)) {
                            score.value = score.peek() - scorePerSecond * dt * 0.5;
                            expression = "miss";
                        }
                        if (rightPressed.value && !accurateNotes.includes(Notes.Right)) {
                            score.value = score.peek() - scorePerSecond * dt * 0.5;
                            expression = "miss";
                        }
                    }
                    if (
                        audioPosition.value >
                        song.value.beatMap[song.value.beatMap.length - 1].time +
                            song.value.beatMap[song.value.beatMap.length - 1].hold +
                            0.5
                    ) {
                        if (score.value >= target.value) {
                            context.fillStyle = textColor;
                            context.font = `48px Vector Mono`;
                            context.fillText("YOU DID IT!", 100, 480);
                        } else {
                            context.fillStyle = textColor;
                            context.font = `48px Vector Mono`;
                            context.fillText("OH NO!", 200, 480);
                            expression = "miss";
                        }
                    }

                    if (expression !== "miss") {
                        timeSinceLastNonMiss.value = 0;
                    } else {
                        timeSinceLastNonMiss.value += dt;
                    }

                    context.fillStyle = faceColor;
                    context.strokeStyle = faceColor;
                    if (expression === "neutral") {
                        context.fillRect(200, 130, 20, 80);
                        context.fillRect(400, 130, 20, 80);
                        context.beginPath();
                        context.arc(310, 260, 110, 0, Math.PI);
                        context.closePath();
                        context.lineWidth = 20;
                        context.stroke();
                    } else if (expression === "left") {
                        context.fillRect(190, 130, 20, 80);
                        context.fillRect(390, 130, 20, 80);
                        context.beginPath();
                        context.arc(250, 290, 60, 0, Math.PI * 2);
                        context.closePath();
                        context.lineWidth = 20;
                        context.stroke();
                    } else if (expression === "right") {
                        context.fillRect(210, 130, 20, 80);
                        context.fillRect(410, 130, 20, 80);
                        context.beginPath();
                        context.arc(370, 290, 60, 0, Math.PI * 2);
                        context.closePath();
                        context.lineWidth = 20;
                        context.stroke();
                    } else if (expression === "up") {
                        context.fillRect(200, 100, 20, 60);
                        context.fillRect(400, 100, 20, 60);
                        context.beginPath();
                        context.arc(310, 230, 60, 0, Math.PI * 2);
                        context.closePath();
                        context.lineWidth = 20;
                        context.stroke();
                    } else if (expression === "down") {
                        context.fillRect(200, 190, 20, 70);
                        context.fillRect(400, 190, 20, 70);
                        context.beginPath();
                        context.arc(310, 370, 60, 0, Math.PI * 2);
                        context.closePath();
                        context.lineWidth = 20;
                        context.stroke();
                    } else if (expression === "miss" && timeSinceLastNonMiss.peek() > 0.2) {
                        context.fillRect(200, 130, 20, 80);
                        context.fillRect(400, 130, 20, 80);
                        context.beginPath();
                        context.arc(310, 360, 110, Math.PI, 0);
                        context.closePath();
                        context.lineWidth = 20;
                        context.stroke();
                    }

                    context.fillStyle = textColor;
                    context.font = `48px Vector Mono`;
                    if (audioPosition.value === 0) {
                        context.fillText("SING WITH ME?", 60, 480);
                    } else if (audioPosition.value < 4) {
                        context.fillText(Math.floor(5 - audioPosition.value).toString(), 280, 480);
                    }

                    if (leftPressed.value) {
                        context.fillStyle = activeNoteColor;
                    } else {
                        context.fillStyle = inactiveNoteColor;
                    }
                    drawArrow(context, Notes.Left, arrowPosition);

                    if (downPressed.value) {
                        context.fillStyle = activeNoteColor;
                    } else {
                        context.fillStyle = inactiveNoteColor;
                    }
                    drawArrow(context, Notes.Down, arrowPosition);

                    if (upPressed.value) {
                        context.fillStyle = activeNoteColor;
                    } else {
                        context.fillStyle = inactiveNoteColor;
                    }
                    drawArrow(context, Notes.Up, arrowPosition);

                    if (rightPressed.value) {
                        context.fillStyle = activeNoteColor;
                    } else {
                        context.fillStyle = inactiveNoteColor;
                    }
                    drawArrow(context, Notes.Right, arrowPosition);
                    const beatMapPosition =
                        arrowPosition - beatMapHeight + (audioPosition.value / duration) * beatMapHeight;
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
                                notePosition = arrowPosition;
                            }
                        }
                        drawArrow(context, beat.note, notePosition);
                    });

                    context.fillStyle = textColor;
                    context.font = `64px Vector Mono`;
                    context.fillText(
                        score.value.toFixed(0).padStart(5, " ") + "/" + target.value.toFixed(0).padStart(5, " "),
                        12,
                        64
                    );
                }}
                onClick={() => {
                    shouldBePlaying.value = true;
                }}
            />
        </div>
    );
};

import "./Rhythm.css";
