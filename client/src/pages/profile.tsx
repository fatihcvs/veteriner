import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, MapPin, Phone, Mail, Heart, Plus, Edit, Trash2, Calendar } from "lucide-react";
import { Pet } from "@shared/schema";
import { PET_SPECIES } from "@/lib/constants";

const userProfileSchema = z.object({
  firstName: z.string().min(1, 'Ad zorunludur'),
  lastName: z.string().min(1, 'Soyad zorunludur'),
  phone: z.string().optional(),
  whatsappPhone: z.string().optional(),
  whatsappOptIn: z.boolean().default(false),
});

const profileDetailsSchema = z.object({
  address: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  postalCode: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  dateOfBirth: z.string().optional(),
  occupation: z.string().optional(),
  notes: z.string().optional(),
});

const petSchema = z.object({
  name: z.string().min(1, 'Hayvan adı zorunludur'),
  species: z.string().min(1, 'Tür seçimi zorunludur'),
  breed: z.string().optional(),
  sex: z.string().optional(),
  birthDate: z.string().optional(),
  weightKg: z.string().optional(),
  microchipNo: z.string().optional(),
});

type UserProfile = z.infer<typeof userProfileSchema>;
type ProfileDetails = z.infer<typeof profileDetailsSchema>;
type PetForm = z.infer<typeof petSchema>;

