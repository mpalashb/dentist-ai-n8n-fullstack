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
  BarChart3,
  FileText,
  Mail,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Calendar,
  Download,
  Filter,
} from "lucide-react";

const Analytics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("month");

  // Mock data for charts and stats
  const transcriptData = [
    { name: "Jan", completed: 12, processing: 2, failed: 1 },
    { name: "Feb", completed: 18, processing: 3, failed: 0 },
    { name: "Mar", completed: 15, processing: 1, failed: 2 },
    { name: "Apr", completed: 22, processing: 4, failed: 1 },
    { name: "May", completed: 19, processing: 2, failed: 0 },
    { name: "Jun", completed: 24, processing: 3, failed: 1 },
  ];

  const emailData = [
    { name: "Jan", sent: 120, opened: 98, clicked: 42 },
    { name: "Feb", sent: 132, opened: 110, clicked: 48 },
    { name: "Mar", sent: 141, opened: 118, clicked: 52 },
    { name: "Apr", sent: 156, opened: 132, clicked: 58 },
    { name: "May", sent: 148, opened: 125, clicked: 54 },
    { name: "Jun", sent: 162, opened: 138, clicked: 62 },
  ];

  const userActivityData = [
    { name: "Jan", active: 42, new: 12 },
    { name: "Feb", active: 48, new: 15 },
    { name: "Mar", active: 45, new: 18 },
    { name: "Apr", active: 52, new: 22 },
    { name: "May", active: 58, new: 25 },
    { name: "Jun", active: 64, new: 28 },
  ];

  const stats = [
    {
      title: "Total Transcripts",
      value: "110",
      change: "+12%",
      icon: FileText,
      trend: "up",
    },
    {
      title: "Emails Sent",
      value: "859",
      change: "+18%",
      icon: Mail,
      trend: "up",
    },
    {
      title: "Active Users",
      value: "64",
      change: "+8%",
      icon: Users,
      trend: "up",
    },
    {
      title: "Success Rate",
      value: "94.2%",
      change: "+2.1%",
      icon: TrendingUp,
      trend: "up",
    },
  ];

  const topTranscripts = [
    {
      id: 1,
      name: "Client Meeting",
      date: "2025-01-10",
      status: "completed",
      duration: "24:15",
      client: "Acme Corp",
      accuracy: "98.5%",
    },
    {
      id: 2,
      name: "Project Discussion",
      date: "2025-01-09",
      status: "completed",
      duration: "18:42",
      client: "Tech Solutions",
      accuracy: "97.2%",
    },
    {
      id: 3,
      name: "Sales Call",
      date: "2025-01-08",
      status: "completed",
      duration: "32:07",
      client: "Global Industries",
      accuracy: "99.1%",
    },
    {
      id: 4,
      name: "Team Sync",
      date: "2025-01-07",
      status: "completed",
      duration: "15:33",
      client: "Internal",
      accuracy: "96.8%",
    },
  ];

  const topEmails = [
    {
      id: 1,
      name: "Welcome Email",
      date: "2025-01-10",
      status: "sent",
      opens: 42,
      clicks: 18,
      openRate: "35.0%",
      clickRate: "15.0%",
    },
    {
      id: 2,
      name: "Newsletter",
      date: "2025-01-08",
      status: "sent",
      opens: 78,
      clicks: 32,
      openRate: "55.3%",
      clickRate: "22.7%",
    },
    {
      id: 3,
      name: "Product Update",
      date: "2025-01-07",
      status: "sent",
      opens: 56,
      clicks: 24,
      openRate: "35.9%",
      clickRate: "15.4%",
    },
    {
      id: 4,
      name: "Follow-up",
      date: "2025-01-05",
      status: "sent",
      opens: 38,
      clicks: 16,
      openRate: "28.8%",
      clickRate: "12.1%",
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
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">
              {user
                ? "Detailed analytics and insights for your voice transcripts and email campaigns."
                : "Public analytics dashboard. Sign in to access your personalized data."}
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant={timeRange === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("week")}
              >
                Week
              </Button>
              <Button
                variant={timeRange === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("month")}
              >
                Month
              </Button>
              <Button
                variant={timeRange === "quarter" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("quarter")}
              >
                Quarter
              </Button>
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className={`hover-lift border-l-4 ${
                stat.title === "Total Transcripts"
                  ? "border-l-blue-500"
                  : stat.title === "Emails Sent"
                  ? "border-l-green-500"
                  : stat.title === "Active Users"
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
                    ? "+12 from last month"
                    : stat.title === "Emails Sent"
                    ? "+132 from last month"
                    : stat.title === "Active Users"
                    ? "+5 from last month"
                    : "+2.1% from last month"}
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transcripts">Transcripts</TabsTrigger>
            <TabsTrigger value="emails">Emails</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Transcript Analytics</CardTitle>
                      <CardDescription>
                        Performance metrics for your voice transcripts
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
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
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Email Analytics</CardTitle>
                      <CardDescription>
                        Performance metrics for your email campaigns
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                    <p className="text-muted-foreground">
                      Email analytics chart will appear here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
                <CardDescription>
                  Active users and new signups over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                  <p className="text-muted-foreground">
                    User activity chart will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transcripts" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Transcript Performance</CardTitle>
                  <CardDescription>
                    Key metrics for your voice transcripts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Completion Rate</span>
                      <span className="font-medium">96.4%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Average Accuracy</span>
                      <span className="font-medium">97.8%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Average Duration</span>
                      <span className="font-medium">22:35</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Processing Time</span>
                      <span className="font-medium">1:24</span>
                    </div>
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
                      <span className="font-medium">106 (96.4%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span>Processing</span>
                      </div>
                      <span className="font-medium">3 (2.7%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span>Failed</span>
                      </div>
                      <span className="font-medium">1 (0.9%)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Transcripts</CardTitle>
                <CardDescription>
                  Transcripts with the highest accuracy scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topTranscripts.map((item) => (
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
                        <Badge variant="outline">{item.accuracy}</Badge>
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

              <Card>
                <CardHeader>
                  <CardTitle>Email Delivery</CardTitle>
                  <CardDescription>
                    Delivery status for your email campaigns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Delivered</span>
                      </div>
                      <span className="font-medium">841 (97.9%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span>Bounced</span>
                      </div>
                      <span className="font-medium">18 (2.1%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <span>Opened</span>
                      </div>
                      <span className="font-medium">363 (42.3%)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Emails</CardTitle>
                <CardDescription>
                  Email campaigns with the highest engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topEmails.map((item) => (
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
                            <span>{item.opens} opens</span>
                            <span>•</span>
                            <span>{item.clicks} clicks</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{item.openRate}</Badge>
                        <Badge variant="outline">{item.clickRate}</Badge>
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

          <TabsContent value="users" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>New user signups over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                    <p className="text-muted-foreground">
                      User growth chart will appear here
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Activity</CardTitle>
                  <CardDescription>
                    Daily active users over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                    <p className="text-muted-foreground">
                      User activity chart will appear here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>User Demographics</CardTitle>
                <CardDescription>Breakdown of your user base</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <h4 className="font-medium">By Plan</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Free</span>
                        <span>42 (65.6%)</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Pro</span>
                        <span>18 (28.1%)</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Enterprise</span>
                        <span>4 (6.3%)</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">By Region</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>North America</span>
                        <span>28 (43.8%)</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Europe</span>
                        <span>22 (34.4%)</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Asia</span>
                        <span>10 (15.6%)</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Other</span>
                        <span>4 (6.2%)</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">By Device</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Desktop</span>
                        <span>38 (59.4%)</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Mobile</span>
                        <span>20 (31.2%)</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tablet</span>
                        <span>6 (9.4%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
