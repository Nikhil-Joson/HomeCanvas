/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full p-4 text-center">
      <div className="flex items-center justify-center">
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-zinc-800">
            Home Canvas 2.0
          </h1>
      </div>
      <p className="mt-4 text-lg text-zinc-600 max-w-3xl mx-auto">
        Upload photos of a product and scene, then drag your product into the perfect spot.
        <br />
        You can also use the AI chatbot to edit your scene directly.
      </p>
    </header>
  );
};

export default Header;