"use client";

import { Mic, Square } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: ((event: Event) => void) | null;
  start(): void;
  stop(): void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export type VoiceInputButtonProps = {
  onTranscript: (value: string) => void;
  label?: string;
  className?: string;
};

export function VoiceInputButton({
  onTranscript,
  label = "Dictate",
  className,
}: VoiceInputButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const candidate =
      window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;

    if (!candidate) {
      return;
    }

    setIsSupported(true);
    const recognition = new candidate();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (transcript.length > 0) {
        onTranscript(transcript);
      }
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [onTranscript]);

  const startRecording = useCallback(() => {
    if (!recognitionRef.current) {
      return;
    }
    recognitionRef.current.start();
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  }, []);

  const handleClick = useCallback(() => {
    if (!isSupported) {
      return;
    }
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, isSupported, startRecording, stopRecording]);

  const icon = useMemo(
    () =>
      isRecording ? <Square className="size-4" /> : <Mic className="size-4" />,
    [isRecording],
  );

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      aria-pressed={isRecording}
      className={className}
      onClick={handleClick}
      type="button"
      variant={isRecording ? "destructive" : "ghost"}
    >
      {icon}
      <span className="sr-only">{label}</span>
    </Button>
  );
}
