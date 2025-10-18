import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  HelpCircle,
  BookOpen,
  MessageSquare,
  Mail,
  Phone,
  Video,
  FileText,
  Download,
  ExternalLink,
  Search,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const Help = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("faq");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data for FAQ
  const faqItems = [
    {
      id: 1,
      question: "How do I create a new voice transcript?",
      answer:
        "To create a new voice transcript, navigate to the 'New Voice' page from the sidebar. You can either upload an audio file or record directly using your microphone. Once uploaded, our system will process the audio and generate a transcript for you.",
      category: "Getting Started",
    },
    {
      id: 2,
      question: "What audio formats are supported?",
      answer:
        "We support a wide range of audio formats including MP3, WAV, M4A, and FLAC. For best results, we recommend using high-quality audio files with minimal background noise.",
      category: "Technical",
    },
    {
      id: 3,
      question: "How accurate are the transcriptions?",
      answer:
        "Our transcription service has an average accuracy rate of 97.8%. Accuracy can vary based on audio quality, background noise, and speaker clarity. You can always edit and correct transcripts after they're generated.",
      category: "Technical",
    },
    {
      id: 4,
      question: "Can I integrate with other services?",
      answer:
        "Yes, we offer integrations with popular services like email platforms, CRM systems, and productivity tools. Check our integrations page for a full list of supported services.",
      category: "Integrations",
    },
    {
      id: 5,
      question: "How do I set up email automation?",
      answer:
        "To set up email automation, go to the 'Email Automation' page. You can create templates, set triggers based on transcript content, and schedule emails to be sent automatically.",
      category: "Email Automation",
    },
    {
      id: 6,
      question: "What pricing plans are available?",
      answer:
        "We offer three pricing plans: Free, Pro, and Enterprise. The Free plan includes basic features with limited usage. The Pro plan offers advanced features and higher limits. The Enterprise plan provides custom solutions for large organizations.",
      category: "Billing",
    },
  ];

  // Mock data for guides
  const guides = [
    {
      id: 1,
      title: "Getting Started Guide",
      description: "Learn the basics of using our platform",
      category: "Getting Started",
      readTime: "5 min",
      featured: true,
    },
    {
      id: 2,
      title: "Voice Transcription Best Practices",
      description: "Tips for getting the most accurate transcriptions",
      category: "Voice Transcription",
      readTime: "8 min",
      featured: true,
    },
    {
      id: 3,
      title: "Setting Up Email Automation",
      description: "Step-by-step guide to automating your emails",
      category: "Email Automation",
      readTime: "10 min",
      featured: false,
    },
    {
      id: 4,
      title: "Understanding Analytics",
      description: "How to interpret your analytics data",
      category: "Analytics",
      readTime: "7 min",
      featured: false,
    },
    {
      id: 5,
      title: "API Integration Guide",
      description: "Connect our services with your existing systems",
      category: "Integrations",
      readTime: "15 min",
      featured: false,
    },
    {
      id: 6,
      title: "Team Collaboration Features",
      description: "How to work effectively with your team",
      category: "Team Management",
      readTime: "6 min",
      featured: false,
    },
  ];

  // Mock data for contact options
  const contactOptions = [
    {
      id: 1,
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      icon: MessageSquare,
      availability: "Available now",
      responseTime: "Instant",
    },
    {
      id: 2,
      title: "Email Support",
      description: "Send us a detailed message",
      icon: Mail,
      availability: "24/7",
      responseTime: "Within 24 hours",
    },
    {
      id: 3,
      title: "Schedule a Call",
      description: "Book a time to speak with our team",
      icon: Phone,
      availability: "Mon-Fri, 9AM-5PM",
      responseTime: "Scheduled",
    },
    {
      id: 4,
      title: "Video Tutorial",
      description: "Watch our video guides and tutorials",
      icon: Video,
      availability: "Always available",
      responseTime: "Instant",
    },
  ];

  // Mock data for recent tickets
  const recentTickets = [
    {
      id: 1,
      subject: "Issue with transcript accuracy",
      status: "resolved",
      date: "2025-01-08",
      lastUpdate: "2025-01-09",
    },
    {
      id: 2,
      subject: "Question about email automation",
      status: "in-progress",
      date: "2025-01-10",
      lastUpdate: "2025-01-10",
    },
    {
      id: 3,
      subject: "Billing inquiry",
      status: "open",
      date: "2025-01-12",
      lastUpdate: "2025-01-12",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            Resolved
          </Badge>
        );
      case "in-progress":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            In Progress
          </Badge>
        );
      case "open":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            Open
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "open":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredFAQ = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGuides = guides.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Help & Support</h1>
            <p className="text-muted-foreground">
              Find answers to your questions or get in touch with our support
              team.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download Guides
            </Button>
            <Button className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Contact Support
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search for help articles, guides, and more..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="guides">Guides</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="tickets">My Tickets</TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Find answers to common questions about our platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredFAQ.length > 0 ? (
                    filteredFAQ.map((item) => (
                      <div
                        key={item.id}
                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2">
                            <h3 className="font-semibold">{item.question}</h3>
                            <p className="text-muted-foreground">
                              {item.answer}
                            </p>
                          </div>
                          <Badge variant="outline">{item.category}</Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No results found
                      </h3>
                      <p className="text-muted-foreground">
                        Try adjusting your search query or browse other
                        categories.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guides" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredGuides.map((guide) => (
                <Card
                  key={guide.id}
                  className={`hover-lift cursor-pointer ${
                    guide.featured ? "border-primary" : ""
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{guide.title}</CardTitle>
                        <CardDescription>{guide.description}</CardDescription>
                      </div>
                      {guide.featured && (
                        <Badge className="bg-primary text-primary-foreground">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        <span>{guide.readTime} read</span>
                      </div>
                      <Badge variant="outline">{guide.category}</Badge>
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                      Read Guide
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {contactOptions.map((option) => (
                <Card key={option.id} className="hover-lift cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <option.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {option.title}
                        </CardTitle>
                        <CardDescription>{option.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Availability:
                        </span>
                        <span>{option.availability}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Response time:
                        </span>
                        <span>{option.responseTime}</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4">
                      {option.title === "Video Tutorial"
                        ? "Watch Now"
                        : "Contact"}
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Community Resources</CardTitle>
                <CardDescription>
                  Connect with other users and find additional resources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Community Forum</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Join discussions with other users and our team
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Visit Forum
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </Button>
                  </div>
                  <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <Video className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Video Tutorials</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Watch step-by-step video guides
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Watch Videos
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </Button>
                  </div>
                  <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Documentation</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Detailed technical documentation
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Read Docs
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-4">
            {user ? (
              <>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Support Tickets</CardTitle>
                        <CardDescription>
                          Track and manage your support requests
                        </CardDescription>
                      </div>
                      <Button>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        New Ticket
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {recentTickets.length > 0 ? (
                      <div className="space-y-4">
                        {recentTickets.map((ticket) => (
                          <div
                            key={ticket.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              {getStatusIcon(ticket.status)}
                              <div>
                                <p className="font-medium">{ticket.subject}</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span>Created: {ticket.date}</span>
                                  <span>•</span>
                                  <span>Last update: {ticket.lastUpdate}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(ticket.status)}
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          No tickets yet
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          You haven't created any support tickets yet.
                        </p>
                        <Button>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Create Your First Ticket
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Sign in required
                  </h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Please sign in to view and manage your support tickets.
                  </p>
                  <Button onClick={() => navigate("/login")}>Sign In</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Help;
