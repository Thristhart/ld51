import { useComputed, useSignal, useSignalEffect } from "@preact/signals";
import cn from "classnames";
import { useRef } from "preact/hooks";
import { Canvas } from "~/components/Canvas";
import { GizmoProps, useGameTime } from "~/Game";
import "./Wires.css";
interface WireLeftProps {
    readonly type: typeof colors[number];
    readonly hideHead: boolean;
}
const WireLeft = ({ type, hideHead }: WireLeftProps) => {
    return (
        <div
            class={cn("wire", "wireLeft")}
            data-wiretype={type}
            onMouseDown={(e) => {
                e.preventDefault();
            }}>
            {!hideHead && <WireHead />}
        </div>
    );
};

interface WireRightProps {
    readonly type: typeof colors[number];
}
const WireRight = ({ type }: WireRightProps) => {
    return (
        <div class={cn("wire", "wireRight")} data-wiretype={type}>
            <WireHead />
        </div>
    );
};

const WireHead = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="65.34 160.59 56.94 46.44" class="wireHead">
            <path
                d="M106 191.86a20.48 20.48 0 0 1-4.77-.49l2-7.75a17.64 17.64 0 0 0 10.15-1.29l3.2 7.34a26.29 26.29 0 0 1-10.58 2.19zm-31.67-10.92l-7-3.88c1.76-3.16 6.4-10.66 11.53-11.94l1.94 7.76c-1.24.43-4.4 4.36-6.47 8.06zm18.98-3.79L85 174c4.78-3.74 12.29-12.63 14.65-12.31s5.93 5.36 5.93 5.36c-1.33 1.48-9.02 7.56-12.27 10.1zM85 206c-2 0-8.59-8.63-8.86-9.28l7.38-3.1S89 200 89 201s-2 5-4 5z"
                class="wireHeadStroke"
            />
            <path
                d="M108.89 203.66c-.32-1.94-4.79-8.62-8.89-9.66l1.59-3.68c2.3.57 13.83 3.85 15.19 12z"
                class="wireHeadStroke"
            />
            <path
                d="M110 197.89a35.18 35.18 0 0 0-9.08-1.9l.52-8a42.92 42.92 0 0 1 11.64 2.49z"
                class="wireHeadStroke"
            />
            <path
                d="M103.05 193.85l-1.58-7.85c1.16-.24 18.53-2 19.53 1s-1.19 5.44-3.59 6.72-11.79-.39-14.36.13zm2.14-16L97 174c.07 0 14.27-8.13 18.13-8.56s4.41 4.69 3.64 7.12-13.28 5.2-13.58 5.29zm-32 16.33l-6.71-4.36C71.51 182.09 79 170 83 170a5.18 5.18 0 0 1 5.06 3.33l.08-.06c-1.77 1.43-9.14 11.97-14.95 20.91z"
                class="wireHeadStroke"
            />
            <path
                d="M76 200.45l-6.32-4.9c7.26-9.37 15.64-20.76 16.52-22.83a.94.94 0 0 0-.06.18l7.69 2.2C93 178.19 83.65 190.59 76 200.45z"
                class="wireHeadStroke"
            />
            <path
                d="M87.14 198.26l-6.6-4.52c5.62-8.21 11.9-18.59 12.31-21a1.77 1.77 0 0 0 0 .22h8c-.01 4.37-7.46 16.17-13.71 25.3z"
                class="wireHeadStroke"
            />
            <path
                d="M96.05 198.18l-6.7-4.36c5.5-8.44 9.39-20.88 9.43-21l7.64 2.36c-.17.56-4.27 13.64-10.37 23z"
                class="wireHeadStroke"
            />
            <path
                d="M102.05 198.18l-6.7-4.36c5.5-8.44 9.61-19.7 9.65-19.82l7 2c-.17.55-3.85 12.82-9.95 22.18z"
                class="wireHeadStroke"
            />
        </svg>
    );
};

interface ConnectionProps {
    readonly type: typeof colors[number];
    readonly startPos: [x: number, y: number];
    readonly endPos: [x: number, y: number];
}
const Connection = ({ type, startPos, endPos }: ConnectionProps) => {
    const [startX, startY] = startPos;
    const [endX, endY] = endPos;
    const [dx, dy] = [endX - startX, endY - startY];
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    const length = Math.sqrt(dx * dx + dy * dy);

    return (
        <div
            data-wiretype={type}
            class={cn("wire", "connection")}
            style={{
                left: `calc(${startX}px - 0.5vmin)`,
                top: `${startY}px`,
                "--wire-width": `${length}px`,
                transform: `rotate(${angle}deg)`,
            }}>
            <WireHead />
        </div>
    );
};

