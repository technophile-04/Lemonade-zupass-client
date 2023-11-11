import { useState } from "react";
import { useRouter } from "next/router";
import { EdDSATicketPCDPackage } from "../pcd/eddsa-ticket-pcd/src";
import { ZKEdDSAEventTicketPCDArgs, ZKEdDSAEventTicketPCDPackage } from "../pcd/zk-eddsa-event-ticket-pcd/src";
import { ArgumentTypeName } from "@pcd/pcd-types";
import { SemaphoreIdentityPCDPackage } from "@pcd/semaphore-identity-pcd";
import { NextPage } from "next";
import { v5 as uuidv5 } from "uuid";
import { mainnet } from "wagmi";
import { AddressInput } from "~~/components/scaffold-eth";
import { constructZupassPcdGetRequestUrl, isLemonadePublicKey } from "~~/utils";
import { notification } from "~~/utils/scaffold-eth";

const redirectToZuPass = (args: ZKEdDSAEventTicketPCDArgs) => {
  const result = constructZupassPcdGetRequestUrl(
    "https://zupass.org",
    `${window.location.href}`,
    ZKEdDSAEventTicketPCDPackage.name,
    args,
  );

  window.location.href = result;
};

const uuidNamespace = "5ea7f241-94a2-4099-b986-bab20fc8443d";

const constructEventPCDArgs = (eventId: string, productId: string): ZKEdDSAEventTicketPCDArgs => ({
  ticket: {
    argumentType: ArgumentTypeName.PCD,
    pcdType: EdDSATicketPCDPackage.name,
    value: undefined,
    userProvided: true,
    validatorParams: {
      eventIds: [eventId],
      productIds: [productId],
      notFoundMessage: "No eligible PCDs found",
    },
  },
  identity: {
    argumentType: ArgumentTypeName.PCD,
    pcdType: SemaphoreIdentityPCDPackage.name,
    value: undefined,
    userProvided: true,
  },
  validEventIds: {
    argumentType: ArgumentTypeName.StringArray,
    value: [eventId],
    userProvided: false,
  },
  externalNullifier: {
    argumentType: ArgumentTypeName.BigInt,
    value: undefined,
    userProvided: false,
  },
  fieldsToReveal: {
    argumentType: ArgumentTypeName.ToggleList,
    value: {},
    userProvided: false,
    hideIcon: true,
  },
  watermark: {
    argumentType: ArgumentTypeName.BigInt,
    value: "1",
    userProvided: false,
  },
});

const Verify: NextPage = () => {
  const { query } = useRouter();
  const [zuPassType, setZuPassType] = useState("");
  const [inputAddress, setInputAddress] = useState("");
  const proof = query && query.proof && JSON.parse(decodeURIComponent(query.proof as string));
  return (
    <div className="flex items-center flex-col p-10 space-y-8 rounded-2xl">
      <div className="bg-base-100 flex flex-col justify-center items-center p-5 rounded-2xl w-4/5 md:min-h-[75vh] xl:w-2/4 space-y-6">
        <div className="px-5 text-white">
          <h1 className="text-center mb-4">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-3xl font-bold">Lemonade ZuPass </span>
            <span className="block text-3xl font-bold">NFT Verification</span>
          </h1>
        </div>
        <div className="flex flex-col space-y-4">
          {!proof ? (
            <>
              <select
                className="select select-primary select-bordered w-full max-w-xs text-primary"
                value={zuPassType}
                onChange={e => setZuPassType(e.target.value)}
              >
                <option disabled value={""}>
                  Select Zupass Type
                </option>
                <option value={"nft"}>NFT</option>
                <option value={"event"}>Event</option>
              </select>
              <div className="flex flex-col">
                {zuPassType === "nft" ? (
                  <AddressInput onChange={setInputAddress} value={inputAddress} placeholder="Contract address" />
                ) : zuPassType === "event" ? (
                  <select className="select select-bordered w-full max-w-xs">
                    <option disabled selected>
                      Select Event
                    </option>
                    <option value={"Lemonade"}>Lemonade event</option>
                  </select>
                ) : null}
              </div>
              <button
                className={`btn btn-primary btn-outline mt-4 ${!zuPassType ? "disabled" : ""}`}
                disabled={!zuPassType}
                onClick={() => {
                  if (zuPassType === "nft") {
                    const ticketName = "Holder";
                    const nftProductId = uuidv5(ticketName, uuidNamespace);
                    const nftEventId = uuidv5(mainnet.id.toString() + inputAddress, uuidNamespace);

                    const args = constructEventPCDArgs(nftEventId, nftProductId);
                    redirectToZuPass(args);
                  } else {
                    const lemonadeEventId = "651a604db2a69fb20921d212";
                    const lemonadeTicketTypeId = "6523e69fdb09a89db2be89ab";
                    const ticketEventId = uuidv5(lemonadeEventId, uuidNamespace);

                    const ticketProductId = uuidv5(lemonadeTicketTypeId, uuidNamespace);
                    const args = constructEventPCDArgs(ticketEventId, ticketProductId);

                    redirectToZuPass(args);
                  }
                }}
              >
                Get Proof
              </button>
            </>
          ) : (
            <button
              className="btn btn-primary btn-outline"
              onClick={async () => {
                if (!proof) {
                  notification.error("No PCD found!");
                  return;
                }

                const deserializedPCD = await ZKEdDSAEventTicketPCDPackage.deserialize(proof.pcd);

                if (!ZKEdDSAEventTicketPCDPackage.verify(deserializedPCD)) {
                  notification.error(`[ERROR Frontend] ZK ticket PCD is not valid`);
                  return;
                }
                console.log("deserializedPCD", deserializedPCD);

                if (!isLemonadePublicKey(deserializedPCD.claim.signer)) {
                  notification.error(`[ERROR Frontend] PCD is not signed by Zupass`);
                  return;
                }

                // TODO: Use real nonce generated by the server
                if (deserializedPCD.claim.watermark.toString() !== "1") {
                  notification.error(`[ERROR Frontend] PCD watermark doesn't match`);
                  return;
                }

                notification.success(
                  <>
                    <p className="font-bold m-0">Frontend Verified!</p>
                    <p className="m-0">
                      The proof has been verified
                      <br /> by the frontend.
                    </p>
                  </>,
                );
              }}
            >
              Verify
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Verify;
