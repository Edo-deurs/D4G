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
    const themeFilter = document.getElementById("theme-filter");
    const stateFilter = document.getElementById("state-filter");
    const selectOptions = [
      "conforme",
      "en cours de déploiement",
      "non conforme",
      "non applicable",
      "a definir",
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
      select.name = `select-${critere.id}`;
      selectOptions.forEach((option) => {
        const optionEl = document.createElement("option");
        optionEl.value = option;
        optionEl.textContent = option;
        select.appendChild(optionEl);
      });
      select.value = critere.etat;
      select.addEventListener("change", () => {
        etats[critere.id] = select.value;
        updateCounters();
        updateTable();
      });
      tdEtat.appendChild(select);
      row.appendChild(tdEtat);
      tbody.appendChild(row);

      // Ajouter les options de filtre pour les thématiques
      if (!themeFilter.querySelector(`option[value="${critere.thematique}"]`)) {
        const themeOption = document.createElement("option");
        themeOption.value = critere.thematique;
        themeOption.textContent = critere.thematique;
        themeFilter.appendChild(themeOption);
      }
    });

    // Ajouter le tableau au DOM
    table.appendChild(thead);
    table.appendChild(tbody);
    document.getElementById("table-container").appendChild(table);

    // Mettre à jour les compteurs
    function updateCounters() {
      const conformeCounter = document.getElementById("conforme-counter");
      const enCoursCounter = document.getElementById("en-cours-counter");
      const nonConformeCounter = document.getElementById(
        "non-conforme-counter"
      );
      const nonApplicableCounter = document.getElementById(
        "non-applicable-counter"
      );
      const aDefinirCounter = document.getElementById("a-definir-counter");

      // Compter les états
      const etatsCount = Object.values(etats).reduce((count, etat) => {
        count[etat] = (count[etat] || 0) + 1;
        return count;
      }, {});

      // Mettre à jour les compteurs affichés
      conformeCounter.textContent = etatsCount["conforme"] || 0;
      enCoursCounter.textContent = etatsCount["en cours de déploiement"] || 0;
      nonConformeCounter.textContent = etatsCount["non conforme"] || 0;
      nonApplicableCounter.textContent = etatsCount["non applicable"] || 0;

      // Calculer le nombre d'états à définir
      const totalCritereCount = data.criteres.length;
      const definedCritereCount = Object.values(etats).filter(
        (etat) => etat !== "a definir"
      ).length;
      const aDefinirCount = totalCritereCount - definedCritereCount;
      aDefinirCounter.textContent = aDefinirCount;
    }

    // Mettre à jour le tableau en fonction des filtres
    function updateTable() {
      tbody.querySelectorAll("tr").forEach((row) => {
        const themeFilterValue = themeFilter.value.toLowerCase();
        const stateFilterValue = stateFilter.value.toLowerCase();
        const themeMatch =
          themeFilterValue === "" ||
          row
            .querySelector("td:first-child")
            .textContent.toLowerCase()
            .includes(themeFilterValue);
        const stateMatch =
          stateFilterValue === "" ||
          row
            .querySelector("select")
            .value.toLowerCase()
            .includes(stateFilterValue);
        row.style.display = themeMatch && stateMatch ? "table-row" : "none";
      });
    }

    // Mettre à jour le tableau et les compteurs lorsque les filtres sont modifiés
    [themeFilter, stateFilter].forEach((filter) => {
      filter.addEventListener("change", () => {
        updateTable();
        updateCounters();
      });
    });

    document
      .getElementById("exportButton")
      .addEventListener("click", exportToPDF);

    function exportToPDF() {
      const pdf = new jsPDF();

      // Ajouter le titre du PDF
      pdf.text(
        "Liste des critères d'écoconception de services numériques",
        20,
        10
      );

      // Ajouter le numéro d'équipe
      pdf.text("Numéro d'équipe: 22", 20, 20);

      // Ajouter les critères
      const critereElements = document.querySelectorAll(
        "#table-container tbody tr"
      );
      let yOffset = 30; // Décalage en Y pour commencer sous le titre et le numéro d'équipe

      critereElements.forEach((critereElement) => {
        const theme =
          critereElement.querySelector("td:first-child").textContent;
        const critere =
          critereElement.querySelector("td:nth-child(2)").textContent;
        const etat = critereElement.querySelector("select").value;
        // Utiliser splitTextToSize pour gérer le texte sur plusieurs lignes
        const maxWidth = pdf.internal.pageSize.width - 40; // Largeur disponible
        const splitText = pdf.splitTextToSize(
          `${theme} - ${critere}: ${etat}`,
          maxWidth
        );

        // Si le texte dépasse la hauteur de la page, ajouter une nouvelle page
        if (yOffset + splitText.length * 10 > pdf.internal.pageSize.height) {
          pdf.addPage(); // Passer à une nouvelle page
          yOffset = 10; // Réinitialiser le décalage en Y
        }

        // Ajouter le texte sur plusieurs lignes
        splitText.forEach((line) => {
          pdf.text(line, 20, yOffset);
          yOffset += 10; // Augmenter le décalage pour la prochaine ligne
        });
      });

      // Enregistrer le PDF
      pdf.save("exported_text.pdf");

      function calculateConformityScore() {
        const totalCriteria = data.criteres.length;
        const nonApplicableCriteriaCount = Object.values(etats).filter(
          (etat) => etat === "non applicable"
        ).length;
        const conformCriteriaCount = Object.values(etats).filter(
          (etat) => etat === "conforme"
        ).length;

        // Calculer le score de conformité
        const conformityScore =
          conformCriteriaCount / (totalCriteria - nonApplicableCriteriaCount);

        return isNaN(conformityScore) ? 0 : conformityScore; // Retourner 0 si le score est NaN
      }
      function updateCounters() {
        // ... (le reste du code)

        // Calculer le score de conformité
        const conformityScore = calculateConformityScore();

        // Afficher le score dans un élément avec l'id "conformity-score"
        const conformityScoreElement =
          document.getElementById("conformity-score");
        if (conformityScoreElement) {
          conformityScoreElement.textContent = `Score de conformité : ${(
            conformityScore * 100
          ).toFixed(2)}%`;
        }
      }
    }
    // Mettre à jour les compteurs initiaux
    updateCounters();
  }
};
xhr.send();
