
const searchLink = document.querySelector('.search__link .icon-reg'),//иконка поиска
    mainContent = document.querySelector('.main__content'),//основной див для вывода инфы о фильмах(модалка)
    mainClose = document.querySelectorAll('.main__close'),//кнопки закрытия модального окна
    mainBlock = document.querySelector('.main__block'),//див для вывода поисковых запросов
    moviesLink = document.querySelectorAll('.movies__link'), //кнопки открытия модального окна
    movieSolo = document.querySelector('.main__solo'), //див для вывода инфы об одном фильме
    formMain = document.querySelector('.form__main'),//форма поиска
    formInput = formMain.querySelector('input'),//поле ввода поиска
    anime = document.querySelector('.anime'), //прелоадер
    pagination = document.querySelector('.pagination'),//пагинация рез поиска
    headerBtn = document.querySelector('.header__btn'), //бургер меню
    headerAbs = document.querySelector('.header__abs'),//темная область
    headerItems = document.querySelector('.header__items'); //боковое меню в адаптации

function openMenu(){
    const bool = !headerBtn.classList.contains('active');
    headerBtn.classList[bool ? 'add' : 'remove']('active');
    headerAbs.classList[bool ? 'add' : 'remove']('active');
    headerItems.classList[bool ? 'add' : 'remove']('active');
    document.body.classList[bool ? 'add' : 'remove']('active');
}
headerBtn.addEventListener('click', function(e){
    e.preventDefault();
    openMenu();
});

function openMainBlock(e, bool = true) {
    e.preventDefault();
    mainContent.classList[bool ? 'add' : 'remove']('active');
    document.body.classList[bool ? 'add' : 'remove']('active');
};

searchLink.addEventListener('click', openMainBlock);

moviesLink.forEach(item => item.addEventListener('click', openMainBlock));

mainClose.forEach(item => {
    item.addEventListener('click', (e) => {
        openMainBlock(e, false);
    })
});


const host = 'https://kinopoiskapiunofficial.tech';
const hostName = 'X-API-KEY';
const hostValue = '';
const random = (min, max) => Math.floor(Math.random() * (max + 1 - min) + min);
const getLink = (url) => url.split('www.').join('gg');


class Kino{
    constructor(){
        this.date = new Date().getMonth();
        this.curYear = new Date().getFullYear();
        this.months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        this.curMonth = this.months[this.date];
    }
    fOPen = async (url) => {
        const res = await fetch(url, {
            headers: {
                [hostName]: hostValue
            }
        });
        if(res.ok) return res.json();
        else {
            anime.classList.remove('active');
            throw new Error(`Cannot access to ${url}`);
        }
    }
    getTopMovies = (page = 1) => this.fOPen(`${host}/api/v2.2/films/top?type=TOP_250_BEST_FILMS&page=${page}`)
    getSoloFilm = (id) => this.fOPen(`${host}/api/v2.1/films/${id}`)
    getReleases  = (page = 1, year = this.curYear, month = this.curMonth) => this.fOPen(`${host}/api/v2.1/films/releases?year=${year}&month=${month}&page=${page}`)
    getFrames = (id) => this.fOPen(`${host}/api/v2.2/films/${id}/images?type=STILL&page=1`)
    getReviews = (id) => this.fOPen(`${host}/api/v2.2/films/${id}/reviews?page=1&order=DATE_DESC`)
    getSearch = (page = 1, keyword) => this.fOPen(`${host}/api/v2.1/films/search-by-keyword?keyword=${keyword}&page=${page}`)
}


const db = new Kino();

