import { supabase } from "../../../../lib/supabase";
import Price from "../../components/fetchPrice";
import PriceHistory from "../../components/priceHistory";

export default async function Product({
    params,
  }: {
    params: Promise<{ id: string }>
  }) {
    const id = (await params).id

    const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

    return (
    <div>
        <Price url={data.url} />
        <PriceHistory id={data.id} />
    </div>
    )
  }