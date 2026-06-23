import { createContext, useContext, useState } from "react";

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("Loading...");

    const showLoading = (text = "Loading...") => {
        setMessage(text);
        setLoading(true);
    };

    const hideLoading = () => {
        setLoading(false);
        setMessage("Loading...");
    };

    return (
        <LoadingContext.Provider
            value={{
                loading,
                message,
                showLoading,
                hideLoading
            }}
        >
            {children}
        </LoadingContext.Provider>
    );
}

export function useLoading() {
    return useContext(LoadingContext);
}