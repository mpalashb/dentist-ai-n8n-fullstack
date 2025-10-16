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
  FileText,
  Search,
  Filter,
  Download,
  Play,
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  Loader2,
  Upload,
} from "lucide-react";

const Transcripts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const transcripts = [
    {
      id: 1,
      name: "customer_call_001.mp3",
      status: "completed",
      uploadedAt: "2025-01-10 14:30",
      duration: "5:23",
      text: "Hello, I would like to inquire about your services...",
      size: "2.4 MB",
      words: 3245,
      client: "Acme Corp",
    },
    {
      id: 2,
      name: "meeting_recording_jan9.wav",
      status: "processing",
      uploadedAt: "2025-01-09 09:15",
      duration: "12:45",
      text: null,
      size: "1.8 MB",
      words: 2456,
      client: "Tech Solutions",
    },
    {
      id: 3,
      name: "voicemail_client_a.mp3",
      status: "completed",
      uploadedAt: "2025-01-08 16:20",
      duration: "1:52",
      text: "Hi, this is a follow-up on our previous conversation...",
      size: "3.2 MB",
      words: 4321,
      client: "Global Industries",
    },
    {
      id: 4,
      name: "interview_transcript.mp3",
      status: "failed",
      uploadedAt: "2025-01-07 11:00",
      duration: "8:30",
      text: null,
      size: "1.5 MB",
      words: 1987,
      client: "Innovate Inc",
    },
    {
      id: 5,
      name: "product_demo.mp3",
      status: "completed",
      uploadedAt: "2025-01-06 13:45",
      duration: "28:19",
      text: "Today I'll be demonstrating our new product features...",
      size: "2.8 MB",
      words: 3876,
      client: "Customer Co",
    },
    {
      id: 6,
      name: "support_call.mp3",
      status: "completed",
      uploadedAt: "2025-01-05 10:30",
      duration: "12:45",
      text: "Thank you for calling our support line. How can I help you today?",
      size: "1.2 MB",
      words: 1654,
      client: "Client XYZ",
    },
  ];

  const filteredTranscripts = transcripts.filter((transcript) => {
    const matchesSearch =
      transcript.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transcript.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || transcript.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
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
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTabCount = (status: string) => {
    if (status === "all") return transcripts.length;
    return transcripts.filter((t) => t.status === status).length;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Voice Recordings</h1>
            <p className="text-muted-foreground">
              Manage and view your voice recording files
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export All
            </Button>
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Audio
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transcripts..."
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
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
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
            <TabsTrigger value="all">All ({getTabCount("all")})</TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({getTabCount("completed")})
            </TabsTrigger>
            <TabsTrigger value="processing">
              Processing ({getTabCount("processing")})
            </TabsTrigger>
            <TabsTrigger value="failed">
              Failed ({getTabCount("failed")})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Transcripts</CardTitle>
                <CardDescription>
                  A list of all your voice transcription files
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading transcripts...</span>
                  </div>
                ) : filteredTranscripts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No transcripts found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || statusFilter !== "all"
                        ? "Try adjusting your search or filters"
                        : "Get started by uploading your first audio file"}
                    </p>
                    <Button className="gap-2">
                      <Upload className="h-4 w-4" />
                      Upload Audio
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTranscripts.map((transcript) => (
                      <div
                        key={transcript.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            {getStatusIcon(transcript.status)}
                          </div>
                          <div>
                            <h3 className="font-medium">{transcript.name}</h3>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{transcript.uploadedAt}</span>
                              </div>
                              <span>•</span>
                              <span>{transcript.duration}</span>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{transcript.client}</span>
                              </div>
                              <span>•</span>
                              <span>{transcript.size}</span>
                              <span>•</span>
                              <span>{transcript.words} words</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(transcript.status)}
                          <Button variant="ghost" size="sm" title="Play">
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Download">
                            <Download className="h-4 w-4" />
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
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Transcripts;
