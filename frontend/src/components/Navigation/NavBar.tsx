import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { CiBellOn, CiBoxList, CiUser } from "react-icons/ci";
import { IoHomeOutline, IoSearch } from "react-icons/io5";

import SearchField from "../Input/SearchField";
import IconButton from "../Button/IconButton";

const NavBar = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <nav className="bg-[#151316] shadow-md px-6 py-4">
      <div className="mx-[50px] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-white">Kalani's Vault</span>
        </div>
        <div className="relative flex items-center flex-grow max-w-md">
          <SearchField
            type="text"
            placeholder="Search..."
            name="search"
            onChange={handleSearch}
            value={searchQuery}
            icon={<IoSearch className="h-5 w-5 text-gray-400" />}
            className="pr-20"
            onClear={() => setSearchQuery("")}
          />
          <div className="absolute right-10 h-5 w-[1px] bg-gray-300" />
          <Link to="/" className="absolute right-2 flex items-center px-1">
            <IoHomeOutline className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <IconButton
            icon={<CiBellOn className="h-7 w-7" />}
            onClick={() => {}}
          />
          <IconButton
            icon={<CiBoxList className="h-7 w-7" />}
            onClick={() => {}}
          />
          <IconButton
            icon={<CiUser className="h-7 w-7" />}
            onClick={() => {}}
          />
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
