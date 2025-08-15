import { Router } from 'express';
import { requireAuth } from '../auth';
import { storage } from '../storage';
import { insertMedicalRecordSchema } from '@shared/schema';

const router = Router();

router.use(requireAuth);

router.get('/', async (req: any, res) => {
  try {
    const userId = req.user.id;
    const clinics = await storage.getUserClinics(userId);
    const clinicId = clinics[0]?.id;
    if (!clinicId) {
      return res.json([]);
    }
    const records = await storage.getClinicMedicalRecords(clinicId);
    res.json(records);
  } catch (error) {
    console.error('Error fetching medical records:', error);
    res.status(500).json({ message: 'Failed to fetch medical records' });
  }
});

router.post('/', async (req: any, res) => {
  try {
    const data = insertMedicalRecordSchema.parse({
      ...req.body,
      vetUserId: req.user.id,
    });
    const record = await storage.createMedicalRecord(data);
    res.json(record);
  } catch (error: any) {
    console.error('Error creating medical record:', error);
    res.status(400).json({ message: error.message || 'Failed to create medical record' });
  }
});

export default router;
