import {useEffect, useRef, useState} from "react";
import StarRating from "./StarRating";
import {useMovies} from "./useMovies";
import {useLocalStorageState} from "./useLocalStorageState";
import {useKey} from "./useKey";

const average = (arr) => arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const KEY = 'd4cb29eb';

// Render Logic should not include side effect
export default function App() {
    const [query, setQuery] = useState("");
    const [selectedId, setSelectedId] = useState(null);
    const {movies, isLoading, error} = useMovies(query);
    const [watched, setWatched] = useLocalStorageState([], 'watched');


    function handleSelectMovie(id) {
        setSelectedId((selectedId) => (id === selectedId ? null : id));
    }

    function handleCloseMovie() {
        setSelectedId(null);
    }

    function handleAddWatched(movie) {
        setWatched((watched) => [...watched, movie]);
    }

    function handleDeleteWatchedMovie(selectedMovieId) {
        setWatched((watched) => watched.filter((movie) => movie.imdbID !== selectedMovieId));
    }


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
                    {selectedId ? <MovieDetails
                            selectedId={selectedId}
                            onCloseMovie={handleCloseMovie}
                            onAddWatched={handleAddWatched}
                            watched={watched}
                        /> :
                        <>
                            <WatchedSummary watched={watched}/>
                            <WatchedMoviesList watched={watched} onDeletedWatched={handleDeleteWatchedMovie}/>
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
    const inputElement = useRef(null);

    useKey('Enter', function () {
        if (document.activeElement === inputElement.current) return;
        inputElement.current.focus();
        setQuery('');
    })

    return (
        <input
            className="search"
            type="text"
            placeholder="Search movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            ref={inputElement}
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
const WatchedMoviesList = ({watched, onDeletedWatched}) => {
    return (
        <ul className="list">
            {watched.map((movie) => (
                <WatchedMovie movie={movie} key={movie.imdbID} onDeletedWatched={onDeletedWatched}/>
            ))}
        </ul>
    )
}

// Presentational Component
const WatchedMovie = ({movie, onDeletedWatched}) => {
    return (
        <li>
            <img src={movie.poster} alt={`${movie.title} poster`}/>
            <h3>{movie.title}</h3>
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
                <button className={'btn-delete'} onClick={() => onDeletedWatched(movie.imdbID)}>X</button>
            </div>
        </li>
    )

}

function MovieDetails({selectedId, onCloseMovie, onAddWatched, watched}) {
    const [movie, setMovie] = useState({});
    const [userRating, setUserRating] = useState("");
    const [isLoading, setIsLoading] = useState(false);


    const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
    const watchedUserRating = watched.find((movie) => movie.imdbID === selectedId)?.userRating;

    const countRef = useRef(0);

    useEffect(() => {
        if (userRating) countRef.current++;
        console.log(countRef.current);
    }, [userRating]);


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

    function handleAddWatched() {
        const newWatchedMovie = {
            imdbID: selectedId,
            imdbRating: Number(imdbRating),
            userRating: Number(userRating),
            title: title,
            year: year,
            poster: poster,
            runtime: Number(runtime.split(" ")[0]),
            plot: plot,
            released: released,
            actors: actors,
            director: director,
            genre: genre,
            countRatingDecisions: countRef.current,

        }
        onAddWatched(newWatchedMovie);
        onCloseMovie();
    }


    useKey('Escape', onCloseMovie)


    useEffect(function () {
        async function getMoviesDetails() {
            try {
                setIsLoading(true);
                const response = await fetch(`https://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`);
                const data = await response.json();
                setMovie(data);
                setIsLoading(false);
            } catch (e) {
                console.error(e);
            }
        }

        getMoviesDetails();
    }, [selectedId]);


    useEffect(function () {
        if (!title) return;
        document.title = `Movie | ${title}`;

        return function () {
            document.title = 'usePopcorn';
        }
    }, [title]);


    return (
        <div className='details'>
            {isLoading ? <Loader/> :
                <>
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
                            {!isWatched ?
                                (
                                    <>
                                        <StarRating
                                            maxRating={10}
                                            size={24}
                                            onSetRating={setUserRating}
                                        />
                                        {userRating > 0 &&
                                            (<button className={'btn-add'} onClick={handleAddWatched}>Add to
                                                Watched</button>)}
                                    </>
                                ) : (<p>You already watched this movie {watchedUserRating}<span>🌟</span></p>)}
                        </div>
                        <p><em>{plot}</em></p>
                        <p>Starring {actors}</p>
                        <p>Directed By {director}</p>
                    </section>
                </>
            }
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
                    <span>{avgImdbRating.toFixed(2)}</span>
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


