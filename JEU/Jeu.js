class Jeu {
  constructor() {
    this.multiNode = new MultiNode();
    this.multiNode.confirmerConnexion = () => this.confirmerConnexion();
    this.multiNode.confirmerAuthentification = (autresParticipants) =>
      this.confirmerAuthentification(autresParticipants);
    this.multiNode.apprendreAuthentification = (pseudonyme) =>
      this.apprendreAuthentification(pseudonyme);
    this.multiNode.recevoirVariable = (variable) => this.recevoirVariable(variable);

    this.listeJoueur = {};
    this.pseudonymeJoueur = "";
    this.pseudonymeAutreJoueur = "";



    this.scoreMax = 60;
    this.compteurTour = 1;
    this.tourEnCours = null;
    this.desLances = {};
    this.partieTerminee = false;

    this.phaseJeu = Jeu.PHASE.ATTENTE_JOUEURS;

    this.formulaireAuthentification = document.getElementById("formulaire-authentification");
    this.formulaireJeu = document.getElementById("formulaire-jeu");

    this.champPseudonyme = document.getElementById("champ-pseudonyme");
    this.boutonAuthentification = document.getElementById("bouton-authentification");

    this.champScore = document.getElementById("champ-score");
    this.champJouer = document.getElementById("champ-jouer");
    this.boutonJouer = document.getElementById("bouton-jouer");
    this.informationAutreJoueur = document.getElementById("information-autre-joueur");
    this.champScoreAutreJoueur = document.getElementById("champ-score-autre-joueur");

    this.champDe1 = document.getElementById("champ-de-1");
    this.champDe2 = document.getElementById("champ-de-2");
    this.champTour = document.getElementById("champ-tour");
    this.messageTour = document.getElementById("message-tour");
    this.resultatFinal = document.getElementById("resultat-partie");

    this.zoneStatut = document.getElementById("zone-statut");
    this.carteJoueur = document.getElementById("carte-joueur");
    this.carteAutreJoueur = document.getElementById("carte-autre-joueur");

    this.fenetreRegles = document.getElementById("fenetre-regles");
    this.boutonFermerRegles = document.getElementById("bouton-fermer-regles");

    const reglesDejaVues = localStorage.getItem("regles-vues");
    if (reglesDejaVues && this.fenetreRegles) {
      this.fenetreRegles.classList.add("fenetre-cachee");
    }

    if (this.boutonFermerRegles) {
      this.boutonFermerRegles.addEventListener("click", () => {
        this.fermerFenetreRegles();
      });
    }

    this.formulaireAuthentification.addEventListener("submit", (e) =>
      this.soumettreAuthentificationJoueur(e)
    );
    this.formulaireJeu.addEventListener("submit", (e) => this.soumettreJeu(e));

    this.formulaireJeu.style.display = "none";

    this.donnees = this.chargerDonneesLocal();
    if (this.donnees.pseudonyme) {
      this.champPseudonyme.value = this.donnees.pseudonyme;
    }

    this.mettreAJourInterfaceInitiale();
  }

  // =========================
  // DONNÉES / UPGRADE
  // =========================

  chargerDonneesLocal() {
    const brut = localStorage.getItem(Jeu.CLE_STOCKAGE);
    if (!brut) {
      return this.creerDonneesParDefaut();
    }

    try {
      const donnees = JSON.parse(brut);

      if (!donnees.version) {
        const migrees = {
          version: 2,
          pseudonyme: donnees.pseudonyme || "",
          statistiques: {
            victoires: donnees.victoires || 0,
            defaites: 0
          },
          preferences: {
            theme: "clair"
          }
        };
        this.sauvegarderDonneesLocal(migrees);
        return migrees;
      }

      return donnees;
    } catch (erreur) {
      console.error("Erreur lecture données locales :", erreur);
      return this.creerDonneesParDefaut();
    }
  }

  creerDonneesParDefaut() {
    return {
      version: 2,
      pseudonyme: "",
      statistiques: {
        victoires: 0,
        defaites: 0
      },
      preferences: {
        theme: "clair"
      }
    };
  }

  sauvegarderDonneesLocal(donnees = this.donnees) {
    localStorage.setItem(Jeu.CLE_STOCKAGE, JSON.stringify(donnees));
  }

  enregistrerPseudonyme() {
    this.donnees.pseudonyme = this.pseudonymeJoueur;
    this.sauvegarderDonneesLocal();
  }

  incrementerVictoire() {
    this.donnees.statistiques.victoires += 1;
    this.sauvegarderDonneesLocal();
  }

  incrementerDefaite() {
    this.donnees.statistiques.defaites += 1;
    this.sauvegarderDonneesLocal();
  }

  // =========================
  // INTERFACE
  // =========================

  mettreAJourInterfaceInitiale() {
    this.champTour.value = "En attente d’un second joueur";
    this.messageTour.innerText = "Connectez-vous pour démarrer la partie.";
    this.resultatFinal.innerText = "";
    this.mettreAJourStatut("Prêt");
  }

  mettreAJourStatut(message) {
    if (this.zoneStatut) {
      this.zoneStatut.innerText = message;
    }
  }

  mettreAJourTour() {
    this.champTour.value = `Tour ${this.compteurTour}`;

    if (!this.tourEnCours) {
      this.messageTour.innerText = "En attente du premier joueur...";
      return;
    }

    const joueurActif =
      this.tourEnCours === this.pseudonymeJoueur
        ? this.pseudonymeJoueur
        : this.pseudonymeAutreJoueur;

    this.messageTour.innerText = `${joueurActif}, c'est le tour de jouer !`;

    if (this.carteJoueur && this.carteAutreJoueur) {
      this.carteJoueur.classList.toggle(
        "actif",
        this.tourEnCours === this.pseudonymeJoueur
      );
      this.carteAutreJoueur.classList.toggle(
        "actif",
        this.tourEnCours === this.pseudonymeAutreJoueur
      );
    }
  }

  afficherDes(valeur1, valeur2) {
    this.champDe1.value = valeur1;
    this.champDe2.value = valeur2;

    if (this.champDe1.dataset) this.champDe1.dataset.valeur = valeur1;
    if (this.champDe2.dataset) this.champDe2.dataset.valeur = valeur2;
  }

  fermerFenetreRegles() {
    if (this.fenetreRegles) {
      this.fenetreRegles.classList.add("fenetre-cachee");
      localStorage.setItem("regles-vues", "oui");
    }
  }

  // =========================
  // AUTHENTIFICATION
  // =========================

  confirmerConnexion() {
    this.pseudonymeJoueur = this.champPseudonyme.value.trim();

    if (!this.pseudonymeJoueur) {
      alert("Veuillez entrer un pseudonyme.");
      this.boutonAuthentification.disabled = false;
      return;
    }

    this.enregistrerPseudonyme();
    this.multiNode.demanderAuthentification(this.pseudonymeJoueur);
  }

  confirmerAuthentification(autresParticipants) {
    this.formulaireAuthentification.querySelector("fieldset").disabled = true;
    this.ajouterJoueur(this.pseudonymeJoueur);

    if (autresParticipants.length > 0) {
      this.pseudonymeAutreJoueur = autresParticipants[0];
      this.ajouterJoueur(this.pseudonymeAutreJoueur);
      this.phaseJeu = Jeu.PHASE.LANCER_INITIAL;
      this.afficherPartie();
    } else {
      this.mettreAJourStatut("Connecté. En attente d’un autre joueur.");
    }
  }

  apprendreAuthentification(pseudonyme) {
    if (!this.listeJoueur[pseudonyme]) {
      this.ajouterJoueur(pseudonyme);
    }

    this.pseudonymeAutreJoueur = pseudonyme;
    this.phaseJeu = Jeu.PHASE.LANCER_INITIAL;
    this.afficherPartie();
  }

  ajouterJoueur(pseudonyme) {
    this.listeJoueur[pseudonyme] = {
      score: Jeu.SCORE_INITIAL
    };
  }

  afficherPartie() {
    if (!this.pseudonymeAutreJoueur) {
      return;
    }

    this.informationAutreJoueur.innerHTML =
      `Adversaire connecté : <strong>${this.pseudonymeAutreJoueur}</strong>`;

    this.champScore.value = this.listeJoueur[this.pseudonymeJoueur].score;
    this.champScoreAutreJoueur.value =
      this.listeJoueur[this.pseudonymeAutreJoueur].score;

    this.formulaireJeu.style.display = "block";
    this.boutonJouer.disabled = false;

    this.messageTour.innerText =
      "Chaque joueur doit lancer un dé pour déterminer qui commence.";
    this.mettreAJourStatut("Partie prête");
  }

  soumettreAuthentificationJoueur(evenementsubmit) {
    evenementsubmit.preventDefault();
    this.multiNode.connecter();
    this.boutonAuthentification.disabled = true;
  }

  // =========================
  // LOGIQUE DE JEU
  // =========================

  genererValeurDe() {
    return Math.floor(Math.random() * Jeu.POINT_MAXIMUM) + 1;
  }

  soumettreJeu(evenementsubmit) {
    evenementsubmit.preventDefault();

    if (this.partieTerminee) return;

    if (this.phaseJeu === Jeu.PHASE.LANCER_INITIAL) {
      this.lancerDeInitial();
      return;
    }

    if (this.phaseJeu === Jeu.PHASE.PARTIE_EN_COURS) {
      this.jouerTourPrincipal();
    }
  }

  lancerDeInitial() {
    this.boutonJouer.disabled = true;

    const valeurDe = this.genererValeurDe();
    this.champJouer.value = valeurDe;

    const message = {
      pseudonyme: this.pseudonymeJoueur,
      valeur: valeurDe
    };

    this.desLances[this.pseudonymeJoueur] = valeurDe;
    this.multiNode.posterVariableTextuelle(
      Jeu.MESSAGE.JOUER,
      JSON.stringify(message)
    );

    this.mettreAJourStatut("Dé initial lancé");
  }

  determinerPremierJoueur() {
    const deJoueur = this.desLances[this.pseudonymeJoueur];
    const deAutreJoueur = this.desLances[this.pseudonymeAutreJoueur];

    if (typeof deJoueur !== "number" || typeof deAutreJoueur !== "number") {
      return;
    }

    if (deJoueur > deAutreJoueur) {
      this.tourEnCours = this.pseudonymeJoueur;
      this.phaseJeu = Jeu.PHASE.PARTIE_EN_COURS;
      this.boutonJouer.disabled = false;
      this.mettreAJourStatut(`${this.pseudonymeJoueur} commence`);
    } else if (deAutreJoueur > deJoueur) {
      this.tourEnCours = this.pseudonymeAutreJoueur;
      this.phaseJeu = Jeu.PHASE.PARTIE_EN_COURS;
      this.boutonJouer.disabled = this.tourEnCours !== this.pseudonymeJoueur;
      this.mettreAJourStatut(`${this.pseudonymeAutreJoueur} commence`);
    } else {
      this.desLances = {};
      this.messageTour.innerText = "Égalité au lancer initial. Relancez.";
      this.boutonJouer.disabled = false;
      this.mettreAJourStatut("Relance initiale requise");
      return;
    }

    this.mettreAJourTour();
  }

  jouerTourPrincipal() {
    if (this.tourEnCours !== this.pseudonymeJoueur || this.partieTerminee) {
      return;
    }

    this.boutonJouer.disabled = true;

    const valeurDe1 = this.genererValeurDe();
    const valeurDe2 = this.genererValeurDe();

    this.afficherDes(valeurDe1, valeurDe2);

    const total = valeurDe1 + valeurDe2;
    const nouveauScore = this.listeJoueur[this.pseudonymeJoueur].score + total;

    this.changerScoreJoueur(nouveauScore);

    if (this.partieTerminee) {
      return;
    }

    if (valeurDe1 === valeurDe2) {
      this.messageTour.innerText = "Doublé ! Vous rejouez.";
      this.multiNode.posterVariableTextuelle(
        Jeu.MESSAGE.RETOUR,
        JSON.stringify({ pseudo: this.pseudonymeJoueur })
      );
      this.boutonJouer.disabled = false;
      this.mettreAJourStatut("Doublé obtenu");
      return;
    }

    this.compteurTour++;
    this.tourEnCours = this.pseudonymeAutreJoueur;

    this.multiNode.posterVariableTextuelle(
      Jeu.MESSAGE.TOUR,
      JSON.stringify({
        prochainJoueur: this.tourEnCours,
        compteurTour: this.compteurTour
      })
    );

    this.mettreAJourTour();
  }

  recevoirVariable(variable) {
    const message = JSON.parse(variable.valeur);

    if (variable.cle === Jeu.MESSAGE.JOUER) {
      this.desLances[message.pseudonyme] = message.valeur;

      if (
        this.phaseJeu === Jeu.PHASE.LANCER_INITIAL &&
        Object.keys(this.desLances).length === Jeu.NOMBRE_JOUEUR_REQUIS
      ) {
        this.determinerPremierJoueur();
      }
      return;
    }

    if (variable.cle === Jeu.MESSAGE.SCORE) {
      if (message.pseudonyme !== this.pseudonymeJoueur) {
        this.mettreScoreLocalAutre(message.valeur);
      }
      return;
    }

    if (variable.cle === Jeu.MESSAGE.TOUR) {
      this.tourEnCours = message.prochainJoueur;
      this.compteurTour = message.compteurTour || this.compteurTour;
      this.boutonJouer.disabled = this.tourEnCours !== this.pseudonymeJoueur;
      this.mettreAJourTour();
      return;
    }

    if (variable.cle === Jeu.MESSAGE.RETOUR) {
      this.tourEnCours = message.pseudo;
      this.boutonJouer.disabled = this.tourEnCours !== this.pseudonymeJoueur;
      this.mettreAJourTour();
      return;
    }

    if (variable.cle === Jeu.MESSAGE.FIN) {
      this.finDePartie(message.gagnant, false);
    }
  }

  changerScoreJoueur(nouveauScore) {
    if (this.listeJoueur[this.pseudonymeJoueur].score === nouveauScore) {
      return;
    }

    this.listeJoueur[this.pseudonymeJoueur].score = nouveauScore;
    this.champScore.value = nouveauScore;

    this.multiNode.posterVariableTextuelle(
      Jeu.MESSAGE.SCORE,
      JSON.stringify({
        pseudonyme: this.pseudonymeJoueur,
        valeur: nouveauScore
      })
    );

    if (nouveauScore >= this.scoreMax) {
      this.multiNode.posterVariableTextuelle(
        Jeu.MESSAGE.FIN,
        JSON.stringify({ gagnant: this.pseudonymeJoueur })
      );
      this.finDePartie(this.pseudonymeJoueur, true);
    }
  }

  mettreScoreLocalAutre(nouveauScore) {
    this.listeJoueur[this.pseudonymeAutreJoueur].score = nouveauScore;
    this.champScoreAutreJoueur.value = nouveauScore;
  }

  finDePartie(gagnant, estLocale = false) {
    if (this.partieTerminee) return;

    this.partieTerminee = true;
    this.phaseJeu = Jeu.PHASE.TERMINEE;

    const perdant =
      gagnant === this.pseudonymeJoueur
        ? this.pseudonymeAutreJoueur
        : this.pseudonymeJoueur;

    this.resultatFinal.innerText = `${gagnant} a gagné ! 🎉  ${perdant} a perdu.`;
    this.messageTour.innerText = "La partie est terminée.";
    this.mettreAJourStatut("Partie terminée");

    if (gagnant === this.pseudonymeJoueur) {
      this.incrementerVictoire();
    } else {
      this.incrementerDefaite();
    }

    this.boutonJouer.disabled = true;
    this.boutonAuthentification.disabled = true;

    this.formulaireJeu.querySelectorAll("button, input[type='submit']").forEach((element) => {
      element.disabled = true;
    });

    if (estLocale) {
      alert("Victoire !");
    }
  }
}

Jeu.NOMBRE_JOUEUR_REQUIS = 2;
Jeu.SCORE_INITIAL = 0;
Jeu.POINT_MAXIMUM = 6;
Jeu.CLE_STOCKAGE = "jeu-des-multijoueur";

Jeu.PHASE = {
  ATTENTE_JOUEURS: "ATTENTE_JOUEURS",
  LANCER_INITIAL: "LANCER_INITIAL",
  PARTIE_EN_COURS: "PARTIE_EN_COURS",
  TERMINEE: "TERMINEE"
};

Jeu.MESSAGE = {
  JOUER: "JOUER",
  SCORE: "SCORE",
  TOUR: "TOUR",
  RETOUR: "RETOUR",
  FIN: "FIN"
};

new Jeu();
