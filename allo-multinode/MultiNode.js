
class MultiNode{
  constructor(){
    this.messageTransfertVariable            = {etiquette:"TRANSFERT_VARIABLE", variable : ""};
    this.messageDemandeAuthentification      = {etiquette:"DEMANDE_AUTHENTIFICATION", pseudonyme : ""};
    // messages recus
    this.messageNotificationAuthentification = {etiquette:"NOTIFICATION_AUTHENTIFICATION"};
    this.messageNotificationVariable         = {etiquette:"NOTIFICATION_VARIABLE"};
    this.messageConfirmationAuthentification = {etiquette:"CONFIRMATION_AUTHENTIFICATION"};

  }

  connecter(pseudonyme){

    try{
      this.contact = new WebSocket("ws://127.0.0.1:8080/multinode");
      //this.contact.onopen = () => contact.send("allo");
    }
    catch(erreur){
      console.log("erreur" + JSON.stringify(erreur));
    }

    this.contact.addEventListener("open", evenementopen => {
      console.log("ouverture " + JSON.stringify(evenementopen));
      this.confirmerConnexion();
    });

    this.contact.addEventListener("close", evenementclose => {
      console.log("fermeture " + JSON.stringify(evenementclose));
    });

    this.contact.addEventListener("message", evenementmessage => {
      console.log("message " + JSON.stringify(evenementmessage));
      var message = JSON.parse(evenementmessage.data);

      switch(message.etiquette)
      {
        case "NOTIFICATION_AUTHENTIFICATION":
          this.apprendreAuthentification(message.pseudonyme);
        break;
        case "NOTIFICATION_VARIABLE":
          var variable = message.variable;
          console.log("variable recue " + variable.cle + " = " + variable.valeur);
          this.recevoirVariable(variable);
        break;
        case "CONFIRMATION_AUTHENTIFICATION":
          this.confirmerAuthentification(message.listePseudo);
        break;
      }

      //console.debug("Message recu", message.valeur);
    });
  }

  posterVariableTextuelle(id, texte){
    console.debug("MultiNode => posterVariableTextuelle()", id, texte);
    this.messageTransfertVariable.variable = new MultiNode.Variable("texte", id, texte);
    this.contact.send(JSON.stringify(this.messageTransfertVariable));
  }

  posterVariableNumerique(id, nombre){
    console.debug("MultiNode => posterVariableNumerique()", id, nombre);
    this.messageTransfertVariable.variable = new MultiNode.Variable("numerique", id, nombre);
    this.contact.send(JSON.stringify(this.messageTransfertVariable));
  }

  posterVariableBooleenne(id, booleen){
    console.debug("MultiNode => posterVariableBooleenne()", id, booleen);
    this.messageTransfertVariable.variable = new MultiNode.Variable("booleen", id, booleen);
    this.contact.send(JSON.stringify(this.messageTransfertVariable));
  }

  demanderAuthentification(pseudonyme){
    console.debug("MultiNode => demanderAuthentification()",pseudonyme);
    this.messageDemandeAuthentification.pseudonyme = pseudonyme;
    this.contact.send(JSON.stringify(this.messageDemandeAuthentification));
  }

  // fonction a redefinir
  confirmerConnexion(){
    console.error("MultiNode => confirmerConnexion doit être redéfini");
  }

  confirmerAuthentification(autresParticipants){
    console.error("MultiNode => confirmerAuthentification doit être redéfini");
  }

  apprendreAuthentification(pseudonyme){
    console.error("MultiNode => apprendreAuthentification doit être redéfini");
  }

  recevoirVariable(variable){
    console.error("MultiNode => recevoirVariable doit être redéfini");
  }

}

MultiNode.Variable = class {
  constructor(type, cle, valeur){
    this.type = type;
    this.cle = cle;
    this.valeur = valeur;
  }
}
