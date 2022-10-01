import { useComputed, useSignal, useSignalEffect } from "@preact/signals";
import cn from "classnames";
import { useRef } from "preact/hooks";
import { GizmoProps } from "~/Game";
import "./Wires.css";
interface WireLeftProps {
    readonly type: typeof colors[number];
    readonly hideHead: boolean;
}
const WireLeft = ({ type, hideHead }: WireLeftProps) => {
    return (
        <div class={cn("wire", "wireLeft")} data-wiretype={type}>
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

export const Wires = ({ level }: GizmoProps) => {
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
