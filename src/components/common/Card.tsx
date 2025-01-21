import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg",
        "border border-white/10",
        "bg-white/5",
        "shadow-sm hover:shadow transition-all duration-200",
        "backdrop-blur-md",
        className
      )}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: CardContentProps) {
  return (
    <div 
      className={cn(
        "p-6",
        "relative",
        "bg-white/50",
        className
      )} 
      {...props} 
    />
  );
}