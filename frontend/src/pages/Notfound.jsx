import React from "react";

const Notfound = () => {
  document.title = "Ledgifier | 404 page not found";
  return (
    <div className="text-xl text-center w-full h-screen flex items-center justify-center">
      This Page is not found
    </div>
  );
};

export default Notfound;
