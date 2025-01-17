import { supabase } from "../../../../lib/supabase";
import PriceHistory from "../../components/priceHistory";

export default async function Product({
    params,
  }: {
    params: Promise<{ id: string }>
  }) {
    const id = (await params).id

    const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

    return (
    <div className='flex flex-col items-center justify-center min-h-screen py-2'>
        <a href={data.url} rel="noopener noreferrer" className='mb-2 text-2xl'>
          <strong>{data.product_name}</strong>
        </a>{" "}
          <strong>Price:</strong> {data.price}
        <PriceHistory id={data.id} />
    </div>
    )
  }