import { batch, Signal, signal, useComputed, useSignal } from "@preact/signals";
import classNames from "classnames";
import { useMemo } from "preact/hooks";
import { Canvas } from "~/components/Canvas";
import { GizmoProps, useGameTime } from "~/Game";

const gridSize = 10;

type Grid = Signal<boolean>[][];
function makeEmptyGrid() {
    const grid: Signal<boolean>[][] = [];
    for (let i = 0; i < gridSize; i++) {
        grid[i] = [];
        for (let j = 0; j < gridSize; j++) {
            grid[i][j] = signal(false);
        }
    }
    return grid;
}
function getRowWidth(grid: Grid, row: number) {
    if (row >= gridSize) return 5;
    let width = 0;
    for (let i = 0; i < gridSize; i++) {
        if (grid[row][i].peek()) {
            width++;
        }
    }
    return width;
}

export const Stacker = ({ level, completed }: GizmoProps) => {
    const time = useGameTime();
    const grid = useMemo(makeEmptyGrid, []);
    const gridSignal = useSignal(grid);
    const currentRow = useSignal(gridSize - 1);
    const scanDuration = useComputed(() => 5000 / level.value);

    return (
        <Canvas
            width={640}
            height={640}
            class={classNames("stacker", completed.value && "completed")}
            tick={(canvas, context) => {
                const totalDuration = scanDuration.value * 2;
                let period = time.value % totalDuration;
                if (period > totalDuration / 2) {
                    period = totalDuration - period;
                }
                context.clearRect(0, 0, canvas.width, canvas.height);

                const currentSize = getRowWidth(gridSignal.value, currentRow.value + 1);

                const position = 0 + Math.floor((period / scanDuration.value) * (gridSize - currentSize));

                for (let x = 0; x < gridSize; x++) {
                    if (x < position || x >= position + currentSize) {
                        gridSignal.value[currentRow.value][x].value = false;
                    } else {
                        gridSignal.value[currentRow.value][x].value = true;
                    }
                }

                for (let y = 0; y < gridSize; y++) {
                    for (let x = 0; x < gridSize; x++) {
                        const cell = gridSignal.value[y][x];
                        if (cell.value) {
                            context.fillStyle = "cornflowerblue";
                            context.fillRect(
                                (x * canvas.width) / gridSize,
                                (y * canvas.height) / gridSize,
                                canvas.width / gridSize,
                                canvas.height / gridSize
                            );
                        }
                    }
                }
            }}
            onClick={() => {
                batch(() => {
                    currentRow.value--;
                    const rowBelow = gridSignal.value[currentRow.value + 2];
                    const myRow = gridSignal.value[currentRow.value + 1];
                    if (rowBelow) {
                        for (let i = 0; i < rowBelow.length; i++) {
                            myRow[i].value = myRow[i].peek() && rowBelow[i].peek();
                        }
                    }
                    if (myRow.every((cell) => !cell.peek())) {
                        // lose
                        gridSignal.value = makeEmptyGrid();
                        currentRow.value = gridSize - 1;
                        return;
                    }
                    if (currentRow.value < 0) {
                        currentRow.value = gridSize - 1;
                        if (level.value === 5) {
                            completed.value = true;
                            return;
                        }
                        level.value++;
                        gridSignal.value = makeEmptyGrid();
                    }
                });
            }}
        />
    );
};
