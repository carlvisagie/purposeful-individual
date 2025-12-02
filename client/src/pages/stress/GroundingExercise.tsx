import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, ArrowRight } from "lucide-react";

/**
 * 5-4-3-2-1 GROUNDING TECHNIQUE
 * 
 * Evidence-based anxiety reduction (MBSR, CBT)
 * Engages all 5 senses to anchor to present moment
 * 
 * Benefits:
 * - Interrupts anxiety spirals
 * - Brings awareness to present
 * - Reduces rumination
 */

const STEPS = [
  {
    number: 5,
    sense: "See",
    prompt: "Name 5 things you can see around you",
    placeholder: "The lamp on my desk...",
  },
  {
    number: 4,
    sense: "Touch",
    prompt: "Name 4 things you can touch",
    placeholder: "The texture of my chair...",
  },
  {
    number: 3,
    sense: "Hear",
    prompt: "Name 3 things you can hear",
    placeholder: "Birds chirping outside...",
  },
  {
    number: 2,
    sense: "Smell",
    prompt: "Name 2 things you can smell",
    placeholder: "Coffee brewing...",
  },
  {
    number: 1,
    sense: "Taste",
    prompt: "Name 1 thing you can taste",
    placeholder: "The mint from my toothpaste...",
  },
];

interface GroundingExerciseProps {
  onComplete: (durationSeconds: number) => void;
}

export default function GroundingExercise({ onComplete }: GroundingExerciseProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<string[][]>(STEPS.map(() => []));
  const [currentInput, setCurrentInput] = useState("");
  const [startTime] = useState(Date.now());

  const step = STEPS[currentStep];
  const currentResponses = responses[currentStep];
  const isStepComplete = currentResponses.length >= step.number;
  const isExerciseComplete = currentStep === STEPS.length - 1 && isStepComplete;

  const handleAddResponse = () => {
    if (!currentInput.trim()) return;

    const newResponses = [...responses];
    newResponses[currentStep] = [...newResponses[currentStep], currentInput.trim()];
    setResponses(newResponses);
    setCurrentInput("");
  };

  const handleNext = () => {
    if (isExerciseComplete) {
      const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
      onComplete(durationSeconds);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && currentInput.trim()) {
      handleAddResponse();
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Step {currentStep + 1} of {STEPS.length}
        </div>
        <div className="flex gap-2">
          {STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-8 rounded-full ${
                index <= currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Current Step */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {step.number} - {step.sense}
          </CardTitle>
          <CardDescription className="text-base">{step.prompt}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input */}
          <div className="space-y-2">
            <Label htmlFor="response">Your response</Label>
            <div className="flex gap-2">
              <Input
                id="response"
                placeholder={step.placeholder}
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isStepComplete}
              />
              <Button
                onClick={handleAddResponse}
                disabled={!currentInput.trim() || isStepComplete}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Responses */}
          {currentResponses.length > 0 && (
            <div className="space-y-2">
              {currentResponses.map((response, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>{response}</span>
                </div>
              ))}
            </div>
          )}

          {/* Progress indicator */}
          <div className="text-sm text-muted-foreground">
            {currentResponses.length} of {step.number} complete
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-4">
        <Button
          onClick={handleNext}
          disabled={!isStepComplete}
          size="lg"
          className="flex-1"
        >
          {isExerciseComplete ? (
            "Complete Exercise"
          ) : (
            <>
              Next Step
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Instructions */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>
            The 5-4-3-2-1 technique is a grounding exercise that helps you anchor to the present
            moment when feeling anxious or overwhelmed.
          </p>
          <p>
            By engaging all five senses, you interrupt anxious thoughts and bring your attention
            back to your immediate surroundings.
          </p>
          <p className="text-muted-foreground mt-2">
            <strong>Tip:</strong> Take your time with each step. Really notice the details.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
