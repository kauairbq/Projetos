import { Injectable } from "@nestjs/common";

@Injectable()
export class ReportsService {
  getAdvancedReport() {
    return {
      title: "Relatório Avançado",
      generatedAt: new Date().toISOString(),
      insights: [
        "Crescimento de receitas nas últimas 4 semanas",
        "Retenção superior a 85%",
        "Upgrades concentrados no plano Pro",
      ],
    };
  }

  getExport() {
    return {
      message: "Exportação simulada concluída",
      url: "https://example.com/exports/report.csv",
    };
  }
}
