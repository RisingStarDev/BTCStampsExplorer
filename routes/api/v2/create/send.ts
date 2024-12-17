// routes/api/v2/send.ts
import { Handlers } from "$fresh/server.ts";
import { XcpManager } from "$server/services/xcpService.ts";
import { ResponseUtil } from "$lib/utils/responseUtil.ts";
import { PSBTService } from "$server/services/transaction/psbtService.ts";

interface SendInput {
  address: string;
  destination: string;
  asset: string;
  quantity: number;
  options: {
    return_psbt: boolean;
    fee_per_kb: number;
  };
}

export const handler: Handlers = {
  async POST(req) {
    try {
      const input: SendInput = await req.json();
      console.log("Received send input:", input);

      const { address, destination, asset, quantity, options } = input;

      // Validate fee rate
      if (typeof options?.fee_per_kb !== "number" || options.fee_per_kb <= 0) {
        return ResponseUtil.badRequest("Invalid fee rate");
      }

      // Add dust size to options
      const dispenserOptions = {
        ...options,
        regular_dust_size: 546,
        allow_unconfirmed_inputs: true,
        validate: true,
      };

      try {
        // Call XcpManager with the enhanced options
        const response = await XcpManager.createSend(
          address,
          destination,
          asset,
          quantity,
          dispenserOptions,
        );

        if (!response?.result?.psbt) {
          if (response?.error) {
            return ResponseUtil.badRequest(response.error);
          }
          throw new Error("Failed to create send transaction.");
        }

        console.log("PSBT Base64 from XCP:", response.result.psbt);

        // Process PSBT using shared service
        const processedPSBT = await PSBTService.processCounterpartyPSBT(
          response.result.psbt,
          address,
          options.fee_per_kb,
          { validateInputs: true, validateFees: true },
        );

        return new Response(JSON.stringify(processedPSBT), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (error: unknown) {
        // Pass through the specific error message
        const errorMessage = error instanceof Error
          ? error.message
          : "Unknown error";
        return ResponseUtil.badRequest(errorMessage);
      }
    } catch (error: unknown) {
      console.error("Error processing send request:", error);
      const errorMessage = error instanceof Error
        ? error.message
        : "Failed to process send request";
      return ResponseUtil.badRequest(errorMessage);
    }
  },
};