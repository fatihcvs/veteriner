import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PET_SPECIES } from '@/lib/constants';
import LoadingSpinner from '@/components/common/loading-spinner';

const petFormSchema = z.object({
  name: z.string().min(1, 'Hayvan adı gereklidir'),
  species: z.string().min(1, 'Tür seçimi gereklidir'),
  breed: z.string().optional(),
  sex: z.enum(['MALE', 'FEMALE', '']).optional(),
  birthDate: z.string().optional(),
  weightKg: z.string().optional(),
  microchipNo: z.string().optional(),
});

type PetFormData = z.infer<typeof petFormSchema>;

interface PetFormProps {
  onSubmit: (data: PetFormData) => void;
  isLoading: boolean;
  initialData?: Partial<PetFormData>;
}

export default function PetForm({ onSubmit, isLoading, initialData }: PetFormProps) {
  const form = useForm<PetFormData>({
    resolver: zodResolver(petFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      species: initialData?.species || '',
      breed: initialData?.breed || '',
      sex: initialData?.sex || '',
      birthDate: initialData?.birthDate || '',
      weightKg: initialData?.weightKg || '',
      microchipNo: initialData?.microchipNo || '',
    },
  });

  const handleSubmit = (data: PetFormData) => {
    // Convert form data to match API expectations
    const submitData = {
      ...data,
      weightKg: data.weightKg ? parseFloat(data.weightKg) : undefined,
      birthDate: data.birthDate || undefined,
      sex: data.sex || undefined,
    };
    onSubmit(submitData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hayvan Adı *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Hayvan adını girin" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="species"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tür *</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-medical-blue focus:border-medical-blue"
                  >
                    <option value="">Tür seçin</option>
                    {Object.entries(PET_SPECIES).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="breed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cins</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Cins bilgisi (opsiyonel)" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sex"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cinsiyet</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-medical-blue focus:border-medical-blue"
                  >
                    <option value="">Cinsiyet seçin</option>
                    <option value="MALE">Erkek</option>
                    <option value="FEMALE">Dişi</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Doğum Tarihi</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="date"
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weightKg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ağırlık (kg)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="microchipNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mikroçip Numarası</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Mikroçip numarası (opsiyonel)" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-3">
          <Button 
            type="submit" 
            className="bg-medical-blue hover:bg-medical-blue/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Kaydediliyor...
              </>
            ) : (
              'Hayvan Kaydını Oluştur'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
