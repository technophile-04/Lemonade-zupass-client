import { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { CheckCircleIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";

export const AddSubscriptionURL = ({ url }: { url: string }) => {
  const [urlCopied, setUrlCopied] = useState(false);

  return (
    <div className="flex text-sm rounded-3xl peer-checked:rounded-b-none min-h-0 bg-secondary py-0 max-w-[80%]">
      <div className="mt-1 pl-2">
        {urlCopied ? (
          <CheckCircleIcon className="ml-1.5 text-xl font-normal h-5 w-5 cursor-pointer" aria-hidden="true" />
        ) : (
          <CopyToClipboard
            text={url}
            onCopy={() => {
              setUrlCopied(true);
              setTimeout(() => {
                setUrlCopied(false);
              }, 800);
            }}
          >
            <DocumentDuplicateIcon className="ml-1.5 text-xl font-normal h-5 w-5 cursor-pointer" aria-hidden="true" />
          </CopyToClipboard>
        )}
      </div>
      <div className="flex-wrap collapse collapse-arrow">
        <input type="checkbox" className="min-h-0 peer" />
        <div className="collapse-title text-sm min-h-0 py-1.5 pl-1">
          <strong>Reveal URL</strong>
        </div>
        <CopyToClipboard
          text={url}
          onCopy={() => {
            setUrlCopied(true);
            setTimeout(() => {
              setUrlCopied(false);
            }, 800);
          }}
        >
          <div className="collapse-content break-words pr-2 bg-secondary rounded-t-none rounded-3xl max-w-[100px] md:max-w-sm cursor-pointer">
            {url}
          </div>
        </CopyToClipboard>
      </div>
    </div>
  );
};
