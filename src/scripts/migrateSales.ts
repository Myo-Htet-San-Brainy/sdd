import {
  migrateSaleBuyerDetails,
  migrateSaleProductDetails,
} from "@/db/sale";

Promise.all([migrateSaleProductDetails(), migrateSaleBuyerDetails()])
  .then(([productResult, buyerResult]) => {
    console.log(
      `Updated product details: ${productResult.modifiedCount} of ${productResult.matchedCount} sale documents.`
    );
    console.log(
      `Updated buyer details: ${buyerResult.modifiedCount} of ${buyerResult.matchedCount} sale documents.`
    );
  })
  .catch((error) => {
    console.error("Sale migration failed:", error);
    process.exitCode = 1;
  });
