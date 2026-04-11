import type { ComponentProps } from "react";

import ReactBitsPixelBlast from "@/components/reactbits/PixelBlast";

type PixelBlastProps = ComponentProps<typeof ReactBitsPixelBlast>;

export function PixelBlast(props: PixelBlastProps) {
    return <ReactBitsPixelBlast antialias={true} noiseAmount={0.02} speed={0.42} {...props} />;
}

export default PixelBlast;

