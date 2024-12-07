import Carousel from "$islands/Carousel.tsx";
import { StampRow } from "$globals";
import SwiperStyles from "$islands/home/SwiperStyles.tsx";

interface HomeCarouselProps {
  carouselStamps: StampRow[];
}

export function HomeCarousel({ carouselStamps }: HomeCarouselProps) {
  if (!carouselStamps?.length) {
    return null; // Or a loading state
  }

  return (
    <>
      <SwiperStyles />
      <div class="max-w-desktop w-full mx-auto px-3 tablet:px-6 desktop:px-12">
        <div class="
          w-full
          max-w-[500px] h-[200px]
          mobileMd:max-w-[500px] mobileMd:h-[302px]
          mobileLg:max-w-[640px] mobileLg:h-[260px]
          tablet:max-w-[840px] tablet:h-[341px]
          desktop:max-w-[1246px] desktop:h-[480px]
          mx-auto
          relative
          overflow-visible
          flex
          justify-center
          items-center
        ">
          <Carousel
            stamps={carouselStamps}
            class="carousel-container"
          />
        </div>
      </div>
    </>
  );
}