import { supabase } from "../../../../lib/supabase";
import Price from "../../components/fetchPrice";

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

    const { data: priceHistoryData, error: priceHistoryError } = await supabase
        .from("price")
        .select("*")
        .eq("product_id", id )

    console.log(data, error)    

    return (
    <div>
        <Price url={data.url} />
    </div>
    )
  }