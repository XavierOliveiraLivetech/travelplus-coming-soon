"use client";

import { socialItem, socialStagger } from "@/lib/motion";
import { motion } from "motion/react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";

const links = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/livetech.pt/?locale=pt_PT",
    Icon: FaFacebookF,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/livetechpt/",
    Icon: FaInstagram,
  },
  {
    name: "LinkedIn",
    href: "https://pt.linkedin.com/company/livetech-agencia-web",
    Icon: FaLinkedinIn,
  },
  {
    name: "WhatsApp",
    href: "https://wa.me/+351913447690",
    Icon: FaWhatsapp,
  },
];

export default function SocialLinks() {
  return (
    <motion.nav
      aria-label="Redes sociais"
      className="social-media-nav"
      variants={socialStagger}
      initial="hidden"
      animate="show"
    >
      {links.map(({ name, href, Icon }) => (
        <motion.a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={name}
          className="social-media-link"
          variants={socialItem}
          whileHover={{ y: -3, color: "#d87225" }}
          whileTap={{ scale: 0.94 }}
        >
          <Icon className="social-media-icon" aria-hidden />
        </motion.a>
      ))}
    </motion.nav>
  );
}
