import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Mail,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  BarChart3,
  Users,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const Emails = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("campaigns");

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const emails = [
    {
      id: 1,
      subject: "Welcome Email - New Customer",
      recipient: "customer@example.com",
      status: "sent",
      sentAt: "2025-01-10 15:30",
      template: "Welcome Template",
      opens: 42,
      clicks: 18,
      recipients: 1,
    },
    {
      id: 2,
      subject: "Follow-up: Service Inquiry",
      recipient: "prospect@company.com",
      status: "scheduled",
      sentAt: "2025-01-11 10:00",
      template: "Follow-up Template",
      opens: 0,
      clicks: 0,
      recipients: 1,
    },
    {
      id: 3,
      subject: "Monthly Newsletter - January",
      recipient: "All Subscribers",
      status: "sent",
      sentAt: "2025-01-09 08:00",
      template: "Newsletter Template",
      opens: 78,
      clicks: 32,
      recipients: 185,
    },
    {
      id: 4,
      subject: "Appointment Reminder",
      recipient: "client@business.com",
      status: "scheduled",
      sentAt: "2025-01-12 09:00",
      template: "Reminder Template",
      opens: 0,
      clicks: 0,
      recipients: 1,
    },
    {
      id: 5,
      subject: "Product Update - New Features",
      recipient: "All Customers",
      status: "sent",
      sentAt: "2025-01-08 14:30",
      template: "Product Update Template",
      opens: 56,
      clicks: 24,
      recipients: 132,
    },
    {
      id: 6,
      subject: "Special Offer - Limited Time",
      recipient: "Premium Subscribers",
      status: "sent",
      sentAt: "2025-01-07 11:15",
      template: "Promotional Template",
      opens: 92,
      clicks: 41,
      recipients: 98,
    },
  ];

  const templates = [
    {
      id: 1,
      name: "Welcome Template",
      category: "Onboarding",
      lastUsed: "2025-01-10",
      usageCount: 24,
    },
    {
      id: 2,
      name: "Newsletter Template",
      category: "Marketing",
      lastUsed: "2025-01-09",
      usageCount: 12,
    },
    {
      id: 3,
      name: "Follow-up Template",
      category: "Sales",
      lastUsed: "2025-01-05",
      usageCount: 18,
    },
    {
      id: 4,
      name: "Reminder Template",
      category: "Notifications",
      lastUsed: "2025-01-03",
      usageCount: 8,
    },
  ];

  const filteredEmails = emails.filter((email) => {
    const matchesSearch =
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.template.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || email.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            Sent
          </Badge>
        );
      case "scheduled":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            Scheduled
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            Draft
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            Failed
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "scheduled":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "draft":
        return <Mail className="h-4 w-4 text-gray-500" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Mail className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTabCount = (tab: string) => {
    if (tab === "campaigns") return emails.length;
    if (tab === "templates") return templates.length;
    return 0;
  };

  const stats = [
    {
      title: "Total Sent",
      value: "156",
      change: "+12%",
      icon: Send,
      trend: "up",
    },
    {
      title: "Open Rate",
      value: "42.3%",
      change: "+5%",
      icon: Eye,
      trend: "up",
    },
    {
      title: "Click Rate",
      value: "18.7%",
      change: "+2.1%",
      icon: TrendingUp,
      trend: "up",
    },
    {
      title: "Active Subscribers",
      value: "1,245",
      change: "+42",
      icon: Users,
      trend: "up",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Email Automation</h1>
            <p className="text-muted-foreground">
              Manage your automated email campaigns and schedules
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Button className="gap-2">
              <Send className="h-4 w-4" />
              Create Campaign
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className={`hover-lift border-l-4 ${
                stat.title === "Total Sent"
                  ? "border-l-blue-500"
                  : stat.title === "Open Rate"
                  ? "border-l-green-500"
                  : stat.title === "Click Rate"
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
                  {stat.title === "Total Sent"
                    ? "This month"
                    : stat.title === "Open Rate"
                    ? "From last month"
                    : stat.title === "Click Rate"
                    ? "From last month"
                    : "New this month"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="campaigns">
              Campaigns ({getTabCount("campaigns")})
            </TabsTrigger>
            <TabsTrigger value="templates">
              Templates ({getTabCount("templates")})
            </TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email Campaigns</CardTitle>
                <CardDescription>
                  View and manage your email automation campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading campaigns...</span>
                  </div>
                ) : filteredEmails.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No campaigns found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || statusFilter !== "all"
                        ? "Try adjusting your search or filters"
                        : "Get started by creating your first email campaign"}
                    </p>
                    <Button className="gap-2">
                      <Send className="h-4 w-4" />
                      Create Campaign
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredEmails.map((email) => (
                      <div
                        key={email.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            {getStatusIcon(email.status)}
                          </div>
                          <div>
                            <h3 className="font-medium">{email.subject}</h3>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                              <span>To: {email.recipient}</span>
                              <span>•</span>
                              <span>Template: {email.template}</span>
                              <span>•</span>
                              <span>{email.sentAt}</span>
                              {email.status === "sent" && (
                                <>
                                  <span>•</span>
                                  <span>{email.opens} opens</span>
                                  <span>•</span>
                                  <span>{email.clicks} clicks</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(email.status)}
                          <Button variant="ghost" size="sm" title="View">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="More options"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>
                  Manage your email templates for campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{template.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Category: {template.category}</span>
                            <span>•</span>
                            <span>Last used: {template.lastUsed}</span>
                            <span>•</span>
                            <span>Used {template.usageCount} times</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" title="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Duplicate">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
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
                  <CardTitle>Subscriber Growth</CardTitle>
                  <CardDescription>
                    Growth of your email subscribers over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                    <p className="text-muted-foreground">
                      Subscriber growth chart will appear here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Campaign Analytics</CardTitle>
                <CardDescription>
                  Performance metrics for your email campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                  <p className="text-muted-foreground">
                    Campaign analytics chart will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Emails;
