import movieSrc from '/uh2.mp4';
let movie!: HTMLVideoElement

export const setupMovie = () => {
    movie = document.getElementById("video") as HTMLVideoElement;
    movie.src = movieSrc;
}

export const playMovie = (onStart: () => void) => {
    movie.currentTime = 0;
    movie.volume = 1;
    movie.play()
    movie.addEventListener('play', onStart);
}

// Movie duration in seconds
export const getMovieDuration = () => {
    return movie.duration * 1000;
}

export const getMovieElement = (): HTMLVideoElement => movie;