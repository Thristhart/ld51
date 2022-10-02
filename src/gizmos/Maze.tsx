import { Signal, useSignal, useSignalEffect } from "@preact/signals";
import { Canvas } from "~/components/Canvas";
import { GizmoProps } from "~/Game";
import "./Maze.css";

enum Directions {
    Left,
    Right,
    Up,
    Down,
}

const maps = [
    undefined,
    {
        cells: [
            {
                x: 0,
                y: 2,
                walls: [Directions.Right],
            },
            {
                x: 0,
                y: 1,
                walls: [Directions.Right],
            },
            {
                x: 1,
                y: 0,
                walls: [Directions.Right],
            },
            {
                x: 1,
                y: 1,
                walls: [Directions.Right],
            },
        ],
        size: { x: 3, y: 3 },
        start: { x: 0, y: 2 },
        end: { x: 2, y: 0 },
    },
    {
        cells: [
            {
                x: 0,
                y: 3,
                walls: [Directions.Right],
            },
            {
                x: 0,
                y: 2,
                walls: [Directions.Right],
            },
            {
                x: 0,
                y: 1,
                walls: [Directions.Right],
            },
            {
                x: 1,
                y: 0,
                walls: [Directions.Right],
            },
            {
                x: 1,
                y: 1,
                walls: [Directions.Right],
            },
            {
                x: 1,
                y: 2,
                walls: [Directions.Right],
            },
        ],
        size: { x: 4, y: 4 },
        start: { x: 0, y: 3 },
        end: { x: 3, y: 0 },
    },
    {
        cells: [
            {
                x: 0,
                y: 2,
                walls: [Directions.Right],
            },
            {
                x: 0,
                y: 1,
                walls: [Directions.Right],
            },
            {
                x: 1,
                y: 0,
                walls: [Directions.Right],
            },
            {
                x: 1,
                y: 1,
                walls: [Directions.Right],
            },
        ],
        size: { x: 5, y: 5 },
        start: { x: 0, y: 4 },
        end: { x: 4, y: 0 },
    },
];

const canvasWidth = 640;
const canvasHeight = 640;

function drawMaze(
    context: CanvasRenderingContext2D,
    cells: { x: number; y: number; walls: Directions[] }[],
    size: { x: number; y: number },
    playerPosition: { x: number; y: number },
    goalPosition: { x: number; y: number }
) {
    const xCellSize = Math.floor(canvasWidth / size.x);
    const yCellSize = Math.floor(canvasHeight / size.y);
    //drawBG
    context.fillStyle = "white";
    context.fillRect(0, 0, canvasWidth, canvasHeight);

    //drawGrid
    context.lineWidth = 5;
    context.strokeStyle = "black";
    for (let xPos = 0; xPos <= size.x; xPos++) {
        context.beginPath();
        context.moveTo(xPos * xCellSize, 0);
        context.lineTo(xPos * xCellSize, canvasWidth);
        context.closePath();
        context.stroke();
    }
    for (let yPos = 0; yPos <= size.y; yPos++) {
        context.beginPath();
        context.moveTo(0, yPos * yCellSize);
        context.lineTo(canvasWidth, yPos * yCellSize);
        context.closePath();
        context.stroke();
    }

    //drawWalls
    for (const cell of cells) {
        const cellTopLeft = { x: cell.x * xCellSize, y: cell.y * yCellSize };
        let start: { x: number; y: number };
        let end: { x: number; y: number };
        for (const wall of cell.walls) {
            if (wall === Directions.Up) {
                start = cellTopLeft;
                end = { x: cellTopLeft.x + xCellSize, y: cellTopLeft.y };
            }
            if (wall === Directions.Left) {
                start = cellTopLeft;
                end = { x: cellTopLeft.x, y: cellTopLeft.y + yCellSize };
            }
            if (wall === Directions.Right) {
                start = { x: cellTopLeft.x + xCellSize, y: cellTopLeft.y };
                end = { x: cellTopLeft.x + xCellSize, y: cellTopLeft.y + yCellSize };
            }
            if (wall === Directions.Down) {
                start = { x: cellTopLeft.x, y: cellTopLeft.y + yCellSize };
                end = { x: cellTopLeft.x + xCellSize, y: cellTopLeft.y + yCellSize };
            }
            context.beginPath();
            context.moveTo(start!.x, start!.y);
            context.strokeStyle = "black";
            context.lineWidth = 20;
            context.lineTo(end!.x, end!.y);
            context.closePath();
            context.stroke();
        }
    }

    //drawPlayer
    context.fillStyle = "green";
    context.fillRect(
        (playerPosition.x + 0.25) * xCellSize,
        (playerPosition.y + 0.25) * yCellSize,
        0.5 * xCellSize,
        0.5 * yCellSize
    );
    //drawGoal
    context.beginPath();
    context.fillStyle = "red";
    context.moveTo((goalPosition.x + 0.5) * xCellSize, (goalPosition.y + 0.2) * yCellSize);
    context.lineTo((goalPosition.x + 0.2) * xCellSize, (goalPosition.y + 0.75) * yCellSize);
    context.lineTo((goalPosition.x + 0.8) * xCellSize, (goalPosition.y + 0.75) * yCellSize);
    context.closePath();
    context.fill();
}

