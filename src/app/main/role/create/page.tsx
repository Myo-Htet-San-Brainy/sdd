"use client";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { getAllPermissions, hasPermission } from "@/lib/utils";
import { useGetMyPermissions } from "@/query/miscellaneous";
import Link from "next/link";

import { useState } from "react";

import { X } from "lucide-react";
import toast from "react-hot-toast";
import { useCreateRoleMutation } from "@/query/role";
import AllowedPermissions from "@/components/AllowedPermissions";

const allPermissions = getAllPermissions();
const page = () => {
  const { data: myPermissions, isFetching: isFetchingMyPermissions } =
    useGetMyPermissions();
  const [roleName, setRoleName] = useState("");
  const [allowedPermissions, setAllowedPermissions] = useState<string[]>([]);
  const { mutate } = useCreateRoleMutation();
  if (isFetchingMyPermissions) {
    return <div>checking permission...</div>;
  }
  if (
    !hasPermission(
      myPermissions!,
      MODULES_AND_PERMISSIONS.ROLE.PERMISSION_CREATE.name
    )
  ) {
    return (
      <AllowedPermissions
        actionNotPermitted={
          MODULES_AND_PERMISSIONS.ROLE.PERMISSION_CREATE.displayName
        }
        myPermissions={myPermissions!}
      />
    );
  }

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
    // send roleName + allowedPermissions to API
    mutate(
      { rolename: roleName, allowedPermissions },
      {
        onSuccess(data, variables, context) {
          toast.success("Role Created!");
          setRoleName("");
          setAllowedPermissions([]);
        },
        onError(error, variables, context) {
          toast.error("Creating Role Failed! Try again later...");
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="roleName" className="block mb-1 font-medium">
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
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">✅ Allowed Permissions</h3>
          <div className="border p-2 rounded-md min-h-[100px] space-y-2">
            {allowedPermissions.length === 0 && (
              <p className="text-gray-400">No permissions added yet.</p>
            )}
            {allowedPermissions.map((name) => {
              const perm = allPermissions.find((p) => p.name === name);
              return (
                <div
                  key={name}
                  className="flex justify-between items-center bg-slate-100 px-2 py-1 rounded"
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

        <div>
          <h3 className="font-semibold mb-2">📦 Available Permissions</h3>
          <div className="border p-2 rounded-md min-h-[100px] space-y-2">
            {availablePermissions.length === 0 && (
              <p className="text-gray-400">No more permissions to add.</p>
            )}
            {availablePermissions.map((perm) => (
              <button
                type="button"
                key={perm.name}
                onClick={() => addPermission(perm.name)}
                className="w-full text-left hover:bg-slate-100 p-1 rounded"
              >
                {perm.displayName}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
      >
        Create Role
      </button>
    </form>
  );
};

export default page;
