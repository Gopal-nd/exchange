'use client'
import Link from "next/link";
import { LogoIcon } from "@/components/icons/LogoIcon";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { ChevronDown, Search } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className=" sticky top-0 z-20 w-full ">
      <div className=" flex h-14 w-full items-center  p-1">
        <div className="relative flex items-center justify-between w-full">

          <div className="flex items-center flex-row">
            {/* logo */}
            <Link
              href="/"
              className="focus:none flex h-8 shrink-0 flex-col items-center justify-center rounded-lg bg-transparent p-0 text-sm font-semibold text-center hover:opacity-90 disabled:opacity-80 disabled:hover:opacity-80 xs:mr-6 mr-3 ml-4 "
            >
              <div className="flex h-[24px] flex-row items-center justify-center gap-2.5">
                <LogoIcon />
                <p className="font-extrabold text-white text-lg">Backpack</p>
              </div>
            </Link>

            {/* DESKTOP NAV LINKS */}
            <div className="hidden md:flex flex-row items-center pl-4 justify-center gap-5 mx-4 sm:gap-8">
              <Link
                href="/trade/SOL_USD"
                className={clsx(
                  "focus:none flex h-8 flex-col items-center justify-center rounded-lg bg-transparent p-0 text-sm font-semibold hover:opacity-90",
                  pathname.includes('/trade/SOL_USD') ? "text-high-emphasis" : "text-med-emphasis"
                )}
              >
                Spot
              </Link>

              <Link
                href="/trade/BTC_USD_PERP"
                className={clsx(
                  "focus:none flex h-8 flex-col items-center justify-center rounded-lg bg-transparent p-0 text-sm font-semibold hover:opacity-90",
                  pathname.includes('PERP') ? "text-high-emphasis" : "text-med-emphasis"
                )} >
                Futures
              </Link>

              <Link
                href="#"
                className={clsx(
                  "focus:none flex h-8 flex-col items-center justify-center rounded-lg bg-transparent p-0 text-sm font-semibold hover:opacity-90",
                  pathname.startsWith('/lend') ? "text-high-emphasis" : "text-med-emphasis"
                )}>
                Lend
              </Link>

              <div>
                <button
                  type="button"
                  className=" py-2 text-sm text-med-emphasis flex items-center font-semibold hover:opacity-90 gap-0.5"
                >
                  More
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>


          <div className="hidden  lg:absolute top-0 left-1/2 -translate-x-1/2 justify-self-center inline-flex">
            <div className="hidden xl:flex w-[340px] flex-1 cursor-pointer flex-row items-center justify-between overflow-hidden rounded-xl bg-base-background-l2 px-1 ring-0 focus-within:ring-2 focus-within:ring-accent-blue">

              <div className="flex flex-1 flex-row items-center">
                <div className="mx-2">
                  <Search className="h-4 w-4 text-med-emphasis"/>
                </div>

                <input
                  type="text"
                  placeholder="Search markets"
                  aria-label="Search markets"
                  autoComplete="off"
                  spellCheck={false}
                  className="h-8 w-full border-0 bg-base-background-l2 p-0 text-[13px] font-medium text-high-emphasis placeholder-low-emphasis outline-none focus:ring-0"
                />
              </div>

              <div className="mx-2 flex h-6 w-6 select-none items-center justify-center rounded-sm border opacity-50 border-med-emphasis bg-base-background-l2 text-sm text-med-emphasis">
                /
              </div>
            </div>
          </div>

      
          <div className="animate-in fade-in  flex flex-row justify-self-end ">
            <Link
              href="/login"
              className="bg-base-background-l2 my-auto mr-4 rounded-lg px-2 py-1.5 text-xs font-semibold text-nowrap text-white hover:opacity-90 sm:ml-4 sm:px-3 sm:text-sm"
            >
              Log in
            </Link>

            <Link
              href="/signup"
              className="my-auto mr-6 rounded-lg bg-white  text-black px-2 py-1.5 text-xs font-semibold text-nowrap text-button-primary-text hover:opacity-90 sm:px-3 sm:text-sm"
            >
              Sign up
            </Link>
          </div>
        </div>

      </div>
    </header>
  );
}