function opposite(direction: Directions): Directions | undefined {
    if (direction === Directions.Right) {
        return Directions.Left;
    }
    if (direction === Directions.Left) {
        return Directions.Right;
    }
    if (direction === Directions.Up) {
        return Directions.Down;
    }
    if (direction === Directions.Down) {
        return Directions.Up;
    }
    return undefined;
}

function canPlayerGo(
    direction: Directions,
    playerPosition: { x: number; y: number },
    cells: { x: number; y: number; walls: Directions[] }[],
    size: { x: number; y: number }
): boolean {
    if (direction === Directions.Right && playerPosition.x === size.x - 1) {
        return false;
    }
    if (direction === Directions.Left && playerPosition.x === 0) {
        return false;
    }
    if (direction === Directions.Up && playerPosition.y === 0) {
        return false;
    }
    if (direction === Directions.Down && playerPosition.y === size.y - 1) {
        return false;
    }
    for (const cell of cells) {
        for (const wall of cell.walls) {
            if (direction === wall || direction === opposite(wall)) {
                if (
                    //You are going up and there is a wall at the top of your square.
                    //OR You are going up and there is a wall at the bottom of the square above you.
                    (wall === Directions.Up &&
                        direction === Directions.Up &&
                        playerPosition.y === cell.y &&
                        playerPosition.x == cell.x) ||
                    (wall === Directions.Down &&
                        direction === Directions.Up &&
                        playerPosition.y - 1 === cell.y &&
                        playerPosition.x == cell.x)
                ) {
                    return false;
                }
                if (
                    (wall === Directions.Down &&
                        direction === Directions.Down &&
                        playerPosition.y === cell.y &&
                        playerPosition.x == cell.x) ||
                    (wall === Directions.Up &&
                        direction === Directions.Down &&
                        playerPosition.y + 1 === cell.y &&
                        playerPosition.x == cell.x)
                ) {
                    return false;
                }
                if (
                    (wall === Directions.Left &&
                        direction === Directions.Left &&
                        playerPosition.x === cell.x &&
                        playerPosition.y == cell.y) ||
                    (wall === Directions.Right &&
                        direction === Directions.Left &&
                        playerPosition.x - 1 === cell.x &&
                        playerPosition.y == cell.y)
                ) {
                    return false;
                }
                if (
                    (wall === Directions.Right &&
                        direction === Directions.Right &&
                        playerPosition.x === cell.x &&
                        playerPosition.y == cell.y) ||
                    (wall === Directions.Left &&
                        direction === Directions.Right &&
                        playerPosition.x + 1 === cell.x &&
                        playerPosition.y == cell.y)
                ) {
                    return false;
                }
            }
        }
    }
    return true;
}

export const Maze = ({ level }: GizmoProps) => {
    const maze = useSignal(maps[level.value]);
    const cells = useSignal(maze.value!.cells);
    const size = useSignal(maze.value!.size);
    const playerPosition = useSignal(maze.value!.start);
    const goalPosition = useSignal(maze.value!.end);
    const direction: Signal<undefined | Directions> = useSignal(undefined);

    useSignalEffect(() => {
        if (direction.value !== undefined) {
            if (canPlayerGo(direction.value, playerPosition.value, cells.value, size.value)) {
                switch (direction.value) {
                    case Directions.Up:
                        playerPosition.value = { ...playerPosition.value, y: playerPosition.value.y - 1 };
                        break;
                    case Directions.Down:
                        playerPosition.value = { ...playerPosition.value, y: playerPosition.value.y + 1 };
                        break;
                    case Directions.Left:
                        playerPosition.value = { ...playerPosition.value, x: playerPosition.value.x - 1 };
                        break;
                    case Directions.Right:
                        playerPosition.value = { ...playerPosition.value, x: playerPosition.value.x + 1 };
                        break;
                }
                if (playerPosition.value.x == goalPosition.value.x && playerPosition.value.y == goalPosition.value.y) {
                    level.value += 1;
                    maze.value = maps[level.value];
                    cells.value = maze.value!.cells;
                    size.value = maze.value!.size;
                    playerPosition.value = maze.value!.start;
                    goalPosition.value = maze.value!.end;
                }
            }
            direction.value = undefined;
        }
    });

    return (
        <div class="mazeGizmo">
            <button
                class="upButton directionbutton"
                onClick={() => {
                    direction.value = Directions.Up;
                }}>
                ⌃
            </button>
            <button
                class="rightButton directionbutton"
                onClick={() => {
                    direction.value = Directions.Right;
                }}>
                ›
            </button>
            <button
                class="downButton directionbutton"
                onClick={() => {
                    direction.value = Directions.Down;
                }}>
                ⌄
            </button>
            <button
                class="leftButton directionbutton"
                onClick={() => {
                    direction.value = Directions.Left;
                }}>
                ‹
            </button>
            <Canvas
                width={640}
                height={640}
                tick={(_, context) => {
                    drawMaze(context, cells.value, size.value, playerPosition.value, goalPosition.value);
                }}
            />
        </div>
    );
};
