import { Signal, useSignal, useSignalEffect } from "@preact/signals";
import cn from "classnames";
import { useEffect, useMemo } from "preact/hooks";
import { GizmoProps } from "~/Game";
import "./Wordle.css";
import wordList from "./wordle_wordlist.json";

function getRandomAnswer(level: Signal<number>) {
    let success = false;
    let attempt = "";
    let possibleMatches: string[] = [];
    while (!success) {
        attempt = wordList.correct[Math.floor(Math.random() * wordList.correct.length)];
        possibleMatches = [];
        possibleMatches = [
            ...possibleMatches,
            ...[...wordList.valid, ...wordList.correct].filter((x) =>
                isWordAXLettersFromWordB(attempt, x, level.value)
            ),
        ];

        if (possibleMatches.length != 0) {
            success = true;
        }
    }
    return { word: attempt, possibleMatches };
}

function isWordAXLettersFromWordB(a: string, b: string, x: number) {
    let differences = 0;
    for (let pos = 0; pos < a.length; pos++) {
        if (a[pos] !== b[pos]) {
            differences++;
        }
    }
    return differences === x;
}

interface GuessLetterProps {
    readonly letter: string;
    readonly type: "hit" | "near" | "miss" | "filled" | "none";
    readonly className?: string;
}
const GuessLetter = ({ letter, type, className }: GuessLetterProps) => {
    return <span class={cn("guessLetter", type, className)}>{letter === " " ? <>&nbsp;</> : letter}</span>;
};

function getNotHitLetters(word: string, guess: string) {
    const notHitLetters: string[] = [];
    for (let pos = 0; pos < word.length; pos++) {
        if (word[pos] !== guess[pos]) {
            notHitLetters.push(word[pos]);
        }
    }
    return notHitLetters;
}

interface GuessProps {
    readonly guess: string;
    readonly word: Signal<string>;
    readonly isInput?: boolean;
    readonly isInvalid?: Signal<boolean>;
}
const Guess = ({ guess, word, isInput, isInvalid }: GuessProps) => {
    const notHitLetters = useMemo(() => getNotHitLetters(word.value, guess), [word.value, guess]);
    return (
        <span class={cn("guess", { invalid: isInvalid?.value })}>
            {guess.split("").map((guessLetter, letterIndex) => {
                let type: GuessLetterProps["type"] = "none";
                if (isInput) {
                    if (guessLetter !== " ") {
                        type = "filled";
                    }
                } else {
                    if (guessLetter === word.value[letterIndex]) {
                        type = "hit";
                    } else if (notHitLetters.includes(guessLetter)) {
                        type = "near";
                        notHitLetters.splice(notHitLetters.indexOf(guessLetter), 1);
                    } else {
                        type = "miss";
                    }
                }
                return <GuessLetter letter={guessLetter} type={type} />;
            })}
        </span>
    );
};

export const Wordle = ({ level }: GizmoProps) => {
    let result = useMemo(() => getRandomAnswer(level), []);
    const word = useSignal(result.word);
    const guess = useSignal("");
    const initialGuess = useMemo(
        () => result.possibleMatches[Math.floor(Math.random() * result.possibleMatches.length)],
        []
    );
    const guesses = useSignal<string[]>([initialGuess]);

    const isGuessInvalid = useSignal(false);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (hasEnded.value) {
                return;
            }
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
            setTimeout(() => {
                let result = getRandomAnswer(level);
                word.value = result.word;
                guesses.value = [result.possibleMatches[Math.floor(Math.random() * result.possibleMatches.length)]];
                guess.value = "";
                hasEnded.value = false;
            }, 2000);
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
