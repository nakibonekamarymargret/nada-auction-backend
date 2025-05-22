import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import React from "react";
import { FaCircleArrowRight } from "react-icons/fa6";
import { MdEmail, MdLocationOn, MdPhone } from "react-icons/md";
import { Link } from "react-router-dom";
import { Line } from "recharts";

function AboutUsPage() {
  return (
    <>
      <div className="min-h-screen bg-gray-100 px-4 sm:px-6 py-10">
        <div className="max-w-4xl mx-auto px-6 py-12 font-tenor ">
          <h1 className=" text-3xl font-bold text-center mb-7">About Us</h1>
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-2 text-center">
              Who we are
            </h2>
            <p className="text-muted-foreground">
              We are a dedicated Auctioning site providing all access to
              products never seen before We simplify and integrate multiple
              parts of the online auction process, from the cataloguing of items
              to marketing, auction hosting, bidding and most recently payment
              solutions. In doing so, we enable auctioneers to become genuine
              online businesses in a cost-efficient way.
            </p>
          </section>
        </div>
        <Card className="flex flex-col md:flex-row  gap-6 p-0 mb-30 border w-full max-w-5xl mx-auto font-tenor">
          <div className="w-full md:w-1/2 h-[400px] overflow-hidden">
            <img
              src="https://images.pexels.com/photos/7813981/pexels-photo-7813981.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="mission"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-full md:w-1/2 p-8 flex flex-col justify-center text-center md:text-left">
            <h2 className="text-3xl font-semibold mb-6">Our Mission</h2>
            <p className="text-lg text-accent-foreground">
              To Revolutionize the Way People Auction
            </p>
          </div>
        </Card>
        {/* What we do section */}
        <Card className="flex flex-col md:flex-row-reverse  gap-6 p-0 mb-20 border w-full max-w-5xl mx-auto font-tenor ">
          <div className="w-full md:w-1/2 h-[400px] overflow-hidden">
            <img
              src="https://images.pexels.com/photos/15538876/pexels-photo-15538876/free-photo-of-elderly-woman-with-microphone-during-auction.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="mission"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-full md:w-1/2 p-6 flex flex-col justify-center text-center md:text-left space-y-0.5">
            <h2 className="text-3xl font-semibold mb-6">What we do</h2>
            <p className="text-lg text-accent-foreground">
              Join our community and take part in exciting auctions
            </p>
            <Link to={"/register"}>
              <button className=" w-fit bg-[#008080] text-white px-6 py-2 rounded-md hover:bg-[#009181] transition flex items-center gap-2 text-base">
                Join Us Now
                <span>
                  <FaCircleArrowRight className="text-lg" />
                </span>
              </button>
            </Link>
          </div>
        </Card>
        <section className="bg-white py-12 px-4 sm:px-8 lg:px-12 font-tenor ">
          <div className="max-w-7xl mx-auto text-center mb-6">
            <h2 className="text-3xl font-bold">Meet the Team</h2>
            <p className="text-muted-foreground">
              The brains behind the market place{" "}
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            <div className="bg-gray-100 rounded-lg shadow-md p-6 flex flex-col items-center text-center">
              <img
                src={`${import.meta.env.BASE_URL}images/mary.jpeg`}
                alt="Mary"
                className="w-24 h-24 object-cover rounded-full mb-4"
              ></img>
              <h3 className="text-lg  font-bold">Mary Nakiboneka</h3>
              <p className="text-sm text-muted-foreground">Lead Developer</p>
              <p className="text-sm text-muted-foreground">
                nakibonekamarymargret@gmail.com
              </p>
            </div>
            <div className="bg-gray-100 rounded-lg shadow-md p-6 flex flex-col items-center text-center">
              <img
                src={`${import.meta.env.BASE_URL}images/hakim.jpg`}
                alt="Akim"
                className="w-24 h-24 object-cover rounded-full mb-4"
              ></img>
              <h3 className="text-lg  font-bold">Akim Bakaluba</h3>
              <p className="text-sm text-muted-foreground">Lead Developer</p>
              <p className="text-sm text-muted-foreground">
                kimbakaluba@gmail.com
              </p>
            </div>
            <div className="bg-gray-100 rounded-lg shadow-md p-6 flex flex-col items-center text-center">
              <img
                src={`${import.meta.env.BASE_URL}images/kush.jpg`}
                alt="kush"
                className="w-24 h-24 object-cover rounded-full mb-4"
              ></img>
              <h3 className="text-lg  font-bold">kush Muhamed</h3>
              <p className="text-sm text-muted-foreground">Lead Developer</p>
              <p className="text-sm text-muted-foreground">
                kushmuhamed27@gmail.com
              </p>
            </div>
          </div>
        </section>
        <section className="bg-gray-100 py-12 px-4 sm:px-8 lg:px-12 font-tenor">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4 font-tenor">
              Get in Touch With us 😊
            </h2>
            <p className="text-muted-foreground mb-8">
              We would love to hear from you , feel free to reach out to us
            </p>
            <div className="space-y-4 text-lg text-left max-w-md mx-auto">
              <div className="flex items-center gap-3">
                <MdEmail className="text-blue-700 text-xl" />
                <span>support@nada.com</span>
              </div>
              <div className="flex items-center gap-3">
                <MdPhone className="text-blue-700 text-xl" />
                <span>+256700906675</span>
              </div>
              <div className="flex items-center gap-3">
                <MdLocationOn className="text-blue-700 text-xl" />
                <span>Naguru, Plot 5A</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default AboutUsPage;