function getLeftWire(element: Element) {
    const wire = element.closest(".wireLeft") as HTMLElement | null;
    if (!wire) {
        return null;
    }
    const type = wire.dataset.wiretype as typeof colors[number] | null;
    if (!type) {
        return null;
    }
    return { type, wire };
}

function getRightWire(element: Element) {
    const wire = element.closest(".wireRight") as HTMLElement | null;
    if (!wire) {
        return null;
    }
    const type = wire.dataset.wiretype as typeof colors[number] | null;
    if (!type) {
        return null;
    }
    return { type, wire };
}

const colors = ["yellow", "green", "red", "blue", "black"] as const;

const AmongUsWires = ({ level }: GizmoProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const wireCount = useSignal(level.value);
    const wireDrag = useSignal<{ type: typeof colors[number]; pos: [x: number, y: number] } | undefined>(undefined);
    const cursorPosition = useSignal<[x: number, y: number]>([0, 0]);
    const leftOrder = useComputed(() => {
        const wires: typeof colors[number][] = [];
        const colorOptions = [...colors];
        for (let i = 0; i < wireCount.value; i++) {
            const index = Math.floor(Math.random() * colorOptions.length);
            const color = colorOptions[index];
            colorOptions.splice(index, 1);
            wires.push(color);
        }
        return wires;
    });
    const rightOrder = useComputed(() => {
        const wires: typeof colors[number][] = [];
        const colorOptions = [...leftOrder.value];
        const count = colorOptions.length;
        for (let i = 0; i < count; i++) {
            const color = colorOptions.splice(Math.floor(Math.random() * colorOptions.length), 1)[0];
            wires.push(color);
        }
        return wires;
    });

    const connections = useSignal<
        { type: typeof colors[number]; start: [x: number, y: number]; end: [x: number, y: number] }[]
    >([]);

    useSignalEffect(() => {
        if (connections.value.length >= wireCount.value) {
            if (level.peek() >= 5) {
                // you win
                return;
            }
            level.value = level.peek() + 1;
            setTimeout(() => {
                wireCount.value++;
                connections.value = [];
            }, 2000);
        }
    });

    return (
        <div
            class="wires"
            style={{ "--wire-count": wireCount.value }}
            ref={containerRef}
            onMouseMove={(e) => {
                if (!wireDrag.value) {
                    return;
                }
                const rect = containerRef.current?.getBoundingClientRect() ?? { left: 0, top: 0 };
                cursorPosition.value = [e.clientX - rect.left, e.clientY - rect.top];
            }}
            onMouseDown={(e) => {
                if (!e.target || !(e.target instanceof Element)) {
                    return;
                }
                const match = getLeftWire(e.target);
                if (match) {
                    // already connected
                    if (connections.value.some(({ type }) => type === match.type)) {
                        return;
                    }
                    const containerRect = containerRef.current?.getBoundingClientRect() ?? { left: 0, top: 0 };
                    const wireRect = match.wire.getBoundingClientRect();
                    wireDrag.value = {
                        type: match.type,
                        pos: [wireRect.right - containerRect.left, wireRect.top - containerRect.top],
                    };
                    cursorPosition.value = [e.clientX - containerRect.left, e.clientY - containerRect.top];
                }
            }}
            onMouseUp={(e) => {
                if (!wireDrag.value) {
                    return;
                }
                if (!e.target || !(e.target instanceof Element)) {
                    return;
                }
                const match = getRightWire(e.target);
                if (match && match.type === wireDrag.value.type) {
                    const containerRect = containerRef.current?.getBoundingClientRect() ?? { left: 0, top: 0 };
                    const wireRect = match.wire.getBoundingClientRect();
                    connections.value = [
                        {
                            type: match.type,
                            start: wireDrag.value.pos,
                            end: [wireRect.left - containerRect.left - 10, wireRect.top - containerRect.top],
                        },
                        ...connections.value,
                    ];
                }
                wireDrag.value = undefined;
            }}>
            <div class="leftPanel" />
            <div class="rightPanel" />
            {leftOrder.value.map((wireType) => (
                <>
                    <WireLeft
                        type={wireType}
                        hideHead={
                            wireDrag.value?.type === wireType || connections.value.some(({ type }) => type === wireType)
                        }
                    />
                </>
            ))}
            {rightOrder.value.map((type) => (
                <WireRight type={type} />
            ))}
            {wireDrag.value && (
                <Connection type={wireDrag.value.type} startPos={wireDrag.value.pos} endPos={cursorPosition.value} />
            )}
            {connections.value.map((connection) => {
                return <Connection type={connection.type} startPos={connection.start} endPos={connection.end} />;
            })}
        </div>
    );
};

