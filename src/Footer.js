import React from 'react';

const CopyrightFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-500 text-white p-1">
      <p className="text-center text-xl">Copyright {currentYear} . All rights reserved. courtesy of CODE WITH CLEMO</p>
    </footer>
  );
}

export default CopyrightFooter;