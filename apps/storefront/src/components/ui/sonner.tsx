'use client';

import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast bg-[#1a1a1a] border border-[#2a2a2a] text-[#f0f0f0] font-mono text-sm',
          description: 'group-[.toast]:text-[#888]',
          actionButton: 'group-[.toast]:bg-[#ff6b35] group-[.toast]:text-black',
          cancelButton: 'group-[.toast]:bg-[#2a2a2a] group-[.toast]:text-[#888]',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
