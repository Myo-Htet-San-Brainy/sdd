import { migrateSaleProductDetails } from "@/db/sale";

migrateSaleProductDetails()
  .then((result) => {
    console.log(
      `Updated ${result.modifiedCount} of ${result.matchedCount} sale documents.`
    );
  })
  .catch((error) => {
    console.error("Sale product details migration failed:", error);
    process.exitCode = 1;
  });
