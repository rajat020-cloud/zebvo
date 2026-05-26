import 'lucide-react';

declare module 'lucide-react' {
  import React from 'react';
  export const GitHub: React.ForwardRefExoticComponent<
    React.ComponentPropsWithoutRef<'svg'> & React.RefAttributes<SVGSVGElement>
  >;
}
