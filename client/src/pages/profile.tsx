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
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, MapPin, Phone, Mail } from "lucide-react";

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

type UserProfile = z.infer<typeof userProfileSchema>;
type ProfileDetails = z.infer<typeof profileDetailsSchema>;

export default function ProfilePage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'user' | 'details'>('user');

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

  const onUserSubmit = (data: UserProfile) => {
    userUpdateMutation.mutate(data);
  };

  const onDetailsSubmit = (data: ProfileDetails) => {
    detailsUpdateMutation.mutate(data);
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
      </div>
    </div>
  );
}