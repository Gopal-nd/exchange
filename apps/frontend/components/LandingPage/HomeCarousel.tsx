"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";



type Slide = {
  title: string;
  subtitle: string;
  image: string;
  button?: {
    label: string;
    href: string;
  };
};

export const slides: Slide[] = [
  {
    title: "Earn 12.86% APY on your MON collateral",
    subtitle:
      "Lend MON to earn staking yield + lending yield, and use as collateral.",
    image:
      "https://backpack.exchange/_next/image?url=%2Fhome-banner-stacked-yield-mon.png&w=1920&q=75",
    button: {
      label: "Lend MON",
      href: "/lend/MON",
    },
  },
  {
    title: "Lend USD. Earn 3.70% APY. Get points.",
    subtitle:
      "Lend USD to start earning high yield while using as collateral for trading.",
    image:
      "https://backpack.exchange/_next/image?url=%2Fhome-banner-stacked-yield-usd-new.png&w=1920&q=75",
    button: {
      label: "Lend USD",
      href: "/lend/USD",
    },
  },
  {
    title: "Earn 5.69% APY on your SOL collateral",
    subtitle:
      "Lend SOL to earn staking yield + lending yield, and use as collateral.",
    image:
      "https://backpack.exchange/_next/image?url=%2Fhome-banner-stacked-yield-sol-new.png&w=1920&q=75",
    button: {
      label: "Lend SOL",
      href: "/lend/SOL",
    },
  },
  {
    title: "Got USDT?",
    subtitle:
      "Convert to USD with 0 fees and start trading on Backpack!",
    image:
      "https://backpack.exchange/_next/image?url=%2Fhome-banner-usdt-4.png&w=1920&q=75",
    button: {
      label: "Trade USDT",
      href: "/trade/USDT_USD",
    },
  },
  {
    title: "Invite Friends and Earn Points",
    subtitle:
      "Refer a friend and earn a percentage of their trading fees & points.",
    image:
      "https://backpack.exchange/_next/image?url=%2Fhome-banner-refer-3.png&w=1920&q=75",
    button: {
      label: "Manage Referrals",
      href: "/referrals",
    },
  },
  {
    title: "Wire Transfers are Live",
    subtitle: "Deposit and withdraw USD with no fees.",
    image:
      "https://backpack.exchange/_next/image?url=%2Fhome-banner-wire-transfers-2.png&w=1920&q=75",
  },
];








export default function HomeCarousel() {
  const [index, setIndex] = useState(0);

  const prev = () =>
    setIndex((i) => (i === 0 ? slides.length - 1 : i - 1));

  const next = () =>
    setIndex((i) => (i === slides.length - 1 ? 0 : i + 1));

  useEffect(() => {
    const intervel = setInterval(() => {
      setIndex((i) => (i === slides.length - 1 ? 0 : i + 1))
    }, 3000)

    return () => clearInterval(intervel)
  }, [])

  return (
    <div className="relative h-48 overflow-hidden rounded-xl sm:aspect-[1280/373] sm:h-auto">
      
      <div
        className="flex h-full  transition-all duration-300"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div key={i} className="relative w-full shrink-0">
            {/* Image */}
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority={i === 0}
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/85" />

            {/* Content */}
            <div className="relative z-10 flex h-full flex-col justify-center px-20 gap-2">
              <h2 className="text-2xl font-bold text-white md:text-4xl lg:text-[42px]">
                {slide.title}
              </h2>
              <p className="mt-1 text-sm text-white/70 md:text-lg">
                {slide.subtitle}
              </p>
              {slide.button && (
                <a href={'#'}>
                  <button className="inline-flex justify-center focus:none items-center text-center hover:opacity-90 focus:ring-blue-200 bg-white text-base-background-l1 h-12 mt-2 rounded-lg px-4 py-4 text-lg  font-semibold">{slide.button.label}</button>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* LEFT ARROW */}
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 text-base-icon hover:text-base-icon-hover"
      >
        <ChevronLeft className="h-8 w-8" />
      </button>

      {/* RIGHT ARROW */}
      <button
        onClick={next}
        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 text-base-icon hover:text-base-icon-hover"
      >
        <ChevronRight className="h-8 w-8" />
      </button>

      {/* DOTS */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={clsx(
              "h-2 w-2 rounded-full",
              i === index ? "bg-white" : "bg-white/40"
            )}
          />
        ))}
      </div>
    </div>
  );
}
