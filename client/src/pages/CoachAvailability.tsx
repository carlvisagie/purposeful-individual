import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Calendar, Clock, Plus, Trash2, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/_core/hooks/useAuth";

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export default function CoachAvailability() {
  const { user } = useAuth();
  const coachId = user?.id || 1; // Get from authenticated user (coaches are also users)
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [exceptionStart, setExceptionStart] = useState("");
  const [exceptionEnd, setExceptionEnd] = useState("");
  const [exceptionReason, setExceptionReason] = useState("");
  const [showExceptionDialog, setShowExceptionDialog] = useState(false);

  // Fetch availability
  const { data: availabilityData, refetch: refetchAvailability } = trpc.scheduling.getCoachAvailability.useQuery({
    coachId,
  });

  // Fetch exceptions for next 3 months
  const today = new Date();
  const threeMonthsLater = new Date();
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

  const { data: exceptionsData, refetch: refetchExceptions } = trpc.scheduling.getAvailabilityExceptions.useQuery({
    coachId,
    startDate: today,
    endDate: threeMonthsLater,
  });

  // Mutations
  const setAvailability = trpc.scheduling.setCoachAvailability.useMutation({
    onSuccess: () => {
      toast.success("Availability added successfully");
      refetchAvailability();
      setStartTime("09:00");
      setEndTime("17:00");
    },
    onError: (error) => {
      toast.error(`Failed to add availability: ${error.message}`);
    },
  });

  const deleteAvailability = trpc.scheduling.deleteCoachAvailability.useMutation({
    onSuccess: () => {
      toast.success("Availability deleted");
      refetchAvailability();
    },
    onError: (error) => {
      toast.error(`Failed to delete availability: ${error.message}`);
    },
  });

  const createException = trpc.scheduling.createAvailabilityException.useMutation({
    onSuccess: () => {
      toast.success("Time off added successfully");
      refetchExceptions();
      setShowExceptionDialog(false);
      setExceptionStart("");
      setExceptionEnd("");
      setExceptionReason("");
    },
    onError: (error) => {
      toast.error(`Failed to add time off: ${error.message}`);
    },
  });

  const deleteException = trpc.scheduling.deleteAvailabilityException.useMutation({
    onSuccess: () => {
      toast.success("Time off deleted");
      refetchExceptions();
    },
    onError: (error) => {
      toast.error(`Failed to delete time off: ${error.message}`);
    },
  });

  const handleAddAvailability = () => {
    if (!startTime || !endTime) {
      toast.error("Please select start and end times");
      return;
    }

    setAvailability.mutate({
      coachId,
      dayOfWeek: selectedDay,
      startTime,
      endTime,
    });
  };

  const handleAddException = () => {
    if (!exceptionStart || !exceptionEnd) {
      toast.error("Please select start and end dates");
      return;
    }

    createException.mutate({
      coachId,
      startDate: new Date(exceptionStart),
      endDate: new Date(exceptionEnd),
      reason: exceptionReason,
    });
  };

  // Group availability by day
  const availabilityByDay = DAYS_OF_WEEK.map(day => ({
    ...day,
    slots: availabilityData?.availability.filter(a => a.dayOfWeek === day.value) || [],
  }));

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Manage Availability</h1>
        <p className="text-muted-foreground">
          Set your weekly schedule and block off time when you're unavailable
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Weekly Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Weekly Schedule
            </CardTitle>
            <CardDescription>
              Set your regular working hours for each day of the week
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Availability Form */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="space-y-2">
                <Label>Day of Week</Label>
                <Select
                  value={selectedDay.toString()}
                  onValueChange={(value) => setSelectedDay(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map(day => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              <Button
                onClick={handleAddAvailability}
                disabled={setAvailability.isPending}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Availability
              </Button>
            </div>

            {/* Current Schedule */}
            <div className="space-y-3">
              {availabilityByDay.map(day => (
                <div key={day.value}>
                  <h3 className="font-medium text-sm mb-2">{day.label}</h3>
                  {day.slots.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No availability set</p>
                  ) : (
                    <div className="space-y-2">
                      {day.slots.map(slot => (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between p-2 border rounded bg-background"
                        >
                          <span className="text-sm">
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteAvailability.mutate({ id: slot.id })}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Time Off / Exceptions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Time Off
            </CardTitle>
            <CardDescription>
              Block off specific dates when you're unavailable
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => setShowExceptionDialog(true)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Time Off
            </Button>

            {/* Exceptions List */}
            <div className="space-y-2">
              {exceptionsData?.exceptions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No time off scheduled
                </p>
              ) : (
                exceptionsData?.exceptions.map(exception => (
                  <div
                    key={exception.id}
                    className="flex items-start justify-between p-3 border rounded"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {new Date(exception.startDate).toLocaleDateString()} -{" "}
                        {new Date(exception.endDate).toLocaleDateString()}
                      </p>
                      {exception.reason && (
                        <p className="text-sm text-muted-foreground">{exception.reason}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteException.mutate({ id: exception.id })}
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Exception Dialog */}
      <Dialog open={showExceptionDialog} onOpenChange={setShowExceptionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Time Off</DialogTitle>
            <DialogDescription>
              Block off dates when you'll be unavailable for sessions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={exceptionStart}
                onChange={(e) => setExceptionStart(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={exceptionEnd}
                onChange={(e) => setExceptionEnd(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Reason (Optional)</Label>
              <Input
                placeholder="e.g., Vacation, Conference, Personal"
                value={exceptionReason}
                onChange={(e) => setExceptionReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExceptionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddException} disabled={createException.isPending}>
              Add Time Off
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
