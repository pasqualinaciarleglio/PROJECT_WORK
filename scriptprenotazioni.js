// IMPOSTAZIONE DATA MINIMA RICHIESTA
document.addEventListener('DOMContentLoaded', () => {
    const inputData = document.getElementById('data');
    const oggi = new Date();
    
    const anno = oggi.getFullYear();
    const mese = String(oggi.getMonth() + 1).padStart(2, '0');
    const giorno = String(oggi.getDate()).padStart(2, '0');
    
    const dataMinima = `${anno}-${mese}-${giorno}`;
    
    
    inputData.setAttribute('min', dataMinima);
});

// PRENOTAZIONE
document.getElementById('bookingForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    // RECUPERO CF
    let cfUtente = sessionStorage.getItem('utenteLoggatoCF');

    // ALERT UTENTE NON REGISTRATO
    if (!cfUtente) {
        alert("Attenzione: Devi effettuare il login prima di poter prenotare una visita.");
        sessionStorage.setItem('redirectDopoLogin', window.location.href);
        window.location.replace("login.html"); 
        return; 
    }

    // CONTROLLO FASCE ORARIE
    const orarioScelto = document.getElementById('ora').value;
    const isMattina = orarioScelto >= "09:00" && orarioScelto <= "13:00";
    const isPomeriggio = orarioScelto >= "15:00" && orarioScelto <= "17:00";

    if (!isMattina && !isPomeriggio) {
        alert("⚠️ Orario non valido.\nLe visite possono essere prenotate solo nelle fasce orarie: \n- Dalle 09:00 alle 13:00\n- Dalle 15:00 alle 17:00.");
        return;
    }

    // RECUPERO DATI
    const datiPrenotazione = {
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        cf: cfUtente,
        specialista: document.getElementById('specialista').value,
        data: document.getElementById('data').value,
        ora: orarioScelto
    };

    try {
        const response = await fetch('http://127.0.0.1:5000/api/prenota', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datiPrenotazione)
        });

        const result = await response.json();

        if (response.ok) {
            
            document.getElementById('bookingForm').classList.add('hidden');
            document.getElementById('messaggioConferma').classList.remove('hidden');
            
            document.getElementById('riepilogo').innerHTML = `
                ${result.message}<br><br>
                <strong>Codice Prenotazione:</strong> ${result.data.id}<br>
                <strong>Reparto:</strong> ${result.data.specialista.toUpperCase()}<br>
                <strong>Data e Ora:</strong> ${result.data.data} alle ${result.data.ora}
            `;
        } else {
            alert("Errore durante la prenotazione: " + result.message);
        }
    } catch (error) {
        console.error("Errore di connessione:", error);
        alert("Impossibile connettersi al server. Verifica che l'app Flask sia in esecuzione.");
    }
});

// NUOVA PRENOTAZIONE
function resetForm() {
    document.getElementById('bookingForm').reset();
    
    document.getElementById('bookingForm').classList.remove('hidden');
    document.getElementById('messaggioConferma').classList.add('hidden');
}

// CUSTOM MENU A TENDINA PERSONALIZZATO
const selectTrigger = document.getElementById('selectTrigger');
const selectOptions = document.getElementById('selectOptions');
const selectOriginale = document.getElementById('specialista');
const opzioniCustom = selectOptions.querySelectorAll('div');

selectTrigger.addEventListener('click', function(e) {
    e.stopPropagation();
    selectOptions.classList.toggle('hidden');
    selectTrigger.style.borderColor = selectOptions.classList.contains('hidden') ? '#dcdde1' : '#0d362c';
});

opzioniCustom.forEach(opzione => {
    opzione.addEventListener('click', function() {
        selectTrigger.innerText = this.innerText;
        
        selectOriginale.value = this.getAttribute('data-value');
        
        selectOptions.classList.add('hidden');
        selectTrigger.style.borderColor = '#dcdde1';
    });
});


document.addEventListener('click', function(e) {
    if (e.target !== selectTrigger) {
        selectOptions.classList.add('hidden');
        selectTrigger.style.borderColor = '#dcdde1';
    }
});