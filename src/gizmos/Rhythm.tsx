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

function getSongForLevel(_level: number) {
    return songs[0];
}

const arrowPosition = 620;

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
                        if (audioPosition.value > beat.time && audioPosition.value < beat.time + beat.hold) {
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

                            if (wasHit) {
                                song.value.howl.mute(false, patternSoundId.value);
                                accurateNotes.push(beat.note);
                                score.value = score.peek() + scorePerSecond * dt;
                            } else {
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
