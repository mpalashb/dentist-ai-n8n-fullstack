import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface AudioPlayerProps {
  audioUrl: string;
  title?: string;
  className?: string;
}

const AudioPlayer = ({ audioUrl, title, className = "" }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  // Initialize audio
  useEffect(() => {
    if (!audioUrl) {
      setError("No audio URL provided");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setErrorDetails(null);

    const audio = new Audio();
    audioRef.current = audio;

    const handleLoadedData = () => {
      setIsLoading(false);
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = (e: any) => {
      console.error("Audio error:", e);
      console.error("Audio element:", audio);
      console.error("Audio URL:", audioUrl);

      let errorMessage = "Failed to load audio";
      let detailsMessage = null;

      // Try to get more specific error information
      if (audio.error) {
        switch (audio.error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = "Audio playback was aborted";
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = "Network error occurred while loading audio";
            detailsMessage = "Please check your internet connection";
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = "Audio format is not supported";
            detailsMessage =
              "The audio file may be corrupted or in an unsupported format";
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = "Audio source is not supported";
            detailsMessage =
              "The audio URL may be invalid or the file may not exist";
            break;
          default:
            errorMessage = `Error loading audio: ${
              audio.error.message || "Unknown error"
            }`;
        }
      }

      // Check if the URL is accessible
      fetch(audioUrl, { method: "HEAD" })
        .then((response) => {
          if (!response.ok) {
            detailsMessage = `Server returned ${response.status}: ${response.statusText}`;
          } else if (!response.headers.get("Content-Type")?.includes("audio")) {
            detailsMessage = "URL does not point to an audio file";
          }
        })
        .catch((err) => {
          detailsMessage = `Network error: ${err.message}`;
        })
        .finally(() => {
          setError(errorMessage);
          setErrorDetails(detailsMessage);
          setIsLoading(false);
        });
    };

    audio.addEventListener("loadeddata", handleLoadedData);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    // Set the src after adding event listeners
    audio.src = audioUrl;
    audio.load();

    // Cleanup
    return () => {
      audio.removeEventListener("loadeddata", handleLoadedData);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.pause();
    };
  }, [audioUrl]);

  // Toggle play/pause
  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.error("Error playing audio:", err);
        setError("Failed to play audio");
        setErrorDetails(err.message || "Unknown playback error");
      });
    }
    setIsPlaying(!isPlaying);
  };

  // Toggle mute
  const toggleMute = () => {
    if (!audioRef.current) return;

    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !audioRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = offsetX / width;

    audioRef.current.currentTime = percentage * duration;
    setCurrentTime(percentage * duration);
  };

  // Retry loading the audio
  const retryLoading = () => {
    if (!audioRef.current || !audioUrl) return;

    setIsLoading(true);
    setError(null);
    setErrorDetails(null);

    audioRef.current.src = audioUrl;
    audioRef.current.load();
  };

  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="text-center">
            <div className="flex items-center justify-center text-red-500 mb-2">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p className="font-medium">{error}</p>
            </div>
            {errorDetails && (
              <p className="text-sm text-muted-foreground mb-3">
                {errorDetails}
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={retryLoading}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        {title && (
          <div className="mb-2">
            <h3 className="font-medium truncate">{title}</h3>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlayback}
                disabled={isLoading}
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
                onClick={toggleMute}
                disabled={isLoading}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>

              <div className="text-sm text-muted-foreground">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div
              ref={progressBarRef}
              className="w-full h-2 bg-muted rounded-full cursor-pointer"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AudioPlayer;
