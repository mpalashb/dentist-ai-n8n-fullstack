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
  Activity,
  FileText,
  Mail,
  BarChart3,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for charts and stats
  const transcriptData = [
    { name: "Jan", completed: 12, processing: 2 },
    { name: "Feb", completed: 18, processing: 3 },
    { name: "Mar", completed: 15, processing: 1 },
    { name: "Apr", completed: 22, processing: 4 },
    { name: "May", completed: 19, processing: 2 },
    { name: "Jun", completed: 24, processing: 3 },
  ];

  const emailData = [
    { name: "Jan", sent: 120, opened: 98 },
    { name: "Feb", sent: 132, opened: 110 },
    { name: "Mar", sent: 141, opened: 118 },
    { name: "Apr", sent: 156, opened: 132 },
    { name: "May", sent: 148, opened: 125 },
    { name: "Jun", sent: 162, opened: 138 },
  ];

  const stats = [
    {
      title: "Total Transcripts",
      value: "24",
      change: "+12%",
      icon: FileText,
      trend: "up",
    },
    {
      title: "Active Emails",
      value: "156",
      change: "+12%",
      icon: Mail,
      trend: "up",
    },
    {
      title: "Processing",
      value: "3",
      change: "In queue",
      icon: Activity,
      trend: "neutral",
    },
    {
      title: "Success Rate",
      value: "98.5%",
      change: "+0.5%",
      icon: TrendingUp,
      trend: "up",
    },
  ];

  const recentTranscripts = [
    {
      id: 1,
      name: "Client Meeting",
      date: "2025-01-10",
      status: "completed",
      duration: "24:15",
      client: "Acme Corp",
    },
    {
      id: 2,
      name: "Project Discussion",
      date: "2025-01-09",
      status: "processing",
      duration: "18:42",
      client: "Tech Solutions",
    },
    {
      id: 3,
      name: "Sales Call",
      date: "2025-01-08",
      status: "completed",
      duration: "32:07",
      client: "Global Industries",
    },
    {
      id: 4,
      name: "Team Sync",
      date: "2025-01-07",
      status: "completed",
      duration: "15:33",
      client: "Internal",
    },
  ];

  const recentEmails = [
    {
      id: 1,
      name: "Welcome Email",
      date: "2025-01-10",
      status: "sent",
      opens: 42,
      clicks: 18,
    },
    {
      id: 2,
      name: "Follow-up",
      date: "2025-01-09",
      status: "scheduled",
      opens: 0,
      clicks: 0,
    },
    {
      id: 3,
      name: "Newsletter",
      date: "2025-01-08",
      status: "sent",
      opens: 78,
      clicks: 32,
    },
    {
      id: 4,
      name: "Product Update",
      date: "2025-01-07",
      status: "sent",
      opens: 56,
      clicks: 24,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
      case "sent":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            Completed
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            Processing
          </Badge>
        );
      case "scheduled":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            Scheduled
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "sent":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "scheduled":
        return <Mail className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              {user
                ? "Welcome back! Here's what's happening with your business today."
                : "Welcome to our public dashboard! Sign in to access your personalized data."}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Export Report
            </Button>
            {user ? (
              <Button className="gap-2" onClick={() => navigate("/voice")}>
                <FileText className="h-4 w-4" />
                New Voice
              </Button>
            ) : (
              <Button className="gap-2" onClick={() => navigate("/login")}>
                <FileText className="h-4 w-4" />
                Sign In to Get Started
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className={`hover-lift border-l-4 ${
                stat.title === "Total Transcripts"
                  ? "border-l-blue-500"
                  : stat.title === "Active Emails"
                  ? "border-l-green-500"
                  : stat.title === "Processing"
                  ? "border-l-purple-500"
                  : "border-l-amber-500"
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <stat.icon className="h-4 w-4" />
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  {stat.trend === "up" && (
                    <div className="flex items-center text-sm text-green-600">
                      <ArrowUpRight className="h-3 w-3" />
                      <span>{stat.change}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.title === "Total Transcripts"
                    ? "+2 from last week"
                    : stat.title === "Active Emails"
                    ? "+12% from last month"
                    : stat.title === "Processing"
                    ? "In queue"
                    : "+0.5% from last month"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transcripts">Transcripts</TabsTrigger>
            <TabsTrigger value="emails">Emails</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Transcripts</CardTitle>
                      <CardDescription>
                        Your latest voice transcription files
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTranscripts.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(item.status)}
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{item.date}</span>
                              <span>•</span>
                              <span>{item.duration}</span>
                              <span>•</span>
                              <span>{item.client}</span>
                            </div>
                          </div>
                        </div>
                        {getStatusBadge(item.status)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Emails</CardTitle>
                      <CardDescription>
                        Your latest email automation campaigns
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentEmails.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(item.status)}
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{item.date}</span>
                              {item.status === "sent" && (
                                <>
                                  <span>•</span>
                                  <span>{item.opens} opens</span>
                                  <span>•</span>
                                  <span>{item.clicks} clicks</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        {getStatusBadge(item.status)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Activity Overview</CardTitle>
                <CardDescription>
                  Your system activity over the past 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                  <p className="text-muted-foreground">
                    Activity chart will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transcripts" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Transcript Analytics</CardTitle>
                  <CardDescription>
                    Performance metrics for your voice transcripts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                    <p className="text-muted-foreground">
                      Transcript analytics chart will appear here
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transcript Status</CardTitle>
                  <CardDescription>
                    Current status of all transcripts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Completed</span>
                      </div>
                      <span className="font-medium">18 (75%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span>Processing</span>
                      </div>
                      <span className="font-medium">4 (17%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span>Failed</span>
                      </div>
                      <span className="font-medium">2 (8%)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Transcripts</CardTitle>
                <CardDescription>
                  Complete list of your voice transcripts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTranscripts.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(item.status)}
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{item.date}</span>
                            <span>•</span>
                            <span>{item.duration}</span>
                            <span>•</span>
                            <span>{item.client}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(item.status)}
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emails" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Email Analytics</CardTitle>
                  <CardDescription>
                    Performance metrics for your email campaigns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                    <p className="text-muted-foreground">
                      Email analytics chart will appear here
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Email Performance</CardTitle>
                  <CardDescription>
                    Key metrics for your email campaigns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Open Rate</span>
                      <span className="font-medium">42.3%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Click Rate</span>
                      <span className="font-medium">18.7%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Bounce Rate</span>
                      <span className="font-medium">2.1%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Unsubscribe Rate</span>
                      <span className="font-medium">0.8%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Email Campaigns</CardTitle>
                <CardDescription>
                  Complete list of your email campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentEmails.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(item.status)}
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{item.date}</span>
                            {item.status === "sent" && (
                              <>
                                <span>•</span>
                                <span>{item.opens} opens</span>
                                <span>•</span>
                                <span>{item.clicks} clicks</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(item.status)}
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
