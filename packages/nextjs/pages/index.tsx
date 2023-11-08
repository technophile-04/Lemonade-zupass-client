import { useEffect } from "react";
import { useRouter } from "next/router";
import { ArgumentTypeName } from "@pcd/pcd-types";
import { SemaphoreIdentityPCDPackage } from "@pcd/semaphore-identity-pcd";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { AddSubscriptionURL } from "~~/components/AddSubscriptionURL";
import { MetaHeader } from "~~/components/MetaHeader";
import { SignMessageButton } from "~~/components/SignMessageButton";
import { notification } from "~~/utils/scaffold-eth";

const pcdArgs = {
  identity: {
    argumentType: ArgumentTypeName.PCD,
    pcdType: SemaphoreIdentityPCDPackage.name,
    value: undefined,
    userProvided: true,
  },
  fieldsToReveal: {
    argumentType: ArgumentTypeName.ToggleList,
    value: {},
    userProvided: false,
    hideIcon: true,
  },
};

function constructZupassPcdGetRequestUrl(
  zupassClientUrl: string,
  returnUrl: string,
  pcdType: any,
  args: any,
  options?: any,
) {
  const req: any = {
    type: "Get",
    returnUrl: returnUrl,
    args: args,
    pcdType,
    options,
  };
  const encReq = encodeURIComponent(JSON.stringify(req));
  return `${zupassClientUrl}#/prove?request=${encReq}`;
}

const Home: NextPage = () => {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const { query } = useRouter();

  const proof = query && query.proof && JSON.parse(decodeURIComponent(query.proof as string));

  useEffect(() => {
    const doDeserialization = async () => {
      const deserialized = proof && (await SemaphoreIdentityPCDPackage.deserialize(proof.pcd));
      const verified = await SemaphoreIdentityPCDPackage.verify(deserialized);
      console.log("PRC IS:", JSON.parse(proof.pcd));
      notification.success("Verfied");
      console.log("Deserialized", deserialized);
      console.log("Commitment", deserialized.claim.identity.commitment);
      console.log("verified", verified);
    };
    if (proof) {
      doDeserialization();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(proof)]);

  return (
    <>
      <MetaHeader />
      <div className="flex items-center flex-col p-10 space-y-8">
        <div className="bg-base-100 flex items-center flex-col p-5 rounded-2xl">
          <div className="px-5 text-white">
            <h1 className="text-center mb-8">
              <span className="block text-2xl mb-2">Welcome to</span>
              <span className="block text-4xl font-bold">Lemonade ZuPass NFT Verification</span>
            </h1>
          </div>
          {isConnected ? (
            <>
              <SignMessageButton />
              <button
                className="btn btn-primary btn-outline m-4"
                onClick={() => {
                  const result = constructZupassPcdGetRequestUrl(
                    "https://zupass.org",
                    "http://localhost:3000/",
                    SemaphoreIdentityPCDPackage.name,
                    pcdArgs,
                  );

                  console.log("result", result);

                  window.location.href = result; //or you could have a pop up but it's more complicated
                }}
              >
                Get proof
              </button>
            </>
          ) : (
            <button className="btn btn-primary btn-outline" onClick={openConnectModal}>
              Connect Wallet
            </button>
          )}
        </div>
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
          <AddSubscriptionURL url="https://www.google.com/search?as_q=you+have+to+write+a+really+really+long+search+to+get+to+2000+characters.+like+seriously%2C+you+have+no+idea+how+long+it+has+to+be&as_epq=2000+characters+is+absolutely+freaking+enormous.+You+can+fit+sooooooooooooooooooooooooooooooooo+much+data+into+2000+characters.+My+hands+are+getting+tired+typing+this+many+characters.+I+didn%27t+even+realise+how+long+it+was+going+to+take+to+type+them+all.&as_oq=Argh!+So+many+characters.+I%27m+bored+now%2C+so+I%27ll+just+copy+and+paste.+I%27m+bored+now%2C+so+I%27ll+just+copy+and+paste.I%27m+bored+now%2C+so+I%27ll+just+copy+and+paste.I%27m+bored+now%2C+so+I%27ll+just+copy+and+paste.I%27m+bored+now%2C+so+I%27ll+just+copy+and+paste.I%27m+bored+now%2C+so+I%27ll+just+copy+and+paste.I%27m+bored+now%2C+so+I%27ll+just+copy+and+paste.I%27m+bored+now%2C+so+I%27ll+just+copy+and+paste.I%27m+bored+now%2C+so+I%27ll+just+copy+and+paste.I%27m+bored+now%2C+so+I%27ll+just+copy+and+paste.I%27m+bored+now%2C+so+I%27ll+just+copy+and+paste.I%27m+bored+now%2C+so+I%27ll+just+copy+and+paste.I%27m+bored+now%2C+so+I%27ll+just+copy+and+paste.I%27m+bored+now%2C+so+I%27ll+just+copy+and+paste.I%27m+bored+now%2C+so+I%27ll+just+copy+and+paste.I%27m+bored+now%2C+so+I%27ll+just+copy+and+paste.I%27m+bored+now%2C+so+I%27ll+just+copy+and+paste.I%27m+bored+now%2C+so+I%27ll+just+copy+and+paste.I%27m+bored+now%2C+so+I%27ll+just+copy+and+paste.I%27m+bored+now%2C+so+I%27ll+just+copy+and+paste.I%27m+bored+now%2C+so+I%27ll+just+copy+and+paste.I%27m+bored+now%2C+so+I%27ll+just+copy+and+paste.I%27m+bored+now%2C+so+I%27ll+just+copy+and+paste.I%27m+bored+now%2C+so+I%27ll+just+copy+and+paste.I%27m+bored+now%2C+so+I%27ll+just+copy+and+paste.&as_eq=It+has+to+be+freaking+enormously+freaking+enormous&as_nlo=123&as_nhi=456&lr=lang_hu&cr=countryAD&as_qdr=m&as_sitesearch=stackoverflow.com&as_occt=title&safe=active&tbs=rl%3A1%2Crls%3A0&as_filetype=xls&as_rights=(cc_publicdomain%7Ccc_attribute%7Ccc_sharealike%7Ccc_nonderived).-(cc_noncommercial)&gws_rd=ssl" />
        </div>
      </div>
    </>
  );
};

export default Home;
