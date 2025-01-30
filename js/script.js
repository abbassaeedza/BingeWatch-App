const API_KEY = 'xxx';
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

async function fetchTrending(mediaType) {
    const url = `https://api.themoviedb.org/3/trending/${mediaType}/week?language=en-US`;

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
        const result = await response.json();
        const mediaList = result.results;

        mediaList.forEach((media) => {
            const card = cardGenerator(media);
            const id = mediaType === 'movie' ? '#popular-movies' : '#popular-shows';
            document.querySelector(id).appendChild(card);
        });
    } catch (error) {
        console.log(error);
    }
}

function cardGenerator(media) {
    const card = document.createElement('div');
    card.className = 'card';

    const cardLink = document.createElement('a');
    const href = media.media_type === 'movie' ? `movie-details.html` : `tv-details.html`;

    cardLink.setAttribute('href', `${href}?id=${media.id}`);
    const img = document.createElement('img');
    img.setAttribute('src', `https://image.tmdb.org/t/p/original/${media.poster_path}`);
    img.alt = media.media_type === 'movie' ? 'Movie Title' : 'Show Title';
    img.className = 'card-img-top';
    cardLink.appendChild(img);

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    const cardTitle = document.createElement('h5');
    cardTitle.className = 'card-title';
    cardTitle.textmedia = media.title;
    const cardDesc = document.createElement('p');
    cardDesc.className = 'card-text';
    const cardRel = document.createElement('small');
    cardRel.className = 'text-muted';
    cardRel.textmedia = `Release: ${media.release_date}`;
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
            console.log('movies');
            fetchTrending('movie');
            break;
        case '/shows.html':
            console.log('shows');
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
