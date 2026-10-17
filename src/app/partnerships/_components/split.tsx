import { Children, cloneElement, isValidElement, type ReactNode } from "react";

/**
 * Wraps every word in the heading in the two-span structure the rise-in
 * animation expects. Rendered on the server so the heading is real text in the
 * HTML; the animation itself is CSS only (see `.split` in partnerships.css).
 * Nested elements such as <em> keep their styling.
 */
export function Split({
  as: Tag = "h2",
  className = "",
  children,
}: {
  as?: "h1" | "h2" | "h3";
  className?: string;
  children: ReactNode;
}) {
  let i = 0;

  const walk = (node: ReactNode): ReactNode => {
    if (typeof node === "string") {
      return node.split(/(\s+)/).map((part, idx) => {
        if (!part) return null;
        if (/^\s+$/.test(part)) return " ";
        const delay = `${(i++ * 0.06).toFixed(2)}s`;
        return (
          <span className="w" key={idx}>
            <span style={{ transitionDelay: delay, ["--d" as string]: delay }}>
              {part}
            </span>
          </span>
        );
      });
    }
    if (isValidElement<{ children?: ReactNode }>(node)) {
      return cloneElement(node, undefined, ...Children.map(node.props.children, walk) ?? []);
    }
    return node;
  };

  return <Tag className={`split ${className}`.trim()}>{Children.map(children, walk)}</Tag>;
}