export default function ProfilePage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'user' | 'details' | 'pets'>('user');
  const [isPetFormOpen, setIsPetFormOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);

  // Fetch profile data
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["/api/profile"],
    queryFn: async () => {
      const response = await fetch("/api/profile");
      if (!response.ok) {
        throw new Error('Profil bilgileri alınamadı');
      }
      return response.json();
    },
  });

  // Fetch user's pets (only for PET_OWNER role)
  const { data: pets, isLoading: isPetsLoading } = useQuery({
    queryKey: ["/api/pets"],
    enabled: profileData?.user?.role === 'PET_OWNER',
  });

  // User profile form
  const userForm = useForm<UserProfile>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      whatsappPhone: '',
      whatsappOptIn: false,
    },
  });

  // Profile details form
  const detailsForm = useForm<ProfileDetails>({
    resolver: zodResolver(profileDetailsSchema),
    defaultValues: {
      address: '',
      city: '',
      district: '',
      postalCode: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelation: '',
      dateOfBirth: '',
      occupation: '',
      notes: '',
    },
  });

  // Pet form
  const petForm = useForm<PetForm>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      name: '',
      species: '',
      breed: '',
      sex: '',
      birthDate: '',
      weightKg: '',
      microchipNo: '',
    },
  });

  // Update forms when data loads
  React.useEffect(() => {
    if (profileData?.user) {
      userForm.reset(profileData.user);
    }
    if (profileData?.profile) {
      detailsForm.reset({
        address: profileData.profile.address || '',
        city: profileData.profile.city || '',
        district: profileData.profile.district || '',
        postalCode: profileData.profile.postalCode || '',
        emergencyContactName: profileData.profile.emergencyContactName || '',
        emergencyContactPhone: profileData.profile.emergencyContactPhone || '',
        emergencyContactRelation: profileData.profile.emergencyContactRelation || '',
        dateOfBirth: profileData.profile.dateOfBirth || '',
        occupation: profileData.profile.occupation || '',
        notes: profileData.profile.notes || '',
      });
    }
  }, [profileData, userForm, detailsForm]);

  // Update user profile mutation
  const userUpdateMutation = useMutation({
    mutationFn: async (data: UserProfile) => {
      const response = await apiRequest("PUT", "/api/profile/user", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Başarılı",
        description: "Kullanıcı bilgileriniz güncellendi",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update profile details mutation
  const detailsUpdateMutation = useMutation({
    mutationFn: async (data: ProfileDetails) => {
      const response = await apiRequest("PUT", "/api/profile/details", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Başarılı",
        description: "Profil detaylarınız güncellendi",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create pet mutation
  const createPetMutation = useMutation({
    mutationFn: async (data: PetForm) => {
      const petData = {
        ...data,
        weightKg: data.weightKg ? parseFloat(data.weightKg) : undefined,
      };
      const response = await apiRequest("POST", "/api/pets", petData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
      setIsPetFormOpen(false);
      setEditingPet(null);
      petForm.reset();
      toast({
        title: "Başarılı",
        description: "Hayvan kaydı oluşturuldu",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update pet mutation
  const updatePetMutation = useMutation({
    mutationFn: async (data: PetForm & { id: string }) => {
      const petData = {
        ...data,
        weightKg: data.weightKg ? parseFloat(data.weightKg) : undefined,
      };
      const response = await apiRequest("PUT", `/api/pets/${data.id}`, petData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
      setIsPetFormOpen(false);
      setEditingPet(null);
      petForm.reset();
      toast({
        title: "Başarılı",
        description: "Hayvan bilgileri güncellendi",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete pet mutation
  const deletePetMutation = useMutation({
    mutationFn: async (petId: string) => {
      await apiRequest("DELETE", `/api/pets/${petId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
      toast({
        title: "Başarılı",
        description: "Hayvan kaydı silindi",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onUserSubmit = (data: UserProfile) => {
    userUpdateMutation.mutate(data);
  };

  const onDetailsSubmit = (data: ProfileDetails) => {
    detailsUpdateMutation.mutate(data);
  };

  const onPetSubmit = (data: PetForm) => {
    if (editingPet) {
      updatePetMutation.mutate({ ...data, id: editingPet.id });
    } else {
      createPetMutation.mutate(data);
    }
  };

  const handleEditPet = (pet: Pet) => {
    setEditingPet(pet);
    petForm.reset({
      name: pet.name,
      species: pet.species,
      breed: pet.breed || '',
      sex: pet.sex || '',
      birthDate: pet.birthDate || '',
      weightKg: pet.weightKg ? pet.weightKg.toString() : '',
      microchipNo: pet.microchipNo || '',
    });
    setIsPetFormOpen(true);
  };

  const handleDeletePet = (petId: string) => {
    if (confirm('Bu hayvan kaydını silmek istediğinizden emin misiniz?')) {
      deletePetMutation.mutate(petId);
    }
  };

  const handleAddNewPet = () => {
    setEditingPet(null);
    petForm.reset();
    setIsPetFormOpen(true);
  };

  const getSpeciesLabel = (species: string) => {
    const speciesMap: { [key: string]: string } = {
      'DOG': 'Köpek',
      'CAT': 'Kedi', 
      'BIRD': 'Kuş',
      'RABBIT': 'Tavşan',
      'HAMSTER': 'Hamster',
      'FISH': 'Balık'
    };
    return speciesMap[species] || species;
  };

  const getSexLabel = (sex: string) => {
    return sex === 'MALE' ? 'Erkek' : sex === 'FEMALE' ? 'Dişi' : sex;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-medical-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Profil Ayarları</h1>
          <p className="text-professional-gray">Hesap bilgilerinizi ve kişisel detaylarınızı yönetin</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 mb-6 shadow-sm">
          <button
            onClick={() => setActiveTab('user')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-colors ${
              activeTab === 'user'
                ? 'bg-medical-blue text-white'
                : 'text-professional-gray hover:bg-gray-100'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Kullanıcı Bilgileri</span>
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-colors ${
              activeTab === 'details'
                ? 'bg-medical-blue text-white'
                : 'text-professional-gray hover:bg-gray-100'
            }`}
          >
            <MapPin className="h-4 w-4" />
            <span>Profil Detayları</span>
          </button>
          {profileData?.user?.role === 'PET_OWNER' && (
            <button
              onClick={() => setActiveTab('pets')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-colors ${
                activeTab === 'pets'
                  ? 'bg-medical-blue text-white'
                  : 'text-professional-gray hover:bg-gray-100'
              }`}
            >
              <Heart className="h-4 w-4" />
              <span>Hayvanlarım</span>
            </button>
          )}
        </div>

        {/* User Profile Tab */}
        {activeTab === 'user' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-medical-blue" />
                <span>Kullanıcı Bilgileri</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...userForm}>
                <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={userForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ad</FormLabel>
                          <FormControl>
                            <Input placeholder="Adınız" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={userForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Soyad</FormLabel>
                          <FormControl>
                            <Input placeholder="Soyadınız" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-professional-gray" />
                      <span className="text-sm text-professional-gray">
                        E-posta: {profileData?.user?.email}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={userForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefon</FormLabel>
                          <FormControl>
                            <Input placeholder="Telefon numaranız" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={userForm.control}
                      name="whatsappPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>WhatsApp Telefon</FormLabel>
                          <FormControl>
                            <Input placeholder="WhatsApp numaranız" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={userForm.control}
                    name="whatsappOptIn"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">WhatsApp Bildirimleri</FormLabel>
                          <p className="text-sm text-professional-gray">
                            Aşı hatırlatmaları ve diğer önemli bildirimler için WhatsApp mesajı almak istiyorum
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-medical-blue hover:bg-medical-blue/90"
                    disabled={userUpdateMutation.isPending}
                  >
                    {userUpdateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Kullanıcı Bilgilerini Güncelle
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Profile Details Tab */}
        {activeTab === 'details' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-medical-blue" />
                <span>Profil Detayları</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...detailsForm}>
                <form onSubmit={detailsForm.handleSubmit(onDetailsSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">Adres Bilgileri</h3>
                    <FormField
                      control={detailsForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adres</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Tam adresiniz" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={detailsForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Şehir</FormLabel>
                            <FormControl>
                              <Input placeholder="Şehir" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={detailsForm.control}
                        name="district"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>İlçe</FormLabel>
                            <FormControl>
                              <Input placeholder="İlçe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={detailsForm.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Posta Kodu</FormLabel>
                            <FormControl>
                              <Input placeholder="Posta kodu" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">Acil Durum İletişim</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={detailsForm.control}
                        name="emergencyContactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>İletişim Kişisi Adı</FormLabel>
                            <FormControl>
                              <Input placeholder="Acil durum iletişim kişisi" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={detailsForm.control}
                        name="emergencyContactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>İletişim Telefonu</FormLabel>
                            <FormControl>
                              <Input placeholder="Acil durum telefonu" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={detailsForm.control}
                      name="emergencyContactRelation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Yakınlık Derecesi</FormLabel>
                          <FormControl>
                            <Input placeholder="Eş, çocuk, kardeş, vb." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">Kişisel Bilgiler</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={detailsForm.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Doğum Tarihi</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={detailsForm.control}
                        name="occupation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meslek</FormLabel>
                            <FormControl>
                              <Input placeholder="Mesleğiniz" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={detailsForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notlar</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Eklemek istediğiniz özel notlar" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-medical-blue hover:bg-medical-blue/90"
                    disabled={detailsUpdateMutation.isPending}
                  >
                    {detailsUpdateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Profil Detaylarını Güncelle
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Pets Tab - Only for PET_OWNER role */}
        {activeTab === 'pets' && profileData?.user?.role === 'PET_OWNER' && (
          <div className="space-y-6">
            {/* Header with Add Button */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-medical-blue" />
                    <span>Hayvanlarım</span>
                  </CardTitle>
                  <Button 
                    onClick={handleAddNewPet}
                    className="bg-medical-green hover:bg-medical-green/90"
                    data-testid="button-add-pet"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Hayvan Ekle
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isPetsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-medical-blue" />
                  </div>
                ) : !pets || pets.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz hayvan kaydınız yok</h3>
                    <p className="text-gray-600 mb-4">İlk hayvanınızı ekleyerek başlayın</p>
                    <Button 
                      onClick={handleAddNewPet}
                      className="bg-medical-blue hover:bg-medical-blue/90"
                      data-testid="button-add-first-pet"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      İlk Hayvanımı Ekle
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pets.map((pet: Pet) => (
                      <Card key={pet.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={pet.avatarUrl} alt={pet.name} />
                                <AvatarFallback className="bg-medical-blue/10 text-medical-blue font-semibold">
                                  {pet.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold text-gray-900" data-testid={`text-pet-name-${pet.id}`}>{pet.name}</h3>
                                <Badge variant="secondary" className="text-xs">
                                  {getSpeciesLabel(pet.species)}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditPet(pet)}
                                className="h-8 w-8 p-0"
                                data-testid={`button-edit-pet-${pet.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeletePet(pet.id)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                data-testid={`button-delete-pet-${pet.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-600">
                            {pet.breed && (
                              <div className="flex items-center justify-between">
                                <span>Irk:</span>
                                <span className="font-medium">{pet.breed}</span>
                              </div>
                            )}
                            {pet.sex && (
                              <div className="flex items-center justify-between">
                                <span>Cinsiyet:</span>
                                <span className="font-medium">{getSexLabel(pet.sex)}</span>
                              </div>
                            )}
                            {pet.birthDate && (
                              <div className="flex items-center justify-between">
                                <span>Doğum:</span>
                                <span className="font-medium">
                                  {new Date(pet.birthDate).toLocaleDateString('tr-TR')}
                                </span>
                              </div>
                            )}
                            {pet.weightKg && (
                              <div className="flex items-center justify-between">
                                <span>Ağırlık:</span>
                                <span className="font-medium">{pet.weightKg} kg</span>
                              </div>
                            )}
                            {pet.microchipNo && (
                              <div className="flex items-center justify-between">
                                <span>Çip No:</span>
                                <span className="font-medium text-xs">{pet.microchipNo}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pet Form Dialog */}
            <Dialog open={isPetFormOpen} onOpenChange={setIsPetFormOpen}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingPet ? 'Hayvan Bilgilerini Düzenle' : 'Yeni Hayvan Ekle'}
                  </DialogTitle>
                </DialogHeader>
                <Form {...petForm}>
                  <form onSubmit={petForm.handleSubmit(onPetSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={petForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hayvan Adı *</FormLabel>
                            <FormControl>
                              <Input placeholder="Örn: Karabaş" {...field} data-testid="input-pet-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={petForm.control}
                        name="species"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tür *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-pet-species">
                                  <SelectValue placeholder="Tür seçin" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {PET_SPECIES.map((species) => (
                                  <SelectItem key={species.value} value={species.value}>
                                    {species.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={petForm.control}
                        name="breed"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Irk</FormLabel>
                            <FormControl>
                              <Input placeholder="Örn: Golden Retriever" {...field} data-testid="input-pet-breed" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={petForm.control}
                        name="sex"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cinsiyet</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-pet-sex">
                                  <SelectValue placeholder="Cinsiyet seçin" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="MALE">Erkek</SelectItem>
                                <SelectItem value="FEMALE">Dişi</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={petForm.control}
                        name="birthDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Doğum Tarihi</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} data-testid="input-pet-birth-date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={petForm.control}
                        name="weightKg"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ağırlık (kg)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.1" placeholder="Örn: 15.5" {...field} data-testid="input-pet-weight" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={petForm.control}
                      name="microchipNo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mikroçip Numarası</FormLabel>
                          <FormControl>
                            <Input placeholder="Örn: 123456789012345" {...field} data-testid="input-pet-microchip" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsPetFormOpen(false)}
                        data-testid="button-cancel-pet-form"
                      >
                        İptal
                      </Button>
                      <Button
                        type="submit"
                        className="bg-medical-blue hover:bg-medical-blue/90"
                        disabled={createPetMutation.isPending || updatePetMutation.isPending}
                        data-testid="button-save-pet"
                      >
                        {(createPetMutation.isPending || updatePetMutation.isPending) && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {editingPet ? 'Güncelle' : 'Kaydet'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
}