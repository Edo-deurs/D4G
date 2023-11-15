document.getElementById("exportButton").addEventListener("click", exportToPDF);

function exportToPDF() {
  const pdf = new jsPDF();

  // Ajouter le titre du PDF
  pdf.text("Liste des critères d'écoconception de services numériques", 20, 10);

  // Ajouter le numéro d'équipe
  pdf.text("Numéro d'équipe: 22", 20, 20);

  // Ajouter les critères
  const critereElements = document.querySelectorAll(
    "#table-container tbody tr"
  );
  let yOffset = 30; // Décalage en Y pour commencer sous le titre et le numéro d'équipe

  critereElements.forEach((critereElement) => {
    const theme = critereElement.querySelector("td:first-child").textContent;
    const critere = critereElement.querySelector("td:nth-child(2)").textContent;
    const etat = critereElement.querySelector("select").value;

    const critereText = `${theme} - ${critere}: ${etat}`;
    pdf.text(critereText, 20, yOffset);
    yOffset += 10; // Augmenter le décalage pour le prochain critère
  });

  // Enregistrer le PDF
  pdf.save("exported_text.pdf");
}
