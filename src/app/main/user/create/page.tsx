"use client";

import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { hasPermission } from "@/lib/utils";
import { useGetMyPermissions } from "@/query/miscellaneous";
import { useCreateUserMutation } from "@/query/user";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGetRoles } from "@/query/role";
import Link from "next/link";
import toast from "react-hot-toast";
import { SubmitButton } from "@/components/SubmitButton";
import { userSchema } from "@/schema";

const Page = () => {
  const {
    data: myPermissions,
    isFetching: isFetchingMyPermissions,
    isPending: isPendingMyPermissions,
  } = useGetMyPermissions();

  const {
    data: roles,
    isFetching: isFetchingRoles,
    isError: isErrorRoles,
    isPending: isPendingRoles,
  } = useGetRoles();

  const { mutate, isPending: isCreatingUser } = useCreateUserMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: "",
      isActive: "",
      commissionRate: 0,
    },
  });

  const onSubmit = (data: any) => {
    mutate(data, {
      onSuccess: () => {
        toast.success("User created!");
        reset();
      },
      onError: () => {
        toast.error("User creation failed!");
      },
    });
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
      MODULES_AND_PERMISSIONS.USER.PERMISSION_CREATE.name
    )
  ) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-zinc-100">
        <p className="text-red-600 text-lg font-medium text-center">
          You are not permitted to create users.
        </p>
      </div>
    );
  }

  if (isFetchingRoles || isPendingRoles) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-zinc-100">
        <p className="text-red-600 text-lg font-medium">Preparing form...</p>
      </div>
    );
  }

  if (isErrorRoles) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex flex-col items-center justify-center gap-2 bg-zinc-100">
        <p className="text-red-600 text-lg font-medium text-center">
          Something went wrong while prepping the create user form!
        </p>
        <Link href={"/main/user"} className="text-blue-600 underline">
          View Users
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-zinc-50 py-10 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white border border-zinc-200 shadow-md rounded-2xl max-w-2xl mx-auto p-6 space-y-6"
      >
        <h1 className="text-xl font-semibold text-red-600 border-b pb-2">
          Create New User
        </h1>

        {/** Username */}
        <div>
          <label className="block font-medium text-zinc-700 mb-1">
            Username
          </label>
          <input
            {...register("username")}
            placeholder="Ko Aung"
            className="w-full text-zinc-800 border border-zinc-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">
              {errors.username.message}
            </p>
          )}
        </div>

        {/** Password */}
        <div>
          <label className="block font-medium text-zinc-700 mb-1">
            Password
          </label>
          <input
            type="password"
            {...register("password")}
            placeholder="••••••••"
            className="w-full text-zinc-800 border border-zinc-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/** Role */}
        <div>
          <label className="block font-medium text-zinc-700 mb-1">Role</label>
          <select
            {...register("role")}
            className="w-full text-zinc-800 border border-zinc-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Please select a role</option>
            {roles?.map((role) => (
              <option key={role._id} value={role.name}>
                {role.name}
              </option>
            ))}
          </select>
          {errors.role && (
            <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
          )}
        </div>

        {/** Address */}
        <div>
          <label className="block font-medium text-zinc-700 mb-1">
            Address
          </label>
          <input
            {...register("address")}
            placeholder="No. 25, Yangon Street"
            className="w-full text-zinc-800 border border-zinc-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">
              {errors.address.message}
            </p>
          )}
        </div>

        {/** Phone */}
        <div>
          <label className="block font-medium text-zinc-700 mb-1">
            Phone Number
          </label>
          <input
            {...register("phoneNumber")}
            placeholder="09-123456789"
            className="w-full text-zinc-800 border border-zinc-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          {errors.phoneNumber && (
            <p className="text-red-500 text-sm mt-1">
              {errors.phoneNumber.message}
            </p>
          )}
        </div>

        {/** isActive */}
        <div>
          <label className="block font-medium text-zinc-700 mb-1">
            Is Active
          </label>
          <select
            {...register("isActive")}
            className="w-full text-zinc-800 border border-zinc-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Please select active status</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
          {errors.isActive && (
            <p className="text-red-500 text-sm mt-1">
              {errors.isActive.message}
            </p>
          )}
        </div>

        {/** Commission Rate */}
        <div>
          <label className="block font-medium text-zinc-700 mb-1">
            Commission Rate
          </label>
          <input
            type="number"
            {...register("commissionRate", { valueAsNumber: true })}
            placeholder="0.00"
            className="w-full text-zinc-800 border border-zinc-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          {errors.commissionRate && (
            <p className="text-red-500 text-sm mt-1">
              {errors.commissionRate.message}
            </p>
          )}
        </div>

        <div className="pt-4">
          <SubmitButton isLoading={isCreatingUser}>Create User</SubmitButton>
        </div>
      </form>
    </div>
  );
};

export default Page;
