import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { APP_NAME, APP_DESCRIPTION } from '@/lib/constants';
import { Link } from 'wouter';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue/10 to-healthcare-green/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div className="space-y-3">
              <div className="bg-medical-blue p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <i className="fas fa-stethoscope text-white text-2xl"></i>
              </div>
              <h1 className="text-3xl font-bold text-slate-800">{APP_NAME}</h1>
              <p className="text-professional-gray">{APP_DESCRIPTION}</p>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold text-slate-800 mb-2">Özellikler</h3>
                <ul className="text-sm text-professional-gray space-y-1">
                  <li>• Evcil hayvan kayıtları</li>
                  <li>• Aşı takibi ve hatırlatma</li>
                  <li>• Randevu yönetimi</li>
                  <li>• E-ticaret ve sipariş takibi</li>
                  <li>• WhatsApp bildirimleri</li>
                  <li>• Dijital aşı kartı</li>
                </ul>
              </div>

              <Link href="/auth">
                <Button 
                  className="w-full bg-medical-blue hover:bg-medical-blue/90 text-white"
                  size="lg"
                >
                  <i className="fas fa-sign-in-alt mr-2"></i>
                  Giriş Yap / Kayıt Ol
                </Button>
              </Link>
            </div>

            <div className="text-xs text-professional-gray">
              <p>E-posta ile güvenli giriş yapın</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
