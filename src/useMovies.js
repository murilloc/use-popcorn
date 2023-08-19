import {useEffect, useState} from "react";

const KEY = 'd4cb29eb';

export function useMovies(query) {
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [error, setError] = useState("");


    useEffect(function () {
        // Browser API
        const controller = new AbortController();

        async function fetchMovies() {
            try {
                setIsLoading(true);
                setError("");
                const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=${query}`, {signal: controller.signal});
                if (!res.ok) {
                    throw new Error("Error when fetching movies");
                }
                const data = await res.json();
                if (data.Response === 'False') {
                    throw new Error(data.Error);
                }
                setError("");
                setMovies(data.Search);
                setIsLoading(false);
            } catch (e) {
                if (e.name !== "AbortError") setError(e.message);
            } finally {
                setIsLoading(false);
            }

        }

        if (query.length < 3) {
            setMovies([]);
            setError("");
            return;
        }
        //handleCloseMovie();
        fetchMovies().then(r => console.log(r));

        return function () {
            controller.abort();
        }

    }, [query]);

    //return {movies, isLoading, error};
    return {movies, isLoading, error};

}

