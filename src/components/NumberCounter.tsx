import { useNumberCounter } from "@/hooks/use-number-counter";
import { cn } from "@/lib/utils";

interface NumberCounterProps {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
  startOnMount?: boolean;
  decimal?: number;
}

const NumberCounter = ({ 
  value, 
  duration = 1000, 
  className, 
  suffix = "",
  prefix = "",
  startOnMount = true,
  decimal = 0
}: NumberCounterProps) => {
  const { count } = useNumberCounter({ 
    target: value, 
    duration,
    startOnMount 
  });

  const formatNumber = (num: number) => {
    if (decimal > 0) {
      return num.toFixed(decimal);
    }
    return num.toLocaleString();
  };

  return (
    <span className={cn("animate-number-roll", className)}>
      {prefix}{formatNumber(count)}{suffix}
    </span>
  );
};

export default NumberCounter;