const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <>
      <div>User Nav</div>
      {children}
    </>
  );
};

export default layout;
