/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App";
import { RepositoryContext, UIAPIContext } from "./obsidian/context";
import { LocalRepository } from "./local/local-repository";
import { LocalUI } from "./local/local-ui";

const elem = document.getElementById("root")!;
const app = (
    <StrictMode>
        {/* create context in the same shape as the obsidian plugin (view.tsx),
            backed by in-memory fixtures instead of a real vault */}
        <RepositoryContext value={new LocalRepository()}>
            <UIAPIContext value={new LocalUI()}>
                <App />
            </UIAPIContext>
        </RepositoryContext>
    </StrictMode>
);

// https://bun.com/docs/bundler/hot-reloading#import-meta-hot-data
(import.meta.hot.data.root ??= createRoot(elem)).render(app);
