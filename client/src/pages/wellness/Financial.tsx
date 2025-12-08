import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Target, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useModuleLearning } from "@/hooks/useModuleLearning";

export default function FinancialWellness() {
  const [goalType, setGoalType] = useState("");
  const [amount, setAmount] = useState("");
  const [progress, setProgress] = useState(5);
  const [notes, setNotes] = useState("");

  const { trackInteraction, getRecommendations, effectiveness } = useModuleLearning('financial');

  const createHabitMutation = trpc.habits.createHabit.useMutation({
    onSuccess: () => {
      toast.success("Financial habit created!");
      trackInteraction('habit_created', { type: 'financial' });
    }
  });

  const logFinancialGoalMutation = trpc.wellness.logFinancialGoal.useMutation({
    onSuccess: () => {
      toast.success("Financial goal logged");
      trackInteraction('financial_logged', { type: goalType, amount, progress });
      setGoalType("");
      setAmount("");
      setProgress(5);
      setNotes("");
    }
  });

  const handleLogGoal = () => {
    if (!goalType) {
      toast.error("Please select goal type");
      return;
    }

    logFinancialGoalMutation.mutate({
      type: goalType,
      amount,
      progress,
      notes,
      timestamp: Date.now()
    });
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
          <DollarSign className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Financial Wellness</h1>
          <p className="text-muted-foreground">Evidence-based money management & financial freedom</p>
        </div>
      </div>

      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <p className="text-sm text-green-900">
            <strong>Financial wellness = freedom.</strong> Research shows: financial stress is the #1 cause of 
            anxiety. Build emergency fund → eliminate debt → invest consistently → achieve financial independence.
          </p>
        </CardContent>
      </Card>

      {effectiveness > 0 && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">Your Financial Progress</h3>
            </div>
            <div className="space-y-2 text-sm text-purple-800">
              <p>Tracking effectiveness: {effectiveness}%</p>
              {getRecommendations().map((rec, i) => (
                <p key={i}>• {rec}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="track" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="track">Track Goals</TabsTrigger>
          <TabsTrigger value="strategies">Money Strategies</TabsTrigger>
          <TabsTrigger value="habits">Build Habits</TabsTrigger>
        </TabsList>

        <TabsContent value="track" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Log Financial Goal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Goal Type</Label>
                <Select value={goalType} onValueChange={setGoalType}>
                  <SelectTrigger>
                    <SelectValue placeholder="What are you working on?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emergency_fund">Emergency Fund (3-6 months)</SelectItem>
                    <SelectItem value="debt_payoff">Debt Payoff</SelectItem>
                    <SelectItem value="retirement">Retirement Savings</SelectItem>
                    <SelectItem value="investment">Investment Goal</SelectItem>
                    <SelectItem value="savings">General Savings</SelectItem>
                    <SelectItem value="income">Increase Income</SelectItem>
                    <SelectItem value="budget">Budget/Spending Control</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Target Amount (Optional)</Label>
                <Input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g., $10,000"
                />
              </div>

              <div className="space-y-2">
                <Label>Progress (0-10)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="range"
                    min="0"
                    max="10"
                    value={progress}
                    onChange={(e) => setProgress(Number(e.target.value))}
                    className="flex-1"
                  />
                  <Badge>{progress}/10</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Progress, wins, challenges..."
                  rows={3}
                />
              </div>

              <Button onClick={handleLogGoal} className="w-full" disabled={logFinancialGoalMutation.isPending}>
                {logFinancialGoalMutation.isPending ? "Logging..." : "Log Financial Goal"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Evidence-Based Money Strategies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border-2 border-green-200 rounded-lg">
                <h3 className="font-semibold mb-2">1. Pay Yourself First (Automate Savings)</h3>
                <p className="text-sm text-muted-foreground">
                  Automate 20% of income to savings/investments before you see it. Research shows: automation 
                  increases savings rate by 73% (Thaler & Benartzi, 2004)
                </p>
              </div>

              <div className="p-4 border-2 border-green-200 rounded-lg">
                <h3 className="font-semibold mb-2">2. Emergency Fund First (3-6 Months)</h3>
                <p className="text-sm text-muted-foreground">
                  Before investing, build 3-6 months expenses in cash. Financial stress destroys mental health. 
                  Emergency fund = peace of mind.
                </p>
              </div>

              <div className="p-4 border-2 border-blue-200 rounded-lg">
                <h3 className="font-semibold mb-2">3. Index Funds &gt; Stock Picking</h3>
                <p className="text-sm text-muted-foreground">
                  90% of active fund managers underperform index funds. Buy low-cost index funds (VTI, VOO) and 
                  hold forever. Time in market &gt; timing market (Bogle, 1999)
                </p>
              </div>

              <div className="p-4 border-2 border-blue-200 rounded-lg">
                <h3 className="font-semibold mb-2">4. Compound Interest = Magic</h3>
                <p className="text-sm text-muted-foreground">
                  $500/month at 8% return = $745k in 30 years. Start early. Einstein: "Compound interest is the 
                  8th wonder of the world."
                </p>
              </div>

              <div className="p-4 border-2 border-purple-200 rounded-lg">
                <h3 className="font-semibold mb-2">5. Increase Income &gt; Cut Expenses</h3>
                <p className="text-sm text-muted-foreground">
                  Cutting lattes has limits. Increasing income has no ceiling. Focus on: skills, side hustles, 
                  career growth, entrepreneurship.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="habits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Build Financial Habits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-900">
                  <strong>Financial freedom = habits.</strong> Automate savings, track spending, invest 
                  consistently. Small actions compound into wealth.
                </p>
              </div>

              <div className="p-4 border rounded-lg space-y-2">
                <h3 className="font-semibold">Key Financial Habits</h3>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• <strong>Automate savings</strong> - 20% of income to investments/savings</li>
                  <li>• <strong>Track spending</strong> - Weekly review of expenses</li>
                  <li>• <strong>Invest monthly</strong> - Dollar-cost averaging into index funds</li>
                  <li>• <strong>Review net worth</strong> - Monthly check-in on progress</li>
                  <li>• <strong>Increase income</strong> - Daily skill-building for career growth</li>
                  <li>• <strong>Avoid lifestyle inflation</strong> - Save raises, don't spend them</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
