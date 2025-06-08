"use client";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { getAllPermissions, hasPermission } from "@/lib/utils";
import { useGetMyPermissions } from "@/query/miscellaneous";
import { useGetRole, useGetRoles, useUpdateRoleMutation } from "@/query/role";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { CustomError } from "@/lib/CustomError";
import AllowedPermissions from "@/components/AllowedPermissions";
import { useGetUser, useUpdateUserMutation } from "@/query/user";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema } from "../../create/page";

const Page = () => {
  const { data: myPermissions, isFetching: isFetchingMyPermissions } =
    useGetMyPermissions();
  const { id } = useParams<{ id: string }>();
  const {
    data: user,
    isFetching: isFetchingUser,
    isError: isErrorUser,
    error: errorUser,
  } = useGetUser({ id });
  const {
    data: roles,
    isFetching: isFetchingRoles,
    isError: isErrorRoles,
    error: errorRoles,
  } = useGetRoles();
  const { mutate } = useUpdateUserMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createUserSchema),
  });

  useEffect(() => {
    if (user) {
      reset({
        username: user.username,
        password: user.password,
        role: user.role,
        address: user.address,
        phoneNumber: user.phoneNumber,
        isActive: user.isActive ? "true" : "false",
        commissionRate:
          user.commissionRate === null ? "" : String(user.commissionRate), // convert back to string for RHF
      });
    }
  }, [user]);

  const queryClient = useQueryClient(); // ✨ get query client

  useEffect(() => {
    if (errorUser) {
      if (errorUser instanceof CustomError && errorUser.status === 404) {
        queryClient.invalidateQueries({ queryKey: ["users"] });
      }
    }
  }, [isErrorUser]);

  const router = useRouter();

  if (isFetchingMyPermissions) {
    return <div>checking permission...</div>;
  }
  if (
    !hasPermission(
      myPermissions!,
      MODULES_AND_PERMISSIONS.USER.PERMISSION_UPDATE.name
    )
  ) {
    return (
      <AllowedPermissions
        myPermissions={myPermissions!}
        actionNotPermitted={
          MODULES_AND_PERMISSIONS.USER.PERMISSION_UPDATE.displayName
        }
      />
    );
  }

  if (isFetchingUser || isFetchingRoles) {
    return <div>preparing update user form...</div>;
  }

  if (isErrorUser) {
    return (
      <div>
        <p>{errorUser.message || "Something went wrong!"}</p>
        <Link href={"/main/user"}>Update other Users</Link>
      </div>
    );
  }

  if (isErrorRoles) {
    return (
      <div>
        <p>{"Something went wrong while preping update user form!"}</p>
        <Link href={"/main/user"}>View Users</Link>
      </div>
    );
  }

  const onSubmit = (data: any) => {
    mutate(
      { userId: id, userPayload: data },
      {
        onSuccess(data, variables, context) {
          toast.success("User Updated!");
          router.push("/main/user");
        },
        onError(error, variables, context) {
          if (error instanceof CustomError) {
            if (error.status === 404) {
              toast.error("This User has just been removed by other admins!");
              router.push("/main/user");
            } else {
              toast.error("Smth went wrong!");
            }
          }
        },
      }
    );
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label>Username</label>
        <input
          {...register("username")}
          placeholder="Ko Aung"
          className="input"
        />
        {errors.username && <p>{errors.username.message}</p>}
      </div>

      <div>
        <label>Password</label>
        <input
          type="password"
          {...register("password")}
          placeholder="••••••••"
          className="input"
        />
        {errors.password && <p>{errors.password.message}</p>}
      </div>

      <div>
        <label>Role</label>
        <select {...register("role")} className="select">
          <option value="">Please select a role</option>
          {roles?.map((role) => {
            return (
              <option key={role._id} value={role.name}>
                {role.name}
              </option>
            );
          })}
        </select>
        {errors.role && <p>{errors.role.message}</p>}
      </div>

      <div>
        <label>Address</label>
        <input
          {...register("address")}
          placeholder="No. 25, Yangon Street"
          className="input"
        />
        {errors.address && <p>{errors.address.message}</p>}
      </div>

      <div>
        <label>Phone Number</label>
        <input
          {...register("phoneNumber")}
          placeholder="09-123456789"
          className="input"
        />
        {errors.phoneNumber && <p>{errors.phoneNumber.message}</p>}
      </div>

      <div>
        <label>Is Active</label>
        <select {...register("isActive")} className="select">
          <option value="">Please select active status.</option>
          <option value="true">yes</option>
          <option value="false">no</option>
        </select>
        {errors.isActive && <p>{errors.isActive.message}</p>}
      </div>

      <div>
        <label>Commission Rate</label>
        <input
          type="number"
          {...register("commissionRate")}
          placeholder="0.00"
          className="input"
        />
        {errors.commissionRate && <p>{errors.commissionRate.message}</p>}
      </div>

      <button type="submit" className="btn">
        Update User
      </button>
    </form>
  );
};

export default Page;
