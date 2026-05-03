// START
document.addEventListener('DOMContentLoaded', () => {

    const cfUtente = sessionStorage.getItem('utenteLoggatoCF');
    const nomeUtente = sessionStorage.getItem('utenteLoggatoNome');

    if (!cfUtente) return; 

    document.getElementById('user-name').innerText = `Benvenuto, ${nomeUtente}!`;
    document.getElementById('user-cf').innerText = `CF: ${cfUtente}`;

    caricaReferti(cfUtente);
});


// RECUPERO E MOSTRA REFERTI
async function caricaReferti(cf) {
    const listaElement = document.getElementById('lista-referti');
    
    try {
        const response = await fetch(`http://127.0.0.1:5000/api/referti/${cf}`);
        const result = await response.json();

        listaElement.innerHTML = "";

        if (result.status === "success" && result.data.length > 0) {
            
            result.data.forEach(ref => {
                const card = document.createElement('div');
                const isReady = ref.stato === 'Disponibile';
                
                card.className = `referto-card ${isReady ? 'disponibile' : 'lavorazione'}`;
                
                card.innerHTML = `
                    <span class="status-badge ${isReady ? 'badge-ok' : 'badge-wait'}">
                        ${ref.stato}
                    </span>
                    <h4>${ref.esame}</h4>
                    <p><strong>ID:</strong> ${ref.id}</p>
                    <p><strong>Data Esame:</strong> ${formattaData(ref.data_esame)}</p>
                    <hr style="border:0; border-top:1px solid #eee; margin: 15px 0;">
                    <button class="btn-download" 
                            ${!isReady ? 'disabled' : ''} 
                            onclick="scaricaReferto('${ref.id}')">
                        ${isReady ? 'SCARICA REFERTO (PDF)' : 'NON ANCORA PRONTO'}
                    </button>
                `;
                listaElement.appendChild(card);
            });

        } else {
            // SE L'UTENTE NON HA REFERTI
            listaElement.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: white; border-radius: 10px;">
                    <h3 style="color: #2c3e50;">Nessun referto trovato.</h3>
                    <p>Attualmente non ci sono documenti sanitari disponibili per il tuo profilo.</p>
                </div>
            `;
        }
    } catch (error) {
        listaElement.innerHTML = `<p style="color:red; font-weight: bold;">Errore di connessione al server ospedaliero.</p>`;
    }
}


//DOWNLOAD REFERTI
async function scaricaReferto(id) {
    try {
        const response = await fetch(`http://127.0.0.1:5000/api/referti/scarica/${id}`);
        const result = await response.json();
        
        if (result.status === "success") {
            alert("Il tuo browser sta aprendo il documento: " + result.link);
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert("Impossibile scaricare il file al momento.");
    }
}

function formattaData(dataString) {
    const opzioni = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dataString).toLocaleDateString('it-IT', opzioni);
}

// LOGOUT
function eseguiLogout() {
    sessionStorage.clear();
    window.location.href = "login.html";
}