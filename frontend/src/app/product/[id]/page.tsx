import { supabase } from "../../../../lib/supabase";
import PriceHistory from "../../components/priceHistory";

export default async function Product({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();
  const { data: PriceHistoryData } = await supabase
    .from("price")
    .select("created_at, price")
    .eq("product_id", id);
  let cheapeastPrice = 1000000;
  if (PriceHistoryData) {
    for (let i = 0; i < PriceHistoryData.length; i++) {
      if (PriceHistoryData[i].price < cheapeastPrice) {
        cheapeastPrice = PriceHistoryData[i].price;
      }
    }
  }
  const { data: PriceHistoryDataSingle } = await supabase
    .from("price")
    .select("created_at, price")
    .eq("product_id", id)
    .order("created_at", { ascending: false })
    .limit(1);
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden">
        <div className="p-6">
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl font-bold hover:text-blue-600 transition-colors duration-300 mb-4 block text-center underline"
          >
            {data.product_name}
          </a>
          
          <div className="flex justify-between items-center mb-4">
            <span className="text-xl font-semibold text-gray-700 dark:text-gray-200">
              Price: ${data.price}
            </span>
            
            {PriceHistoryData && PriceHistoryData.length > 0 ? (
              PriceHistoryDataSingle &&
              PriceHistoryDataSingle[0]?.price === cheapeastPrice ? (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Cheapest price
                </span>
              ) : (
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                  Not cheapest price
                </span>
              )
            ) : null}
          </div>

          <div className="mb-6 text-center">
            <img
              src={data.image}
              alt={data.product_name}
              className="max-h-80 mx-auto object-contain rounded-lg shadow-md"
            />
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-prose mx-auto">
            <p className="text-gray-600 dark:text-gray-300 text-center">
              {data.product_description}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-4">
          <PriceHistory id={data.id} />
        </div>
      </div>
    </div>
  );
}