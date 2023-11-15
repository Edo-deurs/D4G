document.getElementById("exportButton").addEventListener("click", exportToPDF);

function exportToPDF() {
    const pdf = new jsPDF();

    // Sélectionnez tous les critères dans la liste
    const allCriteria = document.querySelectorAll('.listeCriteres li');

    // Définissez la position initiale pour le texte dans le PDF
    let yPos = 10;

    // Ajoutez chaque critère au PDF
    allCriteria.forEach(critere => {
        // Ajoutez le texte du critère au PDF
        pdf.text(20, yPos, critere.textContent);

        // Incrémentez la position Y pour le prochain critère
        yPos += 10;
    });

    // Enregistrez le PDF avec un nom de fichier spécifié
    pdf.save('exported_criteria.pdf');
}