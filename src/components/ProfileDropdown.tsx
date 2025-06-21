import { User } from "@/Interfaces/User";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { signOut } from "next-auth/react";

export function ProfileDropdown({ profile }: { profile: User }) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 ">
          {profile.username}
          <ChevronDown
            aria-hidden="true"
            className="-mr-1 size-5 text-gray-400"
          />
        </MenuButton>
      </div>

      <MenuItems
        transition
        className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        <div className="py-1">
          <MenuItem>
            <div className="block px-4 py-2 text-sm text-gray-700">
              <span className="font-medium">Username:</span> {profile.username}
            </div>
          </MenuItem>
          <MenuItem>
            <div className="block px-4 py-2 text-sm text-gray-700">
              <span className="font-medium">Role:</span> {profile.role}
            </div>
          </MenuItem>
        </div>

        <div className="py-1">
          <MenuItem>
            <div className="block px-4 py-2 text-sm text-gray-700">
              <span className="font-medium">Phone:</span> {profile.phoneNumber}
            </div>
          </MenuItem>
          <MenuItem>
            <div className="block px-4 py-2 text-sm text-gray-700">
              <span className="font-medium">Address:</span> {profile.address}
            </div>
          </MenuItem>
        </div>

        {profile.commissionRate !== null && (
          <div className="py-1">
            <MenuItem>
              <div className="block px-4 py-2 text-sm text-gray-700">
                <span className="font-medium">Commission Rate:</span>{" "}
                {profile.commissionRate}%
              </div>
            </MenuItem>
          </div>
        )}

        <div className="py-1">
          <MenuItem>
            <button
              className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              onClick={() => {
                signOut();
              }}
            >
              Sign out
            </button>
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  );
}
