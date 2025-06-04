const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <>
      <div>Role Nav</div>
      {children}
    </>
  );
};

export default layout;
