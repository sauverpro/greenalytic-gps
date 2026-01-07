import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useLogin } from '../hooks/useAuth';
import type { LoginType } from '../types';
import { Leaf } from 'lucide-react';

export default function LoginPage() {
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginType, setLoginType] = useState<LoginType>('ENTERPRISE');
  const navigate = useNavigate();
  
  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await loginMutation.mutateAsync({
        loginName,
        loginPassword,
        loginType,
      });
      
      console.log('Login result:', result);
      
      if (result && result.success) {
        console.log('Login successful, navigating to dashboard...');
        navigate('/dashboard');
      } else {
        console.error('Login failed:', result?.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Login exception:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2">
              <Leaf className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-primary">greenAlytics</h1>
            </div>
          </div>
          <CardTitle className="text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your GPS tracking dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="loginName" className="text-sm font-medium">
                Username
              </label>
              <Input
                id="loginName"
                type="text"
                placeholder="Enter your username"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="loginPassword" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="loginPassword"
                type="password"
                placeholder="Enter your password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Login Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="loginType"
                    value="ENTERPRISE"
                    checked={loginType === 'ENTERPRISE'}
                    onChange={(e) => setLoginType(e.target.value as LoginType)}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm">Enterprise Account</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="loginType"
                    value="USER"
                    checked={loginType === 'USER'}
                    onChange={(e) => setLoginType(e.target.value as LoginType)}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm">Device Login</span>
                </label>
              </div>
            </div>

            {loginMutation.isError && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                Login failed. Please check your credentials.
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
