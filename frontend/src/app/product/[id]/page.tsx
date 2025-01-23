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
        cheapeastPrice = PriceHistoryData[i].price
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
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <a href={data.url} rel="noopener noreferrer" className="mb-2 text-2xl">
        <strong>{data.product_name}</strong>
      </a>{" "}
      <strong>Price:</strong> {data.price}
      {PriceHistoryDataSingle && PriceHistoryDataSingle[0]?.price === cheapeastPrice ? <p className="text-green-400">Is the cheapest Price</p> : <p className="text-red-400">Not the cheapest Price</p> }
      <PriceHistory id={data.id} />
      <img
        src={data.image}
        className="max-width: 200px max-height: 200px"
      ></img>
      <div className="text-center max-w-lg">
        <p>{data.product_description}</p>
      </div>
    </div>
  );
}
