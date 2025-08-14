import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { APP_NAME, APP_DESCRIPTION, APP_TAGLINE, APP_FEATURES } from '@/lib/constants';
import { Link } from 'wouter';
import { Heart, Shield, Smartphone, QrCode, Bell, ShoppingCart } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">
              🇹🇷 Türkiye'de İlk ve Tek
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              <span className="text-blue-600">{APP_NAME}</span>
            </h1>
            <p className="text-2xl text-blue-600 font-semibold mb-4">{APP_DESCRIPTION}</p>
            <p className="text-xl text-gray-600 mb-8">{APP_TAGLINE}</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                  <Heart className="h-5 w-5 mr-2" />
                  Ücretsiz Başlayın
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg border-blue-200 text-blue-600 hover:bg-blue-50">
                <QrCode className="h-5 w-5 mr-2" />
                QR Kodunu Dene
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border">
              <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <QrCode className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">QR Kodlu Dijital Pasaport</h3>
              <p className="text-sm text-gray-600">Aşı kartları, sağlık kayıtları ve tüm bilgiler tek QR kodda</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border">
              <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Smartphone className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Akıllı WhatsApp Bildirimleri</h3>
              <p className="text-sm text-gray-600">Aşı zamanı, kontrolü ve beslenme hatırlatmaları otomatik gelir</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border">
              <div className="bg-purple-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Pet'e Özel Ürünler</h3>
              <p className="text-sm text-gray-600">Yaş, kilo ve cinse göre özel beslenme önerileri</p>
            </div>
          </div>

          {/* Features List */}
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">
                🐾 Tüm Özellikler Ücretsiz
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {APP_FEATURES.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <Link href="/auth">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg">
                    <Heart className="h-5 w-5 mr-2" />
                    Hemen Başla - Tamamen Ücretsiz
                  </Button>
                </Link>
                <p className="text-sm text-gray-500 mt-2">
                  Sadece e-posta ile kayıt olun. Kredi kartı gerektirmez.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
