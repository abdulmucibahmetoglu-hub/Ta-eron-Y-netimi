
import { GoogleGenAI, Type } from "@google/genai";
import { Subcontractor, ProgressPayment } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeProgress = async (subcontractor: Subcontractor) => {
  // Use defaults for optional fields to ensure the prompt is valid
  const prompt = `
    Aşağıdaki taşeronun hakediş verilerini analiz et ve Türkçe olarak profesyonel bir inşaat mühendisi gibi yorumla.
    Taşeron: ${subcontractor.name} (${subcontractor.trade})
    Sözleşme Bedeli: ${subcontractor.totalContractValue || 0} TL
    İş Kalemleri: ${JSON.stringify(subcontractor.workItems || [])}
    Yapılan Hakedişler: ${JSON.stringify(subcontractor.progressPayments || [])}

    Lütfen şunları belirt:
    1. İşin genel ilerleme yüzdesi.
    2. Bütçe aşımı veya verimlilik uyarısı var mı?
    3. Gelecek hakediş için projeksiyon ve tavsiyeler.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return "Analiz sırasında bir hata oluştu.";
  }
};

export const analyzeProjectHealth = async (subcontractors: Subcontractor[]) => {
  // Use safe property access for optional subcontractor fields
  const summaryData = subcontractors.map(s => ({
    name: s.name,
    trade: s.trade,
    contractValue: s.totalContractValue || 0,
    paidTotal: (s.progressPayments || []).reduce((sum, p) => sum + p.summary.currentTotal, 0),
    lastPaymentDate: s.progressPayments?.[s.progressPayments.length - 1]?.date
  }));

  const prompt = `
    Tüm şantiyenin taşeron hakediş verilerini analiz et. 
    Veriler: ${JSON.stringify(summaryData)}
    
    Bir proje müdürü perspektifiyle Türkçe olarak:
    1. Projenin genel mali sağlığını değerlendir.
    2. En çok ödeme yapılan kalemleri ve riskli gördüğün taşeronları belirt.
    3. Nakit akışı yönetimi için stratejik tavsiyeler ver.
    Kısa, öz ve profesyonel bir dil kullan.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Project health analysis error:", error);
    return "Proje analizi yapılamadı.";
  }
};

export const parseWorkItemsFromText = async (text: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Metinden iş kalemlerini çıkar ve JSON formatında döndür. Metin: ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            unit: { type: Type.STRING, enum: ["m²", "m³", "mt", "Adet", "Ton", "Kg", "Lump-sum"] },
            unitPrice: { type: Type.NUMBER },
            contractQuantity: { type: Type.NUMBER },
          },
          required: ["description", "unit", "unitPrice", "contractQuantity"]
        }
      }
    }
  });
  // Trim the response text before parsing to ensure valid JSON
  return JSON.parse(response.text.trim());
};
