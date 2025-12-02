import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, ArrowRight, Check } from "lucide-react";

/**
 * DECISION FATIGUE ELIMINATOR
 * 
 * Pre-made decision trees for common scenarios to reduce cognitive load.
 * Based on master prompt: "You never require me to choose."
 */

interface DecisionTree {
  id: string;
  title: string;
  description: string;
  steps: DecisionStep[];
}

interface DecisionStep {
  question: string;
  options: {
    text: string;
    next?: number;
    result?: string;
  }[];
}

const DECISION_TREES: DecisionTree[] = [
  {
    id: "morning-energy",
    title: "Morning Energy Decision",
    description: "What to do when you wake up low energy",
    steps: [
      {
        question: "Did you sleep less than 6 hours?",
        options: [
          { text: "Yes", next: 1 },
          { text: "No", next: 2 },
        ],
      },
      {
        question: "Can you take a 20-minute nap right now?",
        options: [
          { text: "Yes", result: "Take a 20-minute power nap, then do light movement (10-minute walk). Skip intense workout today." },
          { text: "No", result: "Cold shower (2 minutes), then 10-minute walk outside. Caffeine after movement, not before." },
        ],
      },
      {
        question: "Did you hydrate (16oz water) within 30 minutes of waking?",
        options: [
          { text: "Yes", result: "Do 5-minute movement (jumping jacks, pushups). Energy will come. Start with easiest task on list." },
          { text: "No", result: "Drink 16oz water NOW. Wait 10 minutes. Do 5-minute movement. Energy follows action, not feeling." },
        ],
      },
    ],
  },
  {
    id: "overwhelm",
    title: "Overwhelm Protocol",
    description: "What to do when feeling overwhelmed",
    steps: [
      {
        question: "Can you step away for 5 minutes right now?",
        options: [
          { text: "Yes", next: 1 },
          { text: "No", result: "Box breathing: 4-count in, 4-count hold, 4-count out, 4-count hold. Repeat 5 times. Then tackle ONE thing." },
        ],
      },
      {
        question: "Is this physical (body) or mental (mind) overwhelm?",
        options: [
          { text: "Physical", result: "5-minute walk outside. Drink water. Do 10 pushups. Physical overwhelm needs physical release." },
          { text: "Mental", result: "Brain dump: Write everything on paper for 3 minutes. Pick ONE item. Do it for 10 minutes. Momentum kills overwhelm." },
          { text: "Both", result: "Walk outside for 5 minutes while doing brain dump on phone. Return. Pick ONE thing. Do it." },
        ],
      },
    ],
  },
  {
    id: "procrastination",
    title: "Procrastination Breaker",
    description: "What to do when avoiding important task",
    steps: [
      {
        question: "Is the task unclear or too big?",
        options: [
          { text: "Unclear", result: "Spend 2 minutes defining EXACTLY what done looks like. Write one sentence. Then start." },
          { text: "Too big", next: 1 },
          { text: "Neither", next: 2 },
        ],
      },
      {
        question: "Can you do just 2 minutes of it right now?",
        options: [
          { text: "Yes", result: "Set timer for 2 minutes. Do ONLY that. Stop when timer ends. Repeat if momentum builds." },
          { text: "No", result: "Task is still too big. Break into smaller piece. What's the absolute smallest first step? Do that." },
        ],
      },
      {
        question: "Are you afraid of failure or judgment?",
        options: [
          { text: "Yes", result: "Reframe: This is practice, not performance. Do it badly on purpose. Perfection kills action. Start messy." },
          { text: "No", result: "You're in a dopamine deficit. Do 10 pushups or 2-minute cold water. Then start immediately. No thinking." },
        ],
      },
    ],
  },
  {
    id: "emotional-spiral",
    title: "Emotional Spiral Stopper",
    description: "What to do when stuck in negative thought loop",
    steps: [
      {
        question: "Have you been thinking about this for more than 10 minutes?",
        options: [
          { text: "Yes", next: 1 },
          { text: "No", result: "Set 5-minute timer. Think it through ONCE. Write conclusion. Move on. Thinking time is over." },
        ],
      },
      {
        question: "Is this about past or future?",
        options: [
          { text: "Past", result: "Past is data, not destiny. Write: 'What I learned:' and 'What I'll do differently:'. Then close the loop. Done." },
          { text: "Future", result: "Future anxiety needs action plan. Write 3 things you CAN control right now. Do one. Control kills anxiety." },
          { text: "Present", result: "If it's happening now, you need action not analysis. What's ONE thing you can do in next 5 minutes? Do it." },
        ],
      },
    ],
  },
];

export default function DecisionHelper() {
  const [selectedTree, setSelectedTree] = useState<DecisionTree | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState<string | null>(null);

  const handleOptionClick = (option: any) => {
    if (option.result) {
      setResult(option.result);
    } else if (option.next !== undefined) {
      setCurrentStep(option.next);
    }
  };

  const reset = () => {
    setSelectedTree(null);
    setCurrentStep(0);
    setResult(null);
  };

  if (!selectedTree) {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Brain className="h-10 w-10 text-blue-500" />
            Decision Fatigue Eliminator
          </h1>
          <p className="text-muted-foreground mt-2">
            Pre-made decision trees. No thinking required. Just follow the path.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {DECISION_TREES.map((tree) => (
            <Card key={tree.id} className="cursor-pointer hover:border-blue-500 transition-colors" onClick={() => setSelectedTree(tree)}>
              <CardHeader>
                <CardTitle>{tree.title}</CardTitle>
                <CardDescription>{tree.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Start Decision Tree
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Check className="h-6 w-6" />
              Your Action Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 dark:bg-green-950 p-6 rounded-lg">
              <p className="text-lg leading-relaxed">{result}</p>
            </div>
            <div className="flex gap-4">
              <Button onClick={reset} variant="outline" className="flex-1">
                Start Over
              </Button>
              <Button onClick={() => setResult(null)} className="flex-1">
                Try Different Path
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const step = selectedTree.steps[currentStep];

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{selectedTree.title}</CardTitle>
          <CardDescription>Step {currentStep + 1} of {selectedTree.steps.length}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg">
            <p className="text-xl font-medium">{step.question}</p>
          </div>

          <div className="space-y-3">
            {step.options.map((option, idx) => (
              <Button
                key={idx}
                onClick={() => handleOptionClick(option)}
                variant="outline"
                className="w-full justify-start text-left h-auto py-4 px-6"
              >
                {option.text}
                <ArrowRight className="ml-auto h-5 w-5" />
              </Button>
            ))}
          </div>

          <Button onClick={reset} variant="ghost" className="w-full">
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
