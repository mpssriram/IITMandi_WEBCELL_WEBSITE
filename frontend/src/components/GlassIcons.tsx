import ReactBitsGlassIcons, {
    type GlassIconsItem as ReactBitsGlassIconsItem,
    type GlassIconsProps as ReactBitsGlassIconsProps,
} from "@/components/reactbits/GlassIcons";

export type GlassIconsItem = ReactBitsGlassIconsItem;
export type GlassIconsProps = ReactBitsGlassIconsProps;

export function GlassIcons(props: GlassIconsProps) {
    return <ReactBitsGlassIcons {...props} />;
}

export default GlassIcons;

