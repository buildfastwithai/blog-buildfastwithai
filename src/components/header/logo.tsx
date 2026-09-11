"use client";

import LightLogo from "@/public/logo/light.svg";
import DarkLogo from "@/public/logo/dark.svg";
import Image from "next/image";
import Link from "next/link";

export default function Logo({ dark = false, href = "/" }: { dark?: boolean; href?: string }) {
  return (
    <Link href={href} className="flex items-center shrink-0">
      <Image
        src={dark ? DarkLogo : LightLogo}
        alt="buildfastwithai"
        className="h-10 w-auto md:h-[2.8rem] hidden dark:block"
      />
      <Image
        src={dark ?LightLogo : DarkLogo}
        alt="buildfastwithai"
        className="h-10 w-auto md:h-[2.8rem] block dark:hidden"
      />

    </Link>
  );
}
