import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, MessageCircle, Stethoscope, Utensils, Send, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface AIConsultation {
  id: string;
  petId: string;
  question: string;
  response: string;
  category: 'health' | 'nutrition' | 'behavior' | 'general';
  createdAt: string;
  confidence: number;
}

export default function PetCareAssistant() {
  const [activeTab, setActiveTab] = useState('chat');
  const [question, setQuestion] = useState('');
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: pets } = useQuery({
    queryKey: ['/api/pets'],
    retry: false,
  });

  const { data: consultations, refetch: refetchConsultations } = useQuery({
    queryKey: ['/api/ai-consultations'],
    retry: false,
  });

  const aiConsultationMutation = useMutation({
    mutationFn: async (data: { petId: string; question: string; category: string }) => {
      const response = await apiRequest('POST', '/api/ai/consultation', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'AI Analizi Tamamlandı',
        description: 'Uzman önerileri hazırlandı.',
      });
      refetchConsultations();
      setQuestion('');
    },
    onError: (error: Error) => {
      toast({
        title: 'AI Hatası',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !selectedPetId) return;

    setIsLoading(true);
    
    // Determine category based on keywords
    const category = detectCategory(question);
    
    try {
      await aiConsultationMutation.mutateAsync({
        petId: selectedPetId,
        question: question.trim(),
        category,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const detectCategory = (text: string): string => {
    const healthKeywords = ['hastalık', 'semptom', 'ağrı', 'kusmak', 'ishal', 'ateş', 'öksürük'];
    const nutritionKeywords = ['mama', 'beslenme', 'diyet', 'kilo', 'vitamin', 'yemek'];
    const behaviorKeywords = ['davranış', 'eğitim', 'havlama', 'ısırma', 'kaçma', 'korku'];
    
    const lowerText = text.toLowerCase();
    
    if (healthKeywords.some(keyword => lowerText.includes(keyword))) return 'health';
    if (nutritionKeywords.some(keyword => lowerText.includes(keyword))) return 'nutrition';
    if (behaviorKeywords.some(keyword => lowerText.includes(keyword))) return 'behavior';
    
    return 'general';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'health': return <Stethoscope className="h-4 w-4" />;
      case 'nutrition': return <Utensils className="h-4 w-4" />;
      case 'behavior': return <Brain className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'health': return 'bg-red-100 text-red-800';
      case 'nutrition': return 'bg-green-100 text-green-800';
      case 'behavior': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const userPets = (pets as any) || [];
  const userConsultations = (consultations as any) || [];

  return (
    <Card className="border-2 border-dashed border-medical-blue/30 bg-gradient-to-br from-blue-50/50 to-teal-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
          <Sparkles className="h-5 w-5 text-medical-blue" />
          AI Pet Bakım Asistanı
          <Badge variant="outline" className="text-xs bg-medical-blue text-white">
            GPT-4o Destekli
          </Badge>
        </CardTitle>
        <p className="text-sm text-professional-gray">
          Evcil hayvanınızla ilgili sorularınız için 7/24 AI uzman desteği
        </p>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat">Soru Sor</TabsTrigger>
            <TabsTrigger value="history">Geçmiş</TabsTrigger>
            <TabsTrigger value="insights">İçgörüler</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-4">
            <form onSubmit={handleSubmitQuestion} className="space-y-4">
              {/* Pet Selection */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Hangi evcil hayvanınız hakkında soru soracaksınız?
                </label>
                <select
                  value={selectedPetId}
                  onChange={(e) => setSelectedPetId(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-medical-blue"
                  required
                >
                  <option value="">Evcil hayvanınızı seçin</option>
                  {userPets.map((pet: any) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name} ({pet.species} - {pet.breed})
                    </option>
                  ))}
                </select>
              </div>

              {/* Question Input */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Sorunuz
                </label>
                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Örnek: Köpeğim son birkaç gündür iştahsız ve durgun, ne yapmalıyım?"
                  className="min-h-[100px]"
                  maxLength={500}
                  required
                />
                <div className="text-xs text-professional-gray mt-1">
                  {question.length}/500 karakter
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !selectedPetId || !question.trim()}
                className="w-full bg-medical-blue hover:bg-medical-blue/90"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>AI Analiz Ediyor...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Send className="h-4 w-4" />
                    <span>AI Uzmanına Sor</span>
                  </div>
                )}
              </Button>
            </form>

            {/* Quick Questions */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-slate-700 mb-3">Hızlı Sorular</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Kedi/köpeğim nasıl beslenmelidir?',
                  'Evcil hayvanım hasta mı?',
                  'Davranış problemi nasıl çözülür?',
                  'Aşı takvimi nasıl olmalı?'
                ].map((quickQuestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs text-left h-auto p-2"
                    onClick={() => setQuestion(quickQuestion)}
                  >
                    {quickQuestion}
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {userConsultations.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-professional-gray">Henüz AI konsültasyonunuz bulunmuyor.</p>
                <p className="text-sm text-professional-gray mt-2">
                  İlk sorunuzu sormak için "Soru Sor" sekmesini kullanın.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {userConsultations.slice(0, 10).map((consultation: AIConsultation) => (
                  <Card key={consultation.id} className="border-l-4 border-l-medical-blue">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getCategoryColor(consultation.category)}>
                          {getCategoryIcon(consultation.category)}
                          <span className="ml-1 capitalize">{consultation.category}</span>
                        </Badge>
                        <div className="text-xs text-professional-gray">
                          {new Date(consultation.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <h5 className="text-sm font-medium text-slate-800">Soru:</h5>
                          <p className="text-sm text-professional-gray">{consultation.question}</p>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium text-slate-800">AI Yanıtı:</h5>
                          <p className="text-sm text-professional-gray">{consultation.response}</p>
                        </div>
                        
                        {consultation.confidence && (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-professional-gray">Güvenilirlik:</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-1">
                              <div 
                                className="bg-medical-blue h-1 rounded-full" 
                                style={{ width: `${consultation.confidence * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-medical-blue font-medium">
                              {Math.round(consultation.confidence * 100)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-green-50 to-teal-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Utensils className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium text-green-800">Beslenme İçgörüleri</h4>
                  </div>
                  <p className="text-sm text-green-700">
                    Evcil hayvanlarınızın beslenme alışkanlıkları analiz ediliyor...
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Stethoscope className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium text-blue-800">Sağlık Tavsiyesi</h4>
                  </div>
                  <p className="text-sm text-blue-700">
                    Sağlık geçmişinize dayalı kişisel öneriler hazırlanıyor...
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <p className="text-xs text-professional-gray">
                💡 AI içgörüleri, verileriniz analiz edildikçe daha kişisel hale gelir
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}