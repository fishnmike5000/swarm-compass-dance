
import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const navigate = useNavigate();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would handle form submission here
    console.log('Form submitted');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md blur-in">
        <Card className="p-6 shadow-xl bg-white/10 backdrop-blur-md border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-light tracking-tight text-white">
              <span className="font-normal">AI Readiness</span> Audit
            </h1>
            <p className="text-white/80 mt-2">Create your account to continue</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Full Name</Label>
              <Input id="name" placeholder="Enter your full name" className="bg-white/20 border-white/30 text-white placeholder:text-white/50" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Work Email</Label>
              <Input id="email" type="email" placeholder="you@company.com" className="bg-white/20 border-white/30 text-white placeholder:text-white/50" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="business" className="text-white">Business Name</Label>
              <Input id="business" placeholder="Your organization" className="bg-white/20 border-white/30 text-white placeholder:text-white/50" />
            </div>
            
            <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white">
              Get in Touch
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <button 
              className="text-white/70 hover:text-white text-sm"
              onClick={() => navigate('/')}
            >
              Return to home
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;
