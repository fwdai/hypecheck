import { HypeMeterPage } from "@/components/hype-meter-page";
import { getTopTrendingQueries } from "@/lib/measure-store";

export default async function Home() {
  const suggestions = await getTopTrendingQueries(10);
  return <HypeMeterPage suggestions={suggestions} />;
}
