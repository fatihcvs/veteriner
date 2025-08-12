import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import LoadingSpinner from '@/components/common/loading-spinner';
import { Pet, Vaccine } from '@shared/schema';

const vaccinationFormSchema = z.object({
  petId: z.string().min(1, 'Hayvan seçimi gereklidir'),
  vaccineId: z.string().min(1, 'Aşı seçimi gereklidir'),
  administeredAt: z.string().min(1, 'Uygulama tarihi gereklidir'),
  lotNo: z.string().optional(),
  certificateNo: z.string().optional(),
  notes: z.string().optional(),
});

type VaccinationFormData = z.infer<typeof vaccinationFormSchema>;

interface VaccinationFormProps {
  pets: Pet[];
  vaccines: Vaccine[];
  onSubmit: (data: VaccinationFormData) => void;
  isLoading: boolean;
  initialData?: Partial<VaccinationFormData>;
}

export default function VaccinationForm({ 
  pets, 
  vaccines, 
  onSubmit, 
  isLoading, 
  initialData 
}: VaccinationFormProps) {
  const form = useForm<VaccinationFormData>({
    resolver: zodResolver(vaccinationFormSchema),
    defaultValues: {
      petId: initialData?.petId || '',
      vaccineId: initialData?.vaccineId || '',
      administeredAt: initialData?.administeredAt || new Date().toISOString().split('T')[0],
      lotNo: initialData?.lotNo || '',
      certificateNo: initialData?.certificateNo || '',
      notes: initialData?.notes || '',
    },
  });

  const handleSubmit = (data: VaccinationFormData) => {
    // Convert date string to ISO format for backend
    const submitData = {
      ...data,
      administeredAt: new Date(data.administeredAt).toISOString(),
    };
    onSubmit(submitData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="petId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hayvan *</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-medical-blue focus:border-medical-blue"
                  >
                    <option value="">Hayvan seçin</option>
                    {pets.map((pet) => (
                      <option key={pet.id} value={pet.id}>
                        {pet.name} ({pet.species})
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vaccineId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aşı *</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-medical-blue focus:border-medical-blue"
                  >
                    <option value="">Aşı seçin</option>
                    {vaccines.map((vaccine) => (
                      <option key={vaccine.id} value={vaccine.id}>
                        {vaccine.name} ({vaccine.species})
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="administeredAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Uygulama Tarihi *</FormLabel>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="lotNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lot Numarası</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Aşı lot numarası" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="certificateNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sertifika Numarası</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Sertifika numarası" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notlar</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Ek notlar (opsiyonel)"
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <i className="fas fa-info-circle text-blue-600 mt-1"></i>
            <div className="text-sm">
              <p className="font-semibold text-blue-800 mb-1">Bilgi</p>
              <p className="text-blue-700">
                Aşı kaydedildikten sonra otomatik olarak bir sonraki aşı tarihi hesaplanacak ve 
                hatırlatma sistemi devreye girecektir.
              </p>
            </div>
          </div>
        </div>

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
              <>
                <i className="fas fa-syringe mr-2"></i>
                Aşı Kaydını Oluştur
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
