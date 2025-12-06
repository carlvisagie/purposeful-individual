import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Link } from "wouter";
import { Plus, TrendingUp, Calendar, Activity } from "lucide-react";

export default function AutismDashboard() {
  const { data: profiles, isLoading } = trpc.autism.getMyProfiles.useQuery();

  if (isLoading) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Autism Transformation Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Evidence-based interventions for your child's development
          </p>
        </div>
        <Link href="/autism/create-profile">
          <Button size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Add Child Profile
          </Button>
        </Link>
      </div>

      {!profiles || profiles.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Create your child's profile to begin tracking interventions and progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/autism/create-profile">
              <Button>Create First Profile</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile: any) => (
            <Card key={profile.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{profile.childName}</CardTitle>
                <CardDescription>
                  Age: {Math.floor((Date.now() - new Date(profile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Severity</div>
                    <div className="font-medium capitalize">{profile.severity}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Communication</div>
                    <div className="font-medium capitalize">{profile.communicationLevel.replace('_', ' ')}</div>
                  </div>
                </div>

                {profile.atecScore && (
                  <div>
                    <div className="text-sm text-muted-foreground">ATEC Score</div>
                    <div className="text-2xl font-bold">{profile.atecScore}</div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-4">
                  <Link href={`/autism/progress/${profile.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Progress
                    </Button>
                  </Link>
                  <Link href={`/autism/daily-log/${profile.id}`}>
                    <Button size="sm" className="w-full">
                      <Activity className="mr-2 h-4 w-4" />
                      Daily Log
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
              Progress Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Monitor ATEC scores, behavioral improvements, and developmental milestones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-blue-600" />
              Therapy Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Log ABA, OT, speech therapy sessions and track attendance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5 text-purple-600" />
              Interventions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Manage biomedical interventions, supplements, and dietary protocols
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
