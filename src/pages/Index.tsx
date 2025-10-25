import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Wallet, Shield, Heart, Bell, Lock } from 'lucide-react';
import { useEffect } from 'react';

const Index = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      navigate(currentUser.role === 'elder' ? '/elder' : '/guardian');
    }
  }, [currentUser, navigate]);

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-primary rounded-2xl mb-6 shadow-glow">
            <Wallet className="h-16 w-16 text-primary-foreground" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            FinSync
          </h1>
          <p className="text-2xl text-muted-foreground mb-2">
            Safe Digital Payments for Seniors
          </p>
          <p className="text-2xl text-muted-foreground mb-8">
            ಸುರಕ್ಷಿತ ಡಿಜಿಟಲ್ ಪಾವತಿ (Safe Digital Payments)
          </p>
          <Button size="lg" onClick={() => navigate('/auth')} className="shadow-medium text-xl py-6 px-8">
            ಪ್ರಾರಂಭಿಸಿ (Get Started)
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-8 hover:shadow-strong transition-shadow">
            <div className="p-4 bg-success-light rounded-xl w-fit mb-4">
              <Lock className="h-8 w-8 text-success" />
            </div>
            <h3 className="font-bold text-2xl mb-3">Protection Layer</h3>
            <p className="text-lg text-muted-foreground">
              Family approval required for transactions over ₹1000 - keeping your money safe
            </p>
          </Card>

          <Card className="p-8 hover:shadow-strong transition-shadow">
            <div className="p-4 bg-warning-light rounded-xl w-fit mb-4">
              <Bell className="h-8 w-8 text-warning" />
            </div>
            <h3 className="font-bold text-2xl mb-3">Real-time Alerts</h3>
            <p className="text-lg text-muted-foreground">
              Your family guardian gets instant notifications for every transaction
            </p>
          </Card>

          <Card className="p-8 hover:shadow-strong transition-shadow">
            <div className="p-4 bg-accent/20 rounded-xl w-fit mb-4">
              <Heart className="h-8 w-8 text-accent" />
            </div>
            <h3 className="font-bold text-2xl mb-3">Family Support</h3>
            <p className="text-lg text-muted-foreground">
              Connected with your loved ones for safe digital payment guidance
            </p>
          </Card>
        </div>

        {/* User Types */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="h-10 w-10 text-primary" />
              <h3 className="text-3xl font-bold">For Elders</h3>
            </div>
            <ul className="space-y-3 text-lg text-muted-foreground">
              <li>✓ Simple, large buttons and text</li>
              <li>✓ Safe transaction approval process</li>
              <li>✓ Kannada language support</li>
              <li>✓ Family connection for guidance</li>
            </ul>
          </Card>

          <Card className="p-8 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-10 w-10 text-accent" />
              <h3 className="text-3xl font-bold">For Family Guardians</h3>
            </div>
            <ul className="space-y-3 text-lg text-muted-foreground">
              <li>✓ Monitor elder's transactions</li>
              <li>✓ Approve or reject high-risk payments</li>
              <li>✓ Protect from fraud and scams</li>
              <li>✓ Stay connected and supportive</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
