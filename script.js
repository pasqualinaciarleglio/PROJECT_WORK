// START SEARCH
const searchInput = document.querySelector('.search-input');
const searchBtn = document.querySelector('.search-btn'); 
const closeIcon = document.querySelector('.close-icon');

// RICERCA NEL SITO
searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault(); 
        const termineCercato = this.value.toLowerCase().trim();
        
        if (termineCercato.length > 0) {
            eseguiRicerca(termineCercato);
        }
    }
});

searchBtn.addEventListener('click', function() {
    const termineCercato = searchInput.value.toLowerCase().trim();
    
    if (termineCercato.length > 0) {
        eseguiRicerca(termineCercato);
    } else {
        alert("Inserisci una parola chiave per cercare.");
        searchInput.focus(); 
    }
});

searchInput.addEventListener('input', function() {
    if (this.value.length > 0) {
        closeIcon.style.display = 'block';
    } else {
        closeIcon.style.display = 'none';
    }
});

closeIcon.addEventListener('click', function() {
    searchInput.value = '';
    closeIcon.style.display = 'none';
    searchInput.focus();
});

function eseguiRicerca(query) {
    const mappaSito = {
        "referti": "referti.html",
        "esame": "referti.html",
        "esami": "referti.html",
        "analisi": "referti.html",
        "prenot": "prenotazioni.html",
        "visit": "prenotazioni.html",
        "appuntament": "prenotazioni.html",
        "login": "login.html",
        "accesso": "login.html",
        "registr": "login.html",
        "profil": "login.html"
    };

    let paginaTrovata = null;

    for (const parolaChiave in mappaSito) {
        if (query.includes(parolaChiave)) {
            paginaTrovata = mappaSito[parolaChiave];
            break; 
        }
    }

    if (paginaTrovata) {
        searchInput.value = "Reindirizzamento in corso...";
        setTimeout(() => {
            window.location.href = paginaTrovata;
        }, 500); 
    } else {
        alert(`Nessun risultato trovato per "${query}". \nProva a cercare termini come "prenotazioni", "referti" o "login".`);
    }
}


// SCROLL DIPARTIMENTI MEDICI
const carousel = document.getElementById('carousel');
let autoScrollInterval;

function moveCarousel(direction) {
    const scrollAmount = 300;
    const isAtEnd = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 10;
    const isAtStart = carousel.scrollLeft <= 0;

    if (direction === 1 && isAtEnd) {
        carousel.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (direction === -1 && isAtStart) {
        carousel.scrollTo({ left: carousel.scrollWidth, behavior: 'smooth' });
    } else {
        carousel.scrollBy({
            left: direction * scrollAmount,
            behavior: 'smooth'
        });
    }
    restartAutoScroll();
}

// AUTOSCROLL
function startAutoScroll() {
    autoScrollInterval = setInterval(() => {
        moveCarousel(1);
    }, 5000);
}

function stopAutoScroll() {
    clearInterval(autoScrollInterval);
}

function restartAutoScroll() {
    stopAutoScroll();
    startAutoScroll();
}

// START AUTOSCROLL
startAutoScroll();
carousel.addEventListener('mouseenter', stopAutoScroll);
carousel.addEventListener('mouseleave', startAutoScroll);