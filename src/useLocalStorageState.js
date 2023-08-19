import {useEffect, useState} from "react";

export function useLocalStorageState(initialState, key) {

    const [value, setValue] = useState(function () {
        const watchedData = localStorage.getItem(key);
        return watchedData ? JSON.parse(watchedData) : initialState;
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [value, key]);

    return [value,setValue]
}