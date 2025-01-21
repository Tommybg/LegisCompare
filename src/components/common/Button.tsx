import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none shadow-sm relative overflow-hidden animate-gradient bg-[length:200%_200%]',
  {
    variants: {
      variant: {
        default: [
          'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500',
          'text-white',
          'border border-indigo-600',
          'shadow-sm',
          'hover:brightness-110',
          'active:brightness-90',
          'focus-visible:ring-indigo-500',
        ].join(' '),
        destructive: [
          'bg-gradient-to-r from-red-500 via-red-600 to-red-500',
          'text-white',
          'border border-red-700',
          'shadow-sm',
          'hover:brightness-110',
          'active:brightness-90',
          'focus-visible:ring-red-500',
        ].join(' '),
        outline: [
          'bg-gradient-to-r from-gray-50 via-white to-gray-50',
          'border border-gray-300',
          'text-gray-700',
          'shadow-sm',
          'hover:brightness-95',
          'active:brightness-90',
          'focus-visible:ring-gray-500',
        ].join(' '),
        ghost: [
          'text-gray-700',
          'hover:bg-gray-100',
          'active:bg-gray-200',
          'focus-visible:ring-gray-500',
        ].join(' '),
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-8 px-3 text-sm',
        lg: 'h-12 px-8 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };