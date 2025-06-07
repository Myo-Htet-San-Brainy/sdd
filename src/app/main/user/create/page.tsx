"use client";

import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { getAllPermissions, hasPermission } from "@/lib/utils";
import { useGetMyPermissions } from "@/query/miscellaneous";
import AllowedPermissions from "@/components/AllowedPermissions";
import { useCreateUserMutation } from "@/query/user";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGetRoles } from "@/query/role";
import Link from "next/link";
import toast from "react-hot-toast";

// 🧠 Schema

export const createUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(3, "Password must be at least 3 characters"),
  role: z.string().min(1, "Role is required"), // 🚫 can't be empty
  address: z.string().min(1, "Address is required"), // 🚫 can't be empty
  phoneNumber: z.string().min(1, "Phone number is required"), // 🚫 same here
  isActive: z
    .string()
    .min(1, "Active status is required")
    .transform((val) => val === "true"),
  commissionRate: z.string().transform((val) => {
    if (val.trim() === "") return null;
    return Number(val);
  }),
});

const Page = () => {
  const { data: myPermissions, isFetching: isFetchingMyPermissions } =
    useGetMyPermissions();
  const {
    data: roles,
    isFetching: isFetchingRoles,
    isError: isErrorRoles,
    error: errorRoles,
  } = useGetRoles();

  const { mutate } = useCreateUserMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: "",
      isActive: "",
    },
  });

  const onSubmit = (data: any) => {
    mutate(data, {
      onSuccess(data, variables, context) {
        toast.success("Created User!");
        reset();
      },
      onError(error, variables, context) {
        toast.error("User Creation Failed!");
      },
    });
  };

  if (isFetchingMyPermissions) {
    return <div>checking permission...</div>;
  }

  if (
    !hasPermission(
      myPermissions!,
      MODULES_AND_PERMISSIONS.USER.PERMISSION_CREATE.name
    )
  ) {
    return (
      <AllowedPermissions
        actionNotPermitted={
          MODULES_AND_PERMISSIONS.USER.PERMISSION_CREATE.displayName
        }
        myPermissions={myPermissions!}
      />
    );
  }

  if (isFetchingRoles) {
    return <div>preparing create user form...</div>;
  }

  if (isErrorRoles) {
    return (
      <div>
        <p>{"Something went wrong while preping create user form!"}</p>
        <Link href={"/main/user"}>View Users</Link>
      </div>
    );
  }

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
        Create User
      </button>
    </form>
  );
};

export default Page;