function getImage(url: string) {
    const image = new Image();
    image.src = url;
    return image;
}

import moduleBackgroundPath from "../assets/images/wireCutting/wireless_module.png";

import wiresUncut1Path from "../assets/images/wireCutting/wire1_full.png";
import wiresUncut2Path from "../assets/images/wireCutting/wire2_full.png";
import wiresUncut3Path from "../assets/images/wireCutting/wire3_full.png";
import wiresUncut4Path from "../assets/images/wireCutting/wire4_full.png";
import wiresUncut5Path from "../assets/images/wireCutting/wire5_full.png";
import wiresUncut6Path from "../assets/images/wireCutting/wire6_full.png";

import { HelpButton } from "~/components/HelpButton";
import wiresCut1Path from "../assets/images/wireCutting/wire1_cut.png";
import wiresCut2Path from "../assets/images/wireCutting/wire2_cut.png";
import wiresCut3Path from "../assets/images/wireCutting/wire3_cut.png";
import wiresCut4Path from "../assets/images/wireCutting/wire4_cut.png";
import wiresCut5Path from "../assets/images/wireCutting/wire5_cut.png";
import wiresCut6Path from "../assets/images/wireCutting/wire6_cut.png";

const moduleBackground = getImage(moduleBackgroundPath);
const wiresCut = [
    getImage(wiresCut1Path),
    getImage(wiresCut2Path),
    getImage(wiresCut3Path),
    getImage(wiresCut4Path),
    getImage(wiresCut5Path),
    getImage(wiresCut6Path),
];
const wiresUncut = [
    getImage(wiresUncut1Path),
    getImage(wiresUncut2Path),
    getImage(wiresUncut3Path),
    getImage(wiresUncut4Path),
    getImage(wiresUncut5Path),
    getImage(wiresUncut6Path),
];

const tints: { [key: string]: string | undefined } = {
    red: "#dd0f0f",
    yellow: "#dfdf00",
    blue: "#5252ff",
};

const tintCache = new Map<string, HTMLCanvasElement>();
function getTintedVersionOfImage(image: HTMLImageElement, tintColor: string) {
    const key = `${image.src}#${tintColor}`;
    if (tintCache.has(key)) {
        return tintCache.get(key)!;
    }
    if (!image.complete) {
        const canvas = document.createElement("canvas");
        canvas.width = 1080;
        canvas.height = 1080;
        // @ts-ignore
        canvas.loaded = false;
        return canvas;
    }

    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = tints[tintColor] ?? tintColor;
    ctx.drawImage(image, 0, 0);
    ctx.globalCompositeOperation = "multiply";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(image, 0, 0);
    tintCache.set(key, canvas);
    return canvas;
}

interface WireContext {
    wires: KeepTalkingWire[];
}
type WireRule = (context: WireContext) => number[];

interface WireRuleList {
    [key: string]: WireRule[];
}
const wireRules: WireRuleList = {
    4: [
        // Cut every wire.
        (context) => {
            return context.wires.map((x) => x.position);
        },
    ],
    // 3: [
    //     // If there are no red wires, cut the second wire.
    //     (context) => {
    //         if (!context.wires.some((wire) => wire.color === "red")) {
    //             return [context.wires[1].position];
    //         }
    //         return [];
    //     },
    //     // Otherwise, if the last wire is white, cut the last wire.
    //     (context) => {
    //         if (context.wires[context.wires.length - 1].color === "white") {
    //             return [context.wires.length - 1];
    //         }

    //         return [];
    //     },
    //     // Otherwise, if there is more than one blue wire, cut the last blue wire.
    //     (context) => {
    //         const blueWires = context.wires.filter((wire) => wire.color === "blue");
    //         if (blueWires.length > 1) {
    //             return [blueWires[blueWires.length - 1].position];
    //         }
    //         return [];
    //     },
    //     // Otherwise, cut the last wire.
    //     (context) => {
    //         return [context.wires[context.wires.length - 1].position];
    //     },
    // ],
};

