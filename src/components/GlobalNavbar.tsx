"use client";

import { useGetMyPermissions } from "@/query/miscellaneous";
import { signOut } from "next-auth/react";
import React from "react";
import {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from "@/components/BuildingBlocks/Drawer";
import { usePopUpsStore } from "@/store";
import { hasAnyModulePermission, hasPermission } from "@/lib/utils";
import Link from "next/link";

const NAVLINKS = [
  {
    module: "ROLE",
    displayName: "Role Management",
    actions: [
      {
        name: "ROLE:READ",
        displayName: "View Roles",
        link: "/main/role",
      },
    ],
  },
];

const GlobalNavbar = () => {
  const { data: myPermissions, isFetching: isMyPermissionsFetching } =
    useGetMyPermissions();
  const { isOpenGlobalNavbar, setIsOpenGlobalNavbar } = usePopUpsStore();
  console.log(myPermissions);

  return (
    <>
      <Drawer
        direction="left"
        open={isOpenGlobalNavbar}
        onOpenChange={(newState) => setIsOpenGlobalNavbar(newState)}
      >
        <DrawerContent>
          {isMyPermissionsFetching ? (
            <div className="w-[400px] h-full grid place-items-center">
              loading...
            </div>
          ) : (
            <DrawerHeader className="w-[400px]">
              <DrawerTitle className="flex justify-between">
                <h1>Menu</h1>
                <DrawerClose>close</DrawerClose>
              </DrawerTitle>
              <DrawerDescription className="">
                {NAVLINKS.map((item) => {
                  return (
                    <>
                      {hasAnyModulePermission(myPermissions!, item.module) && (
                        <p className="mt-2 text-left text-sm bg-slate-300 p-2">
                          {item.displayName}
                        </p>
                      )}
                      {item.actions.map((action) => {
                        return (
                          hasPermission(myPermissions!, action.name) && (
                            <Link
                              href={action.link}
                              className="mt-2 w-full p-2 flex gap-2 hover:bg-slate-200 transition-colors"
                            >
                              {action.displayName}
                            </Link>
                          )
                        );
                      })}
                    </>
                  );
                })}
              </DrawerDescription>
            </DrawerHeader>
          )}
        </DrawerContent>
      </Drawer>
      <button onClick={() => setIsOpenGlobalNavbar(true)}>open menu</button>
    </>
  );
};

export default GlobalNavbar;

{
  /* {isShowCurrCircleSettings && (
  <div>
    <p className="mt-2 text-left text-sm bg-slate-300 p-2">
      Current Circle Settings
    </p>
    <button
      className="mt-2 w-full p-2 flex gap-2 hover:bg-slate-200 transition-colors"
      onClick={() => setIsOpenViewMembersDialog(true)}
    >
      <Eye />
      View Members
    </button>
    <button
      className="mt-2 w-full p-2 flex gap-2 hover:bg-slate-200 transition-colors"
      onClick={() => setIsOpenInviteNewDialog(true)}
    >
      <Plus />
      Invite New Member
    </button>
    <button
      className="mt-2 w-full p-2 flex gap-2 hover:bg-slate-200 transition-colors"
      onClick={handleLeaveTeam}
    >
      <CircleArrowOutUpRight />
      Leave Team
    </button>
  </div>
)}
<div>
  <p className="mt-2 text-left text-sm bg-slate-300 p-2">
    Universal Settings
  </p>
  <Link
    href={"/Main/viewInfo"}
    onClick={() => setIsOpenMainMenuDrawer(false)}
    className="mt-2 w-full p-2 flex gap-2 hover:bg-slate-200 transition-colors"
  >
    <Eye />
    Check when we free
  </Link>
  <Link
    href={"/Main/fillInData"}
    onClick={() => setIsOpenMainMenuDrawer(false)}
    className="mt-2 w-full p-2 flex gap-2 hover:bg-slate-200 transition-colors"
  >
    <Plus />
    Add My Free Time
  </Link>
  <button
    className="mt-2 w-full p-2 flex gap-2 hover:bg-slate-200 transition-colors"
    onClick={() => signOut()}
  >
    <LogOut />
    Sign Out
  </button>
</div> */
}
