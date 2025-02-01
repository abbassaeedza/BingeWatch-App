const SLICELEN = 31;
const global = {
    currentPage: window.location.pathname.slice(SLICELEN),
    search: {
        term: '',
        type: '',
        page: 1,
        totalPages: 1,
        totalResults: 0,
    },
};

function highlightActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach((navLink) => {
        if (navLink.getAttribute('href').slice(1) === global.currentPage) {
            navLink.classList.add('active');
        }
    });
}

function showAlert(msg, className = 'error') {
    const alertEl = document.createElement('div');
    alertEl.classList.add('alert', className);
    alertEl.appendChild(document.createTextNode(msg));
    document.querySelector('#alert').appendChild(alertEl);

    setTimeout(() => {
        alertEl.remove();
    }, 4000);
}

function showSpinner() {
    document.querySelector('.spinner').classList.add('show');
}

function hideSpinner() {
    document.querySelector('.spinner').classList.remove('show');
}

function addCommasToNum(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

async function fetchAPIData(endpoint) {
    const API_KEY = 'xxx';
    const api_URL = 'https://api.themoviedb.org/3';
    const url = `${api_URL}/${endpoint}`;

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

async function searchMedia() {
    const params = window.location.search;
    const urlParams = new URLSearchParams(params);
    global.search.type = urlParams.get('type');
    global.search.term = urlParams.get('search-term');

    if (global.search.term === '' || !global.search.term || !global.search.type || global.search.type === '') {
        location.href = './';
    }

    showSpinner();
    document.querySelector('#search-results-heading').innerHTML = '';
    document.querySelector('#search-results').innerHTML = '';
    document.querySelector('#pagination').innerHTML = '';

    const { page, results, total_pages, total_results } = await fetchAPIData(
        `search/${global.search.type}?query=${global.search.term}&page=${global.search.page}`
    );

    global.search.page = page;
    global.search.totalPages = total_pages;
    global.search.totalResults = total_results;

    if (results.length === 0) {
        showAlert('no record found');
        hideSpinner();
        return;
    }
    const resultHeading = document.querySelector('#search-results-heading');
    resultHeading.innerHTML = `<h2>${results.length} of ${global.search.totalResults} Results for ${global.search.term}`;

    results.map((media) => {
        const card = cardGenerator(media, global.search.type);
        document.querySelector('#search-results').appendChild(card);
    });

    displayPagination();
    hideSpinner();
}

function displayPagination() {
    const pagination = document.createElement('div');
    pagination.innerHTML = `
                <div class="pagination">
                    <button class="btn btn-primary" id="prev">Prev</button>
                    <button class="btn btn-primary" id="next">Next</button>
                    <div class="page-counter">Page ${global.search.page} of ${global.search.totalPages}</div>
                </div>`;

    document.querySelector('#pagination').appendChild(pagination);

    const prevBtn = document.querySelector('#prev');
    const nextBtn = document.querySelector('#next');

    if (global.search.page === 1) {
        prevBtn.disabled = true;
    }
    if (global.search.page === global.search.total_pages) {
        nextBtn.disabled = true;
    }

    nextBtn.addEventListener('click', async () => {
        global.search.page++;
        searchMedia();
    });

    prevBtn.addEventListener('click', async () => {
        global.search.page--;
        searchMedia();
    });
}

function checkForNullSearch(e) {
    const searchInput = document.querySelector('#search-term').value;

    if (searchInput && searchInput.trim() !== '') {
        searchMedia();
    } else {
        e.preventDefault();
        showAlert('empty field');
    }
}

async function nowPlayingSlider() {
    showSpinner();
    const result = await fetchAPIData('movie/now_playing');
    const movieList = result.results;

    movieList.forEach((movie) => {
        const swiperSlide = document.createElement('div');
        swiperSlide.className = 'swiper-slide';
        swiperSlide.innerHTML = `<a href="movie-details.html?id=${movie.id}">
                  <img src=${
                      movie.poster_path
                          ? `https://image.tmdb.org/t/p/original/${movie.poster_path}`
                          : './images/no-image.jpg'
                  }
                alt="Movie Title" />
                </a>
                <h4 class="swiper-rating">
                  <i class="fas fa-star text-secondary"></i> ${movie.vote_average.toFixed(1)} / 10
                </h4>`;

        document.querySelector('.swiper-wrapper').appendChild(swiperSlide);

        initSwiper();
    });

    hideSpinner();
}

function initSwiper() {
    const options = {
        slidesPerView: 1,
        spaceBetween: 30,
        freeMode: true,
        loop: true,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        breakpoints: {
            500: {
                slidesPerView: 2,
            },
            700: {
                slidesPerView: 3,
            },
            1200: {
                slidesPerView: 4,
            },
        },
    };
    const swiper = new Swiper('.swiper', options);
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

function cardGenerator(media, mediaType) {
    const type = mediaType ? mediaType : media.media_type;
    const card = document.createElement('div');
    card.className = 'card';

    const cardLink = document.createElement('a');
    const href = type === 'movie' ? `movie-details.html` : `tv-details.html`;

    cardLink.setAttribute('href', `${href}?id=${media.id}`);
    const img = document.createElement('img');
    img.src = media.poster_path ? `https://image.tmdb.org/t/p/original/${media.poster_path}` : './images/no-image.jpg';
    img.alt = type === 'movie' ? 'Movie Title' : 'Show Title';
    img.className = 'card-img-top';
    cardLink.appendChild(img);

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    const cardTitle = document.createElement('h5');
    cardTitle.className = 'card-title';
    cardTitle.textContent = type === 'movie' ? media.title : media.name;
    const cardDesc = document.createElement('p');
    cardDesc.className = 'card-text';
    const cardRel = document.createElement('small');
    cardRel.className = 'text-muted';
    cardRel.textContent = type === 'movie' ? `Release: ${media.release_date}` : `First Aired: ${media.first_air_date}`;
    cardDesc.appendChild(cardRel);
    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardDesc);

    card.appendChild(cardLink);
    card.appendChild(cardBody);

    return card;
}

async function fetchDetails(mediaType) {
    showSpinner();

    const mediaID = window.location.search.split('=')[1];
    const media = await fetchAPIData(`${mediaType}/${mediaID}`);

    displayBackdrop(media.backdrop_path);

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

function displayBackdrop(backdropPath) {
    const overlayDiv = document.createElement('div');
    overlayDiv.style.backgroundImage = `url(https://image.tmdb.org/t/p/original/${backdropPath})`;
    overlayDiv.style.backgroundSize = 'cover';
    overlayDiv.style.backgroundPosition = 'center';
    overlayDiv.style.backgroundRepeat = 'no-repeat';
    overlayDiv.style.height = '180vh';
    overlayDiv.style.width = '100vw';
    overlayDiv.style.position = 'absolute';
    overlayDiv.style.top = '0';
    overlayDiv.style.left = '0';
    overlayDiv.style.zIndex = '-1';
    overlayDiv.style.opacity = '0.1';

    document.querySelector('#details').appendChild(overlayDiv);
}

function init() {
    switch (global.currentPage) {
        case '/':
        case '/index.html':
            nowPlayingSlider();
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
            searchMedia();
            break;
    }

    highlightActiveNavLink();
}

document.addEventListener('DOMContentLoaded', init);
document.querySelector('.search-form').addEventListener('submit', checkForNullSearch);
