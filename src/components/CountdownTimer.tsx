import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, AlertTriangle } from "lucide-react";

interface CountdownTimerProps {
  deadline: Date;
  onExpired: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownTimer = ({ deadline, onExpired }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = deadline.getTime() - new Date().getTime();

      if (difference <= 0) {
        setIsExpired(true);
        onExpired();
        return null;
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      if (!newTimeLeft) {
        clearInterval(timer);
      } else {
        setTimeLeft(newTimeLeft);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline, onExpired]);

  if (isExpired) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="flex items-center justify-center gap-3 py-4">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <span className="font-semibold text-destructive">Voting has ended</span>
        </CardContent>
      </Card>
    );
  }

  if (!timeLeft) return null;

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <span className="text-2xl font-bold text-foreground tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-xs text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
    </div>
  );

  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 1;

  return (
    <Card className={isUrgent ? "border-destructive/30 bg-destructive/5 animate-pulse" : "border-primary/20 bg-primary/5"}>
      <CardContent className="py-4">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Clock className={`h-4 w-4 ${isUrgent ? "text-destructive" : "text-primary"}`} />
          <span className={`text-sm font-medium ${isUrgent ? "text-destructive" : "text-primary"}`}>
            Time remaining
          </span>
        </div>
        <div className="flex items-center justify-center gap-4">
          {timeLeft.days > 0 && (
            <>
              <TimeBlock value={timeLeft.days} label="days" />
              <span className="text-xl text-muted-foreground">:</span>
            </>
          )}
          <TimeBlock value={timeLeft.hours} label="hrs" />
          <span className="text-xl text-muted-foreground">:</span>
          <TimeBlock value={timeLeft.minutes} label="min" />
          <span className="text-xl text-muted-foreground">:</span>
          <TimeBlock value={timeLeft.seconds} label="sec" />
        </div>
      </CardContent>
    </Card>
  );
};
