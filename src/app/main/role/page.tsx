"use client";
import { hasPermission } from "@/lib/utils";
import { useGetMyPermissions } from "@/query/miscellaneous";
import React from "react";

const REQUESTED_PERMISSION = "ROLE:READ";

const Page = () => {
  const { data: myPermissions, isFetching: isMyPermissionsFetching } =
    useGetMyPermissions();
  if (isMyPermissionsFetching) {
    return <div>loading...</div>;
  }
  if (!hasPermission(myPermissions!, REQUESTED_PERMISSION)) {
    return (
      <div>
        you are not permitted to do role Management. do these instead...
      </div>
    );
  }
  return <div>Role List</div>;
};

export default Page;
