import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  Brain, 
  TrendingUp, 
  Target,
  CheckCircle2,
  Zap,
  Rocket,
  BookOpen
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useModuleLearning } from "@/hooks/useModuleLearning";

export default function CareerDevelopment() {
  const [goalType, setGoalType] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [progress, setProgress] = useState(5);
  const [action, setAction] = useState("");
  const [notes, setNotes] = useState("");

  // Self-learning integration
  const { trackInteraction, effectiveTechniques, effectiveness } = useModuleLearning('career');

  // Habit formation integration
  const createHabitMutation = trpc.habits.createHabit.useMutation({
    onSuccess: () => {
      toast.success("Career habit created!");
      trackInteraction('habit_created', { type: 'career' });
    }
  });

  const logCareerGoalMutation = trpc.wellness.logCareerGoal.useMutation({
    onSuccess: () => {
      toast.success("Career goal logged - building your future");
      trackInteraction('career_logged', { 
        type: goalType, 
        progress,
        action 
      });
      setGoalType("");
      setGoalDescription("");
      setProgress(5);
      setAction("");
      setNotes("");
    }
  });

  const handleLogGoal = () => {
    if (!goalType || !goalDescription) {
      toast.error("Please select goal type and description");
      return;
    }

    logCareerGoalMutation.mutate({
      type: goalType,
      description: goalDescription,
      progress,
      action,
      notes,
      timestamp: Date.now()
    });
  };

  const handleCreateSkillHabit = () => {
    createHabitMutation.mutate({
      name: "Daily Skill Development",
      description: "30 minutes learning/practicing career skills. Compound growth over time.",
      frequency: "daily",
      category: "career",
      evidenceLevel: "B",
      researchBasis: "Deliberate practice drives expertise development (Ericsson et al., 1993)"
    });
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
          <Briefcase className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Career Development</h1>
          <p className="text-muted-foreground">Evidence-based career growth & skill building</p>
        </div>
      </div>

      {/* Evidence-Based Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Rocket className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-semibold text-blue-900">Career Success = Skills + Strategy + Consistency</p>
              <p className="text-sm text-blue-800">
                Career development isn't about working harder - it's about deliberate practice, strategic networking, 
                and consistent skill-building. Research shows: 10,000 hours makes you world-class, but 1 hour/day 
                for 10 years gets you there.
              </p>
              <p className="text-sm text-blue-800">
                <strong>Key insight:</strong> Your career is a long game. Small daily investments compound into 
                massive results.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Self-Learning Insights */}
      {effectiveness > 0 && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">Your Career Progress</h3>
            </div>
            <div className="space-y-2 text-sm text-purple-800">
              <p>Tracking effectiveness: {effectiveness}%</p>
              {effectiveTechniques().map((rec, i) => (
                <p key={i}>• {rec}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="track" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="track">Track Goals</TabsTrigger>
          <TabsTrigger value="strategies">Career Strategies</TabsTrigger>
          <TabsTrigger value="habits">Build Habits</TabsTrigger>
          <TabsTrigger value="science">The Science</TabsTrigger>
        </TabsList>

        {/* Track Career Goals */}
        <TabsContent value="track" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Log Career Goal Progress
              </CardTitle>
              <CardDescription>
                Track goals and actions to build momentum
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Goal Type</Label>
                <Select value={goalType} onValueChange={setGoalType}>
                  <SelectTrigger>
                    <SelectValue placeholder="What are you working on?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skill_development">Skill Development</SelectItem>
                    <SelectItem value="promotion">Promotion/Advancement</SelectItem>
                    <SelectItem value="job_search">Job Search/Career Change</SelectItem>
                    <SelectItem value="networking">Networking/Relationships</SelectItem>
                    <SelectItem value="side_project">Side Project/Business</SelectItem>
                    <SelectItem value="certification">Certification/Education</SelectItem>
                    <SelectItem value="leadership">Leadership Development</SelectItem>
                    <SelectItem value="portfolio">Portfolio/Personal Brand</SelectItem>
                    <SelectItem value="income">Income Growth</SelectItem>
                    <SelectItem value="work_life_balance">Work-Life Balance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Goal Description</Label>
                <Input
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                  placeholder="e.g., Learn React, Get promoted to Senior, Launch side business"
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
                  <Badge variant={progress > 7 ? "default" : progress > 4 ? "secondary" : "outline"}>
                    {progress}/10
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  0 = Just started, 10 = Goal achieved
                </p>
              </div>

              <div className="space-y-2">
                <Label>Action Taken Today</Label>
                <Select value={action} onValueChange={setAction}>
                  <SelectTrigger>
                    <SelectValue placeholder="What did you do?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="learned">Learned/Studied</SelectItem>
                    <SelectItem value="practiced">Practiced Skill</SelectItem>
                    <SelectItem value="networked">Networked/Connected</SelectItem>
                    <SelectItem value="applied">Applied for Job/Opportunity</SelectItem>
                    <SelectItem value="built">Built/Created Something</SelectItem>
                    <SelectItem value="shipped">Shipped/Delivered Work</SelectItem>
                    <SelectItem value="got_feedback">Got Feedback/Mentorship</SelectItem>
                    <SelectItem value="planned">Planned/Strategized</SelectItem>
                    <SelectItem value="researched">Researched Industry/Role</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Wins, lessons learned, next steps..."
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleLogGoal} 
                className="w-full"
                disabled={logCareerGoalMutation.isPending}
              >
                {logCareerGoalMutation.isPending ? "Logging..." : "Log Career Progress"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Career Strategies */}
        <TabsContent value="strategies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Evidence-Based Career Strategies
              </CardTitle>
              <CardDescription>
                Research-backed approaches to career growth
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Deliberate Practice */}
              <div className="p-4 border-2 border-green-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Deliberate Practice (Not Just Hours)</h3>
                  <Badge className="bg-green-600">Level A Evidence</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>The strategy:</strong> Practice at the edge of your ability with immediate feedback. 
                  Focus on weaknesses, not strengths. Quality &gt; quantity.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Why it works:</strong> 10,000 hours doesn't make you an expert - 10,000 hours of 
                  deliberate practice does. Mindless repetition doesn't improve skill.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Research: Ericsson et al. (1993), expertise development requires deliberate practice
                </p>
              </div>

              {/* Build in Public */}
              <div className="p-4 border-2 border-blue-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Build in Public / Show Your Work</h3>
                  <Badge className="bg-blue-600">Level B Evidence</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>The strategy:</strong> Share your learning journey publicly (blog, Twitter, GitHub, 
                  LinkedIn). Document what you're building and learning.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Why it works:</strong> Creates serendipity - opportunities find you. Builds credibility, 
                  attracts mentors, and forces you to learn deeply (teaching effect).
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Research: Public commitment increases goal achievement (Gollwitzer & Sheeran, 2006)
                </p>
              </div>

              {/* Strategic Networking */}
              <div className="p-4 border-2 border-purple-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Strategic Networking (Weak Ties Matter)</h3>
                  <Badge className="bg-purple-600">Level A Evidence</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>The strategy:</strong> Build relationships with people outside your immediate circle. 
                  Weak ties (acquaintances) provide more opportunities than close friends.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Why it works:</strong> Your close friends know the same opportunities you do. Weak ties 
                  connect you to different networks and information.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Research: Granovetter (1973), "strength of weak ties" - most jobs come from acquaintances
                </p>
              </div>

              {/* T-Shaped Skills */}
              <div className="p-4 border-2 border-green-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">T-Shaped Skills (Deep + Broad)</h3>
                  <Badge className="bg-green-600">Level B Evidence</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>The strategy:</strong> Go deep in one area (vertical bar of T), but have broad knowledge 
                  across related fields (horizontal bar).
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Why it works:</strong> Specialists are replaceable, generalists lack depth. T-shaped 
                  people are rare and valuable - they can collaborate across domains.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Research: Hansen & von Oetinger (2001), T-shaped professionals drive innovation
                </p>
              </div>

              {/* Career Capital */}
              <div className="p-4 border-2 border-blue-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Build Career Capital (Skills = Leverage)</h3>
                  <Badge className="bg-blue-600">Level B Evidence</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>The strategy:</strong> Focus on building rare and valuable skills first. Passion follows 
                  mastery, not the other way around.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Why it works:</strong> "Follow your passion" is bad advice. Build skills → gain autonomy 
                  and control → passion emerges.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Research: Newport (2012), "So Good They Can't Ignore You" - skills beat passion
                </p>
              </div>

              {/* Compound Learning */}
              <div className="p-4 border-2 border-purple-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">1% Better Every Day (Compound Learning)</h3>
                  <Badge className="bg-purple-600">Level B Evidence</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>The math:</strong> 1% improvement daily = 37x better in a year. 1 hour/day for 10 years 
                  = world-class expertise.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Why it works:</strong> Small consistent actions compound exponentially. Most people 
                  overestimate what they can do in a week, underestimate what they can do in a year.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Research: Clear (2018), "Atomic Habits" - small habits compound into remarkable results
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Build Career Habits */}
        <TabsContent value="habits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Build Career Development Habits
              </CardTitle>
              <CardDescription>
                Daily actions that compound into career success
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Career Compounding:</strong> 30 minutes of skill-building daily = 182 hours/year. 
                  That's 4.5 work weeks of pure learning. Most people don't do this - which is why it works.
                </p>
              </div>

              <div className="p-4 border rounded-lg space-y-3">
                <h3 className="font-semibold">Daily Skill Development</h3>
                <p className="text-sm text-muted-foreground">
                  30 minutes learning/practicing career skills. Compound growth over time.
                </p>
                <Button onClick={handleCreateSkillHabit} variant="outline" className="w-full">
                  Create Daily Skill Habit
                </Button>
              </div>

              <div className="p-4 border rounded-lg space-y-2">
                <h3 className="font-semibold">Other Career Habits</h3>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• <strong>Morning learning</strong> - 30 min before work (books, courses, practice)</li>
                  <li>• <strong>Ship something weekly</strong> - Build portfolio, not just consume</li>
                  <li>• <strong>Network monthly</strong> - Coffee chat with someone new</li>
                  <li>• <strong>Share publicly</strong> - Write/post what you're learning</li>
                  <li>• <strong>Get feedback</strong> - Ask for critique, don't avoid it</li>
                  <li>• <strong>Track wins</strong> - Document accomplishments for reviews/interviews</li>
                </ul>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-900">
                  <strong>Research:</strong> People who dedicate 5+ hours/week to learning are 47% more likely 
                  to be promoted (LinkedIn Learning Report, 2019)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* The Science */}
        <TabsContent value="science" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                The Science of Career Success
              </CardTitle>
              <CardDescription>
                What research says about career growth
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border-2 border-blue-200 rounded-lg space-y-3">
                <h3 className="font-semibold text-lg">The 10,000 Hour Rule (Misunderstood)</h3>
                <p className="text-sm text-muted-foreground">
                  Malcolm Gladwell popularized "10,000 hours to mastery," but that's not the full story. It's 
                  10,000 hours of <strong>deliberate practice</strong> - focused, uncomfortable, with feedback.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Reality:</strong> 1 hour/day of deliberate practice = 10,000 hours in ~27 years. But 
                  you can reach "good enough" in 100-300 hours, and "very good" in 1,000-3,000 hours.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Research: Ericsson et al. (1993), Kaufman (2013) - "first 20 hours" principle
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Career Success Factors</h3>
                
                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-1">Skills &gt; Credentials</h4>
                  <p className="text-sm text-muted-foreground">
                    Employers increasingly value demonstrable skills over degrees. Portfolio beats resume. 
                    Build in public to prove your abilities.
                  </p>
                </div>

                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-1">Network = Net Worth</h4>
                  <p className="text-sm text-muted-foreground">
                    70-85% of jobs are filled through networking, not job boards. Weak ties (acquaintances) 
                    provide more opportunities than close friends (Granovetter, 1973)
                  </p>
                </div>

                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-1">Consistency Beats Intensity</h4>
                  <p className="text-sm text-muted-foreground">
                    30 min/day for a year beats weekend binges. Habit formation research shows: small daily 
                    actions compound, intense bursts don't stick (Clear, 2018)
                  </p>
                </div>

                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-1">Feedback Accelerates Growth</h4>
                  <p className="text-sm text-muted-foreground">
                    Seeking feedback (even negative) predicts career success. People who actively seek critique 
                    advance faster (Ashford & Cummings, 1983)
                  </p>
                </div>

                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-1">Career Capital &gt; Passion</h4>
                  <p className="text-sm text-muted-foreground">
                    "Follow your passion" is bad advice. Build rare/valuable skills first → gain autonomy → 
                    passion follows (Newport, 2012)
                  </p>
                </div>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold mb-2">Key Researchers & Books</h4>
                <ul className="text-sm space-y-1">
                  <li>• <strong>Anders Ericsson</strong> - Deliberate practice, expertise development</li>
                  <li>• <strong>Cal Newport</strong> - "So Good They Can't Ignore You", deep work</li>
                  <li>• <strong>James Clear</strong> - "Atomic Habits", 1% better daily</li>
                  <li>• <strong>Mark Granovetter</strong> - "Strength of weak ties", networking research</li>
                </ul>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900">Your Career is a Long Game</p>
                    <p className="text-sm text-green-800 mt-1">
                      You'll work 40+ years. Small daily investments compound into massive advantages. 30 min/day 
                      of deliberate practice = 182 hours/year = 7,280 hours over 40 years. That's enough to become 
                      world-class at anything. Start today.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
