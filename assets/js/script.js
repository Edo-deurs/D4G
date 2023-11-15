const xhr = new XMLHttpRequest();
xhr.open(
  "GET",
  "./assets/json/referentiel-general-ecoconception-version-v1.json"
);
xhr.onload = function () {
  if (xhr.status === 200) {
    const data = JSON.parse(xhr.responseText);
    const liste = document.getElementById("maListe");
    data.criteres.forEach((critere) => {
      const li = document.createElement("li");
      const titre = document.createElement("h2");
      titre.textContent = critere.critere;
      li.appendChild(titre);
      const thematique = document.createElement("p");
      thematique.innerHTML = `<strong>Thématique:</strong> ${critere.thematique}`;
      li.appendChild(thematique);
      const objectif = document.createElement("p");
      objectif.innerHTML = `<strong>Objectif:</strong> ${critere.objectif}`;
      li.appendChild(objectif);
      liste.appendChild(li);
    });
  } else {
    console.log("Impossible de charger le fichier JSON");
  }
};
xhr.send();
