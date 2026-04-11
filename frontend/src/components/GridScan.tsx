import type { ComponentProps } from "react";

import { GridScan as ReactBitsGridScan } from "@/components/reactbits/GridScan";

type GridScanProps = ComponentProps<typeof ReactBitsGridScan>;

export function GridScan(props: GridScanProps) {
    return (
        <ReactBitsGridScan
            enableWebcam={false}
            showPreview={false}
            sensitivity={0.52}
            lineThickness={1.1}
            linesColor="#2c3f5c"
            scanColor="#67e8f9"
            scanOpacity={0.42}
            gridScale={0.115}
            lineStyle="solid"
            lineJitter={0.08}
            scanDirection="pingpong"
            enablePost={true}
            bloomIntensity={0.24}
            bloomThreshold={0.18}
            bloomSmoothing={0.26}
            chromaticAberration={0.0018}
            noiseIntensity={0.008}
            scanGlow={0.68}
            scanSoftness={1.8}
            scanPhaseTaper={0.88}
            scanDuration={2.4}
            scanDelay={1.8}
            {...props}
        />
    );
}

export default GridScan;