function determineAppropriateWiresToCut(wires: KeepTalkingWire[]): number[] {
    const ruleList = wireRules[wires.length];
    if (!ruleList) {
        return [];
    }

    for (const rule of ruleList) {
        const result = rule({ wires });
        if (result.length > 0) {
            return result;
        }
    }

    return [];
}

function generateWires(count: number): KeepTalkingWire[] {
    const colors = ["red", "blue", "yellow", "white", "black"];
    const wires: KeepTalkingWire[] = [];
    let possibleSkips = 6 - count;
    for (let i = 0; i < 6 && wires.length < count; i++) {
        if (Math.random() < 0.4 && possibleSkips > 0) {
            possibleSkips--;
            continue;
        }
        wires.push({
            color: colors[Math.floor(Math.random() * colors.length)],
            isCut: false,
            position: i,
        });
    }
    return wires;
}

interface KeepTalkingWire {
    color: string;
    position: number;
    isCut: boolean;
}

const KeepTalkingWires = ({ level }: GizmoProps) => {
    const time = useGameTime();
    const cursorPosition = useSignal([0, 0]);
    const wires = useSignal<KeepTalkingWire[]>([]);

    useSignalEffect(() => {
        wires.value = generateWires(level.value - 2);
    });

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const hoveringWire = useSignal<number | null>(null);

    return (
        <div className="wirecutting">
            <HelpButton>
                <WiresHelp />
            </HelpButton>
            <Canvas
                width={1080}
                height={1080}
                canvasRef={canvasRef}
                onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    cursorPosition.value = [
                        ((e.clientX - rect.left) / rect.width) * 1080,
                        ((e.clientY - rect.top) / rect.height) * 1080,
                    ];
                }}
                onClick={() => {
                    const wire = wires.value.find((w) => w.position === hoveringWire.value);
                    if (wire) {
                        wire.isCut = true;
                        const wiresToCut = determineAppropriateWiresToCut(wires.value);
                        console.log(wiresToCut);
                        if (wiresToCut.length === 0) {
                            // TODO: Fail
                            console.log("Failed");
                            return;
                        }
                        const incorrectCuts = wires.value.filter((w) => w.isCut && !wiresToCut.includes(w.position));
                        if (incorrectCuts.length > 0) {
                            // TODO: Fail
                            console.log("Failed");
                            return;
                        }
                        const correctCuts = wires.value.filter((w) => w.isCut && wiresToCut.includes(w.position));
                        if (correctCuts.length === wiresToCut.length) {
                            // TODO: win
                            console.log("Win");
                        }
                    }
                }}
                tick={(canvas, context) => {
                    time.value; // force update

                    context.clearRect(0, 0, canvas.width, canvas.height);
                    context.drawImage(moduleBackground, 0, 0, canvas.width, canvas.height);
                    let hoveringOverWire = false;
                    for (const wire of wires.value) {
                        const image = wire.isCut ? wiresCut[wire.position] : wiresUncut[wire.position];
                        const canvas = getTintedVersionOfImage(image, wire.color);

                        let isHovering = false;
                        const wireContext = canvas.getContext("2d")!;
                        const [x, y] = cursorPosition.value;
                        const alphaUnderCursor = wireContext.getImageData(x, y, 1, 1).data[3];
                        if (alphaUnderCursor > 100) {
                            // hovering
                            isHovering = true;
                        }

                        if (isHovering) {
                            context.shadowBlur = 30;
                            context.shadowColor = "black";
                            context.shadowOffsetX = 10;
                            context.shadowOffsetY = 10;
                            hoveringOverWire = true;
                            hoveringWire.value = wire.position;
                        } else {
                            context.shadowColor = "transparent";
                        }
                        context.drawImage(canvas, 0, 0, canvas.width, canvas.height);
                    }
                    if (hoveringOverWire) {
                        canvasRef.current!.style.cursor = "pointer";
                    } else {
                        canvasRef.current!.style.cursor = "unset";
                        hoveringWire.value = null;
                    }
                }}
            />
        </div>
    );
};

export const Wires = ({ level }: GizmoProps) => {
    if (level.value < 6) {
        return <AmongUsWires level={level} />;
    }
    return <KeepTalkingWires level={level} />;
};

import WiresHelp from "./WiresHelp.mdx";
