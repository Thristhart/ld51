import { render } from "preact";
import { Game } from "~/Game";
import "~/input";
import "~/style.css";

render(<Game />, document.querySelector("main")!);
