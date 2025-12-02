import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw } from "lucide-react";

/**
 * BOX BREATHING TECHNIQUE
 * 
 * Evidence-based stress reduction (Navy SEALs, Andrew Huberman)
 * Pattern: Inhale 4s → Hold 4s → Exhale 4s → Hold 4s
 * 
 * Benefits:
 * - Activates parasympathetic nervous system
 * - Reduces cortisol
 * - Improves focus and calm
 */

const PHASES = ["Inhale", "Hold", "Exhale", "Hold"] as const;
const PHASE_DURATION = 4000; // 4 seconds per phase
const TOTAL_CYCLE_DURATION = PHASE_DURATION * 4; // 16 seconds

interface BoxBreathingProps {
  onComplete: (durationSeconds: number) => void;
}

export default function BoxBreathing({ onComplete }: BoxBreathingProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [cycleCount, setcycleCount] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const startTime = Date.now() - (currentPhase * PHASE_DURATION + (progress / 100) * PHASE_DURATION);
    
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      const currentCycle = Math.floor(elapsed / TOTAL_CYCLE_DURATION);
      const phaseElapsed = elapsed % TOTAL_CYCLE_DURATION;
      const phase = Math.floor(phaseElapsed / PHASE_DURATION);
      const phaseProgress = ((phaseElapsed % PHASE_DURATION) / PHASE_DURATION) * 100;

      setCurrentPhase(phase);
      setProgress(phaseProgress);
      setElapsedSeconds(Math.floor(elapsed / 1000));
      setcycleCount(currentCycle);
    }, 50);

    return () => clearInterval(interval);
  }, [isActive, currentPhase, progress]);

  const handleStart = () => {
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setCurrentPhase(0);
    setProgress(0);
    setElapsedSeconds(0);
    setcycleCount(0);
  };

  const handleFinish = () => {
    onComplete(elapsedSeconds);
    handleReset();
  };

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  return (
    <div className="space-y-6">
      {/* Breathing Circle Animation */}
      <div className="flex items-center justify-center">
        <div className="relative w-64 h-64">
          {/* Outer circle */}
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          
          {/* Animated breathing circle */}
          <div
            className={`absolute inset-0 rounded-full bg-primary/20 border-4 border-primary transition-all duration-[4000ms] ease-in-out flex items-center justify-center ${
              isActive ? "animate-pulse" : ""
            }`}
            style={{
              transform: currentPhase === 0 || currentPhase === 2
                ? `scale(${currentPhase === 0 ? 1 + progress / 100 : 2 - progress / 100})`
                : currentPhase === 1
                ? "scale(2)"
                : "scale(1)",
            }}
          >
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{PHASES[currentPhase]}</div>
              <div className="text-lg text-muted-foreground">
                {Math.ceil((PHASE_DURATION - (progress / 100) * PHASE_DURATION) / 1000)}s
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Phase Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {minutes}:{seconds.toString().padStart(2, "0")}
              </div>
              <div className="text-sm text-muted-foreground">Duration</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{cycleCount}</div>
              <div className="text-sm text-muted-foreground">Cycles</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        {!isActive ? (
          <Button onClick={handleStart} size="lg" className="flex-1">
            <Play className="h-4 w-4 mr-2" />
            Start
          </Button>
        ) : (
          <Button onClick={handlePause} size="lg" variant="outline" className="flex-1">
            <Pause className="h-4 w-4 mr-2" />
            Pause
          </Button>
        )}
        <Button onClick={handleReset} size="lg" variant="outline">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        {elapsedSeconds > 0 && (
          <Button onClick={handleFinish} size="lg" variant="default">
            Finish & Save
          </Button>
        )}
      </div>

      {/* Instructions */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>Box breathing is used by Navy SEALs and elite performers to manage stress.</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Inhale through your nose for 4 seconds</li>
            <li>Hold your breath for 4 seconds</li>
            <li>Exhale through your mouth for 4 seconds</li>
            <li>Hold your breath for 4 seconds</li>
            <li>Repeat for 5-10 minutes</li>
          </ol>
          <p className="text-muted-foreground mt-2">
            <strong>Recommended:</strong> Practice 3-5 cycles (1-2 minutes) for quick stress relief.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