function renderTrendMovies(element = [], fn = [], films = [], params = []){
    anime.classList.add('active');
    element.forEach((item, i) => {
        const parent = document.querySelector(`${item} .swiper-wrapper`);
        db[fn[i]](params[i]).then(data => {
            data[films[i]].forEach(elem => {
                const slide = document.createElement('div');
                slide.classList.add('swiper-slide');
                slide.innerHTML = `
                    <div class="movie__item" data-id="${elem.filmId}" onclick="renderSolo(${elem.filmId})">
                        <img src="${elem.posterUrlPreview}" alt="${elem.nameRu || elem.nameEn}" loading="lazy">
                    </div>
                `;
                parent.append(slide);
            })
            new Swiper(`${item}`, {
                slidesPerView: 1,
                spaceBetween: 27,
                // slidesPerGroup: 3,
                loop: true,
                // loopFillGroupWithBlank: true,
                navigation: {
                    nextEl: `${item} .swiper-button-next`,
                    prevEl: `${item} .swiper-button-prev`,
                },
                breakpoints: {
                    1440: {
                        slidesPerView: 6,
                    },
                    1200: {
                        slidesPerView: 5,
                    },
                    960: {
                        slidesPerView: 4,
                    },
                    720: {
                        slidesPerView: 3,
                    },
                    500: {
                        slidesPerView: 2,
                    },
                }
            });
        })
        .then(() => {
            const pages = 13;
            const rand = random(1, pages);
            renderHeader(rand);
            // let s = document.querySelectorAll('.movie__item');
            // s.forEach(item => {
            //     item.addEventListener('click', function(){
            //         let attr = this.getAttribute('data-id');
            //         renderSolo(attr);
            //     })
            // })
        })
        .catch(e => {
            console.log(e);
            anime.classList.remove('active');
        })
    })
}
renderTrendMovies(['.trend__tv-slider', '.popular__actors-slider'], ['getTopMovies', 'getReleases'], ['films', 'releases'], [1,1]);

const popularTitle = document.querySelector('.popular__actors-title strong'),
    popularYear = document.querySelector('.year'),
    popularPoster = document.querySelector('.coming__soon-block > img');

popularTitle.textContent = `${db.curMonth} ${db.curYear}`;
popularYear.textContent = db.curYear;

db.getTopMovies(2).then(res => {
    const rand = random(0, res.films.length - 1);
    popularPoster.src = res.films[rand].posterUrlPreview;
})
.catch(e => {
    console.log(e);
    anime.classList.remove('active');
})

function renderHeader(page) {
    db.getTopMovies(page).then(res => {
        const max = random(0, res.films.length - 1);
        const filmId = res.films[max].filmId;
        const filmRating = res.films[max].rating;
        db.getSoloFilm(filmId).then(response => {
            const sm = response.data;
            const headerText = document.querySelector('.header__text');
            headerText.innerHTML = `
                <h1 class="header__title">${sm.nameRu || sm.nameEn}</h1>
                <div class="header__balls">
                    <span class="header__year">${sm.year}</span>
                    <span class="logo__span header__rating  header__year ">${sm.ratingAgeLimits}+</span>
                    <div class="header__seasons header__year">${sm.seasons.length}</div>
                    <div class="header__stars header__year"><span class="icon-solid"></span><strong>${filmRating}</strong></div>
                </div>
                <p class="header__descr">
                    ${sm.description}
                </p>
                <div class="header__buttons">
                    <a href="${getLink(sm.webUrl)}" class="header__watch"><span class="icon-solid"></span>watch</a>
                    <a href="#" class="header__more header__watch movie__item" onclick="renderSolo(${sm.filmId})">More information</a>
                </div>
            `;
            anime.classList.remove('active');
        })
        .catch(e => {
            console.log(e);
            anime.classList.remove('active');
        })
    })
    .catch(e => {
        console.log(e);
        anime.classList.remove('active');
    })
}

