from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import uuid

# UTENTE DATI
class Utente:
    def __init__(self, cf, nome, email, password):
        self.cf = cf.upper()
        self.nome = nome
        self.email = email
        self.password_hash = generate_password_hash(password)

    def verifica_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {"cf": self.cf, "nome": self.nome, "email": self.email}

# REFERTO DATI
class Referto:
    def __init__(self, id_referto, paziente_cf, esame, data_esame, stato, url_download=None):
        self.id = id_referto
        self.paziente_cf = paziente_cf.upper()
        self.esame = esame
        self.data_esame = data_esame
        self.stato = stato
        self.url_download = url_download

    def to_dict(self):
        return {
            "id": self.id,
            "esame": self.esame,
            "data_esame": self.data_esame,
            "stato": self.stato
        }

# PRENOTAZIONE DATI
class Prenotazione:
    def __init__(self, paziente_cf, specialista, data, ora):
        self.id = "PRN-" + str(uuid.uuid4())[:8].upper()
        self.paziente_cf = paziente_cf.upper()
        self.specialista = specialista
        self.data = data
        self.ora = ora

    def to_dict(self):
        return {
            "id": self.id,
            "specialista": self.specialista,
            "data": self.data,
            "ora": self.ora
        }

# DATABASE IN MEMORIA
class SistemaOspedaliero:
    def __init__(self):
        self.utenti = {} 
        self.referti = []
        self.prenotazioni = []
        self._popola_dati_fittizi() 

    def _popola_dati_fittizi(self):
        utente_test = Utente("RSSMRA80A01F205Z", "Mario Rossi", "mario@email.com", "password123")
        self.utenti[utente_test.cf] = utente_test

        self.referti.append(Referto("REF-001", "RSSMRA80A01F205Z", "Analisi del Sangue", "2026-04-15", "Disponibile", "/download/ref_001.pdf"))
        self.referti.append(Referto("REF-002", "RSSMRA80A01F205Z", "Radiografia Torace", "2026-04-28", "In Lavorazione"))

    def login_utente(self, cf, password):
        cf = cf.upper() 

        if cf in self.utenti:
            utente = self.utenti[cf]
            if utente.verifica_password(password):
                return True, utente
                
        return False, "Codice Fiscale o password non validi."

    def registra_utente(self, cf, nome, email, password):
        cf = cf.upper()
        if cf in self.utenti:
            return False, "Utente già registrato con questo Codice Fiscale."
        
        for utente in self.utenti.values():
            if utente.email == email:
                return False, "Email già in uso."
        
        nuovo_utente = Utente(cf, nome, email, password)
        self.utenti[cf] = nuovo_utente
        return True, nuovo_utente

    def crea_prenotazione(self, cf, specialista, data, ora):
        if cf not in self.utenti:
            return False, "Utente non trovato nel sistema."
        
        nuova_pren = Prenotazione(cf, specialista, data, ora)
        self.prenotazioni.append(nuova_pren)
        return True, nuova_pren

    def cerca_referti_paziente(self, cf):
        cf = cf.upper()
        referti_trovati = [r for r in self.referti if r.paziente_cf == cf]
        return referti_trovati

    def recupera_link_referto(self, id_referto):
        for r in self.referti:
            if r.id == id_referto:
                if r.stato == "Disponibile":
                    return True, f"http://ospedalesanpio.it/storage{r.url_download}"
                else:
                    return False, "Documento in lavorazione, non ancora disponibile."
        return False, "Referto inesistente."


app = Flask(__name__)
CORS(app)

ospedale = SistemaOspedaliero()

# LOGIN
@app.route('/api/login', methods=['POST'])
@app.route('/api/login', methods=['POST'])
def api_login():
    dati = request.json
    cf = dati.get('cf')
    password = dati.get('password')

    if not cf or not password:
         return jsonify({"status": "error", "message": "Inserisci Codice Fiscale e password."}), 400

    successo, risultato = ospedale.login_utente(cf, password)

    if successo:
        return jsonify({
            "status": "success",
            "message": f"Bentornato, {risultato.nome}!",
            "user": risultato.to_dict()
        }), 200
    else:
        return jsonify({"status": "error", "message": risultato}), 401

# REGISTRAZIONE
@app.route('/api/register', methods=['POST'])
def api_register():
    dati = request.json
    cf = dati.get('cf')
    nome = dati.get('nome')
    email = dati.get('email')
    password = dati.get('password')

    if not all([cf, nome, email, password]):
        return jsonify({"status": "error", "message": "Tutti i campi sono obbligatori."}), 400

    successo, risultato = ospedale.registra_utente(cf, nome, email, password)

    if successo:
        return jsonify({
            "status": "success",
            "message": "Registrazione completata con successo! Ora puoi accedere.",
            "user": risultato.to_dict()
        }), 201
    else:
        return jsonify({"status": "error", "message": risultato}), 400

# PRENOTAZIONE
@app.route('/api/prenota', methods=['POST'])
def api_prenota():
    dati = request.json
    cf = dati.get('cf')
    specialista = dati.get('specialista')
    data = dati.get('data')
    ora = dati.get('ora')

    successo, risultato = ospedale.crea_prenotazione(cf, specialista, data, ora)

    if successo:
        return jsonify({
            "status": "success",
            "message": "Visita prenotata con successo.",
            "data": risultato.to_dict()
        }), 201
    else:
        return jsonify({"status": "error", "message": risultato}), 400

# REFERTI UTENTE
@app.route('/api/referti/<cf>', methods=['GET'])
def api_get_referti(cf):
    referti_utente = ospedale.cerca_referti_paziente(cf)
    
    if not referti_utente:
        return jsonify({
            "status": "empty", 
            "message": "Nessun referto trovato per questo profilo.", 
            "data": []
        }), 200

    dati_json = [r.to_dict() for r in referti_utente]
    return jsonify({"status": "success", "data": dati_json}), 200

# SCARICA REFERTO
@app.route('/api/referti/scarica/<id_referto>', methods=['GET'])
def api_scarica_referto(id_referto):
    successo, risultato = ospedale.recupera_link_referto(id_referto)

    if successo:
        return jsonify({
            "status": "success",
            "message": f"Download avviato per {id_referto}",
            "link": risultato
        }), 200
    else:
        return jsonify({"status": "error", "message": risultato}), 400

# AVVIO SERVER
if __name__ == '__main__':
    app.run(debug=True, port=5000)