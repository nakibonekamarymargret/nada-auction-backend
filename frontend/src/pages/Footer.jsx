import React from "react";

const Footer = () => {
  return (
    <footer className="bg-black w-full py-8 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Logo & Intro */}
        <div>
          <h2
            style={{ fontFamily: "var(--roboto)" }}
            className="text-white text-3xl font-bold mb-2"
          >
            NADA
          </h2>
          <p className="text-gray-300 text-sm">
            Millions of unique items are added to NADA each year from 700+
            expert auction houses worldwide.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-semibold mb-2">Quick Links</h3>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>
              <a href="/about" className="hover:text-white">
                About Us
              </a>
            </li>
            <li>
              <a href="/auctions" className="hover:text-white">
                Live Auctions
              </a>
            </li>{" "}
            <li>
              <a
                href="https://corporatefinanceinstitute.com/resources/management/auction/"
                className="hover:text-white"
              >
                How to Bid{" "}
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:text-white">
                Contact
              </a>
            </li>
            <li>
              <a href="/terms" className="hover:text-white">
                Terms & Conditions
              </a>
            </li>
          </ul>
        </div>

        {/* Social & Contact */}
        <div>
          <h3 className="text-white font-semibold mb-2">Connect with Us</h3>
          <div className="flex space-x-4 text-gray-400">
            <a href="#" className="hover:text-white">
              Facebook
            </a>
            <a href="#" className="hover:text-white">
              Twitter
            </a>
            <a href="#" className="hover:text-white">
              Instagram
            </a>
          </div>
          <p className="text-gray-400 mt-4 text-sm">
            Email:{" "}
            <a href="mailto:support@nada.com" className="hover:text-white">
              support@nada.com
            </a>
          </p>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-700 mt-8 pt-4 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} NADA Auctioning Platform. All rights
        reserved.
      </div>
    </footer>
  );
};

export default Footer;
