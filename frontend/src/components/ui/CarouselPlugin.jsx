import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent } from "@/components/ui/card";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const images = ["/images/bg1.jpg"];

export function CarouselPlugin() {
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  );

  
  return (
    <Carousel
      plugins={[plugin.current]}
      className="flex w-full h-98 p-4 mx-auto rounded-lg object-cover  "
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {images.map((src, index) => (
          <CarouselItem key={index}>
            <div className="p-2">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <img
                    src={src}
                    alt={`Carousel image ${index + 1}`}
                    className="w-full h-full object-cover rounded-md"
                  />
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
