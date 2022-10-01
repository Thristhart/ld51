import { Signal, useSignal, useSignalEffect } from "@preact/signals";
import cn from "classnames";
import { useEffect, useState } from "preact/hooks";
import { GizmoProps } from "~/Game";
import "./Wordle.css";
import wordList from "./wordle_wordlist.json";

function getRandomAnswer() {
    return wordList.correct[Math.floor(Math.random() * wordList.correct.length)];
}

interface GuessLetterProps {
    readonly letter: string;
    readonly type: "hit" | "near" | "miss" | "filled" | "none";
    readonly className?: string;
}
const GuessLetter = ({ letter, type, className }: GuessLetterProps) => {
    return <span class={cn("guessLetter", type, className)}>{letter === " " ? <>&nbsp;</> : letter}</span>;
};

interface GuessProps {
    readonly guess: string;
    readonly word: Signal<string>;
    readonly isInput?: boolean;
    readonly isInvalid?: Signal<boolean>;
}
const Guess = ({ guess, word, isInput, isInvalid }: GuessProps) => {
    const [initialInputState] = useState(isInput);
    if (initialInputState !== isInput) {
        console.log("changed isInput", isInput);
    }
    return (
        <span class={cn("guess", { invalid: isInvalid?.value })}>
            {guess.split("").map((guessLetter, letterIndex) => (
                <GuessLetter
                    letter={guessLetter}
                    type={
                        isInput
                            ? guessLetter === " "
                                ? "none"
                                : "filled"
                            : guessLetter === word.value[letterIndex]
                            ? "hit"
                            : word.value.includes(guessLetter)
                            ? "near"
                            : "miss"
                    }
                />
            ))}
        </span>
    );
};

export const Wordle = ({ level }: GizmoProps) => {
    const word = useSignal(getRandomAnswer());
    const guess = useSignal("");
    const guesses = useSignal<string[]>([]);

    const isGuessInvalid = useSignal(false);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Enter") {
                if (wordList.valid.includes(guess.value) || wordList.correct.includes(guess.value)) {
                    guesses.value = [...guesses.value, guess.value];
                    guess.value = "";
                } else {
                    isGuessInvalid.value = true;
                    setTimeout(() => {
                        isGuessInvalid.value = false;
                    }, 300);
                }
            } else if (event.key === "Backspace") {
                guess.value = guess.value.slice(0, -1);
            } else if (event.key.length === 1 && event.key.match(/[a-z]/i)) {
                if (guess.value.length < 5) {
                    guess.value += event.key.toLowerCase();
                }
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [guess]);

    // 2 is correct, 1 is incorrect, false is not ended
    const hasEnded = useSignal<false | 1 | 2>(false);

    useSignalEffect(() => {
        if (hasEnded.value) {
            return;
        }
        if (guesses.value.includes(word.value)) {
            level.value += 1;
            hasEnded.value = 2;
        }
        if (guesses.value.length === 5) {
            hasEnded.value = 1;
        }
        if (hasEnded.value) {
            word.value = getRandomAnswer();
            guesses.value = [];
            guess.value = "";
        }
    });

    return (
        <div class={cn("wordle", hasEnded.value && "ended", hasEnded.value === 2 && "correct")}>
            {guesses.value.map((guess, index) => {
                return <Guess guess={guess} word={word} key={index} />;
            })}

            {guesses.value.length < 5 && (
                <Guess
                    isInput={true}
                    guess={guess.value.padEnd(5)}
                    word={word}
                    key={guesses.value.length}
                    isInvalid={isGuessInvalid}
                />
            )}

            {Array.from({ length: 4 - guesses.value.length }, (_, index) => (
                <Guess isInput={true} guess={"".padEnd(5)} word={word} key={guesses.value.length + index + 1} />
            ))}
        </div>
    );
};
