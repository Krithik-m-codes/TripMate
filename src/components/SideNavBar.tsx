"use client";

import React, { useEffect, useState } from "react";
import { Nav } from "./ui/nav";
import {
  BookHeart,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  History,
  Compass,
  Map,
  ChevronLeft,
  CircleUser,
} from "lucide-react";
import { Button } from "./ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

type Props = {};

export default function SideNavbar({}: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setIsCollapsed(window.innerWidth < 768);
  }, []);

  function toggleCollapse() {
    setIsCollapsed(!isCollapsed);
  }

  return (
    <div className="relative min-w-auto md:min-w-[96px] max-w-auto border-r px-2 md:px-6 pb-10 pt-24 ">
      <Button
        variant="secondary"
        className="absolute z-10 top-7 right-[-29px] rounded-full w-12 h-12 shadow-xl flex justify-center items-center"
        onClick={toggleCollapse}
      >
        {isCollapsed ? (
          <ChevronRight size={28} strokeWidth={1.85} />
        ) : (
          <ChevronLeft size={28} strokeWidth={1.85} />
        )}
      </Button>

      <div className="absolute top-5 left-0 right-0 gap-1 flex justify-center items-center w-full">
        <Image
          src="/tripmate-logo.png"
          alt="tripmate logo"
          width={30}
          height={40}
          className={
            cn("h-8 w-8", isCollapsed ? "h-10 w-10" : "h-8 w-8") +
            " rounded-full"
          }
        />
        <h2 className={cn("text-xl font-bold", isCollapsed ? "hidden" : "")}>
          TripMate
        </h2>
      </div>
      <Nav
        isCollapsed={isCollapsed}
        links={[
          {
            title: "Dashboard",
            href: "/dashboard",
            icon: LayoutDashboard,
            variant: "default",
          },
          {
            title: "Home",
            href: "/map",
            icon: Map,
            variant: "default",
          },
          {
            title :"AI TripMate",
            href: "/ai-trip-planner",
            icon: Map,
            variant: "default",
          },
          {
            title: "Directions",
            href: "/directions",
            icon: Compass,
            variant: "default",
          },

          {
            title: "Profile",
            href: "/profile",
            icon: CircleUser,
            variant: "ghost",
          },
          {
            title: "Saved Places",
            href: "/saved-places",
            icon: BookHeart,
            variant: "ghost",
          },
          {
            title: "Recent Trips",
            href: "/recents-history",
            icon: History,
            variant: "ghost",
          },
        ]}
      />
      <div>
        <Button
          variant="default"
          className="absolute bottom-5 left-3 right-3 text-white capitalize bg-[#166F5B]"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut />
        </Button>
      </div>
    </div>
  );
}
