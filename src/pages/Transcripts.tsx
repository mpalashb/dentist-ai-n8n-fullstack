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
import { useAuth } from "@/contexts/AuthContext";
import {
  getVoiceRecords,
  getVoiceRecordsByStatus,
  searchVoiceRecords,
  type VoiceRecord,
} from "@/services/voiceRecordService";
import AudioPlayer from "@/components/AudioPlayer";

const Transcripts = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [transcripts, setTranscripts] = useState<VoiceRecord[]>([]);
  const [filteredTranscripts, setFilteredTranscripts] = useState<VoiceRecord[]>(
    []
  );
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(
    null
  );

  // Format time in seconds to MM:SS format
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Fetch transcripts from Supabase
  useEffect(() => {
    const fetchTranscripts = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const { records } = await getVoiceRecords();
        setTranscripts(records);
        setFilteredTranscripts(records);
      } catch (error) {
        console.error("Error fetching transcripts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTranscripts();
  }, [user]);

  // Filter transcripts based on search term and status
  useEffect(() => {
    const filterTranscripts = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        let records: VoiceRecord[] = [];

        if (searchTerm) {
          const result = await searchVoiceRecords(searchTerm);
          records = result.records;
        } else if (statusFilter !== "all") {
          const result = await getVoiceRecordsByStatus(statusFilter);
          records = result.records;
        } else {
          const result = await getVoiceRecords();
          records = result.records;
        }

        setFilteredTranscripts(records);
      } catch (error) {
        console.error("Error filtering transcripts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    filterTranscripts();
  }, [searchTerm, statusFilter, user]);

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
    return transcripts.filter((t) => t.processing_status === status).length;
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
                      <div key={transcript.id}>
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              {getStatusIcon(
                                transcript.processing_status || "pending"
                              )}
                            </div>
                            <div>
                              <h3 className="font-medium">
                                {transcript.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    {new Date(
                                      transcript.created_at
                                    ).toLocaleString()}
                                  </span>
                                </div>
                                <span>•</span>
                                <span>
                                  {formatTime(transcript.duration || 0)}
                                </span>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span>
                                    User {transcript.profile_id.substring(0, 8)}
                                  </span>
                                </div>
                                <span>•</span>
                                <span>
                                  {transcript.file_size
                                    ? (
                                        transcript.file_size /
                                        (1024 * 1024)
                                      ).toFixed(2)
                                    : "0.00"}{" "}
                                  MB
                                </span>
                                <span>•</span>
                                <span>
                                  {transcript.transcript
                                    ? transcript.transcript.split(" ").length
                                    : 0}{" "}
                                  words
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(
                              transcript.processing_status || "pending"
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Play"
                              onClick={() =>
                                setCurrentlyPlayingId(
                                  currentlyPlayingId === transcript.id
                                    ? null
                                    : transcript.id
                                )
                              }
                            >
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
                        {currentlyPlayingId === transcript.id && (
                          <div className="mt-2">
                            <AudioPlayer
                              audioUrl={transcript.file_url}
                              title={transcript.title}
                            />
                          </div>
                        )}
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
