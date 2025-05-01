import React from 'react'
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

const carouselItems = [
  {
    id: 1,
    image: "/images/camera.jpg",
    alt: "Camera",
    text: "Got the best peoducts for you",
    describe: "Dont miss out on this",
  },
  {
    id: 2,
    image: "/images/leatherbag.jpg",
    alt: "bag",
    text: "For your style and comfort desires", 
    describe: "NADA NADA NADA got you covered",
  },
  {
    id: 3,
    image: "/images/smartwatch.jpg",
    alt: "watch",
    text: "Theres no better time to shop",
    describe: "Be the first to get it",
  },
{
    id: 4,
    image: "/images/speakers.jpg",
    alt: "speaker ",
    text: "Sounds well when you get your product from NADA",
    describe: "Enjoy the sound",
  }
]

const AnimatedImage = () => {
  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      direction: "ltr",
    },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );
  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {carouselItems.map((item) => (
          <div className="flex-[0_0_100%] relative" key={item}>
            <img
              src={item.image}
              alt={`carousel ${item.id}`}
              className="w-full h-96 object-cover rounded-lg"
            />
            <div className="absolute bottom-5 left-5  bg-opacity-50 text-white px-4 py-2 rounded">
              <p className="text-lg font-semibold">{item.text}</p>
              <p className="text-lg font-semibold">{item.describe}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnimatedImage;
