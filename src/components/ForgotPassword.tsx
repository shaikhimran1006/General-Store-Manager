
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sendPasswordResetEmailToUser } from "@/lib/firebase";

interface ForgotPasswordProps {
  onBack: () => void;
}

const ForgotPassword = ({ onBack }: ForgotPasswordProps) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await sendPasswordResetEmailToUser(email);

      toast({
        title: "Password reset email sent!",
        description: "Check your email for the password reset link.",
      });

      setStep(2);
    } catch (error: any) {
      console.error("Error sending password reset email:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send password reset email. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const getStepIcon = () => {
    switch (step) {
      case 1: return <Mail className="h-6 w-6" />;
      case 2: return <CheckCircle className="h-6 w-6" />;
      default: return <Mail className="h-6 w-6" />;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return "Reset Your Password";
      case 2: return "Password Reset Email Sent";
      default: return "Reset Password";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1: return "Enter your email address and we'll send you a password reset link.";
      case 2: return "Check your email for the password reset link.";
      default: return "";
    }
  };

  return (
    <Card className="shadow-xl shadow-blue-900/5 backdrop-blur-sm bg-white/95 border-store-200">
      <CardHeader className="space-y-1 flex flex-col items-center pb-2">
        <div className="flex items-center justify-center rounded-full bg-gradient-to-br from-store-600 to-store-400 p-3 mb-4 shadow-lg shadow-store-400/30">
          {getStepIcon()}
        </div>
        <CardTitle className="text-2xl font-bold text-center bg-gradient-to-br from-store-800 to-store-600 bg-clip-text text-transparent">
          {getStepTitle()}
        </CardTitle>
        <CardDescription className="text-center text-store-700/70 font-medium">
          {getStepDescription()}
        </CardDescription>

        {/* Step indicator */}
        <div className="flex items-center space-x-2 mt-4">
          {[1, 2].map((stepNum) => (
            <div
              key={stepNum}
              className={`w-2 h-2 rounded-full transition-colors ${stepNum <= step ? 'bg-store-600' : 'bg-store-200'
                }`}
            />
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-4">
        {step === 1 && (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-store-700 font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-store-50/50 border-store-200 focus:border-store-400"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-store-600 to-store-500 hover:from-store-700 hover:to-store-600"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Email"}
            </Button>
          </form>
        )}

        {step === 2 && (
          <div className="text-center space-y-4">
            <div className="text-green-600 text-lg font-medium">
              Password reset email sent!
            </div>
            <p className="text-store-600">
              Check your email for the password reset link. Click the link in the email to set your new password.
            </p>
            <Button
              onClick={onBack}
              className="w-full bg-gradient-to-r from-store-600 to-store-500 hover:from-store-700 hover:to-store-600"
            >
              Back to Login
            </Button>
          </div>
        )}

        {step < 2 && (
          <Button
            variant="ghost"
            onClick={onBack}
            className="w-full text-store-600 hover:text-store-700 hover:bg-store-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ForgotPassword;
