import ReactBitsOrb from "@/components/reactbits/Orb";

type OrbProps = {
    className?: string;
    intensity?: number;
};

export function Orb(props: OrbProps) {
    return <ReactBitsOrb {...props} />;
}

export default Orb;
