interface ArticleContentProps {
    content: string;
}

export default function ArticleContent({
    content,
}: ArticleContentProps): React.ReactElement {
    return (
        <div
            className="
                [&_a]:font-bold
                [&_a]:text-[#ee8434]
                [&_a]:underline
                [&_a]:underline-offset-4
                [&_a]:transition-colors
                [&_a:hover]:text-[#ff729f]

                [&_blockquote]:my-10
                [&_blockquote]:border-l-4
                [&_blockquote]:border-[#ff729f]
                [&_blockquote]:bg-[#1c1c1c]
                [&_blockquote]:px-6
                [&_blockquote]:py-5
                [&_blockquote]:font-bold
                [&_blockquote]:italic
                [&_blockquote]:text-white

                [&_figure]:my-10
                [&_figure]:overflow-hidden

                [&_h2]:mb-5
                [&_h2]:mt-12
                [&_h2]:text-3xl
                [&_h2]:font-black
                [&_h2]:uppercase
                [&_h2]:leading-[0.95]
                [&_h2]:tracking-[-0.05em]

                [&_h3]:mb-4
                [&_h3]:mt-10
                [&_h3]:text-2xl
                [&_h3]:font-black
                [&_h3]:uppercase
                [&_h3]:leading-none
                [&_h3]:tracking-[-0.04em]

                [&_img]:h-auto
                [&_img]:max-w-full

                [&_li]:mb-2
                [&_ol]:my-6
                [&_ol]:pl-6
                [&_ol]:text-[#1c1c1c]/70
                [&_ol]:marker:text-[#ee8434]

                [&_p]:mb-6
                [&_p]:text-base
                [&_p]:leading-8
                [&_p]:text-[#1c1c1c]/70

                [&_strong]:font-black
                [&_ul]:my-6
                [&_ul]:list-disc
                [&_ul]:pl-6
                [&_ul]:text-[#1c1c1c]/70

                [&_.wp-block-image]:my-10
                [&_.wp-element-caption]:mt-3
                [&_.wp-element-caption]:text-xs
                [&_.wp-element-caption]:italic
                [&_.wp-element-caption]:text-[#1c1c1c]/45

                [&_.wp-block-heading]:font-black
                [&_.wp-block-list]:leading-7
            "
            dangerouslySetInnerHTML={{
                __html: content,
            }}
        />
    );
}