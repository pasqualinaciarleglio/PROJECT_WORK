// SCAMBIO MODULI LOG/REG 
function toggleAuth() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    loginForm.classList.toggle('hidden');
    registerForm.classList.toggle('hidden');
}

//LOGIN
async function handleLogin(event) {
    event.preventDefault();
    
    const cf = document.getElementById('login-cf').value.toUpperCase();
    const password = document.getElementById('login-pass').value;

    if (cf.length !== 16) {
        alert("Il Codice Fiscale deve essere di 16 caratteri.");
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:5000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cf: cf, password: password })
        });

        const result = await response.json();
        
        if (response.ok) {

            sessionStorage.setItem('utenteLoggatoCF', result.user.cf);
            sessionStorage.setItem('utenteLoggatoNome', result.user.nome);
            
            alert(result.message);
            
            // CONTROLLO REDIRECT
            const paginaPrecedente = sessionStorage.getItem('redirectDopoLogin');
            
            if (paginaPrecedente) {
                sessionStorage.removeItem('redirectDopoLogin'); 
                window.location.href = paginaPrecedente;
            } else {
                window.location.href = "index.html"; 
            }
        }
        if (response.ok) {
            sessionStorage.setItem('utenteLoggatoCF', result.user.cf);
            sessionStorage.setItem('utenteLoggatoNome', result.user.nome);
            
            alert(result.message);
            window.location.href = "index.html";
        } else {
            alert("Errore: " + result.message);
        }
    } catch (error) {
        console.error("Errore di connessione:", error);
        alert("Il server backend non risponde. Riprova più tardi.");
    }
}

// REGISTRAZIONE
async function handleRegister(event) {
    event.preventDefault();
    
    const nome = document.getElementById('reg-nome').value;
    const cf = document.getElementById('reg-cf').value.toUpperCase();
    const password = document.getElementById('reg-pass').value;

    if (cf.length !== 16) {
        alert("Il Codice Fiscale deve essere di 16 caratteri.");
        return;
    }

    // EMAIL AUTOMATICA
    const emailGenerata = cf.toLowerCase() + "@paziente.sanpio.it";

    try {
        const response = await fetch('http://127.0.0.1:5000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cf: cf, nome: nome, email: emailGenerata, password: password })
        });

        const result = await response.json();

        if (response.ok) {
            alert("Registrazione completata con successo! Ora puoi accedere.");
            toggleAuth();
            document.getElementById('login-cf').value = cf;
        } else {
            alert("Errore: " + result.message);
        }
    } catch (error) {
        console.error("Errore di connessione:", error);
        alert("Il server backend non risponde. Assicurati che Flask sia avviato.");
    }
}

// INVIO PRENOTAZIONE
async function inviaPrenotazione(event) {
    event.preventDefault();

    // RECUPERO CF UTENTE
    const cfUtente = sessionStorage.getItem('utenteLoggatoCF');

    if (!cfUtente) {
        alert("Devi effettuare l'accesso per prenotare.");
        window.location.href = "login.html";
        return;
    }

    const dati = {
        nome: document.getElementById('nome').value,
        cf: cfUtente,
        specialista: document.getElementById('specialista').value,
        data: document.getElementById('data').value,
        ora: document.getElementById('ora').value
    };

    try {
        const response = await fetch('http://127.0.0.1:5000/api/prenota', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dati)
        });

        const result = await response.json();

        if (response.ok) {
            document.getElementById('bookingForm').classList.add('hidden');
            const conferma = document.getElementById('messaggioConferma');
            conferma.classList.remove('hidden');
            document.getElementById('riepilogo').innerText = 
                `Prenotazione confermata! Codice: ${result.data.id}`;
        } else {
            alert("Errore: " + result.message);
        }
    } catch (error) {
        alert("Errore di connessione con il server San Pio.");
    }
}

// LISTA EVENTI
const bookingForm = document.getElementById('bookingForm');
if(bookingForm) {
    bookingForm.addEventListener('submit', inviaPrenotazione);
}