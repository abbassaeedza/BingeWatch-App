const SLICELEN = 31;
const global = {
    currentPage: window.location.pathname.slice(SLICELEN),
};

function highlightActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach((navLink) => {
        if (navLink.getAttribute('href').slice(1) === global.currentPage) {
            navLink.classList.add('active');
        }
    });
}

async function fetchAPIData(endpoint) {
    const API_KEY =
        'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjNzNiYjk4YmViZjIzZjg4ODk5ZjE0OGZhZTZlNTlhNSIsIm5iZiI6MTczNzgzNjEwMy4zNjgsInN1YiI6IjY3OTU0NjQ3YTZlNDEyODNmMTJhZTc5NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.4ntt2Gjy1yrz9ogxJgM8la9xmZdrG8CxO52KhGpukWg';
    const api_URL = 'https://api.themoviedb.org/3';
    const url = `${api_URL}/${endpoint}/week?language=en-US`;

    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${API_KEY}`,
        },
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`Request Failed ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.log(error);
    }
}

async function fetchTrending(mediaType) {
    document.querySelector('.spinner').classList.toggle('show');

    const result = await fetchAPIData(`trending/${mediaType}`);
    const mediaList = result.results;

    mediaList.forEach((media) => {
        const card = cardGenerator(media);
        const id = mediaType === 'movie' ? '#popular-movies' : '#popular-shows';
        document.querySelector(id).appendChild(card);
    });
    document.querySelector('.spinner').classList.toggle('show');
}

function cardGenerator(media) {
    const card = document.createElement('div');
    card.className = 'card';

    const cardLink = document.createElement('a');
    const href = media.media_type === 'movie' ? `movie-details.html` : `tv-details.html`;

    cardLink.setAttribute('href', `${href}?id=${media.id}`);
    const img = document.createElement('img');
    img.src = media.poster_path ? `https://image.tmdb.org/t/p/original/${media.poster_path}` : './images/no-image.jpg';
    img.alt = media.media_type === 'movie' ? 'Movie Title' : 'Show Title';
    img.className = 'card-img-top';
    cardLink.appendChild(img);

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    const cardTitle = document.createElement('h5');
    cardTitle.className = 'card-title';
    cardTitle.textContent = media.media_type === 'movie' ? media.title : media.name;
    const cardDesc = document.createElement('p');
    cardDesc.className = 'card-text';
    const cardRel = document.createElement('small');
    cardRel.className = 'text-muted';
    cardRel.textContent =
        media.media_type === 'movie' ? `Release: ${media.release_date}` : `First Aired: ${media.first_air_date}`;
    cardDesc.appendChild(cardRel);
    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardDesc);

    card.appendChild(cardLink);
    card.appendChild(cardBody);

    return card;
}

function init() {
    switch (global.currentPage) {
        case '/':
        case '/index.html':
            console.log('home');
            break;
        case '/movies.html':
            fetchTrending('movie');
            break;
        case '/shows.html':
            fetchTrending('tv');
            break;
        case '/movie-details.html':
            console.log('movie details');
            break;
        case '/tv-details.html':
            console.log('tv details');
            break;
        case '/search.html':
            console.log('search');
            break;
    }

    highlightActiveNavLink();
}

document.addEventListener('DOMContentLoaded', init);
