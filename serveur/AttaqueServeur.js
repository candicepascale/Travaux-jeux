const MultiNodeServeur = require('./MultiNodeServeur.js');

//Les messages sont transportés dans des variables de type texte.
//Une variable est constituée minimalement d'un type, d'une clé et d'une valeur.
//Quand les variables sont expédiées vers les clients, elles sont sous la forme JSON.strignify
//formaterPourMessage permet de générer une variable facile à utiliser.
class Variable{
  static type = "texte";
  static cle = null;
  static valeur = null;

  static formaterPourMessage(){
    return {
      type : this.type,
      cle : this.cle,
      valeur : this.valeur
    }
  }
}

//VariablePointDeVie est une variable de type "texte" avec une clé "POINT_DE_VIE"
//Les valeurs de la variable sont pseudonyme et valeur (nombre de point de vie)
class VariablePointDeVie extends Variable {
  static cle = "POINT_DE_VIE";

  static setValeur(pseudonyme, valeur){
    let valeurObjet = { pseudonyme : pseudonyme, valeur : valeur };
    this.valeur = JSON.stringify(valeurObjet);
  }
}

//VariableFinPartie est une variable de type "texte" avec une clé "FIN_PARTIE"
//Les valeurs de la variable sont pseudonyme (joueur perdant) et valeur (true indique qu'il a perdu)
class VariableFinPartie extends Variable {
  static cle = "FIN_PARTIE";

  static setValeur(pseudonymeJoueurPerdant){
    let valeurObjet = { pseudonyme : pseudonymeJoueurPerdant, valeur : true };
    this.valeur = JSON.stringify(valeurObjet);
  }
}

//VariableAttaque est une variable de type "texte" avec une clé "ATTAQUE"
//Les valeurs de la variable ne sont pas identifiées car pas utilisées dans le code
class VariableAttaque extends Variable {
 static cle = "ATTAQUE";
}

//AttaqueJoueur est la définition d'un joueur pour le jeu Attaque
//Toutes les caractéristiques du joueur sont définies ici.
//Dans le cas de Attaque c'est seulement le nombre de points de vie.
//Dans un jeu graphique, ça pourrait être les coordonnées (x,y) du joueur, sa direction, sa vélocité, etc.
class AttaqueJoueur extends MultiNodeServeur.Joueur{
  constructor(pseudonyme, pointDeVie){
    super(pseudonyme);
    this.pointDeVie = pointDeVie;
  }
}

class AttaqueServeur{
  constructor(){
    this.multiNodeServeur = new MultiNodeServeur.Serveur();
    //Surcharge des méthode de MultiNodeServeur.js pour les besoins du jeu Attaque
    this.multiNodeServeur.actionReceptionMessageTransfertVariable = (messageTransfertVariable) => this.actionReceptionMessageTransfertVariable(messageTransfertVariable);
    this.multiNodeServeur.actionFinReceptionMessage = () => this.actionFinReceptionMessage();
    this.multiNodeServeur.actionCreerJoueur = (pseudonyme) => this.actionCreerJoueur(pseudonyme);
  }

  /*
   * Activé dans MultiNodeServeur.js->agirSurReceptionMessage quand le messageMultinode est messageTransfertVariable
   * Quand le client exécute, par exemple, posterVariableTextuelle.
   *
   * messageTransfertVariable :
   *   type = "texte";
   *   variable =
   *     cle = "ATTAQUE" ou "FIN_PARTIE" ou "POINT_DE_VIE"
   *     valeur = ex : { pseudonyme : "seb", valeur : 5 }
   *
   */
  actionReceptionMessageTransfertVariable(messageTransfertVariable){
    //variableCle : "ATTAQUE" ou "FIN_PARTIE" ou "POINT_DE_VIE"
    let variableCle = messageTransfertVariable.variable.cle;
    switch (variableCle) {
      //"ATTAQUE"
      case VariableAttaque.cle :
        let variableAttaqueValeur = JSON.parse(messageTransfertVariable.variable.valeur);
        let joueurCible = this.identifierJoueurCible(variableAttaqueValeur.pseudonyme);
        joueurCible.pointDeVie -= variableAttaqueValeur.valeur;
        //Voici le message transféré par le serveur à la réception du message "ATTAQUE"
        VariablePointDeVie.setValeur(joueurCible.pseudonyme, joueurCible.pointDeVie);
        messageTransfertVariable.variable = VariablePointDeVie.formaterPourMessage();
        break;
    }
    //Le serveur transfère le message "messageTransfertVariable" par défaut.
    //Le message d'origine peut être transformé ou échanger par un nouveau message.
    //Le switch case permet de faire des actions pour chaque message reçu.
    this.multiNodeServeur.repondreTransfertVariable(messageTransfertVariable);
  }

  /*
   * Activé dans MultiNodeServeur.js->agirSurReceptionMessage à la fin de la méthode
   * Quand le client exécute, par exemple, posterVariableTextuelle.
   *
   * Position idéale pour faire des tests de fin de partie ou autre action globale
   */
  actionFinReceptionMessage(){
    console.log("AttaqueServeur.actionFinReceptionMessage");
    //Identifier le joueur perdant
    let pseudonymeJoueurPerdant = this.identifierPseudonymeJoueurPerdant();
    //S'il existe
    if(pseudonymeJoueurPerdant){
      //Créer un nouveau message VariableFinPartie
      let messageTransfertVariable = this.multiNodeServeur.messageTransfertVariable;
      VariableFinPartie.setValeur(pseudonymeJoueurPerdant);
      messageTransfertVariable.variable = VariableFinPartie.formaterPourMessage();
      //Transférer le message à tous les clients
      this.multiNodeServeur.repondreTransfertVariable(messageTransfertVariable);
    }
  }

  /*
   * Activé dans MultiNodeServeur.js->ajouterJoueur pour ajouter un joueur adapté au jeu
   * Quand le client exécute, par exemple, une demande d'authentification.
   *
   * Le pseudonyme est la seule information obligatoire fournie par MultiNodeServeur.js
   */
  actionCreerJoueur(pseudonyme){
    //Création d'un joueur spécifique pour le jeu Attaque ou autre
    return new AttaqueJoueur(pseudonyme, 20);
  }

  /*
   * À partir d'un pseudonyme, identifie l'autre joueur
   */
  identifierJoueurCible(pseudonymeAttanquant){
    let joueurCible = null;
    //Boucle qui identifie le joueur ciblé
    this.multiNodeServeur.listeJoueur.forEach((joueur) => { if(!joueur.estSemblable(pseudonymeAttanquant)) joueurCible = joueur;});
    return joueurCible;
  }

  /*
   * Si un pseudonyme est trouvé ça indique que la partie est fini.
   */
  identifierPseudonymeJoueurPerdant(){
    let pseudonymeJoueurPerdant = null;
    //Boucle qui identifie le joueur perdant
    this.multiNodeServeur.listeJoueur.forEach((joueur) => { if(joueur.pointDeVie <= 0) pseudonymeJoueurPerdant = joueur.pseudonyme; });
    return pseudonymeJoueurPerdant;
  }

}

new AttaqueServeur();