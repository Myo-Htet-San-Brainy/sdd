const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <>
      <div>Product Nav</div>
      {children}
    </>
  );
};

export default layout;
