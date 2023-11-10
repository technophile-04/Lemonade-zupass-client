// TODO: Eventticket flow
// TODO: List all the Top NFTs and verify
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ArgumentTypeName } from "@pcd/pcd-types";
import { SemaphoreSignaturePCDPackage } from "@pcd/semaphore-signature-pcd";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import { isAddress } from "viem";
import { mainnet, useAccount, useSignMessage } from "wagmi";
import { AddSubscriptionURL } from "~~/components/AddSubscriptionURL";
import { MetaHeader } from "~~/components/MetaHeader";
import { AddressInput } from "~~/components/scaffold-eth";
import { constructZupassPcdGetRequestUrl } from "~~/utils";
import { notification } from "~~/utils/scaffold-eth";

const API_BASE_URL = "https://zupass.lemonade.social/nft";

const pcdArgs = {
  identity: {
    argumentType: ArgumentTypeName.PCD,
    pcdType: SemaphoreSignaturePCDPackage.name,
    value: undefined,
    userProvided: true,
  },
  signedMessage: {
    argumentType: ArgumentTypeName.String,
    value: "Hello",
    userProvided: false,
  },
};

const Home: NextPage = () => {
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();

  const { query } = useRouter();
  const [messageToSign, setMessageToSign] = useState("");
  const [subscriptionURL, setSubscriptionURL] = useState("");
  const [inputAddress, setInputAddress] = useState("");

  const {
    data: signMessageData,
    error,
    isLoading,
    signMessageAsync,
    isSuccess: isSigningMessageSuccessfull,
  } = useSignMessage({
    message: messageToSign,
  });

  const proof = query && query.proof && JSON.parse(decodeURIComponent(query.proof as string));

  const handleSign = async () => {
    try {
      await signMessageAsync();
      notification.success("Message signed successfully");
    } catch (e) {
      notification.error("An Error happend while signing the message");
      console.log("An Error happend while signing the message", e);
      console.log("Error", error?.cause);
    }
  };

  const generateSubscriptionURL = () => {
    if (!proof) {
      notification.error("Please get the proof first");
      return;
    }
    if (!isAddress(inputAddress)) {
      notification.error("Please enter a valid address");
      return;
    }
    const base64EncodedPaylod = window.btoa(
      JSON.stringify({ account: address, signature: signMessageData, pcd: proof.pcd }),
    );

    const url = `${API_BASE_URL}/${mainnet.id}/${inputAddress}/${base64EncodedPaylod}`;
    setSubscriptionURL(url);
  };

  useEffect(() => {
    const getSigningMessage = async () => {
      try {
        if (!address) {
          notification.error("Please connect your wallet");
          return;
        }

        const base64EncodedPCD = window.btoa(proof.pcd);
        const response = await fetch(`${API_BASE_URL}/message?account=${address}&pcd=${base64EncodedPCD}`);
        const resJson = await response.json();
        setMessageToSign(resJson.message);
        notification.success(
          <>
            <p className="font-bold m-0">Proof received!</p>
            <p className="m-0">Please sign the message</p>
          </>,
        );
      } catch (e) {
        console.log("Error while receiving message", e);
        notification.error("Error while receiving message");
      }
    };
    if (proof && address) {
      getSigningMessage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(proof), address]);

  return (
    <>
      <MetaHeader />
      <div className="flex items-center flex-col p-10 space-y-8">
        <div className="bg-base-100 flex items-center flex-col p-5 rounded-2xl">
          <div className="px-5 text-white">
            <h1 className="text-center mb-4">
              <span className="block text-2xl mb-2">Welcome to</span>
              <span className="block text-4xl font-bold">Lemonade ZuPass NFT</span>
            </h1>
          </div>
          {isConnected ? (
            <>
              {messageToSign && !isSigningMessageSuccessfull && (
                <button
                  className={`btn btn-primary btn-outline ${isLoading ? "loading" : ""}`}
                  onClick={() => handleSign()}
                >
                  {isLoading ? "Check Wallet" : "Sign Message"}
                </button>
              )}
              {!proof && (
                <button
                  className="btn btn-primary btn-outline"
                  onClick={() => {
                    const result = constructZupassPcdGetRequestUrl(
                      "https://zupass.org",
                      `${window.location.href}`,
                      SemaphoreSignaturePCDPackage.name,
                      pcdArgs,
                    );

                    console.log("result", result);

                    window.location.href = result; //or you could have a pop up but it's more complicated
                  }}
                >
                  Get proof
                </button>
              )}
            </>
          ) : (
            <button className="btn btn-primary btn-outline" onClick={openConnectModal}>
              Connect Wallet
            </button>
          )}
          {isConnected && isSigningMessageSuccessfull && (
            <div className="flex flex-col space-y-4">
              <AddressInput onChange={setInputAddress} value={inputAddress} placeholder="Contract address" />
              <button className="btn btn-primary btn-outline" onClick={() => generateSubscriptionURL()}>
                Get subscription URL
              </button>
            </div>
          )}
        </div>
        {isSigningMessageSuccessfull && isConnected && subscriptionURL && (
          <div className="bg-base-100 flex items-center flex-col p-5 rounded-2xl">
            <div className="px-5 text-white">
              <p className="text-2xl mb-2 text-center">Success 🥳!</p>
              <p className="text-xl">
                Please copy the below URL and paste it at{" "}
                <a
                  href="https://zupass.org/#/add-subscription"
                  className="underline-offset-4 underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  https://zupass.org/add-subscription
                </a>
              </p>
            </div>
            <AddSubscriptionURL url={subscriptionURL} />
            <iframe
              src="https://zupass.org/#/add-subscription"
              title="Zupass add subscription"
              className="mt-5 w-full h-[400px] md:h-[600px] rounded-2xl"
            ></iframe>
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
