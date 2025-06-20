"use client";

import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { getAllPermissions, hasPermission } from "@/lib/utils";
import { useGetMyPermissions } from "@/query/miscellaneous";
import { useGetRoles } from "@/query/role";
import { useGetUser, useUpdateUserMutation } from "@/query/user";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { CustomError } from "@/lib/CustomError";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema } from "../../create/page";
import { SubmitButton } from "@/components/SubmitButton";

const Page = () => {
  const {
    data: myPermissions,
    isFetching: isFetchingMyPermissions,
    isPending: isPendingMyPermissions,
  } = useGetMyPermissions();

  const { id } = useParams<{ id: string }>();
  const {
    data: user,
    isFetching: isFetchingUser,
    isPending: isPendingUser,
    isError: isErrorUser,
    error: errorUser,
  } = useGetUser({ id });

  const {
    data: roles,
    isFetching: isFetchingRoles,
    isPending: isPendingRoles,
    isError: isErrorRoles,
  } = useGetRoles();

  const { mutate, isPending: isPendingUpdateUser } = useUpdateUserMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createUserSchema),
  });

  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      reset({
        username: user.username,
        password: user.password,
        role: user.role,
        address: user.address,
        phoneNumber: user.phoneNumber,
        isActive: user.isActive ? "true" : "false",
        commissionRate: user.commissionRate ?? 0,
      });
    }
  }, [user]);

  useEffect(() => {
    if (errorUser instanceof CustomError && errorUser.status === 404) {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    }
  }, [isErrorUser]);

  if (isFetchingMyPermissions || isPendingMyPermissions) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-zinc-50">
        <p className="text-zinc-600 animate-pulse text-center">
          Checking permissions...
        </p>
      </div>
    );
  }

  if (
    !hasPermission(
      myPermissions!,
      MODULES_AND_PERMISSIONS.USER.PERMISSION_UPDATE.name
    )
  ) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-zinc-50">
        <p className="text-red-600 text-lg font-medium text-center">
          You are not permitted to update users.
        </p>
      </div>
    );
  }

  if (isFetchingUser || isFetchingRoles || isPendingUser || isPendingRoles) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-zinc-50">
        <p className="text-zinc-600 animate-pulse text-center">
          Preparing update user form...
        </p>
      </div>
    );
  }

  if (isErrorUser) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex flex-col items-center justify-center bg-zinc-50 space-y-2">
        <p className="text-red-600 text-center text-lg font-medium">
          {errorUser.message || "Something went wrong!"}
        </p>
        <Link href="/main/user" className="text-blue-600 hover:underline">
          Update other Users
        </Link>
      </div>
    );
  }

  if (isErrorRoles) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex flex-col items-center justify-center bg-zinc-50 space-y-2">
        <p className="text-red-600 text-center text-lg font-medium">
          Something went wrong while preparing update user form!
        </p>
        <Link href="/main/user" className="text-blue-600 hover:underline">
          View Users
        </Link>
      </div>
    );
  }

  const onSubmit = (data: any) => {
    mutate(
      { userId: id, userPayload: data },
      {
        onSuccess: () => {
          toast.success("User Updated!");
          router.push("/main/user");
        },
        onError: (error) => {
          if (error instanceof CustomError) {
            if (error.status === 404) {
              toast.error("This user has just been removed by another admin!");
              router.push("/main/user");
            } else {
              toast.error("Something went wrong!");
            }
          }
        },
      }
    );
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-zinc-50 py-10 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white border border-zinc-200 shadow-md rounded-2xl max-w-2xl mx-auto p-6 space-y-6"
      >
        <h1 className="text-xl font-semibold text-red-600 border-b pb-2">
          Update User
        </h1>

        {[
          { label: "Username", name: "username", type: "text" },
          { label: "Password", name: "password", type: "password" },
          { label: "Address", name: "address", type: "text" },
          { label: "Phone Number", name: "phoneNumber", type: "text" },
        ].map(({ label, name, type }) => (
          <div key={name}>
            <label className="block font-medium text-zinc-700 mb-1">
              {label}:
            </label>
            <input
              type={type}
              {...register(
                name as
                  | "username"
                  | "password"
                  | "commissionRate"
                  | "address"
                  | "phoneNumber"
              )}
              className="border border-zinc-300 px-3 py-2 rounded-md w-full text-zinc-500"
            />
            {errors[name as keyof typeof errors] && (
              <p className="text-sm text-red-500 mt-1">
                {errors[name as keyof typeof errors]?.message as string}
              </p>
            )}
          </div>
        ))}

        {/* 🔹 Number Inputs */}
        {[{ label: "Commission Rate", name: "commissionRate" }].map(
          ({ label, name }) => (
            <div key={name}>
              <label className="block font-medium text-zinc-700 mb-1">
                {label}:
              </label>
              <input
                type="number"
                step="0.01"
                {...register(name as "commissionRate", { valueAsNumber: true })}
                className="border border-zinc-300 px-3 py-2 rounded-md w-full text-zinc-500"
              />
              {errors[name as keyof typeof errors] && (
                <p className="text-sm text-red-500 mt-1">
                  {errors[name as keyof typeof errors]?.message as string}
                </p>
              )}
            </div>
          )
        )}

        <div>
          <label className="block font-medium text-zinc-700 mb-1">Role:</label>
          <select
            {...register("role")}
            className="border border-zinc-300 px-3 py-2 rounded-md w-full text-zinc-500"
          >
            <option value="">Please select a role</option>
            {roles?.map((role) => (
              <option key={role._id} value={role.name}>
                {role.name}
              </option>
            ))}
          </select>
          {errors.role && (
            <p className="text-sm text-red-500 mt-1">{errors.role.message}</p>
          )}
        </div>

        <div>
          <label className="block font-medium text-zinc-700 mb-1">
            Is Active:
          </label>
          <select
            {...register("isActive")}
            className="border border-zinc-300 px-3 py-2 rounded-md w-full text-zinc-500"
          >
            <option value="">Please select active status</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
          {errors.isActive && (
            <p className="text-sm text-red-500 mt-1">
              {errors.isActive.message}
            </p>
          )}
        </div>

        <div className="pt-4">
          <SubmitButton isLoading={isPendingUpdateUser}>
            Update User
          </SubmitButton>
        </div>
      </form>
    </div>
  );
};

export default Page;
