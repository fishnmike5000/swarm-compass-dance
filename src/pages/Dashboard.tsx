
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, Upload, Settings } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Dashboard = () => {
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const { toast } = useToast();

  const handleVoiceAgent = () => {
    setIsVoiceActive(!isVoiceActive);
    toast({
      title: isVoiceActive ? "Voice agent stopped" : "Voice agent started",
      description: isVoiceActive ? "Your voice agent is now inactive" : "Your voice agent is now listening...",
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      toast({
        title: "File uploaded",
        description: `${e.target.files[0].name} has been uploaded successfully.`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F0FB] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold text-[#1A1F2C]">AI Readiness Dashboard</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-[#8E9196]">
              <Settings className="h-4 w-4 mr-2" /> Settings
            </Button>
            <div className="h-8 w-8 rounded-full bg-[#9b87f5] flex items-center justify-center text-white">
              {/* User initials or avatar would go here */}
              U
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Voice Agent Card */}
            <Card className="shadow-sm border-0">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isVoiceActive ? 'bg-[#9b87f5] animate-pulse-subtle' : 'bg-[#F1F0FB] border-2 border-[#9b87f5]'}`}>
                    <Mic className={`h-8 w-8 ${isVoiceActive ? 'text-white' : 'text-[#9b87f5]'}`} />
                  </div>
                  <div>
                    <h2 className="text-xl font-medium text-[#1A1F2C] mb-2">Voice Agent</h2>
                    <p className="text-[#8E9196] mb-4">Start your voice agent to begin the AI readiness assessment.</p>
                    <Button 
                      onClick={handleVoiceAgent}
                      className={`w-full ${isVoiceActive ? 'bg-red-500 hover:bg-red-600' : 'bg-[#9b87f5] hover:bg-[#8a76e4]'}`}
                    >
                      {isVoiceActive ? 'Stop Voice Agent' : 'Start Voice Agent'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* File Upload Card */}
            <Card className="shadow-sm border-0">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-[#F1F0FB] border-2 border-[#1EAEDB] flex items-center justify-center">
                    <Upload className="h-8 w-8 text-[#1EAEDB]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-medium text-[#1A1F2C] mb-2">Upload Documents</h2>
                    <p className="text-[#8E9196] mb-4">Upload your company documents for AI readiness analysis.</p>
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <div className="w-full py-2 px-4 bg-[#1EAEDB] hover:bg-[#0FA0CE] text-white rounded-md text-center cursor-pointer">
                        Upload Files
                      </div>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
