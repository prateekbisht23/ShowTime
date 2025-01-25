async function fetchMovies() {
    try {
        // Fetch Now Playing Movies
        const nowPlayingResponse = await fetch(
            `${config.tmdbBaseUrl}/movie/now_playing?api_key=${config.tmdbApiKey}&language=en-US&page=1`
        );
        const nowPlayingData = await nowPlayingResponse.json();

        // Fetch Upcoming Movies
        const upcomingResponse = await fetch(
            `${config.tmdbBaseUrl}/movie/upcoming?api_key=${config.tmdbApiKey}&language=en-US&page=1`
        );
        const upcomingData = await upcomingResponse.json();

        // Filter out movies that are both in upcoming and now playing
        const nowPlayingIds = new Set(nowPlayingData.results.map(m => m.id));
        const uniqueUpcoming = upcomingData.results.filter(movie => !nowPlayingIds.has(movie.id));

        // Update Featured Section with the highest rated current movie
        const featuredMovie = nowPlayingData.results
            .sort((a, b) => b.vote_average - a.vote_average)[0];
        updateFeaturedSection(featuredMovie);

        // Update Now Playing Section
        const nowPlayingContainer = document.querySelector('.movie-section:nth-of-type(4) .movie-grid');
        nowPlayingContainer.innerHTML = '';
        
        nowPlayingData.results.slice(0, 4).forEach(movie => {
            const movieCard = createMovieCard(movie, 'now-playing');
            nowPlayingContainer.appendChild(movieCard);
        });

        // Update Upcoming Section
        const upcomingContainer = document.querySelector('.movie-section:nth-of-type(3) .movie-grid');
        upcomingContainer.innerHTML = '';

        uniqueUpcoming.slice(0, 4).forEach(movie => {
            const movieCard = createMovieCard(movie, 'upcoming');
            upcomingContainer.appendChild(movieCard);
        });

    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}

function updateFeaturedSection(movie) {
    const featuredSection = document.querySelector('.featured-banner');
    const releaseDate = new Date(movie.release_date);
    const formattedDate = releaseDate.toLocaleDateString('en-US', { 
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    featuredSection.innerHTML = `
        <div class="featured-content">
            <h2>Featured This Week</h2>
            <div class="featured-movie-info">
                <h3>${movie.title}</h3>
                <p class="featured-rating">⭐ ${movie.vote_average.toFixed(1)}/10</p>
                <p class="featured-overview">${movie.overview}</p>
                <p class="featured-release">Release Date: ${formattedDate}</p>
                <button class="btn featured-btn">Book Now</button>
            </div>
        </div>
        <img src="${config.tmdbBackdropBaseUrl}${movie.backdrop_path}" 
             alt="${movie.title}" 
             class="featured-image">
    `;
}

function createMovieCard(movie, type) {
    const card = document.createElement('div');
    card.className = 'movie-card';

    const releaseDate = new Date(movie.release_date);
    const formattedDate = releaseDate.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric' 
    });

    if (type === 'upcoming') {
        // Keep the original layout for upcoming movies
        card.innerHTML = `
            <img src="${config.tmdbImageBaseUrl}${movie.poster_path}" 
                 alt="${movie.title}" 
                 class="movie-poster">
            <div class="movie-content">
                <h3 class="movie-title">
                    <a href="#" onclick="openIMDB('${movie.id}')" class="movie-title-link">${movie.title}</a>
                </h3>
                <div class="movie-info">
                    <div class="movie-details" style="flex-direction: column; align-items: center;">
                        <span class="release-date">Coming ${formattedDate}</span>
                        <button class="btn-small">Notify Me</button>
                    </div>
                </div>
            </div>
        `;
    } else {
        // Modified layout for now showing movies with rating and button side by side
        card.innerHTML = `
            <img src="${config.tmdbImageBaseUrl}${movie.poster_path}" 
                 alt="${movie.title}" 
                 class="movie-poster">
            <div class="movie-content">
                <h3 class="movie-title">
                    <a href="#" onclick="openIMDB('${movie.id}')" class="movie-title-link">${movie.title}</a>
                </h3>
                <div class="movie-info">
                    <div class="movie-details" style="flex-direction: row; justify-content: space-between; align-items: center; padding: 0.5rem;">
                        <span class="rating">⭐ ${movie.vote_average.toFixed(1)}/10</span>
                        <button class="btn-small">Book Now</button>
                    </div>
                </div>
            </div>
        `;
    }

    return card;
}

async function openIMDB(tmdbId) {
    try {
        const response = await fetch(
            `${config.tmdbBaseUrl}/movie/${tmdbId}?api_key=${config.tmdbApiKey}&language=en-US`
        );
        const movieData = await response.json();
        
        if (movieData.imdb_id) {
            window.open(`https://www.imdb.com/title/${movieData.imdb_id}`, '_blank');
        }
    } catch (error) {
        console.error('Error fetching IMDB ID:', error);
    }
}

// Load movies when the page loads
document.addEventListener('DOMContentLoaded', fetchMovies); 