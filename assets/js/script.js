const xhr = new XMLHttpRequest();
xhr.open(
  "GET",
  "./assets/json/referentiel-general-ecoconception-version-v1.json"
);
xhr.onload = function () {
  if (xhr.status === 200) {
    const data = JSON.parse(xhr.responseText);
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");
    const selectOptions = [
      "conforme",
      "en cours de déploiement",
      "non conforme",
      "non applicable",
    ];
    const etats = {};

    // Créer les en-têtes du tableau
    const headerRow = document.createElement("tr");
    const thTheme = document.createElement("th");
    thTheme.textContent = "Thématique";
    headerRow.appendChild(thTheme);
    const thCritere = document.createElement("th");
    thCritere.textContent = "Critère";
    headerRow.appendChild(thCritere);
    const thEtat = document.createElement("th");
    thEtat.textContent = "État";
    headerRow.appendChild(thEtat);
    thead.appendChild(headerRow);

    // Créer les lignes du tableau avec les critères
    data.criteres.forEach((critere) => {
      const row = document.createElement("tr");
      const tdTheme = document.createElement("td");
      tdTheme.textContent = critere.thematique;
      row.appendChild(tdTheme);
      const tdCritere = document.createElement("td");
      tdCritere.textContent = critere.critere;
      row.appendChild(tdCritere);
      const tdEtat = document.createElement("td");
      const select = document.createElement("select");
      select.name = "etat";
      selectOptions.forEach((option) => {
        const optionElement = document.createElement("option");
        optionElement.value = option;
        optionElement.textContent = option;
        select.appendChild(optionElement);
      });
      select.value = etats[critere.critere] || "";
      select.addEventListener("change", () => {
        etats[critere.critere] = select.value;
      });
      tdEtat.appendChild(select);
      row.appendChild(tdEtat);
      tbody.appendChild(row);
    });

    table.appendChild(thead);
    table.appendChild(tbody);

    // Ajouter le tableau à la page
    const container = document.getElementById("table-container");
    container.appendChild(table);

    // Ajouter les options de filtrage des thématiques
    const selectFiltre = document.getElementById("filtre");
    const themes = data.criteres.reduce((acc, critere) => {
      if (!acc.includes(critere.thematique)) {
        acc.push(critere.thematique);
      }
      return acc;
    }, []);
    themes.forEach((theme) => {
      const optionElement = document.createElement("option");
      optionElement.value = theme;
      optionElement.textContent = theme;
      selectFiltre.appendChild(optionElement);
    });
    selectFiltre.addEventListener("change", () => {
      const rows = tbody.querySelectorAll("tr");
      rows.forEach((row) => {
        if (
          selectFiltre.value === "" ||
          row.children[0].textContent === selectFiltre.value
        ) {
          row.style.display = "";
        } else {
          row.style.display = "none";
        }
      });
    });
  }
};
xhr.send();
