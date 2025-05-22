// components/ui/AnimatedImage.jsx
import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
const base = import.meta.env.BASE_URL;

const carouselItems = [
  {
    id: 1,
      image: `${base}images/camera.jpg`,
    alt: "Camera",
    text: "Got the best products for you",
    describe: "Don't miss out on this",
  },
  {
    id: 2,
      image: `${base}images/leatherbag.jpg`,

      alt: "Bag",
    text: "For your style and comfort desires",
    describe: "NADA NADA NADA got you covered",
  },
  {
    id: 3,
      image: `${base}images/smartwatch.jpg`,
      alt: "Smartwatch",
    text: "There's no better time to shop",
    describe: "Be the first to get it",
  },
  {
    id: 4,
      image: `${base}images/speakers.jpg`,

    alt: "Speakers",
    text: "Sounds well when you get your product from NADA",
    describe: "Enjoy the sound",
  },
];
const AnimatedImage = () => {
  const [emblaRef] = useEmblaCarousel(
    { loop: true, direction: "ltr" },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );

  return (
    <div className="relative overflow-hidden rounded-lg shadow-lg">
      {/* Carousel Container */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {carouselItems.map((item) => (
            <div
              key={item.id}
              className="flex-[0_0_100%] relative"
            >
              {/* Image */}
              <img
                src={item.image}
                alt={item.alt}
                className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-lg"
              />

              {/* Text Overlay */}
              <div className="absolute inset-0 bg-black/50 bg-opacity-50 flex items-end p-6">
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-white mb-2">
                    {item.text}
                  </p>
                  <p className="text-sm sm:text-base text-white">
                    {item.describe}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows (Optional) */}
      <button
        onClick={(e) => {
          e.preventDefault();
          emblaRef.current.scrollPrev();
        }}
        className="absolute top-1/2 left-4 -translate-y-1/2 z-10 bg-white bg-opacity-70 hover:bg-opacity-90 rounded-full p-2 shadow-md"
        aria-label="Previous slide"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-800"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        onClick={(e) => {
          e.preventDefault();
          emblaRef.current.scrollNext();
        }}
        className="absolute top-1/2 right-4 -translate-y-1/2 z-10 bg-white bg-opacity-70 hover:bg-opacity-90 rounded-full p-2 shadow-md"
        aria-label="Next slide"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-800"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
};

export default AnimatedImage;