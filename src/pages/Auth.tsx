import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Wallet, Shield } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const { signup, login, currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (currentUser) {
    navigate(currentUser.role === 'elder' ? '/elder' : '/guardian');
    return null;
  }

  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'elder' as 'elder' | 'guardian',
    guardianId: ''
  });

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(
        signupData.email,
        signupData.password,
        signupData.fullName,
        signupData.role,
        signupData.role === 'elder' ? signupData.guardianId : undefined
      );
      toast.success('Account created successfully!');
      navigate(signupData.role === 'elder' ? '/elder' : '/guardian');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(loginData.email, loginData.password);
      toast.success('Logged in successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-primary rounded-2xl mb-4 shadow-glow">
            <Wallet className="h-12 w-12 text-primary-foreground" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            FinSync
          </h1>
          <p className="text-xl text-muted-foreground">Safe Digital Payments for Seniors</p>
        </div>

        <Card className="shadow-strong">
          <CardHeader>
            <CardTitle className="text-3xl">ಸ್ವಾಗತ! (Welcome)</CardTitle>
            <CardDescription className="text-lg">
              Login or create an account to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 h-14">
                <TabsTrigger value="login" className="text-lg">Login</TabsTrigger>
                <TabsTrigger value="signup" className="text-lg">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="login-email" className="text-lg">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      className="h-14 text-lg"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="login-password" className="text-lg">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      className="h-14 text-lg"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full h-14 text-xl" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="signup-name" className="text-lg">Full Name</Label>
                    <Input
                      id="signup-name"
                      placeholder="Your full name"
                      className="h-14 text-lg"
                      value={signupData.fullName}
                      onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="signup-email" className="text-lg">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      className="h-14 text-lg"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="signup-password" className="text-lg">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      className="h-14 text-lg"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-lg">Role</Label>
                    <RadioGroup
                      value={signupData.role}
                      onValueChange={(value) => setSignupData({ ...signupData, role: value as any })}
                    >
                      <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:bg-secondary cursor-pointer">
                        <RadioGroupItem value="elder" id="elder" />
                        <Label htmlFor="elder" className="cursor-pointer flex-1 text-lg">
                          <div className="flex items-center gap-3">
                            <Wallet className="h-6 w-6" />
                            <span>Elder (Senior Citizen)</span>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:bg-secondary cursor-pointer">
                        <RadioGroupItem value="guardian" id="guardian" />
                        <Label htmlFor="guardian" className="cursor-pointer flex-1 text-lg">
                          <div className="flex items-center gap-3">
                            <Shield className="h-6 w-6" />
                            <span>Family Guardian (Caregiver)</span>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  {signupData.role === 'elder' && (
                    <div className="space-y-3">
                      <Label htmlFor="guardian-id" className="text-lg">Guardian ID (Optional)</Label>
                      <Input
                        id="guardian-id"
                        placeholder="Your guardian's user ID"
                        className="h-14 text-lg"
                        value={signupData.guardianId}
                        onChange={(e) => setSignupData({ ...signupData, guardianId: e.target.value })}
                      />
                      <p className="text-base text-muted-foreground">
                        Ask your family guardian for their User ID to link accounts
                      </p>
                    </div>
                  )}
                  <Button type="submit" className="w-full h-14 text-xl" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
