import { abbreviateAddress, convertToEmoji } from "utils/util.ts";

interface Deployment {
  amt: number;
  block_index: number;
  block_time: string;
  creator: string;
  deci: number;
  destination: string;
  lim: number;
  max: number;
  op: string;
  p: string;
  tick: string;
  tx_hash: string;
}

interface MintStatus {
  decimals: number;
  limit: number;
  max_supply: number;
  progress: number;
  total_minted: number;
  total_mints: number;
}

interface SRC20TickHeaderProps {
  deployment: Deployment;
  mintStatus: MintStatus;
  totalHolders: number;
  totalMints: number;
  totalTransfers: number;
}

function StatItem(
  { label, value, direction, currency }: {
    label: string;
    value: string | number;
    currency?: string;
    direction: string;
  },
) {
  return (
    <div
      class={`flex ${
        direction === "col" ? "flex-col" : "gap-2 items-center justify-end"
      }`}
    >
      <p class="text-lg font-light text-[#666666]">{label}</p>
      <p
        class={`font-bold text-[#999999] ${
          direction === "col" ? "text-3xl" : "text-lg"
        }`}
      >
        {value}
        {currency
          ? <span className="font-extralight">&nbsp;{currency}</span>
          : ""}
      </p>
    </div>
  );
}

export function SRC20TickHeader({
  deployment,
  mintStatus, // FIXME: these are displayed in the transfer / mints tables
  totalHolders,
  totalMints,
  totalTransfers,
}: SRC20TickHeaderProps) {
  const tickValue = deployment.tick ? convertToEmoji(deployment.tick) : "N/A";
  const deployDate = new Date(deployment.block_time).toLocaleDateString(
    undefined,
    {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  );

  return (
    <div class="flex w-full flex-col gap-6">
      <div class="w-full flex flex-wrap gap-3 md:gap-6 p-3 md:p-6 bg-gradient-to-br from-[#1F002E00] via-[#14001F7F] to-[#1F002EFF]">
        <div class="flex flex-col md:flex-row justify-between gap-3 w-full">
          <div className="flex gap-3">
            <img
              src={`/content/${deployment.tx_hash}.svg`}
              class="max-w-[135px] rounded-lg"
              alt={`${deployment.tick} token image`}
              loading="lazy"
            />
            <div>
              <p class="text-3xl md:text-6xl uppercase font-black text-[#660099]">
                {tickValue}
              </p>
              <p className="text-[#666666] text-2xl font-light">CREATOR</p>
              <p className="text-[#999999] text-2xl font-bold">
                ${deployment.creator}
              </p>
            </div>
          </div>
          <div class="flex flex-col gap-2 justify-end items-start ml-auto">
            <div className="flex gap-2">
              <img src="/img/src20/details/EnvelopeSimple.svg" />
              <img src="/img/src20/details/Globe.svg" />
              <img src="/img/src20/details/TelegramLogo.svg" />
              <img src="/img/src20/details/XLogo.svg" />
            </div>
            <div>
              <StatItem label="Deploy" value={deployDate} direction="row" />
              <StatItem
                label="Block #"
                value={deployment.block_index}
                direction="row"
              />
              <StatItem
                label="TX ID"
                value={abbreviateAddress(deployment.tx_hash)}
                direction="row"
              />
            </div>
          </div>
        </div>

        <p class="text-sm text-[#CCCCCC] font-medium">
          This is an SRC-20 token, there are many like it, but this one is{" "}
          {deployment.tick.toUpperCase()}. This was deployed on block{" "}
          {deployment.block_index}{" "}
          without a description on the deploy. We hope you enjoy.
        </p>
      </div>

      <div class="flex flex-wrap gap-3 md:gap-6 p-3 md:p-6 justify-between bg-gradient-to-br from-[#1F002E00] via-[#14001F7F] to-[#1F002EFF]">
        <StatItem label="Supply" value={deployment.max} direction="col" />
        <div>
          <StatItem label="DECIMALS" value={deployment.deci} direction="row" />
          <StatItem label="LIMIT" value={deployment.lim} direction="row" />
        </div>
      </div>
      <div class="flex flex-wrap gap-3 md:gap-6 p-3 md:p-6 justify-between bg-gradient-to-br from-[#1F002E00] via-[#14001F7F] to-[#1F002EFF]">
        <StatItem
          label="MARKETCAP" // FIXME: Placeholder
          value="931593"
          currency="BTC"
          direction="col"
        />
        <StatItem
          label="24H VOLUME" // FIXME: Placeholder
          value="13427"
          currency="BTC"
          direction="col"
        />
      </div>
      <div class="flex flex-wrap gap-3 md:gap-6 p-3 md:p-6 justify-between bg-gradient-to-br from-[#1F002E00] via-[#14001F7F] to-[#1F002EFF]">
        <StatItem label="PRICE" value="33" currency="SATS" direction="col" />
        <StatItem
          label="24H CHANGE" // FIXME: Placeholder
          value="11"
          currency="SATS"
          direction="col"
        />
      </div>
    </div>
  );
}