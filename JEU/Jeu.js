class Jeu {
  constructor() {
    this.multiNode = new MultiNode();
    this.multiNode.confirmerConnexion = () => this.confirmerConnexion();
    this.multiNode.confirmerAuthentification = (autresParticipants) => this.confirmerAuthentification(autresParticipants);
    this.multiNode.apprendreAuthentification = (pseudonyme) => this.apprendreAuthentification(pseudonyme);
    this.multiNode.recevoirVariable = (variable) => this.recevoirVariable(variable);
    this.listeJoueur = {};
    this.pseudonymeJoueur = "";
    this.pseudonymeAutreJoueur = "";
    this.formulaireAuthentification = document.getElementById("formulaire-authentification");
    this.formulaireAuthentification.addEventListener("submit", (evenementsubmit) => this.soumettreAuthentificationJoueur(evenementsubmit));
    this.champPseudonyme = document.getElementById("champ-pseudonyme");
    this.boutonAuthentification = document.getElementById("bouton-authentification");
    this.formulaireJeu = document.getElementById("formulaire-jeu");
    this.formulaireJeu.addEventListener("submit", (evenementsubmit) => this.soumettreJeu(evenementsubmit));
    this.formulaireJeu.style.display = "none";
    this.champScore = document.getElementById("champ-score");
    this.champJouer = document.getElementById("champ-jouer");
    this.boutonJouer = document.getElementById("bouton-jouer");
    this.informationAutreJoueur = document.getElementById("information-autre-joueur");
    this.champScoreAutreJoueur = document.getElementById("champ-score-autre-joueur");
    this.desLances = {};
    this.scoreMax = 60;
    this.tourEnCours = false;
    this.compteurTour = 0;
    this.champDe1 = document.getElementById("champ-de-1");
    this.champDe2 = document.getElementById("champ-de-2");
    this.champTour = document.getElementById("champ-tour");
    this.messageTour =  document.getElementById("message-tour");
    this.resultatFinal= document.getElementById("resultat-partie")
  }

  mettreAJourTour() {
    this.champTour.value = `Tour ${this.compteurTour}`;
    const joueurActif = this.tourEnCours === this.pseudonymeJoueur ? this.pseudonymeJoueur: this.pseudonymeAutreJoueur;
    this.messageTour.innerText = `${joueurActif}, c'est votre tour !`;
  }

  confirmerConnexion() {
    console.log("Je suis connecté.");
    this.pseudonymeJoueur = this.champPseudonyme.value;
    if (!this.pseudonymeJoueur) {
      alert("Veuillez entrer un pseudonyme !");
      return;
    }
    this.multiNode.demanderAuthentification(this.pseudonymeJoueur);
  }

  confirmerAuthentification(autresParticipants) {
    console.log("Je suis authentifié.");
    console.log("Les autres participants sont " + JSON.stringify(autresParticipants));
    this.formulaireAuthentification.querySelector("fieldset").disabled = true;
    this.ajouterJoueur(this.pseudonymeJoueur);
    if (autresParticipants.length > 0) {
      this.pseudonymeAutreJoueur = autresParticipants[0];
      this.ajouterJoueur(autresParticipants[0]);
      this.afficherPartie();
    }
  }

  apprendreAuthentification(pseudonyme) {
    console.log("Nouvel ami connecté : " + pseudonyme);
    this.ajouterJoueur(pseudonyme);
    this.pseudonymeAutreJoueur = pseudonyme;
    console.log("pseudonymeAutreJoueur défini : " + this.pseudonymeAutreJoueur);
    this.afficherPartie();
  }

  ajouterJoueur(pseudonyme) {
    console.log("ajouterJoueur : " + pseudonyme);
    this.listeJoueur[pseudonyme] = { score: Jeu.SCORE_INITIAL };
  }

 determinerPremierJoueur() {
    console.log("Valeurs des dés :", this.desLances);
    let deJoueur = this.desLances[this.pseudonymeJoueur];
    this.mettreAJourTour();
    let deAutreJoueur = this.desLances[this.pseudonymeAutreJoueur];
    this.mettreAJourTour();
    if (deJoueur > deAutreJoueur) {
        console.log(`${this.pseudonymeJoueur} commence la partie !`);
        this.tourEnCours = this.pseudonymeJoueur;
        this.boutonJouer.disabled = false;
        this.mettreAJourTour();
    } else if (deJoueur < deAutreJoueur) {
        console.log(`${this.pseudonymeAutreJoueur} commence la partie !`);
        this.tourEnCours = this.pseudonymeAutreJoueur;
        this.boutonJouer.disabled = true;
        this.mettreAJourTour();
    } else {
        console.log("Égalité ! Relancez les dés...");
        this.desLances = {};
        this.messageTour.innerText = "Égalité ! Relancez les dés...";
    }
    this.compteurTour;
    console.log(`Début du Tour ${this.compteurTour}`);
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

  recevoirVariable(variable) {
    console.log("recevoirVariable " + variable.cle + " = " + variable.valeur);
    let message = JSON.parse(variable.valeur);
    if (variable.cle === Jeu.MESSAGE.JOUER) {
      this.desLances[message.pseudonyme] = message.valeur;
      console.log(`Le joueur ${message.pseudonyme} a lancé un dé et obtenu ${message.valeur}`);
      if (Object.keys(this.desLances).length === Jeu.NOMBRE_JOUEUR_REQUIS) {
          console.log("Tous les joueurs ont lancé leur dé. Déterminons qui commence !");
          if (!this.tourEnCours) {
            this.determinerPremierJoueur();
          } else {
            console.log("Début du deuxième tour !");
            this.boutonJouer.disabled = false;
          }
          }
      } else if (variable.cle === Jeu.MESSAGE.SCORE) {
      let message = JSON.parse(variable.valeur);
      console.log(`Mise à jour du score de ${message.pseudonyme} : ${message.valeur}`);
        if (message.pseudonyme !== this.pseudonymeJoueur) {
        this.changerScoreAutreJoueur(message.valeur);
        } else {
        this.changerScoreJoueur(message.valeur);
        }
      }
    if (variable.cle === "TOUR") {
    let message = JSON.parse(variable.valeur);
    console.log(`C'est maintenant au tour de ${message.prochainJoueur}`);
    if (message.prochainJoueur === this.pseudonymeJoueur) {
        this.boutonJouer.disabled = false;
    } else {
        this.boutonJouer.disabled = true;
    }
    this.tourEnCours = message.prochainJoueur;
     this.mettreAJourTour();
  }
  }

  soumettreAuthentificationJoueur(evenementsubmit) {
    console.log("soumettreAuthentificationJoueur");
    evenementsubmit.preventDefault();
    this.multiNode.connecter();
    this.boutonAuthentification.disabled = true;
  }

  afficherPartie() {
    if (!this.pseudonymeAutreJoueur) {
      console.log("Aucun autre joueur détecté pour démarrer la partie.");
      return;
    }
    this.informationAutreJoueur.innerHTML = this.informationAutreJoueur.innerHTML.replace("{nom-autre-joueur}", this.pseudonymeAutreJoueur);
    this.champScoreAutreJoueur.value = this.listeJoueur[this.pseudonymeAutreJoueur].score;
    this.champScore.value = this.listeJoueur[this.pseudonymeJoueur].score;
    this.formulaireJeu.style.display = "block";
    console.log("Affichage de la partie terminé, détermination du premier joueur...");
    this.determinerPremierJoueur();
  }

  genererValeurDe() {
    return Math.floor(Math.random() * Jeu.POINT_MAXIMUM) + 1;
  }

  soumettreJeu(evenementsubmit) {
    console.log("soumettreJeu");
    evenementsubmit.preventDefault();
    if (!this.tourEnCours) {
        let valeurDe = this.genererValeurDe();
        this.champJouer.value = valeurDe;
        let message = {
            pseudonyme: this.pseudonymeJoueur,
            valeur: valeurDe
        };
        this.multiNode.posterVariableTextuelle(Jeu.MESSAGE.JOUER, JSON.stringify(message));
    } else {
        console.log("Le deuxième tour commence !");
        this.boutonJouer.disabled = true;
        this.jouerDeuxiemeTour();
    }
  }

  jouerDeuxiemeTour() {
    console.log(`Tour ${this.compteurTour} en cours...`);
    let joueurActif = this.tourEnCours;
    if (joueurActif !== this.pseudonymeJoueur) {
        return;
    }
    console.log(`${joueurActif}, c'est votre tour de lancer deux dés !`);
    let valeurDe1 = this.genererValeurDe();
    let valeurDe2 = this.genererValeurDe();
    console.log(`Dés lancés : ${valeurDe1} et ${valeurDe2}`);
    this.champDe1.value = valeurDe1;
    this.champDe2.value = valeurDe2;
    if (valeurDe1 === valeurDe2) {
        console.log(`${joueurActif} a fait un doublé, il peut rejouer !`);
        this.messageTour.innerText="vous avez un doublez! rejouez!";
        this.boutonJouer.disabled = false;
        this.multiNode.posterVariableTextuelle("RETOUR", JSON.stringify({ pseudo: joueurActif }));
        return;
    } else if (valeurDe1 !== valeurDe2) {
        this.compteurTour++;
        this.mettreAJourTour();
    }
    let nouveauScore = this.listeJoueur[joueurActif].score + valeurDe1 + valeurDe2;
    if (joueurActif === this.pseudonymeJoueur) {
        this.changerScoreJoueur(nouveauScore);
    } else {
        this.changerScoreAutreJoueur(nouveauScore);
    }
    this.tourEnCours = (joueurActif === this.pseudonymeJoueur) ? this.pseudonymeAutreJoueur : this.pseudonymeJoueur;
    let message = {
        prochainJoueur: this.tourEnCours
    };
    this.multiNode.posterVariableTextuelle("TOUR", JSON.stringify(message));
    this.boutonJouer.disabled = true;
     this.mettreAJourTour();
  }

  changerScoreJoueur(nouveauScore) {
    console.log("changerScoreJoueur()=>valeur " + nouveauScore);
    if (this.listeJoueur[this.pseudonymeJoueur].score === nouveauScore) {
        console.log("Le score du joueur est déjà à jour, aucune mise à jour envoyée.");
        return;
    }
    this.listeJoueur[this.pseudonymeJoueur].score = nouveauScore;
    this.champScore.value = nouveauScore;
    let message = {
        pseudonyme: this.pseudonymeJoueur,
        valeur: nouveauScore
    };
    this.multiNode.posterVariableTextuelle(Jeu.MESSAGE.SCORE, JSON.stringify(message));
    if (nouveauScore >= this.scoreMax) {
        this.changerScoreJoueur(nouveauScore);
        console.log(`${this.pseudonymeJoueur} a gagné avec ${nouveauScore} points !`);
        this.finDePartie(this.pseudonymeJoueur);
    }
  }

  changerScoreAutreJoueur(nouveauScore) {
    console.log("changerScoreAutreJoueur()=>valeur " + nouveauScore);
    if (this.listeJoueur[this.pseudonymeAutreJoueur].score === nouveauScore) {
        console.log("Le score de l'autre joueur est déjà à jour, aucune mise à jour envoyée.");
        return;
    }
    this.listeJoueur[this.pseudonymeAutreJoueur].score = nouveauScore;
    this.champScoreAutreJoueur.value = nouveauScore;
    let message = {
        pseudonyme: this.pseudonymeAutreJoueur,
        valeur: nouveauScore
    };
    this.multiNode.posterVariableTextuelle(Jeu.MESSAGE.SCORE, JSON.stringify(message));
    if (nouveauScore >= this.scoreMax) {
        this.changerScoreAutreJoueur(nouveauScore);
        console.log(`${this.pseudonymeAutreJoueur} a gagné avec ${nouveauScore} points !`);
        this.finDePartie(this.pseudonymeAutreJoueur);
    }
  }

  finDePartie(gagnant) {
    console.log(`La partie est terminée. ${gagnant} a gagné !`);
    let perdant = (gagnant === this.pseudonymeJoueur) ? this.pseudonymeAutreJoueur : this.pseudonymeJoueur;
    let messageFinal = `${gagnant} a gagné ! 🎉\n${perdant} a perdu. 😢`;
    this.resultatFinal.innerText = messageFinal;
     alert(`${gagnant} a gagné !`);
    this.boutonJouer.disabled = true;
    this.boutonAuthentification.disabled = true;
    this.formulaireJeu.querySelectorAll("button").forEach((button) => {
        button.disabled = true;
    });
     this.boutonJouer.disabled = true;
     this.boutonAuthentification.disabled = true;

  }
}

Jeu.NOMBRE_JOUEUR_REQUIS = 2;
Jeu.SCORE_INITIAL = 0;
Jeu.POINT_MAXIMUM = 6;
Jeu.MESSAGE = {
  JOUER: "JOUER",
  SCORE: "SCORE",
};
new Jeu();
