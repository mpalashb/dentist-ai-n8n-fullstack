import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Mic,
  Square,
  Play,
  Pause,
  Download,
  Trash2,
  Save,
  Clock,
  Volume2,
} from "lucide-react";

const Voice = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordings, setRecordings] = useState<any[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize recordings with mock data
  useEffect(() => {
    setRecordings([
      {
        id: 1,
        name: "Meeting Notes",
        date: "2025-01-10",
        duration: "5:23",
        size: "2.4 MB",
      },
      {
        id: 2,
        name: "Client Call",
        date: "2025-01-09",
        duration: "12:45",
        size: "1.8 MB",
      },
      {
        id: 3,
        name: "Voice Memo",
        date: "2025-01-08",
        duration: "1:52",
        size: "3.2 MB",
      },
    ]);
  }, []);

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        setRecordedAudio(audioBlob);
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);

      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Play/pause recorded audio
  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Save recording
  const saveRecording = () => {
    if (recordedAudio && audioUrl) {
      const newRecording = {
        id: recordings.length + 1,
        name: `Recording ${recordings.length + 1}`,
        date: new Date().toISOString().split("T")[0],
        duration: formatTime(recordingTime),
        size: `${(recordedAudio.size / (1024 * 1024)).toFixed(2)} MB`,
      };
      setRecordings([newRecording, ...recordings]);

      // Reset recording state
      setRecordedAudio(null);
      setAudioUrl(null);
      setRecordingTime(0);
    }
  };

  // Delete recording
  const deleteRecording = () => {
    setRecordedAudio(null);
    setAudioUrl(null);
    setRecordingTime(0);
  };

  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">New Voice</h1>
            <p className="text-muted-foreground">
              Record and manage your voice recordings
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recording Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Voice Recorder
              </CardTitle>
              <CardDescription>
                Click the record button to start recording your voice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="relative">
                  <Button
                    size="lg"
                    className={`h-24 w-24 rounded-full ${
                      isRecording ? "bg-red-500 hover:bg-red-600" : ""
                    }`}
                    onClick={isRecording ? stopRecording : startRecording}
                  >
                    {isRecording ? (
                      <Square className="h-10 w-10" />
                    ) : (
                      <Mic className="h-10 w-10" />
                    )}
                  </Button>
                  {isRecording && (
                    <div className="absolute -top-2 -right-2">
                      <Badge variant="destructive" className="animate-pulse">
                        Recording
                      </Badge>
                    </div>
                  )}
                </div>

                {isRecording && (
                  <div className="text-center">
                    <div className="text-2xl font-mono">
                      {formatTime(recordingTime)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Recording in progress...
                    </p>
                  </div>
                )}

                {recordedAudio && audioUrl && (
                  <div className="w-full space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Recording: {formatTime(recordingTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={togglePlayback}
                        >
                          {isPlaying ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={saveRecording}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={deleteRecording}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <audio
                      ref={audioRef}
                      src={audioUrl}
                      onEnded={() => setIsPlaying(false)}
                      className="w-full"
                      controls
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Saved Recordings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Saved Recordings
              </CardTitle>
              <CardDescription>
                Your previously recorded voice files
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recordings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No recordings yet
                  </h3>
                  <p className="text-muted-foreground">
                    Record your first voice memo using the recorder
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recordings.map((recording) => (
                    <div
                      key={recording.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <h3 className="font-medium">{recording.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{recording.date}</span>
                          <span>•</span>
                          <span>{recording.duration}</span>
                          <span>•</span>
                          <span>{recording.size}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" title="Play">
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Download">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Voice;
