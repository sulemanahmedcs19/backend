import profileLogo from "../assets/sidebar/profile.png";
import Admin from "../assets/sidebar/adminlogo.png";
import Search from "../assets/sidebar/search.png";

function Header() {
  return (
    <header className="w-full h-[65px] flex items-center bg-white shadow-md rounded-xl px-8 relative">
      {/* LEFT SIDE BRAND */}
      <div className="flex items-center gap-3 absolute left-8">
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          ALPHA
        </h1>
        <img
          src={profileLogo}
          alt="logo"
          className="w-[35px] h-[35px] rounded-full shadow-sm"
        />
      </div>

      {/* CENTER SEARCH BAR */}
      <div className="absolute left-1/2 transform -translate-x-1/2 w-[35%] h-[34px]">
        <div className="relative w-full h-full">
          <img
            src={Search}
            alt="search-icon"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-60"
          />

          <input
            type="text"
            placeholder="Search..."
            className="w-full h-full pl-10 pr-4 rounded-full bg-gray-100 border 
              border-gray-200 shadow-inner text-sm text-gray-600 
              focus:ring-2 focus:ring-purple-400 focus:bg-white outline-none transition"
          />
        </div>
      </div>

      {/* RIGHT SIDE ADMIN INFO */}
      <div className="absolute right-8 flex items-center gap-3 cursor-pointer hover:opacity-90 transition">
        <img
          src={Admin}
          alt="profile"
          className="w-[40px] h-[40px] rounded-full shadow"
        />
        <div className="leading-tight">
          <p className="text-[15px] font-semibold text-gray-800">Admin</p>
          <p className="text-[13px] text-gray-500">Asifkhan@domain.ae</p>
        </div>
      </div>
    </header>
  );
}

export default Header;
