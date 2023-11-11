/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";

export const HotCollections = () => {
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch("https://zupass.lemonade.social/nft/collections");
        const data = await response.json();
        setCollections(data.collections);
      } catch (error) {
        console.error("Error fetching collections:", error);
      }
    };

    fetchCollections();
  }, []);

  return (
    <div>
      <h2 className="text-white text-[15px] mb-4">Hot Collections</h2>
      <div className="flex flex-wrap gap-2">
        {collections.map((collection: any) => (
          <div key={collection.collection_id} className="flex items-center gap-2 bg-[#212121] rounded-[27px] p-3 h-14">
            <img
              src={collection.image_url}
              alt={`${collection.name} Image`}
              width={30}
              height={30}
              className="object-cover rounded-full"
            />
            <div>
              <h3 className="text-[15px] m-0 text-white">{collection.name}</h3>
              {/* <p></p> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
