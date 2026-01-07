import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useModuleLearning } from "@/hooks/useModuleLearning";
import { useHabitFormation } from "@/hooks/useHabitFormation";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { Brain, Heart, Activity, TrendingDown, AlertCircle, CheckCircle2 } from "lucide-react";

export default function StressManagement() {
  const [stressLevel, setStressLevel] = useState(5);
  const [stressors, setStressors] = useState("");
  const [physicalSymptoms, setPhysicalSymptoms] = useState<string[]>([]);
  const [copingStrategy, setCopingStrategy] = useState("");
  
  const { trackTechniqueUsage, effectiveTechniques } = useModuleLearning("stress");
  const { createHabit, trackHabitCompletion } = useHabitFormation("stress");
  
  const recommendations = effectiveTechniques;
  
  const handleLogStress = () => {
    console.log("Logging stress:", { stressLevel, stressors, physicalSymptoms, copingStrategy });
    // Reset form
    setStressors("");
    setPhysicalSymptoms([]);
    setCopingStrategy("");
  };
  
  const symptomOptions = [
    "Tension headaches",
    "Muscle tension",
    "Rapid heartbeat",
    "Shallow breathing",
    "Digestive issues",
    "Fatigue",
    "Insomnia",
    "Irritability"
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-orange-900">Stress Management</h1>
          <p className="text-lg text-orange-700">Evidence-based stress reduction protocols</p>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-white/80 backdrop-blur border-orange-200">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Current Level</p>
                <p className="text-2xl font-bold text-orange-900">{stressLevel}/10</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white/80 backdrop-blur border-orange-200">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">7-Day Trend</p>
                <p className="text-2xl font-bold text-green-600">-15%</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white/80 backdrop-blur border-orange-200">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">HRV Score</p>
                <p className="text-2xl font-bold text-red-900">68</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white/80 backdrop-blur border-orange-200">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Recovery Score</p>
                <p className="text-2xl font-bold text-purple-900">72%</p>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Log Stress */}
          <Card className="p-6 bg-white/90 backdrop-blur border-orange-200">
            <h2 className="text-2xl font-bold text-orange-900 mb-4">Log Stress Event</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stress Level (1-10)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={stressLevel}
                    onChange={(e) => setStressLevel(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-2xl font-bold text-orange-900 w-12 text-center">
                    {stressLevel}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Calm</span>
                  <span>Moderate</span>
                  <span>Severe</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What's causing stress?
                </label>
                <Textarea
                  value={stressors}
                  onChange={(e) => setStressors(e.target.value)}
                  placeholder="Work deadline, family conflict, financial worry..."
                  className="min-h-[100px]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Physical Symptoms
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {symptomOptions.map((symptom) => (
                    <label key={symptom} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={physicalSymptoms.includes(symptom)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPhysicalSymptoms([...physicalSymptoms, symptom]);
                          } else {
                            setPhysicalSymptoms(physicalSymptoms.filter(s => s !== symptom));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      {symptom}
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coping Strategy Used
                </label>
                <Select value={copingStrategy} onValueChange={setCopingStrategy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select strategy..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breathing">Breathing Exercise</SelectItem>
                    <SelectItem value="exercise">Physical Exercise</SelectItem>
                    <SelectItem value="meditation">Meditation</SelectItem>
                    <SelectItem value="talk">Talked to Someone</SelectItem>
                    <SelectItem value="journaling">Journaling</SelectItem>
                    <SelectItem value="nature">Time in Nature</SelectItem>
                    <SelectItem value="music">Music/Art</SelectItem>
                    <SelectItem value="none">None Yet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleLogStress} className="w-full bg-orange-600 hover:bg-orange-700">
                Log Stress Event
              </Button>
            </div>
          </Card>
          
          {/* Evidence-Based Protocols */}
          <Card className="p-6 bg-white/90 backdrop-blur border-orange-200">
            <h2 className="text-2xl font-bold text-orange-900 mb-4">Stress Reduction Protocols</h2>
            
            <div className="space-y-4">
              {/* Physiological Sigh */}
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-orange-900">Physiological Sigh (Huberman)</h3>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Level A</span>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  Two inhales through nose, long exhale through mouth. Fastest way to reduce stress in real-time.
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>1. Deep inhale through nose (fill lungs 80%)</p>
                  <p>2. Quick second inhale through nose (fill to 100%)</p>
                  <p>3. Long, slow exhale through mouth</p>
                  <p>4. Repeat 1-3 times</p>
                </div>
                <FeedbackWidget
                  interventionType="physiological_sigh"
                  onFeedback={(helpful, rating) => trackTechniqueUsage("physiological_sigh", helpful, rating)}
                />
              </div>
              
              {/* Box Breathing */}
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-orange-900">Box Breathing (Navy SEALs)</h3>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Level A</span>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  4-4-4-4 breathing pattern. Activates parasympathetic nervous system.
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-900 font-bold">1</div>
                    <span>Inhale 4 sec</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-900 font-bold">2</div>
                    <span>Hold 4 sec</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-900 font-bold">3</div>
                    <span>Exhale 4 sec</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-900 font-bold">4</div>
                    <span>Hold 4 sec</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Repeat for 5 minutes</p>
                <FeedbackWidget
                  interventionType="box_breathing"
                  onFeedback={(helpful, rating) => trackTechniqueUsage("box_breathing", helpful, rating)}
                />
              </div>
              
              {/* Cold Exposure */}
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-orange-900">Cold Exposure (Huberman)</h3>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Level B</span>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  11 minutes total per week. Increases resilience, dopamine, norepinephrine.
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Cold shower: 30-60 seconds, 2-3x per week</p>
                  <p>• Ice bath: 2-5 minutes, 1-2x per week</p>
                  <p>• Temperature: Uncomfortable but safe (50-59°F)</p>
                  <p>• Best: Morning, after waking</p>
                </div>
                <FeedbackWidget
                  interventionType="cold_exposure"
                  onFeedback={(helpful, rating) => trackTechniqueUsage("cold_exposure", helpful, rating)}
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
