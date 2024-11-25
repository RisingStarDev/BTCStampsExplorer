import { getPaginationParams } from "$lib/utils/paginationUtils.ts";
import { Handlers } from "$fresh/server.ts";

import WalletHeader from "$islands/Wallet/details/WalletHeader.tsx";
import WalletDetails from "$islands/Wallet/details/WalletDetails.tsx";
import WalletContent from "$islands/Wallet/details/WalletContent.tsx";
import { serverConfig } from "$server/config/config.ts";
import { Dispenser, WalletData, WalletPageProps } from "$lib/types/index.d.ts";
import { StampController } from "$server/controller/stampController.ts";
import { getAddressInfo } from "$lib/utils/balanceUtils.ts";

export const handler: Handlers = {
  async GET(req, ctx) {
    const { address } = ctx.params;
    const url = new URL(req.url);
    const stampsParams = getPaginationParams(url, "stamps");
    const src20Params = getPaginationParams(url, "src20");
    const openListingsParams = getPaginationParams(url, "open_listings");
    const closedListingsParams = getPaginationParams(url, "closed_listings");

    try {
      // Fetch all required data in parallel
      const [
        stampsResponse,
        src20Response,
        btcInfo,
        openDispensersResponse,
        closedDispensersResponse,
      ] = await Promise.allSettled([
        // Stamps data with pagination
        fetch(
          `${serverConfig.API_BASE_URL}/api/v2/stamps/balance/${address}?page=${stampsParams.page}&limit=${stampsParams.limit}`,
        ),
        // SRC20 data with pagination
        fetch(
          `${serverConfig.API_BASE_URL}/api/v2/src20/balance/${address}?page=${src20Params.page}&limit=${src20Params.limit}`,
        ),
        // Get BTC info with USD value included
        getAddressInfo(address, {
          includeUSD: true,
          apiBaseUrl: serverConfig.API_BASE_URL,
        }),
        StampController.getDispensersWithStampsByAddress(
          address,
          openListingsParams.limit || 10,
          openListingsParams.page || 1,
          "open",
        ),
        StampController.getDispensersWithStampsByAddress(
          address,
          closedListingsParams.limit || 10,
          closedListingsParams.page || 1,
          "closed",
        ),
      ]);

      const stampsData = await stampsResponse.json();
      const src20Data = await src20Response.json();

      const openDispensersData = openDispensersResponse.status === "fulfilled"
        ? openDispensersResponse.value
        : { dispensers: [], total: 0 };

      const closedDispensersData =
        closedDispensersResponse.status === "fulfilled"
          ? closedDispensersResponse.value
          : { dispensers: [], total: 0 };

      const walletData: WalletData = {
        balance: btcInfo?.balance ?? 0,
        usdValue: (btcInfo?.balance ?? 0) * (btcInfo?.btcPrice ?? 0),
        address,
        btcPrice: btcInfo?.btcPrice ?? 0,
        fee: 0,
        txCount: btcInfo?.txCount ?? 0,
        unconfirmedBalance: btcInfo?.unconfirmedBalance ?? 0,
        unconfirmedTxCount: btcInfo?.unconfirmedTxCount ?? 0,
        dispensers: {
          open: openDispensersData.dispensers.length,
          closed: closedDispensersData.dispensers.length,
          total: openDispensersData.total + closedDispensersData.total,
          items: [
            ...openDispensersData.dispensers,
            ...closedDispensersData.dispensers,
          ],
        },
      };

      const dispenserSection = {
        dispensers: [
          ...openDispensersData.dispensers,
          ...closedDispensersData.dispensers,
        ],
        openPagination: {
          page: openListingsParams.page || 1,
          limit: openListingsParams.limit || 10,
          total: openDispensersData.total,
          totalPages: Math.ceil(
            openDispensersData.total / (openListingsParams.limit || 10),
          ),
        },
        closedPagination: {
          page: closedListingsParams.page || 1,
          limit: closedListingsParams.limit || 10,
          total: closedDispensersData.total,
          totalPages: Math.ceil(
            closedDispensersData.total / (closedListingsParams.limit || 10),
          ),
        },
      };

      return ctx.render({
        data: {
          stamps: {
            data: stampsData.data,
            pagination: {
              page: stampsParams.page || 1,
              limit: stampsParams.limit || 10,
              total: stampsData.total,
              totalPages: Math.ceil(
                stampsData.total / (stampsParams.limit || 10),
              ),
            },
          },
          src20: {
            data: src20Data.data,
            pagination: {
              page: src20Params.page || 1,
              limit: src20Params.limit || 10,
              total: src20Data.total,
              totalPages: Math.ceil(
                src20Data.total / (src20Params.limit || 10),
              ),
            },
          },
          dispensers: dispenserSection,
        },
        address,
        walletData,
        stampsTotal: stampsData.total || 0,
        src20Total: src20Data.total || 0,
      });
    } catch (error) {
      console.error("Error:", error);
      // Return safe default state
      return ctx.render({
        data: {
          stamps: {
            data: [],
            pagination: { page: 1, limit: 8, total: 0, totalPages: 0 },
          },
          src20: {
            data: [],
            pagination: { page: 1, limit: 8, total: 0, totalPages: 0 },
          },
          dispenser: {
            dispensers: [],
            pagination: { page: 1, limit: 8, total: 0, totalPages: 0 },
          },
        },
        address,
        walletData: {
          balance: 0,
          usdValue: 0,
          address,
          btcPrice: 0,
          fee: 0,
          txCount: 0,
          unconfirmedBalance: 0,
          unconfirmedTxCount: 0,
          dispensers: {
            open: 0,
            closed: 0,
            total: 0,
            items: [],
          },
        },
        stampsTotal: 0,
        src20Total: 0,
      });
    }
  },
};

export default function Wallet(props: WalletPageProps) {
  const { data } = props;

  return (
    <div class="flex flex-col gap-8">
      <WalletHeader
        filterBy={[]}
        sortBy="DESC"
      />
      <WalletDetails
        walletData={data.walletData}
        stampsTotal={data.stampsTotal}
        src20Total={data.src20Total}
        stampsCreated={0}
        setShowItem={() => {}}
      />
      <WalletContent
        stamps={data.data.stamps}
        src20={data.data.src20}
        dispenser={data.data.dispenser}
        address={data.address}
        showItem="stamp"
      />
    </div>
  );
}
