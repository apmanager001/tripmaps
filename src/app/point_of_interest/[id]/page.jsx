import React from "react";
import PointOfInterest from "../comp/pointOfInterest";

const Page = async ({ params }) => {
  const { id } = await params;

  return (
    <div>
      <PointOfInterest poiId={id} />
    </div>
  );
};

export default Page;
