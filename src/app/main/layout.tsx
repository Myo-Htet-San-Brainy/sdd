import React from "react";

const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div>
      <div>main navbar</div>
      {children}
    </div>
  );
};

export default layout;
