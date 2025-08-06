interface ProductCountProps {
  showing?: number;
  total?: number;
  className?: string;
}

export const ProductCount: React.FC<ProductCountProps> = ({
  showing,
  total,
  className = "mb-4 text-red-500 font-medium text-right",
}) => {
  if (typeof showing !== "number") return null;

  const productText = (count: number) =>
    `${count} product${count !== 1 ? "s" : ""}`;

  return (
    <div className={className}>
      Showing {showing}
      {typeof total === "number" && ` out of ${total}`}
    </div>
  );
};
