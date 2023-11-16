document.getElementById("exportButton").addEventListener("click", exportToPDF);

function exportToPDF() {
  const pdf = new window.jspdf.jsPDF();

  pdf.text("Liste des critères d'écoconception de services numériques", 20, 10);
  pdf.text("Numéro d'équipe: 22", 20, 20);

  const critereElements = document.querySelectorAll(
    "#table-container tbody tr"
  );
  let yOffset = 30;

  critereElements.forEach((critereElement) => {
    const theme = critereElement.querySelector("td:first-child").textContent;
    const critere = critereElement.querySelector("td:nth-child(2)").textContent;
    const etat = critereElement.querySelector("select").value;

    const maxWidth = pdf.internal.pageSize.width - 40;
    const splitText = pdf.splitTextToSize(
      `${theme} - ${critere}: ${etat}`,
      maxWidth
    );

    if (yOffset + splitText.length * 10 > pdf.internal.pageSize.height) {
      pdf.addPage();
      yOffset = 10;
    }

    splitText.forEach((line) => {
      pdf.text(line, 20, yOffset);
      yOffset += 10;
    });
  });
  pdf.save("exported_text.pdf");
}
function exportToPDF() {
  const nomDuSite =
    document.getElementById("siteInput").value || "Evaluation_Conformite";
  const nomDuFichier = `${nomDuSite}_evaluation_conformite.pdf`;

  // Crée un nouveau document PDF
  const pdf = new window.jspdf.jsPDF();

  // Configure le titre
  pdf.setFontSize(16);
  const titre = `Évaluation de Conformité - ${nomDuSite}`;

  // Ajoute la date actuelle
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("fr-FR");
  const dateText = `Date : ${formattedDate}`;

  // Configure la position de départ
  let yPosition = 20;

  // Configure les colonnes
  const columns = ["Critère", "État"];

  // Récupère les données du tableau
  const tableRows = [];
  const rows = document.querySelectorAll("#tableauBody tr");

  rows.forEach((row) => {
    const critere = row.querySelector(".id a").innerText;
    const etat = row.querySelector(".status-select").value;

    // Ajoute le titre et la date sur chaque page
    if (yPosition + 30 > pdf.internal.pageSize.height) {
      pdf.addPage();
      yPosition = 20;
      pdf.text(titre, 20, yPosition);
      yPosition += 15;
      pdf.text(dateText, 20, yPosition);
      yPosition += 15;
    }

    tableRows.push([critere, etat]);
    yPosition += 15; // Ajoute un espace avant chaque ligne du tableau

    // Ajoute une nouvelle page si nécessaire
    if (yPosition + 15 > pdf.internal.pageSize.height) {
      pdf.addPage();
      yPosition = 20;
      pdf.text(titre, 20, yPosition);
      yPosition += 15;
      pdf.text(dateText, 20, yPosition);
      yPosition += 15;
    }
  });

  // Ajoute le tableau avec les données
  pdf.autoTable({
    startY: yPosition,
    head: [columns],
    body: tableRows,
  });

  // Enregistre le PDF
  pdf.save(nomDuFichier);
}
