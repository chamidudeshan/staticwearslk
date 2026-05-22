import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap font-mono text-sm font-bold tracking-widest uppercase transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 active:scale-95',
  {
    variants: {
      variant: {
        default:
          'bg-[#ff6b35] text-black hover:bg-[#e8ff59] hover:text-black',
        outline:
          'border border-[#2a2a2a] text-[#888] hover:border-[#ff6b35] hover:text-[#ff6b35]',
        ghost:
          'text-[#888] hover:text-[#f0f0f0] hover:bg-[#1a1a1a]',
        destructive:
          'bg-red-600 text-white hover:bg-red-700',
        secondary:
          'bg-[#1a1a1a] text-[#f0f0f0] border border-[#2a2a2a] hover:border-[#ff6b35]',
      },
      size: {
        default: 'h-11 px-6 py-2',
        sm: 'h-8 px-4 text-xs',
        lg: 'h-14 px-10 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
