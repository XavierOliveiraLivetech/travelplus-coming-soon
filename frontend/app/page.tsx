"use client";

import BackgroundMedia from "@/components/BackgroundMedia";
import EmailForm from "@/components/EmailForm";
import Gallery from "@/components/Gallery";
import Logo from "@/components/Logo";
import { withBasePath } from "@/lib/basePath";
import { fadeIn, fadeUp, pageStagger, staggerPassThrough } from "@/lib/motion";
import { MotionConfig, motion } from "motion/react";

const LIVETECH_LOGO_SRC = withBasePath("/Logos/Livetech.png");

export default function Home() {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className="coming-soon-page"
        initial="hidden"
        animate="show"
        variants={pageStagger}
      >
        <BackgroundMedia />

        <motion.div
          className="coming-soon-scale"
          variants={staggerPassThrough}
        >
          <motion.header className="coming-soon-header" variants={fadeIn}>
            <Logo />
          </motion.header>

          <motion.div className="coming-soon-body" variants={staggerPassThrough}>
            <motion.main className="coming-soon-main" variants={staggerPassThrough}>
              <motion.div className="text" variants={fadeUp}>
                <h1 className="coming-soon-title">
                  <span className="coming-soon-title-line">
                    Há uma novidade a caminho.
                  </span>
                  <span className="coming-soon-title-line">
                    E promete mudar a forma como trabalha
                  </span>
                </h1>
              </motion.div>

              <motion.div className="cta" variants={fadeUp}>
                <p className="coming-soon-description">
                  <span className="coming-soon-description-line">
                    Quer fazer parte desta viagem?
                  </span>{" "}
                  <span className="coming-soon-description-line">
                    <motion.span
                      className="coming-soon-reserve-highlight"
                      initial={{ backgroundSize: "0% 2px" }}
                      animate={{ backgroundSize: "100% 2px" }}
                      transition={{ delay: 1.15, duration: 0.85, ease: "easeOut" }}
                    >
                      Reserve já
                    </motion.span>{" "}
                    o seu lugar.
                  </span>
                </p>

                <div className="coming-soon-form-section">
                  <EmailForm />
                </div>
              </motion.div>
            </motion.main>

            <Gallery />
          </motion.div>

          <motion.footer className="coming-soon-footer" variants={fadeUp}>
            <p className="coming-soon-copyright">
              <span>© Copyright 2026 .</span>
              <motion.a
                href="https://www.livetech.pt/pt/agencia/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Livetech"
                className="coming-soon-copyright-logo-link"
                whileHover={{ opacity: 0.85 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={LIVETECH_LOGO_SRC}
                  alt="Livetech"
                  width={140}
                  height={38}
                  className="coming-soon-copyright-logo"
                />
              </motion.a>
            </p>
          </motion.footer>
        </motion.div>
      </motion.div>
    </MotionConfig>
  );
}
