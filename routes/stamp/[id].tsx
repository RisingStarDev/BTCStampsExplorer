import { StampRow, StampSectionProps } from "globals";

import { Handlers } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

import { StampImage } from "$islands/stamp/details/StampImage.tsx";
import { StampInfo } from "$islands/stamp/details/StampInfo.tsx";
import { StampRelatedInfo } from "$islands/stamp/details/StampRelatedInfo.tsx";
import { StampRelatedGraph } from "$islands/stamp/details/StampRelatedGraph.tsx";
import { RecentSales } from "$islands/stamp/details/RecentSales.tsx";

import { StampController } from "$server/controller/stampController.ts";
import { StampService } from "$server/services/stampService.ts";
import { CollectionController } from "$server/controller/collectionController.ts";
import { fetchBTCPriceInUSD } from "$lib/utils/balanceUtils.ts";
import { serverConfig } from "$server/config/config.ts";
import { DispenserManager } from "$server/services/xcpService.ts";
import { formatSatoshisToBTC } from "$lib/utils/formatUtils.ts";

interface StampDetailPageProps {
  data: {
    stamp: StampRow;
    total: number;
    sends: any;
    dispensers: any;
    dispenses: any;
    holders: any;
    vaults: any;
    last_block: number;
    stamps_recent: any;
    collections: CollectionRow[];
    lowestPriceDispenser: any; // Add this property
  };
}

interface StampData {
  stamp: StampRow;
  total: number;
  sends: any;
  dispensers: any;
  dispenses: any;
  holders: any;
  last_block: number;
  stamps_recent: any;
  collections: CollectionRow[];
  lowestPriceDispenser: any;
}

export const handler: Handlers<StampData> = {
  async GET(_req: Request, ctx) {
    try {
      const url = new URL(_req.url);
      const { id } = ctx.params;
      const stampData = await StampController.getStampDetailsById(id);

      // Check for null/undefined stamp data
      if (!stampData?.data?.stamp) {
        return ctx.renderNotFound();
      }

      // Only fetch dispensers for STAMP or SRC-721
      let dispensers = [];
      let lowestPriceDispenser = null;
      let floorPrice = null;

      if (
        stampData.data.stamp.ident === "STAMP" ||
        stampData.data.stamp.ident === "SRC-721"
      ) {
        // Fetch dispensers separately
        const dispensersData = await DispenserManager.getDispensersByCpid(
          stampData.data.stamp.cpid,
        );
        dispensers = dispensersData?.dispensers || [];

        // Find the lowest price open dispenser
        const openDispensers = dispensers.filter((d) => d.give_remaining > 0);
        lowestPriceDispenser = openDispensers.reduce(
          (lowest, dispenser) => {
            if (!lowest || dispenser.satoshirate < lowest.satoshirate) {
              return dispenser;
            }
            return lowest;
          },
          null,
        );

        // Calculate floor price from lowest price dispenser
        floorPrice = lowestPriceDispenser
          ? Number(
            formatSatoshisToBTC(lowestPriceDispenser.satoshirate, {
              includeSymbol: false,
            }),
          )
          : null;
      }

      const btcPrice = await fetchBTCPriceInUSD(serverConfig.API_BASE_URL);

      // Calculate USD values
      const stampWithPrices = {
        ...stampData.data.stamp,
        floorPrice,
        floorPriceUSD: floorPrice !== null ? floorPrice * btcPrice : null,
        marketCapUSD: typeof stampData.data.stamp.marketCap === "number"
          ? stampData.data.stamp.marketCap * btcPrice
          : null,
      };

      // Don't wait for recent sales - let it load independently
      StampController.getRecentSales(1, 6).then(result => {
        console.log("Recent sales loaded: ", result);
      }).catch(error => {
        console.error("Error loading recent sales:", error);
      });

      return ctx.render({
        ...stampData.data,
        stamp: stampWithPrices,
        stamps_recent: { data: [] }, // Initialize empty, will be populated by island
        collections,
        last_block: stampData.last_block,
        lowestPriceDispenser,
        dispensers,
      });
    } catch (error) {
      console.error("Error fetching stamp data:", error);
      if (error.message?.includes("Stamp not found")) {
        return ctx.renderNotFound();
      }
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};

export default function StampPage(props: StampDetailPageProps) {
  const {
    collections,
    stamp,
    holders,
    sends,
    dispensers,
    dispenses,
    stamps_recent,
    lowestPriceDispenser,
  } = props.data;

  const title = stamp.name
    ? `${stamp.name}`
    : `Bitcoin Stamp #${stamp.stamp} - stampchain.io`;

  const dispensesWithRates = StampService.mapDispensesWithRates(
    dispenses,
    dispensers,
  );

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta property="og:title" content={title} />
        <meta
          property="og:description"
          content="Unprunable UTXO Art, Because Sats Don't Exist"
        />
        <meta property="og:image" content={stamp.stamp_url} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <div className="flex flex-col gap-10 tablet:gap-20 desktop:gap-50">
        <div className="grid grid-cols-1 tablet:grid-cols-2 gap-12">
          <StampImage
            stamp={stamp}
            flag={true}
          />
          <StampInfo
            stamp={stamp}
            lowestPriceDispenser={lowestPriceDispenser}
          />
        </div>

        <StampRelatedGraph
          holders={holders}
        />

        <StampRelatedInfo
          sends={sends}
          dispensers={dispensers}
          dispensesWithRates={dispensesWithRates}
        />

        <RecentSales initialData={stamps_recent.data} />
      </div>
    </>
  );
}
