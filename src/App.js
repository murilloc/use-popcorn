import {useEffect, useState} from "react";
import userEvent from "@testing-library/user-event";
import StarRating from "./StarRating";

const average = (arr) => arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = 'd4cb29eb';

// Render Logic should not include side effect
export default function App() {
    const [query, setQuery] = useState("Terminator");
    const [movies, setMovies] = useState([]);
    const [watched, setWatched] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedId, setSelectedId] = useState(null);

    function handleSelectMovie(id) {
        setSelectedId((selectedId) => (id === selectedId ? null : id));
    }

    function handleCloseMovie() {
        setSelectedId(null);
    }

    useEffect(function () {
        async function fetchMovies() {
            try {
                setIsLoading(true);
                setError("");
                const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=${query}`);
                if (!res.ok) {
                    throw new Error("Error when fetching movies");
                }
                const data = await res.json();
                if (data.Response === 'False') {
                    throw new Error(data.Error);
                }
                setMovies(data.Search);
                console.log(data.Search)
                setIsLoading(false);
            } catch (e) {
                setError(e.message);
            } finally {
                setIsLoading(false);
            }

        }

        if (query.length < 3) {
            setMovies([]);
            setError("");
            return;
        }
        fetchMovies();
    }, [query]);


    return (
        <>
            <NavBar>
                <SearchBar query={query} setQuery={setQuery}/>
                <NumResults movies={movies}/>
            </NavBar>
            <Main>
                <Box movies={movies}>
                    {/*{isLoading ? <Loader/> :<MovieList movies={movies}/>}*/}
                    {isLoading && <Loader/>}
                    {!isLoading && !error && <MovieList movies={movies} onSelectMovie={handleSelectMovie}/>}
                    {error && <ErrorMessage message={error}/>}
                </Box>
                <Box>
                    {selectedId ? <MovieDetails selectedId={selectedId} onCloseMovie={handleCloseMovie}/> :
                        <>
                            <WatchedSummary watched={watched}/>
                            <WatchedMoviesList watched={watched}/>
                        </>
                    }
                </Box>
            </Main>
        </>
    );
}


const Loader = () => {
    return (
        <div className="loader">
            <span role="img" aria-label="popcorn">Loading....</span>
        </div>
    )
}

const ErrorMessage = ({message}) => {
    return (
        <div className="error">
            <span role="img" aria-label="popcorn">🍿</span>
            <p>{message}</p>
        </div>
    )
}

// Stateful Component
function SearchBar({query, setQuery}) {
    return (
        <input
            className="search"
            type="text"
            placeholder="Search movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
        />
    )
}

// Presentational Component
const Logo = () => {
    return (
        <div className="logo">
            <span role="img">🍿</span>
            <h1>usePopcorn</h1>
        </div>
    )
}


// Presentational Component
const NumResults = ({movies}) => {
    return (
        <p className="num-results">
            Found <strong>{movies.length}</strong> results
        </p>
    )
}


//Structural Component
const NavBar = ({children}) => {
    return (
        <nav className="nav-bar">
            <Logo/>
            {children}
        </nav>
    )
}


// Stateful Component
const Box = ({children}) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="box">
            <button
                className="btn-toggle"
                onClick={() => setIsOpen((open) => !open)}
            >
                {isOpen ? "–" : "+"}
            </button>
            {isOpen && children}
        </div>
    )
}

// const WatchedBox = () => {
//
//     const [watched, setWatched] = useState(tempWatchedData);
//     const [isOpen2, setIsOpen2] = useState(true);
//
//     return (
//         <div className="box">
//             <button
//                 className="btn-toggle"
//                 onClick={() => setIsOpen2((open) => !open)}
//             >
//                 {isOpen2 ? "–" : "+"}
//             </button>
//             {isOpen2 && (
//                 <>
//                     <WatchedSummary watched={watched}/>
//                     <WatchedMoviesList watched={watched}/>
//                 </>
//             )}
//         </div>
//     )
// }

// Presentational Component
const MovieList = ({movies, onSelectMovie}) => {

    return (
        <ul className="list list-movies">
            {movies?.map((movie) => (
                <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie}/>
            ))}
        </ul>
    )
}

// Presentational Component
const Movie = ({movie, onSelectMovie}) => {
    return (
        <li onClick={() => onSelectMovie(movie.imdbID)}>
            <img src={movie.Poster} alt={`${movie.Title} poster`}/>
            <h3>{movie.Title}</h3>
            <div>
                <p>
                    <span>🗓</span>
                    <span>{movie.Year}</span>
                </p>
            </div>
        </li>
    )
}


// Presentational Component
const WatchedMoviesList = ({watched}) => {

    return (
        <ul className="list">
            {watched.map((movie) => (
                <WatchedMovie movie={movie} key={movie.imdbID}/>
            ))}
        </ul>
    )
}

// Presentational Component
const WatchedMovie = ({movie}) => {
    return (
        <li>
            <img src={movie.Poster} alt={`${movie.Title} poster`}/>
            <h3>{movie.Title}</h3>
            <div>
                <p>
                    <span>⭐️</span>
                    <span>{movie.imdbRating}</span>
                </p>
                <p>
                    <span>🌟</span>
                    <span>{movie.userRating}</span>
                </p>
                <p>
                    <span>⏳</span>
                    <span>{movie.runtime} min</span>
                </p>
            </div>
        </li>
    )

}

function MovieDetails({selectedId, onCloseMovie}) {
    const [movie, setMovie] = useState({});
    const [userRating, setUserRating] = useState("");

    const {
        Title: title,
        Year: year,
        Poster: poster,
        Runtime: runtime,
        imdbRating,
        Plot: plot,
        Released: released,
        Actors: actors,
        Director: director,
        Genre: genre
    } = movie;

    console.log(title, year, poster, runtime, imdbRating, plot, released, actors, director, genre);


    useEffect(function () {
        async function getMoviesDetails() {
            try {
                const response = await fetch(`https://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`);
                const data = await response.json();
                console.log(data);
                setMovie(data);
            } catch (e) {
                console.error(e);
            }
        }

        getMoviesDetails()
    }, [selectedId])

    return (
        <div className='details'>
            <header>
                <button className="btn-back" onClick={onCloseMovie}>&larr;</button>
                <img src={poster} alt={`Poster of ${movie} movie`}/>
                <div className={'details-overview'}>
                    <h2>{title}</h2>
                    <p>{released} &bull; {runtime}</p>
                    <p>{genre}</p>
                    <p><span>⭐</span>{imdbRating} IMDB Rating</p>
                </div>
            </header>
            <section>
                <div className="rating">
                <StarRating maxRating={10} size={24} onSetRating={setUserRating}
                />
                </div>
                <p><em>{plot}</em></p>
                <p>Starring {actors}</p>
                <p>Directed By {director}</p>
            </section>
        </div>
    );
}


//
const WatchedSummary = ({watched}) => {

    const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
    const avgUserRating = average(watched.map((movie) => movie.userRating));
    const avgRuntime = average(watched.map((movie) => movie.runtime));

    return (
        <div className="summary">
            <h2>Movies you watched</h2>
            <div>
                <p>
                    <span>#️⃣</span>
                    <span>{watched.length} movies</span>
                </p>
                <p>
                    <span>⭐️</span>
                    <span>{avgImdbRating}</span>
                </p>
                <p>
                    <span>🌟</span>
                    <span>{avgUserRating}</span>
                </p>
                <p>
                    <span>⏳</span>
                    <span>{avgRuntime} min</span>
                </p>
            </div>
        </div>
    )
}

//Structural Component
const Main = ({children}) => {
    return (
        <main className="main">
            {children}
        </main>
    )
}


