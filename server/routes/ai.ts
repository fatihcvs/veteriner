import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../auth';
import { getPetConsultation, generateNutritionPlan, analyzeSymptoms, generateProductRecommendations } from '../services/openai';
import { db } from '../db';
import { pets, aiConsultations } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

const router = Router();

// Helper function to calculate age from birth date
function calculateAge(birthDate: string | null): number {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

// Helper function to get medical history from pet records
async function getPetMedicalHistory(petId: string): Promise<string> {
  // This will be enhanced when we have medical records implemented
  return 'Geçmiş kayıt bulunmuyor';
}

// Consultation request schema
const consultationSchema = z.object({
  petId: z.string(),
  question: z.string().min(10).max(500),
  category: z.enum(['health', 'nutrition', 'behavior', 'general'])
});

// AI Pet Consultation
router.post('/consultation', requireAuth, async (req, res) => {
  try {
    const { petId, question, category } = consultationSchema.parse(req.body);

    // Verify pet ownership
    const [pet] = await db
      .select()
      .from(pets)
      .where(and(eq(pets.id, petId), eq(pets.ownerId, req.user!.id)));

    if (!pet) {
      return res.status(404).json({ message: 'Pet not found or access denied' });
    }

    // Calculate age from birth date
    const age = calculateAge(pet.birthDate);
    
    // Get medical history
    const medicalHistory = await getPetMedicalHistory(petId);

    // Get AI consultation
    const consultation = await getPetConsultation({
      petId,
      petInfo: {
        name: pet.name,
        species: pet.species,
        breed: pet.breed || 'Bilinmiyor',
        age: age,
        weight: pet.weightKg ? parseFloat(pet.weightKg) : undefined,
        medicalHistory: medicalHistory
      },
      question,
      category
    });

    // Save consultation to database
    const [savedConsultation] = await db
      .insert(aiConsultations)
      .values({
        userId: req.user!.id,
        petId,
        question,
        response: consultation.answer,
        category,
        confidence: consultation.confidence.toString(),
        urgencyLevel: consultation.urgencyLevel,
        veterinaryRecommendation: consultation.veterinaryRecommendation,
        recommendations: consultation.recommendations,
        followUpQuestions: consultation.followUpQuestions || []
      })
      .returning();

    res.json({
      consultation: savedConsultation,
      aiResponse: consultation
    });

  } catch (error) {
    console.error('AI consultation error:', error);
    res.status(500).json({ 
      message: 'AI consultation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get user's AI consultation history
router.get('/consultations', requireAuth, async (req, res) => {
  try {
    const consultations = await db
      .select()
      .from(aiConsultations)
      .where(eq(aiConsultations.userId, req.user!.id))
      .orderBy(aiConsultations.createdAt)
      .limit(50);

    res.json(consultations);
  } catch (error) {
    console.error('Get consultations error:', error);
    res.status(500).json({ message: 'Failed to fetch consultations' });
  }
});

// Nutrition Plan Generation
const nutritionSchema = z.object({
  petId: z.string(),
  goals: z.array(z.string()),
  currentWeight: z.number().optional(),
  targetWeight: z.number().optional(),
  activityLevel: z.enum(['low', 'medium', 'high']).optional()
});

router.post('/nutrition-plan', requireAuth, async (req, res) => {
  try {
    const { petId, goals, currentWeight, targetWeight, activityLevel } = nutritionSchema.parse(req.body);

    // Verify pet ownership
    const [pet] = await db
      .select()
      .from(pets)
      .where(and(eq(pets.id, petId), eq(pets.ownerId, req.user!.id)));

    if (!pet) {
      return res.status(404).json({ message: 'Pet not found or access denied' });
    }

    const petWeight = currentWeight || (pet.weightKg ? parseFloat(pet.weightKg) : 5);

    const nutritionPlan = await generateNutritionPlan({
      ...pet,
      age: calculateAge(pet.birthDate),
      currentWeight: petWeight,
      targetWeight,
      activityLevel: activityLevel || 'medium'
    }, goals);

    res.json({
      pet: {
        id: pet.id,
        name: pet.name,
        species: pet.species,
        breed: pet.breed
      },
      nutritionPlan,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Nutrition plan error:', error);
    res.status(500).json({ 
      message: 'Failed to generate nutrition plan',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Symptom Analysis
const symptomSchema = z.object({
  petId: z.string(),
  symptoms: z.array(z.string().min(2).max(100)),
  duration: z.string().optional(),
  severity: z.enum(['mild', 'moderate', 'severe']).optional()
});

router.post('/analyze-symptoms', requireAuth, async (req, res) => {
  try {
    const { petId, symptoms, duration, severity } = symptomSchema.parse(req.body);

    // Verify pet ownership
    const [pet] = await db
      .select()
      .from(pets)
      .where(and(eq(pets.id, petId), eq(pets.ownerId, req.user!.id)));

    if (!pet) {
      return res.status(404).json({ message: 'Pet not found or access denied' });
    }

    const analysis = await analyzeSymptoms(symptoms, {
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      age: calculateAge(pet.birthDate),
      weight: pet.weightKg ? parseFloat(pet.weightKg) : undefined,
      medicalHistory: await getPetMedicalHistory(petId)
    });

    // Add context info
    const analysisResult = {
      ...analysis,
      pet: {
        id: pet.id,
        name: pet.name,
        species: pet.species
      },
      symptoms,
      duration,
      severity: severity || 'moderate',
      analyzedAt: new Date().toISOString(),
      disclaimer: "Bu analiz yalnızca bilgilendirme amaçlıdır. Kesin teşhis için veteriner hekiminize başvurun."
    };

    res.json(analysisResult);

  } catch (error) {
    console.error('Symptom analysis error:', error);
    res.status(500).json({ 
      message: 'Failed to analyze symptoms',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Smart Product Recommendations
router.get('/product-recommendations', requireAuth, async (req, res) => {
  try {
    // Get user's pets
    const userPets = await db
      .select()
      .from(pets)
      .where(eq(pets.ownerId, req.user!.id));

    if (userPets.length === 0) {
      return res.json({ 
        recommendations: [],
        message: 'Öneri almak için önce bir evcil hayvan ekleyin' 
      });
    }

    // Get user's order history and preferences
    // TODO: Implement order history query when orders table is ready
    const userHistory = {
      orders: [],
      preferences: [],
      budget: 'medium'
    };

    const recommendations = await generateProductRecommendations(userPets, userHistory);

    res.json({
      pets: userPets.map(pet => ({
        id: pet.id,
        name: pet.name,
        species: pet.species,
        breed: pet.breed
      })),
      recommendations,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Product recommendations error:', error);
    res.status(500).json({ 
      message: 'Failed to generate product recommendations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;