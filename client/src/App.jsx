import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Editor from "./pages/Editor";
import Settings from "./pages/Settings";
import Delete from "./pages/Delete";
import Reset from "./pages/Reset";

import LoadingOverlay from "./components/LoadingOverlay";

export default function App() {
    return (
        <div className="min-h-screen bg-black text-white">

            <LoadingOverlay />

            <Routes>

                <Route
                    path="/"
                    element={<Home />}
                />

                {/* Empty workspace */}
                <Route
                    path="/editor"
                    element={<Editor />}
                />

                {/* Workspace filtered by one or more tags */}
                <Route
                    path="/editor/:tags"
                    element={<Editor />}
                />

                <Route
                    path="/delete/:id"
                    element={<Delete />}
                />

                <Route
                    path="/settings"
                    element={<Settings />}
                />

                <Route
                    path="/reset"
                    element={<Reset />}
                />

            </Routes>

        </div>
    );
}