import { useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "../lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { TrendingUp, TrendingDown, Minus, Calendar, Activity, Heart, Brain } from "lucide-react";

export default function AutismProgress() {
  const [, params] = useRoute("/autism/progress/:id");
  const profileId = parseInt(params?.id || "0");

  const { data: profile } = trpc.autism.getProfile.useQuery({ id: profileId });
  const { data: outcomes } = trpc.autism.getOutcomes.useQuery({ profileId });

  if (!profile) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  // Calculate trends
  const calculateTrend = (values: number[]) => {
    if (values.length < 2) return "stable";
    const recent = values[values.length - 1];
    const previous = values[values.length - 2];
    if (recent > previous) return "up";
    if (recent < previous) return "down";
    return "stable";
  };

  const atecScores = outcomes?.map((o: any) => o.atecScore).filter(Boolean) || [];
  const behaviorScores = outcomes?.map((o: any) => o.behaviorScore).filter(Boolean) || [];
  const sleepScores = outcomes?.map((o: any) => o.sleepScore).filter(Boolean) || [];
  const familyQOL = outcomes?.map((o: any) => o.familyQOL).filter(Boolean) || [];

  const atecTrend = calculateTrend(atecScores);
  const behaviorTrend = calculateTrend(behaviorScores);
  const sleepTrend = calculateTrend(sleepScores);
  const qolTrend = calculateTrend(familyQOL);

  const TrendIcon = ({ trend, inverse = false }: { trend: string; inverse?: boolean }) => {
    const isGood = inverse ? trend === "down" : trend === "up";
    if (trend === "stable") return <Minus className="h-5 w-5 text-gray-500" />;
    if (isGood) return <TrendingUp className="h-5 w-5 text-green-600" />;
    return <TrendingDown className="h-5 w-5 text-red-600" />;
  };

  return (
    <div className="container mx-auto py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">{profile.childName}'s Progress</h1>
        <p className="text-muted-foreground mt-2">
          Tracking transformation journey with evidence-based outcomes
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ATEC Score</CardTitle>
            <TrendIcon trend={atecTrend} inverse={true} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {atecScores[atecScores.length - 1] || profile.atecScore || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {atecScores.length > 0 ? "Lower is better" : "Add first assessment"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Behavior</CardTitle>
            <TrendIcon trend={behaviorTrend} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {behaviorScores[behaviorScores.length - 1] || "N/A"}/10
            </div>
            <p className="text-xs text-muted-foreground">
              {behaviorScores.length > 0 ? "Parent-reported" : "Start tracking"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sleep Quality</CardTitle>
            <TrendIcon trend={sleepTrend} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sleepScores[sleepScores.length - 1] || "N/A"}/10
            </div>
            <p className="text-xs text-muted-foreground">
              {sleepScores.length > 0 ? "Recent average" : "Start tracking"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Family QOL</CardTitle>
            <TrendIcon trend={qolTrend} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {familyQOL[familyQOL.length - 1] || "N/A"}/10
            </div>
            <p className="text-xs text-muted-foreground">
              {familyQOL.length > 0 ? "Your wellbeing matters" : "Start tracking"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Progress Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="family">Family</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5 text-blue-600" />
                Progress Timeline
              </CardTitle>
              <CardDescription>
                Key milestones and improvements over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {outcomes && outcomes.length > 0 ? (
                <div className="space-y-4">
                  {outcomes.map((outcome: any, index: number) => (
                    <div key={outcome.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                      <div className="flex-shrink-0">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">
                          {new Date(outcome.assessmentDate).toLocaleDateString()}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
                          {outcome.atecScore && (
                            <div>
                              <span className="text-muted-foreground">ATEC: </span>
                              <span className="font-medium">{outcome.atecScore}</span>
                            </div>
                          )}
                          {outcome.behaviorScore && (
                            <div>
                              <span className="text-muted-foreground">Behavior: </span>
                              <span className="font-medium">{outcome.behaviorScore}/10</span>
                            </div>
                          )}
                          {outcome.sleepScore && (
                            <div>
                              <span className="text-muted-foreground">Sleep: </span>
                              <span className="font-medium">{outcome.sleepScore}/10</span>
                            </div>
                          )}
                          {outcome.familyQOL && (
                            <div>
                              <span className="text-muted-foreground">Family QOL: </span>
                              <span className="font-medium">{outcome.familyQOL}/10</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No progress data yet. Start tracking outcomes to see trends!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="mr-2 h-5 w-5 text-purple-600" />
                Behavioral Progress
              </CardTitle>
              <CardDescription>
                Tracking challenging behaviors and improvements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-2">Current Challenges</div>
                  <div className="text-sm text-muted-foreground">
                    {profile.behaviorChallenges 
                      ? JSON.parse(profile.behaviorChallenges).join(", ")
                      : "No challenges recorded"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">Behavior Score Trend</div>
                  {behaviorScores.length > 0 ? (
                    <div className="flex items-center gap-2">
                      {behaviorScores.map((score: number, i: number) => (
                        <div key={i} className="flex-1">
                          <div className="h-24 bg-gray-100 rounded relative">
                            <div 
                              className="absolute bottom-0 left-0 right-0 bg-blue-600 rounded"
                              style={{ height: `${score * 10}%` }}
                            />
                          </div>
                          <div className="text-xs text-center mt-1">{score}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Start tracking to see trends</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Communication Development</CardTitle>
              <CardDescription>
                Tracking language and communication progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-2">Current Level</div>
                  <div className="text-2xl font-bold capitalize">
                    {profile.communicationLevel.replace('_', ' ')}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">Communication History</div>
                  {outcomes && outcomes.length > 0 ? (
                    <div className="space-y-2">
                      {outcomes
                        .filter((o: any) => o.communicationLevel)
                        .map((o: any) => (
                          <div key={o.id} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {new Date(o.assessmentDate).toLocaleDateString()}
                            </span>
                            <span className="font-medium capitalize">
                              {o.communicationLevel.replace('_', ' ')}
                            </span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No history yet</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Physical Health</CardTitle>
              <CardDescription>
                GI symptoms, sleep, and overall health
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-2">GI Symptoms</div>
                  <div className="text-sm text-muted-foreground">
                    {profile.giSymptoms 
                      ? JSON.parse(profile.giSymptoms).join(", ")
                      : "No symptoms recorded"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">Sleep Issues</div>
                  <div className="text-sm text-muted-foreground">
                    {profile.sleepIssues 
                      ? JSON.parse(profile.sleepIssues).join(", ")
                      : "No issues recorded"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">Sleep Score Trend</div>
                  {sleepScores.length > 0 ? (
                    <div className="flex items-center gap-2">
                      {sleepScores.map((score: number, i: number) => (
                        <div key={i} className="flex-1">
                          <div className="h-24 bg-gray-100 rounded relative">
                            <div 
                              className="absolute bottom-0 left-0 right-0 bg-indigo-600 rounded"
                              style={{ height: `${score * 10}%` }}
                            />
                          </div>
                          <div className="text-xs text-center mt-1">{score}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Start tracking to see trends</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="family" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="mr-2 h-5 w-5 text-red-600" />
                Family Wellbeing
              </CardTitle>
              <CardDescription>
                Your wellbeing matters too - track family quality of life
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-2">Family Quality of Life</div>
                  {familyQOL.length > 0 ? (
                    <div className="flex items-center gap-2">
                      {familyQOL.map((score: number, i: number) => (
                        <div key={i} className="flex-1">
                          <div className="h-24 bg-gray-100 rounded relative">
                            <div 
                              className="absolute bottom-0 left-0 right-0 bg-green-600 rounded"
                              style={{ height: `${score * 10}%` }}
                            />
                          </div>
                          <div className="text-xs text-center mt-1">{score}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Start tracking to see trends</p>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">Parent Stress Level</div>
                  {outcomes && outcomes.length > 0 ? (
                    <div className="space-y-2">
                      {outcomes
                        .filter((o: any) => o.parentStress)
                        .map((o: any) => (
                          <div key={o.id} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {new Date(o.assessmentDate).toLocaleDateString()}
                            </span>
                            <span className="font-medium">{o.parentStress}/10</span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No data yet</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
