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
    let sortDirection = 1;

    const scoreConformite = document.getElementById("conformity-score");

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

      const etatsCount = Object.values(etats).reduce((count, etat) => {
        count[etat] = (count[etat] || 0) + 1;
        return count;
      }, {});

      conformeCounter.textContent = etatsCount["conforme"] || 0;
      enCoursCounter.textContent = etatsCount["en cours de déploiement"] || 0;
      nonConformeCounter.textContent = etatsCount["non conforme"] || 0;
      nonApplicableCounter.textContent = etatsCount["non applicable"] || 0;
      scoreConformite.textContent = etatsCount["score de conformité"] || 0;

      const totalCritereCount = data.criteres.length;
      const definedCritereCount = Object.values(etats).filter(
        (etat) => etat !== "a definir"
      ).length;
      const aDefinirCount = totalCritereCount - definedCritereCount;
      aDefinirCounter.textContent = aDefinirCount;

      const scoreConformiteCount =
        (etatsCount["conforme"] || 0) /
        (totalCritereCount - (etatsCount["non applicable"] || 0));
      scoreConformite.textContent = scoreConformiteCount.toFixed(2) * 100 + "%";
    }

    function updateTable() {
      tbody.innerHTML = "";
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
        select.addEventListener("change", (e) => {
          critere.etat = select.value;
          etats[critere.id] = e.target.value;
          updateCounters();
        });
        tdEtat.appendChild(select);
        row.appendChild(tdEtat);
        tbody.appendChild(row);
      });
      tbody.querySelectorAll("tr").forEach((row) => {
        const themeFilterValue = themeFilter.value.toLowerCase();
        const stateFilterValue = stateFilter.value.toLowerCase();
        const themeMatch =
          themeFilterValue === "" ||
          row.querySelector("td:first-child").textContent.toLowerCase() ===
            themeFilterValue;
        const stateMatch =
          stateFilterValue === "" ||
          row.querySelector("select").value.toLowerCase() === stateFilterValue;
        row.style.display = themeMatch && stateMatch ? "table-row" : "none";
      });
    }

    // Créer les en-têtes du tableau
    const headerRow = document.createElement("tr");
    const thTheme = document.createElement("th");
    thTheme.textContent = "Thématique";
    thTheme.addEventListener("click", () => {
      data.criteres.sort((a, b) => a.thematique.localeCompare(b.thematique));
      updateTable();
    });
    headerRow.appendChild(thTheme);
    const thCritere = document.createElement("th");
    thCritere.textContent = "Critère";
    thCritere.addEventListener("click", () => {
      data.criteres.sort((a, b) => a.critere.localeCompare(b.critere));
      updateTable();
    });
    headerRow.appendChild(thCritere);
    const thEtat = document.createElement("th");
    thEtat.textContent = "État";
    thEtat.addEventListener("click", () => {
      data.criteres.sort((a, b) => {
        const etatOrder = [
          "conforme",
          "en cours de déploiement",
          "non conforme",
          "non applicable",
          "a definir",
        ];
        return etatOrder.indexOf(a.etat) - etatOrder.indexOf(b.etat);
      });
      updateTable();
    });
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
      select.value = "a definir";
      select.addEventListener("change", () => {
        etats[critere.id] = select.value;
        updateCounters();
        updateTable();
      });
      tdEtat.appendChild(select);
      row.appendChild(tdEtat);
      tbody.appendChild(row);
      if (!themeFilter.querySelector(`option[value="${critere.thematique}"]`)) {
        const themeOption = document.createElement("option");
        themeOption.value = critere.thematique;
        themeOption.textContent = critere.thematique;
        themeFilter.appendChild(themeOption);
      }
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    document.body.appendChild(table);

    document
      .getElementById("exportButton")
      .addEventListener("click", exportToPDF);

    function exportToPDF() {
      const nomDuSite = document.getElementById("url").value;
      const pdf = new window.jspdf.jsPDF();

      pdf.text(
        "Liste des critères d'écoconception de services numériques",
        20,
        10
      );

      // Configure le titre
      pdf.setFontSize(16);
      const titre = `Évaluation de Conformité - ${nomDuSite}`;
      console.log("Titre:", titre);

      // Ajoute la date actuelle sur la première page
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString("fr-FR");
      const dateText = `Date : ${formattedDate}`;
      pdf.text(dateText, 20, 20);

      // Récupère les données du tableau
      const critereElements = document.querySelectorAll(
        "#table-container tbody tr"
      );

      const tableData = [];
      critereElements.forEach((critereElement) => {
        const theme =
          critereElement.querySelector("td:first-child").textContent;
        const critere =
          critereElement.querySelector("td:nth-child(2)").textContent;
        const etat = critereElement.querySelector("select").value;

        tableData.push([theme, critere, etat]);
      });

      // Configure les colonnes du tableau
      const columns = ["Thème", "Critère", "État"];

      // Ajoute le tableau avec les données
      pdf.autoTable({
        startY: 40,
        head: [columns],
        body: tableData,
      });
      pdf.text(
        `Score de Conformité : ${scoreConformite}`,
        pdf.internal.pageSize.width - 60,
        10
      );

      pdf.save("exported_text.pdf");
    }

    // Ajouter le tableau au DOM
    table.appendChild(thead);
    table.appendChild(tbody);
    document.getElementById("table-container").appendChild(table);

    // Mettre à jour le tableau et les compteurs lorsque les filtres sont modifiés
    [themeFilter, stateFilter].forEach((filter) => {
      filter.addEventListener("change", () => {
        updateTable();
        updateCounters();
      });
    });

    // Mettre à jour les compteurs initiaux
    updateCounters();
  }
};

xhr.send();
