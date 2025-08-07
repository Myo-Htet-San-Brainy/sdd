import Link from "next/link";

type ConflictModalContentProps = {
  currentProduct: {
    brand: string;
    type: string[];
    description: string;
  };
  similarProducts: Array<{
    _id: string;
    brand: string;
    type: string[];
    description: string;
  }>;
  handleClose?: (result?: any) => void;
  prodYouCreating: string;
  similarProds: string;
  updateThisInstead: string;
  confirmCreateNew: string;
  brand: string;
  type: string;
  description: string;
};

export function ConflictModalContent({
  currentProduct,
  similarProducts,
  handleClose,
  prodYouCreating,
  similarProds,
  updateThisInstead,
  confirmCreateNew,
  brand,
  type,
  description,
}: ConflictModalContentProps) {
  return (
    <>
      {/* Current Product */}
      <div className="space-y-2">
        <h3 className="font-medium text-white">{prodYouCreating}:</h3>
        <p className="text-sm text-white">
          <strong>{brand}:</strong> {currentProduct.brand || "N/A"} <br />
          <strong>{type}:</strong> {currentProduct.type.join(", ")} <br />
          <strong>{description}:</strong> {currentProduct.description}
        </p>
      </div>

      {/* Similar Products */}
      <div className="space-y-2">
        <h3 className="font-medium text-white">{similarProds}:</h3>
        <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
          {similarProducts.map((prod) => (
            <div
              key={prod._id}
              className="border border-white/30 bg-white/20 backdrop-blur-md p-3 rounded-md flex items-start justify-between"
            >
              <div className="text-sm text-white">
                <strong>{brand}:</strong> {prod.brand || "N/A"} <br />
                <strong>{type}:</strong> {prod.type.join(", ")} <br />
                <strong>{description}:</strong> {prod.description}
              </div>
              <Link
                href={`/main/product/${prod._id}/update`}
                className="ml-4 text-white underline hover:text-red-700 text-sm"
                onClick={() => {
                  handleClose && handleClose("update");
                }}
              >
                {updateThisInstead}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Confirm */}
      <div className="flex justify-end pt-4">
        <button
          onClick={() => {
            handleClose && handleClose("create");
          }}
          className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-md"
        >
          {confirmCreateNew}
        </button>
      </div>
    </>
  );
}
