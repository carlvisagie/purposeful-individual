import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useModuleLearning } from "@/hooks/useModuleLearning";
import { useHabitFormation } from "@/hooks/useHabitFormation";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { Brain, AlertTriangle, TrendingDown, CheckCircle2, Shield } from "lucide-react";

export default function OCDManagement() {
  const [obsessionType, setObsessionType] = useState("");
  const [compulsionType, setCompulsionType] = useState("");
  const [anxietyLevel, setAnxietyLevel] = useState(5);
  const [exposureCompleted, setExposureCompleted] = useState(false);
  const [notes, setNotes] = useState("");
  
  const { trackIntervention, getRecommendations } = useModuleLearning("ocd");
  const { createHabit, trackHabitCompletion } = useHabitFormation("ocd");
  
  const recommendations = getRecommendations();
  
  const handleLogExposure = () => {
    console.log("Logging OCD exposure:", { obsessionType, compulsionType, anxietyLevel, exposureCompleted, notes });
    setNotes("");
    setExposureCompleted(false);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-indigo-900">OCD Management</h1>
          <p className="text-lg text-indigo-700">Evidence-based ERP and cognitive restructuring</p>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-white/80 backdrop-blur border-indigo-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-indigo-600" />
              <div>
                <p className="text-sm text-gray-600">Anxiety Level</p>
                <p className="text-2xl font-bold text-indigo-900">{anxietyLevel}/10</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white/80 backdrop-blur border-indigo-200">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Compulsions</p>
                <p className="text-2xl font-bold text-green-600">-30%</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white/80 backdrop-blur border-indigo-200">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Exposures</p>
                <p className="text-2xl font-bold text-blue-900">15</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white/80 backdrop-blur border-indigo-200">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-purple-900">78%</p>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Log Exposure */}
          <Card className="p-6 bg-white/90 backdrop-blur border-indigo-200">
            <h2 className="text-2xl font-bold text-indigo-900 mb-4">Log ERP Session</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Obsession Type
                </label>
                <Select value={obsessionType} onValueChange={setObsessionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select obsession..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contamination">Contamination</SelectItem>
                    <SelectItem value="harm">Harm/Safety</SelectItem>
                    <SelectItem value="symmetry">Symmetry/Order</SelectItem>
                    <SelectItem value="intrusive">Intrusive Thoughts</SelectItem>
                    <SelectItem value="checking">Checking</SelectItem>
                    <SelectItem value="religious">Religious/Moral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compulsion Type
                </label>
                <Select value={compulsionType} onValueChange={setCompulsionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select compulsion..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="washing">Washing/Cleaning</SelectItem>
                    <SelectItem value="checking">Checking</SelectItem>
                    <SelectItem value="counting">Counting/Repeating</SelectItem>
                    <SelectItem value="arranging">Arranging/Ordering</SelectItem>
                    <SelectItem value="mental">Mental Rituals</SelectItem>
                    <SelectItem value="reassurance">Reassurance Seeking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peak Anxiety Level (1-10)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={anxietyLevel}
                    onChange={(e) => setAnxietyLevel(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-2xl font-bold text-indigo-900 w-12 text-center">
                    {anxietyLevel}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exposure Notes
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What triggered it? How did you resist the compulsion? How did anxiety change over time?"
                  className="min-h-[120px]"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={exposureCompleted}
                  onChange={(e) => setExposureCompleted(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label className="text-sm font-medium text-gray-700">
                  Successfully Resisted Compulsion
                </label>
              </div>
              
              <Button onClick={handleLogExposure} className="w-full bg-indigo-600 hover:bg-indigo-700">
                Log Exposure
              </Button>
            </div>
          </Card>
          
          {/* ERP Protocols */}
          <Card className="p-6 bg-white/90 backdrop-blur border-indigo-200">
            <h2 className="text-2xl font-bold text-indigo-900 mb-4">ERP Protocols</h2>
            
            <div className="space-y-4">
              {/* Exposure Hierarchy */}
              <div className="p-4 bg-indigo-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-indigo-900">Exposure Hierarchy (Gold Standard)</h3>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Level A</span>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  Gradual exposure to feared situations while preventing compulsive response.
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>1. List fears from least to most anxiety-provoking (0-100)</p>
                  <p>2. Start with 30-40 anxiety level exposure</p>
                  <p>3. Stay in situation until anxiety drops 50%</p>
                  <p>4. Repeat same exposure until habituation occurs</p>
                  <p>5. Move up hierarchy gradually</p>
                </div>
                <FeedbackWidget
                  interventionType="exposure_hierarchy"
                  onFeedback={(helpful, rating) => trackIntervention("exposure_hierarchy", helpful, rating)}
                />
              </div>
              
              {/* Response Prevention */}
              <div className="p-4 bg-indigo-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-indigo-900">Response Prevention</h3>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Level A</span>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  Actively resist performing compulsions when obsessions arise.
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Delay: "I'll check in 15 minutes" (then extend)</p>
                  <p>• Reduce: Do compulsion fewer times</p>
                  <p>• Modify: Change ritual slightly</p>
                  <p>• Eliminate: Stop compulsion completely</p>
                  <p>• Track urge intensity over time (usually peaks then drops)</p>
                </div>
                <FeedbackWidget
                  interventionType="response_prevention"
                  onFeedback={(helpful, rating) => trackIntervention("response_prevention", helpful, rating)}
                />
              </div>
              
              {/* Cognitive Restructuring */}
              <div className="p-4 bg-indigo-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-indigo-900">Cognitive Restructuring</h3>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Level B</span>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  Challenge OCD thoughts with evidence-based thinking.
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• "What's the evidence for/against this thought?"</p>
                  <p>• "What would I tell a friend with this thought?"</p>
                  <p>• "What's the worst that could realistically happen?"</p>
                  <p>• "Am I confusing a thought with a fact?"</p>
                  <p>• "Is this OCD talking or reality?"</p>
                </div>
                <FeedbackWidget
                  interventionType="cognitive_restructuring"
                  onFeedback={(helpful, rating) => trackIntervention("cognitive_restructuring", helpful, rating)}
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
