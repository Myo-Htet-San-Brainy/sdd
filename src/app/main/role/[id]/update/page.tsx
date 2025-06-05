"use client";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { getAllPermissions, hasPermission } from "@/lib/utils";
import { useGetMyPermissions } from "@/query/miscellaneous";
import { useGetRole } from "@/query/role";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";

const allPermissions = getAllPermissions();

const Page = () => {
  const [roleName, setRoleName] = useState("");
  const [allowedPermissions, setAllowedPermissions] = useState<string[]>([]);

  const { data: myPermissions, isFetching: isFetchingMyPermissions } =
    useGetMyPermissions();
  const { id } = useParams<{ id: string }>();
  const {
    data: role,
    isFetching: isFetchingRole,
    isError: isErrorRole,
    error: errorRole,
  } = useGetRole({ id });

  useEffect(() => {
    if (role) {
      setAllowedPermissions(role.permissions);
      setRoleName(role.name);
    }
  }, [role]);

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
      <div>
        you are not permitted to do role Management. do these instead...
        {Object.values(MODULES_AND_PERMISSIONS).map((module) => {
          return (
            hasPermission(myPermissions!, module.PERMISSION_READ.name) && (
              <Link
                href={module.PERMISSION_READ.link}
                className="mt-2 w-full p-2 flex gap-2 hover:bg-slate-200 transition-colors"
              >
                {module.PERMISSION_READ.displayName}
              </Link>
            )
          );
        })}
      </div>
    );
  }

  if (isFetchingRole) {
    return <div>preparing update form...</div>;
  }

  if (isErrorRole) {
    return (
      <div>
        <p>{errorRole.message || "Something went wrong!"}</p>
        <Link href={"/main/role"}>View other Roles</Link>
      </div>
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
    console.log({ roleName, allowedPermissions });
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
        Update Role
      </button>
    </form>
  );
};

export default Page;