function renderSolo(id) {
    openMainBlock(event);
    mainBlock.innerHTML = '';
    pagination.innerHTML = '';
    anime.classList.add('active');
    (async function() {
        const [reviews, frames, solo] = await Promise.all([
            db.getReviews(id),
            db.getFrames(id),
            db.getSoloFilm(id)
        ]);
        return {reviews, frames, solo};
    }())
    .then(res => {
       const solo = res.solo.data;
       const genres = solo.genres.reduce((acc, item) => acc + `${item.genre} `, '');
       const countries = solo.countries.reduce((acc, item) => acc + `${item.country} `, '');
       let facts = '';
       let reviews = '';
       let frames = '';
       solo.facts.forEach((item, i) => {
            if(i < 10) facts += `<li class="solo__facts">${i+1}: ${item}</li>`;
       })
       res.reviews.items.forEach((item, i) => {
            if(i < 10) {
                reviews += `
                    <div class="review__item">
                        <span>${item.author}</span>
                        <p class="review__descr">${item.description}</p>
                    </div>
                `;
            }
       })
       res.frames.items.forEach((item, i) => {
            if(i < 10) frames += `<img src="${item.previewUrl}" alt="" loading="lazy">`;
       })
       const div = `
            <div class="solo__img">
                <img src="${solo.posterUrlPreview}" alt="${solo.nameRu || solo.nameEn}">
                <a href="${getLink(solo.webUrl)}" class="solo__link header__watch">Смотреть фильм</a>
            </div>
            <div class="solo__content">
                <h3 class="trend__tv-title solo__title">${solo.nameRu || solo.nameEn}</h3>
                <ul>
                    <li class="solo__countries">Страны: ${countries}</li>
                    <li class="solo__countries">Жанры: ${genres}</li>
                    <li class="solo__countries">Продолжительность: ${solo.filmLength || ''}</li>
                    <li class="solo__countries">Год: ${solo.year || ''}</li>
                    <li class="solo__countries">Мировая премьера: ${solo.premiereWorld || ''}</li>
                    <li class="solo__countries">Возрастной рейтинг: ${solo.ratingAgeLimits || ''}</li>
                    <li class="solo__countries">Слоган: ${solo.slogan || ''}</li>
                    <li class="solo__countries">Описание: ${solo.description || ''}</li>
                </ul>
            </div>
            <ul class="solo__facts">
                <h3 class="trend__tv-title">Интересные факты</h3>
                ${facts}
            </ul>
            <h3 class="trend__tv-title solo__title2">Кадры из фильма</h3>
            <div class="solo__images">
                ${frames}
            </div>
            <div class="solo__reviews">
                <h3 class="trend__tv-title solo__title2">Отзывы</h3>
                ${reviews}
            </div>
       `;
       movieSolo.innerHTML = div;
       anime.classList.remove('active');

    })
    .catch(e => {
        console.log(e);
        anime.classList.remove('active');
    })
}
function renderPagination(cur = 1, len){
    pagination.innerHTML = '';
    const ul = document.createElement('ul');
    ul.classList.add('header__list');
    const list = len < 14 ? len : 14;
    for (let i = 1; i <= list; i++) {
       const li = document.createElement('li');
       li.innerHTML = `<a href="#" data-page="${i}" class="pagination__link ${cur == i ? 'active' : ''}">${i}</a>`;
       ul.append(li);
    }
    pagination.append(ul);
}

function clickPagination (val, fn) {
    const links = document.querySelectorAll('.pagination__link');
    links.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            let dataPage = this.getAttribute('data-page');
            renderCards(dataPage, val, fn);
        })
    })
}

function renderCards(page = 1, se = '', fn = 'getTopMovies') {
    mainBlock.innerHTML = '';
    movieSolo.innerHTML = '';
    db[fn](page, se).then(data => {
        if(data.films.length > 0) {
            data.films.forEach(item => {
                const someItem = document.createElement('div');
                someItem.classList.add('some__item');
                someItem.innerHTML = `
                    <div class="some__img">
                        <img src="${item.posterUrlPreview}" alt="${item.nameRu || item.nameEn}" loading="lazy" >
                        <span class="some__rating">${item.rating || 0}</span>
                    </div>
                    <h3 class="some__title">${item.nameRu || item.nameEn}</h3>
                `;
                someItem.setAttribute('onclick', `renderSolo(${item.filmId})`);
                mainBlock.append(someItem);
            });
            renderPagination(page, data.pagesCount);
        }
        else {
            pagination.innerHTML = '';
            mainBlock.innerHTML = `<p class="undefined">Ничего не найдено</p>`;
        }
    })
    .then(() => {
        if(fn != 'getTopMovies') anime.classList.remove('active');
        clickPagination(se, fn);
    })
    .catch(e => {
        console.log(e);
        anime.classList.remove('active');
    })
}

renderCards();

formMain.addEventListener('submit', function(e){
    e.preventDefault();
    anime.classList.add('active');
    renderCards(1, formInput.value, 'getSearch');
})





