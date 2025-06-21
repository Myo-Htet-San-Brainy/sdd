"use client";

import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { getAllPermissions, hasPermission } from "@/lib/utils";
import { useGetMyPermissions } from "@/query/miscellaneous";
import { useGetRole, useUpdateRoleMutation } from "@/query/role";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { CustomError } from "@/lib/CustomError";
import { SubmitButton } from "@/components/SubmitButton";

const allPermissions = getAllPermissions();

const Page = () => {
  const [roleName, setRoleName] = useState("");
  const [allowedPermissions, setAllowedPermissions] = useState<string[]>([]);

  const {
    data: myPermissions,
    isFetching: isFetchingMyPermissions,
    isPending: isPendingMyPermissions,
  } = useGetMyPermissions();

  const { id } = useParams<{ id: string }>();
  const {
    data: role,
    isFetching: isFetchingRole,
    isPending: isPendingRole,
    isError: isErrorRole,
    error: errorRole,
  } = useGetRole({ id });

  const { mutate, isPending: isUpdating } = useUpdateRoleMutation();
  const router = useRouter();

  useEffect(() => {
    if (role) {
      setAllowedPermissions(role.permissions);
      setRoleName(role.name);
    }
  }, [role]);

  const availablePermissions = allPermissions.filter(
    (perm) => !allowedPermissions.includes(perm.name)
  );

  const addPermission = (name: string) => {
    setAllowedPermissions([...allowedPermissions, name]);
  };

  const removePermission = (name: string) => {
    setAllowedPermissions(allowedPermissions.filter((perm) => perm !== name));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (allowedPermissions.length <= 0) {
      toast.error("Please select at least one permission.");
      return;
    }

    mutate(
      { roleId: id, rolename: roleName, allowedPermissions },
      {
        onSuccess: () => {
          toast.success("Role updated!");
          router.push("/main/role");
        },
        onError: (error) => {
          if (error instanceof CustomError) {
            if (error.status === 404) {
              toast.error("Role not found!");
              router.push("/main/role");
            } else {
              toast.error("Internal server error!");
            }
          }
        },
      }
    );
  };

  if (isFetchingMyPermissions || isPendingMyPermissions) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-zinc-100">
        <p className="text-red-600 text-lg font-medium">
          Checking permission...
        </p>
      </div>
    );
  }

  if (
    !hasPermission(
      myPermissions!,
      MODULES_AND_PERMISSIONS.ROLE.PERMISSION_UPDATE.name
    )
  ) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-zinc-100">
        <p className="text-red-600 text-lg font-medium text-center">
          You are not permitted to update roles.
        </p>
      </div>
    );
  }

  if (isFetchingRole || isPendingRole) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-zinc-100">
        <p className="text-red-600 text-lg font-medium">
          Preparing update form...
        </p>
      </div>
    );
  }

  if (isErrorRole) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex flex-col items-center justify-center gap-2 bg-zinc-100">
        <p className="text-red-600 text-lg font-medium text-center">
          {errorRole.message || "Something went wrong!"}
        </p>
        <Link href="/main/role" className="text-blue-600 underline">
          Update other roles
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-zinc-50 py-10 px-4">
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto bg-white border border-zinc-200 shadow-md rounded-2xl p-6 space-y-6"
      >
        <h1 className="text-xl font-semibold text-red-600 border-b pb-2">
          Update Role
        </h1>

        <div>
          <label
            htmlFor="roleName"
            className="block font-medium text-zinc-700 mb-1"
          >
            Role Name <span className="text-red-500">*</span>
          </label>
          <input
            id="roleName"
            type="text"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            required
            minLength={1}
            placeholder="Enter role name"
            className="w-full text-zinc-800 border border-zinc-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Allowed permissions */}
          <div>
            <h3 className="font-semibold text-zinc-700 mb-2">
              ✅ Allowed Permissions
            </h3>
            <div className="border border-zinc-200 p-2 rounded-md min-h-[100px] space-y-2 bg-zinc-50">
              {allowedPermissions.length === 0 && (
                <p className="text-sm text-zinc-400">
                  No permissions added yet.
                </p>
              )}
              {allowedPermissions.map((name) => {
                const perm = allPermissions.find((p) => p.name === name);
                return (
                  <div
                    key={name}
                    className="flex justify-between items-center bg-slate-100 px-3 py-1.5 rounded text-zinc-800"
                  >
                    <span>{perm?.displayName || name}</span>
                    <button
                      type="button"
                      onClick={() => removePermission(name)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Available permissions */}
          <div>
            <h3 className="font-semibold text-zinc-700 mb-2">
              📦 Available Permissions
            </h3>
            <div className="border border-zinc-200 p-2 rounded-md min-h-[100px] space-y-2 bg-zinc-50">
              {availablePermissions.length === 0 && (
                <p className="text-sm text-zinc-400">
                  No more permissions to add.
                </p>
              )}
              {availablePermissions.map((perm) => (
                <button
                  type="button"
                  key={perm.name}
                  onClick={() => addPermission(perm.name)}
                  className="w-full text-left text-zinc-800 hover:bg-slate-100 px-2 py-1 rounded transition"
                >
                  {perm.displayName}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4">
          <SubmitButton isLoading={isUpdating}>Update Role</SubmitButton>
        </div>
      </form>
    </div>
  );
};

export default Page;
