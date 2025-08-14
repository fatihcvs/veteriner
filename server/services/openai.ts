import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface PetConsultationRequest {
  petId: string;
  petInfo: {
    name: string;
    species: string;
    breed: string;
    age: number;
    weight?: number;
    medicalHistory?: string;
  };
  question: string;
  category: 'health' | 'nutrition' | 'behavior' | 'general';
}

export interface PetConsultationResponse {
  answer: string;
  confidence: number;
  recommendations: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  veterinaryRecommendation: boolean;
  followUpQuestions?: string[];
}

export async function getPetConsultation(request: PetConsultationRequest): Promise<PetConsultationResponse> {
  try {
    const systemPrompt = `Sen uzman bir veteriner hekim ve pet bakım uzmanısın. Türkiye'de çalışıyorsun ve pet sahiplerine güvenilir, bilimsel temelli tavsiyelerde bulunuyorsun.

GÖREV: Evcil hayvan sahiplerinin sorularını yanıtla ve uygun önerilerde bulun.

PET BİLGİLERİ:
- İsim: ${request.petInfo.name}
- Tür: ${request.petInfo.species}
- Ras: ${request.petInfo.breed}
- Yaş: ${request.petInfo.age} yaş
- Kilo: ${request.petInfo.weight ? request.petInfo.weight + 'kg' : 'Belirtilmemiş'}
- Geçmiş: ${request.petInfo.medicalHistory || 'Belirtilmemiş'}

KURALLAR:
1. ASLA tıbbi teşhis koyma, sadece genel önerilerde bulun
2. Acil durumlarda mutlaka veteriner hekime başvurmayı öner
3. Güvenilir, bilimsel kaynaklara dayalı bilgi ver
4. Türkçe yanıt ver, sıcak ve anlayışlı ol
5. Güvenlik derecesi ve veteriner önerisi belirt

YANITINI JSON FORMAT'ında ver:
{
  "answer": "Ana yanıt (200-300 kelime)",
  "confidence": 0.85, // 0-1 arası güven skoru
  "recommendations": ["Öneri 1", "Öneri 2", "Öneri 3"],
  "urgencyLevel": "low|medium|high|emergency",
  "veterinaryRecommendation": true/false,
  "followUpQuestions": ["Takip sorusu 1", "Takip sorusu 2"]
}`;

    const userPrompt = `Kategori: ${request.category}
Soru: ${request.question}

Bu soruyu yukarıdaki pet bilgileri ışığında yanıtla.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate and sanitize response
    return {
      answer: result.answer || "Üzgünüm, bu soruyu şu anda yanıtlayamıyorum. Lütfen daha spesifik bilgi verin veya veteriner hekiminize başvurun.",
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
      recommendations: Array.isArray(result.recommendations) ? result.recommendations.slice(0, 5) : [],
      urgencyLevel: ['low', 'medium', 'high', 'emergency'].includes(result.urgencyLevel) ? result.urgencyLevel : 'medium',
      veterinaryRecommendation: Boolean(result.veterinaryRecommendation),
      followUpQuestions: Array.isArray(result.followUpQuestions) ? result.followUpQuestions.slice(0, 3) : []
    };

  } catch (error) {
    console.error('OpenAI consultation error:', error);
    
    // Fallback response
    return {
      answer: "Üzgünüm, teknik bir sorun oluştu. Lütfen daha sonra tekrar deneyin veya acil durumlar için veteriner hekiminize başvurun.",
      confidence: 0.1,
      recommendations: ["Veteriner hekime başvurun", "Sorunuzu daha sonra tekrar sorun"],
      urgencyLevel: 'medium',
      veterinaryRecommendation: true,
      followUpQuestions: []
    };
  }
}

export async function generateNutritionPlan(petInfo: any, goals: string[]): Promise<any> {
  try {
    const prompt = `Sen bir veteriner beslenme uzmanısın. ${petInfo.species} türünde, ${petInfo.breed} cinsinde, ${petInfo.age} yaşında bir ${petInfo.name} için beslenme planı hazırla.

Hedefler: ${goals.join(', ')}

JSON format'ta yanıt ver:
{
  "dailyCalories": 850,
  "meals": [
    {
      "time": "08:00",
      "description": "Kahvaltı porsiyon açıklaması",
      "calories": 300
    }
  ],
  "supplements": ["Vitamin", "Mineral"],
  "warnings": ["Uyarı 1", "Uyarı 2"],
  "duration": "4 hafta"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.6,
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error('Nutrition plan generation error:', error);
    throw new Error('Beslenme planı oluşturulamadı');
  }
}

export async function analyzeSymptoms(symptoms: string[], petInfo: any): Promise<any> {
  try {
    const prompt = `Sen bir veteriner hekimsin. Aşağıdaki semptomları analiz et ve risk değerlendirmesi yap:

Pet: ${petInfo.name} - ${petInfo.species} - ${petInfo.breed} - ${petInfo.age} yaş
Semptomlar: ${symptoms.join(', ')}

ÖNEMLI: Teşhis koyma, sadece genel değerlendirme yap.

JSON yanıt:
{
  "riskLevel": "low|medium|high|critical",
  "possibleCauses": ["Sebep 1", "Sebep 2"],
  "immediateActions": ["Yapılacak 1", "Yapılacak 2"],
  "veterinaryUrgency": true/false,
  "monitoringAdvice": "İzleme tavsiyeleri"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error('Symptom analysis error:', error);
    throw new Error('Semptom analizi yapılamadı');
  }
}

export async function generateProductRecommendations(petProfiles: any[], userHistory: any): Promise<any> {
  try {
    const prompt = `Sen bir pet ürünleri uzmanısın. Aşağıdaki pet profilleri ve kullanıcı geçmişi için ürün önerileri hazırla:

Pet Profilleri: ${JSON.stringify(petProfiles)}
Kullanıcı Geçmişi: ${JSON.stringify(userHistory)}

Kişiselleştirilmiş ürün kategorileri ve öneriler sun. JSON format:
{
  "recommendations": [
    {
      "category": "Mama",
      "reason": "Neden önerildiği",
      "priority": "high|medium|low",
      "products": ["Ürün türü 1", "Ürün türü 2"]
    }
  ],
  "budget": {
    "monthly": 500,
    "priority_items": ["Öncelikli ürün 1"]
  }
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error('Product recommendation error:', error);
    throw new Error('Ürün önerileri oluşturulamadı');
  }
}