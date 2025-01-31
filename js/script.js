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

function showSpinner() {
    document.querySelector('.spinner').classList.add('show');
}

function hideSpinner() {
    document.querySelector('.spinner').classList.remove('show');
}

async function fetchAPIData(endpoint) {
    const API_KEY =
        'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjNzNiYjk4YmViZjIzZjg4ODk5ZjE0OGZhZTZlNTlhNSIsIm5iZiI6MTczNzgzNjEwMy4zNjgsInN1YiI6IjY3OTU0NjQ3YTZlNDEyODNmMTJhZTc5NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.4ntt2Gjy1yrz9ogxJgM8la9xmZdrG8CxO52KhGpukWg';
    const api_URL = 'https://api.themoviedb.org/3';
    const url = `${api_URL}/${endpoint}?language=en-US`;

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
    showSpinner();

    const result = await fetchAPIData(`trending/${mediaType}/week`);
    const mediaList = result.results;

    mediaList.forEach((media) => {
        const card = cardGenerator(media);
        const id = mediaType === 'movie' ? '#popular-movies' : '#popular-shows';
        document.querySelector(id).appendChild(card);
    });

    hideSpinner();
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

function addCommasToNum(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

async function fetchDetails(mediaType) {
    showSpinner();

    const mediaID = window.location.search.split('=')[1];
    const media = await fetchAPIData(`${mediaType}/${mediaID}`);

    const topDetails = document.createElement('div');
    topDetails.className = 'details-top';
    topDetails.innerHTML = `
                    <div>
                        <img src="${
                            media.poster_path
                                ? `https://image.tmdb.org/t/p/original/${media.poster_path}`
                                : './images/no-image.jpg'
                        }" class="card-img-top" alt="${mediaType === 'movie' ? 'Movie Title' : 'Show Title'}" />
                    </div>
                    <div>
                        <h2>${mediaType === 'movie' ? media.title : media.name}</h2>
                        <p>
                            <i class="fas fa-star text-primary"></i>
                            ${media.vote_average.toFixed(1)} / 10
                        </p>
                        <p class="text-muted">${
                            mediaType === 'movie'
                                ? `Release Date: ${media.release_date}`
                                : `First Aired: ${media.first_air_date}`
                        }</p>
                        <p>
                            ${media.overview}
                        </p>
                        <h5>Genres</h5>
                        <ul class="list-group">
                            ${media.genres.map((genre) => `<li>${genre.name}</li>`).join('')}
                        </ul>
                        <a href="${media.homepage}" target="_blank" class="btn">Visit ${
        mediaType === 'movie' ? 'Movie' : 'TV Show'
    } Homepage</a>
                    </div>`;

    const bottomDetails = document.createElement('div');
    bottomDetails.className = 'details-bottom';
    bottomDetails.innerHTML = `
                    <h2>${mediaType === 'movie' ? 'Movie Info' : 'TV Show Info'}</h2>
                    <ul>
                        ${
                            mediaType === 'movie'
                                ? `<li>
                            <span class="text-secondary">Budget:</span>
                            $${addCommasToNum(media.budget)}
                        </li>
                        <li>
                            <span class="text-secondary">Revenue:</span>
                            $${addCommasToNum(media.revenue)}
                        </li>
                        <li><span class="text-secondary">Runtime:</span> ${media.runtime}</li>`
                                : `<li>
                            <span class="text-secondary">Number Of Episodes:</span>
                            ${media.number_of_episodes}
                        </li>
                        <li>
                            <span class="text-secondary">Last Episode To Air:</span>
                            ${media.last_air_date}
                        </li>`
                        }
                        <li><span class="text-secondary">Status:</span> ${media.status}</li>
                    </ul>
                    <h4>Production Companies</h4>
                    <div class="list-group">${media.production_companies
                        .map((company) => `<span>${company.name}</span>`)
                        .join(', ')}</div>
                </div>`;

    const details = document.querySelector('#details');
    details.appendChild(topDetails);
    details.appendChild(bottomDetails);

    hideSpinner();
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
            fetchDetails('movie');
            break;
        case '/tv-details.html':
            fetchDetails('tv');
            break;
        case '/search.html':
            console.log('search');
            break;
    }

    highlightActiveNavLink();
}

document.addEventListener('DOMContentLoaded', init);
