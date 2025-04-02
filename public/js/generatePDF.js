async function generatePDF(studyId, includeIAnalysis = false, iaResponse = null) {
    try {
        const study = allStudies.find(s => s._id === studyId);
        if (!study) {
            alert("Estudo não encontrado!");
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Configurações gerais
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 40);

        // --- Página 1: Dados do Estudo ---
        doc.setFontSize(16);
        doc.text(`Relatório do Estudo: ${study.product}`, 105, 15, { align: 'center' });
        
        // Tabela de informações básicas
        doc.autoTable({
            startY: 25,
            head: [['Campo', 'Valor']],
            body: [
                ['Lote', study.lot],
                ['Natureza', study.nature],
                ['Data de Início', new Date(study.startDate).toLocaleDateString()],
                ['Responsável', study.responsible]
            ],
            theme: 'grid'
        });

        // Tabela de condições
        const conditionsData = [];
        for (const [condition, days] of Object.entries(study.conditions)) {
            for (const [day, values] of Object.entries(days)) {
                conditionsData.push([
                    condition.toUpperCase(),
                    day,
                    values.aspect,
                    values.color,
                    values.odor,
                    values.pH,
                    values.viscosity
                ]);
            }
        }

        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 10,
            head: [['Condição', 'Dia', 'Aspecto', 'Cor', 'Odor', 'pH', 'Viscosidade']],
            body: conditionsData,
            theme: 'grid'
        });

        // --- Página 2: Análise da IA (se solicitado) ---
        if (includeIAnalysis && iaResponse) {
            doc.addPage();
            doc.setFontSize(16);
            doc.text('Análise Gerada por Inteligência Artificial:', 105, 20, { align: 'center' });
            
            //Formata o texto da IA para caber no PDF
            const formattedIAText = iaResponse
    .replace(/<li>/gi, '• ')  // Converte itens de lista
    .replace(/<[^>]*>/g, '')  // Remove outras tags
    .trim();
            
            doc.setFontSize(12);
            doc.text(formattedIAText, 15, 30, {
                maxWidth: 180,
                align: 'left'
            });
            
            // Adiciona selo de "Análise IA"
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 255);
            doc.text(' Essa analise foi gerada por inteligência artificil, em caso de dúvidas consulte um especialista.', 50, 285);
        }

        // Rodapé
        const footerY = doc.internal.pageSize.height - 5;
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Relatório gerado em ${new Date().toLocaleString()}`, 105, footerY, { align: 'center' });

        // Nome do arquivo
        const fileName = includeIAnalysis 
            ? `Relatório_${study.product}_com_IA.pdf` 
            : `Relatório_${study.product}.pdf`;
        
        doc.save(fileName);

    } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        alert("Erro na geração do PDF. Verifique o console.");
    }
}