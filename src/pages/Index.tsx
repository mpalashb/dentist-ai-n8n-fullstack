import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  FileText,
  Mail,
  BarChart3,
  Shield,
  Zap,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const features = [
    {
      icon: FileText,
      title: "Voice Transcription",
      description:
        "Upload and process voice recordings with automatic transcription and status tracking.",
    },
    {
      icon: Mail,
      title: "Email Automation",
      description:
        "Schedule and manage automated email campaigns with smart templates and analytics.",
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description:
        "Track performance metrics, success rates, and system activity in real-time.",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description:
        "Enterprise-grade security with end-to-end encryption for all your data.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "Optimized performance with quick processing and responsive interface.",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description:
        "Invite team members and collaborate on transcripts and email campaigns.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold">CD</span>
          </div>
          <span className="font-bold text-xl">Client Dashboard</span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => navigate("/login")}>
            Sign In
          </Button>
          <Button onClick={() => navigate("/signup")}>Get Started</Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Client Dashboard System
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Manage your voice transcripts, automate emails, and streamline your
            business operations all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              onClick={() => navigate("/signup")}
              className="gap-2"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-16">
          <Card className="text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">98%</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Accuracy Rate</CardDescription>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">24/7</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Support</CardDescription>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">500+</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Happy Clients</CardDescription>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">99.9%</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Uptime</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border border-border hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-accent/30 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join hundreds of businesses already using our platform to streamline
            their operations.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/signup")}
            className="gap-2"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-border">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">CD</span>
            </div>
            <span className="font-bold">Client Dashboard</span>
          </div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Client Dashboard. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
