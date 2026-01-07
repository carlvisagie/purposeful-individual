import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useModuleLearning } from "@/hooks/useModuleLearning";
import { useHabitFormation } from "@/hooks/useHabitFormation";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { Brain, Zap, Target, Clock, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ADHDSupport() {
  const [focusLevel, setFocusLevel] = useState(5);
  const [distractions, setDistractions] = useState("");
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [strategy, setStrategy] = useState("");
  
  const { trackTechniqueUsage, effectiveTechniques } = useModuleLearning("adhd");
  const { createHabit, trackHabitCompletion } = useHabitFormation("adhd");
  
  const recommendations = effectiveTechniques;
  
  const handleLogSession = () => {
    console.log("Logging ADHD session:", { focusLevel, distractions, taskCompleted, strategy });
    setDistractions("");
    setTaskCompleted(false);
    setStrategy("");
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-blue-900">ADHD Support</h1>
          <p className="text-lg text-blue-700">Evidence-based focus and executive function protocols</p>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-white/80 backdrop-blur border-blue-200">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Focus Score</p>
                <p className="text-2xl font-bold text-blue-900">{focusLevel}/10</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white/80 backdrop-blur border-blue-200">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Focus Time Today</p>
                <p className="text-2xl font-bold text-green-600">2.5h</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white/80 backdrop-blur border-blue-200">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Tasks Completed</p>
                <p className="text-2xl font-bold text-purple-900">8/12</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white/80 backdrop-blur border-blue-200">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Streak</p>
                <p className="text-2xl font-bold text-yellow-900">7 days</p>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Log Focus Session */}
          <Card className="p-6 bg-white/90 backdrop-blur border-blue-200">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Log Focus Session</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Focus Level (1-10)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={focusLevel}
                    onChange={(e) => setFocusLevel(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-2xl font-bold text-blue-900 w-12 text-center">
                    {focusLevel}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Main Distractions
                </label>
                <Textarea
                  value={distractions}
                  onChange={(e) => setDistractions(e.target.value)}
                  placeholder="Phone notifications, noise, wandering thoughts..."
                  className="min-h-[100px]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Strategy Used
                </label>
                <Select value={strategy} onValueChange={setStrategy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select strategy..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pomodoro">Pomodoro Technique</SelectItem>
                    <SelectItem value="body_doubling">Body Doubling</SelectItem>
                    <SelectItem value="music">Focus Music</SelectItem>
                    <SelectItem value="movement">Movement Breaks</SelectItem>
                    <SelectItem value="timer">Visual Timer</SelectItem>
                    <SelectItem value="environment">Environment Change</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={taskCompleted}
                  onChange={(e) => setTaskCompleted(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label className="text-sm font-medium text-gray-700">
                  Task Completed Successfully
                </label>
              </div>
              
              <Button onClick={handleLogSession} className="w-full bg-blue-600 hover:bg-blue-700">
                Log Session
              </Button>
            </div>
          </Card>
          
          {/* Evidence-Based Protocols */}
          <Card className="p-6 bg-white/90 backdrop-blur border-blue-200">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">ADHD Management Protocols</h2>
            
            <div className="space-y-4">
              {/* Pomodoro + Movement */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-blue-900">Pomodoro + Movement (Huberman)</h3>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Level A</span>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  25 min focus + 5 min movement break. Movement resets dopamine for next session.
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• 25 min: Deep focus on ONE task</p>
                  <p>• 5 min: Physical movement (walk, stretch, jumping jacks)</p>
                  <p>• Repeat 4x, then 15-30 min break</p>
                  <p>• Best: Morning when dopamine is highest</p>
                </div>
                <FeedbackWidget
                  interventionType="pomodoro_movement"
                  onFeedback={(helpful, rating) => trackTechniqueUsage("pomodoro_movement", helpful, rating)}
                />
              </div>
              
              {/* Body Doubling */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-blue-900">Body Doubling</h3>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Level B</span>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  Work alongside someone else (in person or virtual). Increases accountability and focus.
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Find accountability partner or use Focusmate</p>
                  <p>• Set shared timer (25-50 minutes)</p>
                  <p>• Work silently in parallel</p>
                  <p>• Brief check-in at end</p>
                </div>
                <FeedbackWidget
                  interventionType="body_doubling"
                  onFeedback={(helpful, rating) => trackTechniqueUsage("body_doubling", helpful, rating)}
                />
              </div>
              
              {/* Visual Timer + Gamification */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-blue-900">Visual Timer + Gamification</h3>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Level B</span>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  External time awareness + reward system. Reduces time blindness.
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Use Time Timer or visual countdown</p>
                  <p>• Track "focus points" for completed sessions</p>
                  <p>• Reward milestones (10 sessions = treat)</p>
                  <p>• Make it visible and satisfying</p>
                </div>
                <FeedbackWidget
                  interventionType="visual_timer"
                  onFeedback={(helpful, rating) => trackTechniqueUsage("visual_timer", helpful, rating)}
                />
              </div>
            </div>
          </Card>
        </div>
        
        {/* AI Recommendations */}
        {recommendations.length > 0 && (
          <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <h2 className="text-2xl font-bold text-purple-900 mb-4 flex items-center gap-2">
              <Brain className="w-6 h-6" />
              Personalized Recommendations
            </h2>
            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="p-4 bg-white rounded-lg border border-purple-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{rec.technique}</h3>
                      <p className="text-sm text-gray-600 mt-1">{rec.reason}</p>
                      <p className="text-xs text-green-600 mt-2">
                        <CheckCircle2 className="w-3 h-3 inline mr-1" />
                        {rec.successRate}% success rate for you
                      </p>
                    </div>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      AI Recommended
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
