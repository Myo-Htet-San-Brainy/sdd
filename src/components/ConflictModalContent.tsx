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
};

export function ConflictModalContent({
  currentProduct,
  similarProducts,
  handleClose,
}: ConflictModalContentProps) {
  return (
    <>
      {/* Current Product */}
      <div className="space-y-2">
        <h3 className="font-medium text-white">Product You Tried to Create:</h3>
        <p className="text-sm text-white">
          <strong>Brand:</strong> {currentProduct.brand || "N/A"} <br />
          <strong>Type:</strong> {currentProduct.type.join(", ")} <br />
          <strong>Description:</strong> {currentProduct.description}
        </p>
      </div>

      {/* Similar Products */}
      <div className="space-y-2">
        <h3 className="font-medium text-white">Similar Products:</h3>
        <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
          {similarProducts.map((prod) => (
            <div
              key={prod._id}
              className="border border-white/30 bg-white/20 backdrop-blur-md p-3 rounded-md flex items-start justify-between"
            >
              <div className="text-sm text-white">
                <strong>Brand:</strong> {prod.brand || "N/A"} <br />
                <strong>Type:</strong> {prod.type.join(", ")} <br />
                <strong>Description:</strong> {prod.description}
              </div>
              <Link
                href={`/main/product/${prod._id}/update`}
                className="ml-4 text-white underline hover:text-red-700 text-sm"
                onClick={() => {
                  handleClose && handleClose("update");
                }}
              >
                Update This Product
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
          Confirm Create New
        </button>
      </div>
    </>
  );
}
