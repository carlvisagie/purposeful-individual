import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2, DollarSign, Clock } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function ManageSessionTypes() {
  const { user } = useAuth();
  const coachId = user?.id || 1; // Get from authenticated user (coaches are also users)
  const [showDialog, setShowDialog] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);
  
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(60);
  const [price, setPrice] = useState(150);

  // Fetch session types
  const { data, refetch } = trpc.sessionTypes.list.useQuery({ coachId });

  // Mutations
  const createType = trpc.sessionTypes.create.useMutation({
    onSuccess: () => {
      toast.success("Session type created");
      refetch();
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to create: ${error.message}`);
    },
  });

  const updateType = trpc.sessionTypes.update.useMutation({
    onSuccess: () => {
      toast.success("Session type updated");
      refetch();
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });

  const deleteType = trpc.sessionTypes.delete.useMutation({
    onSuccess: () => {
      toast.success("Session type deleted");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  const toggleStatus = trpc.sessionTypes.toggleStatus.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const resetForm = () => {
    setShowDialog(false);
    setEditingType(null);
    setName("");
    setDescription("");
    setDuration(60);
    setPrice(150);
  };

  const handleEdit = (type: any) => {
    setEditingType(type);
    setName(type.name);
    setDescription(type.description || "");
    setDuration(type.duration);
    setPrice(type.price / 100); // Convert cents to dollars
    setShowDialog(true);
  };

  const handleSubmit = () => {
    if (!name || !duration || price < 0) {
      toast.error("Please fill all required fields");
      return;
    }

    const priceInCents = Math.round(price * 100);

    if (editingType) {
      updateType.mutate({
        id: editingType.id,
        name,
        description,
        duration,
        price: priceInCents,
      });
    } else {
      createType.mutate({
        coachId,
        name,
        description,
        duration,
        price: priceInCents,
      });
    }
  };

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Session Types & Pricing</h1>
          <p className="text-muted-foreground">
            Configure your service offerings with outcome-focused positioning
          </p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Session Type
        </Button>
      </div>

      {/* Session Types List */}
      <div className="grid gap-4">
        {data?.sessionTypes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No session types yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first session offering to start accepting bookings
              </p>
              <Button onClick={() => setShowDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Session Type
              </Button>
            </CardContent>
          </Card>
        ) : (
          data?.sessionTypes.map((type) => (
            <Card key={type.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{type.name}</CardTitle>
                    {type.description && (
                      <CardDescription className="mt-2">{type.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={type.isActive === "true"}
                      onCheckedChange={(checked) =>
                        toggleStatus.mutate({ id: type.id, isActive: checked })
                      }
                    />
                    <span className="text-sm text-muted-foreground">
                      {type.isActive === "true" ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{type.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-lg">
                        ${(type.price / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(type)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm("Delete this session type?")) {
                          deleteType.mutate({ id: type.id });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={resetForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingType ? "Edit Session Type" : "Create Session Type"}
            </DialogTitle>
            <DialogDescription>
              Define your session offering with clear outcomes and value positioning
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Session Name *</Label>
              <Input
                placeholder="e.g., Breakthrough Strategy Session"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Use outcome-focused language (e.g., "Career Transformation Session" not "60-min call")
              </p>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="What transformation will clients experience? What specific outcomes will they achieve?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Focus on outcomes, not features. What problem does this solve?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration (minutes) *</Label>
                <Input
                  type="number"
                  min={15}
                  max={480}
                  step={15}
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label>Price (USD) *</Label>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-sm text-blue-900 mb-2">
                💡 High-Conversion Pricing Tips
              </h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Use premium positioning ($150+ for transformation sessions)</li>
                <li>• Anchor with highest-value offer first</li>
                <li>• Include specific outcomes in descriptions</li>
                <li>• Limit choices to 3-4 options max (reduce cognitive load)</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createType.isPending || updateType.isPending}
            >
              {editingType ? "Update" : "Create"} Session Type
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
