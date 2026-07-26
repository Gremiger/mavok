"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

export function Markdown({
  children,
  className,
  onInternalLink,
}: {
  children: string;
  className?: string;
  onInternalLink?: (href: string) => void;
}) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          p: ({ children }) => <p className="leading-relaxed">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">
              {children}
            </strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => (
            <ul className="list-disc pl-4 space-y-0.5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-4 space-y-0.5">{children}</ol>
          ),
          a: ({ href, children }) => {
            if (href?.startsWith("mavok-note://") && onInternalLink) {
              return (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onInternalLink(href);
                  }}
                  className="text-accent underline underline-offset-2"
                >
                  {children}
                </button>
              );
            }
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline underline-offset-2"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
