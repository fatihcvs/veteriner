import { test } from 'node:test';
import assert from 'node:assert/strict';
import { insertMedicalRecordSchema } from '@shared/schema';
import crypto from 'node:crypto';

test('insertMedicalRecordSchema parses valid record', () => {
  const record = {
    petId: crypto.randomUUID(),
    type: 'EXAMINATION',
    title: 'Genel Kontrol',
    description: 'Rutin muayene',
    visitDate: new Date(),
    vetUserId: crypto.randomUUID(),
  };
  const parsed = insertMedicalRecordSchema.parse(record);
  assert.equal(parsed.title, 'Genel Kontrol');
});

test('insertMedicalRecordSchema rejects missing fields', () => {
  assert.throws(() => insertMedicalRecordSchema.parse({}), /Required/);
});

test('insertMedicalRecordSchema requires vetUserId', () => {
  const record = {
    petId: crypto.randomUUID(),
    type: 'EXAMINATION',
    title: 'Kontrol',
    description: 'Rutin',
    visitDate: new Date(),
  } as any;
  assert.throws(() => insertMedicalRecordSchema.parse(record), /vetUserId/);
});

test('updateMedicalRecordSchema allows partial data', () => {
  const update = { title: 'Yeni Başlık' };
  const parsed = insertMedicalRecordSchema.partial().parse(update);
  assert.equal(parsed.title, 'Yeni Başlık');
});
