import GlobalNavbar from "@/components/GlobalNavbar";
import React from "react";

const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div>
      <GlobalNavbar />
      {children}
    </div>
  );
};

export default layout;
