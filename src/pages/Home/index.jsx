import React from "react";
import Harmon_Banner from "../../assets/images/Harmon_Banner.png";
import Harmon_Logo from "../../assets/images/Harmon_Logo.png";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { GoStarFill } from "react-icons/go";
function Home() {
  const listeners = [
    {
      key: 1,
      name: "Nguyễn Thúc Thùy Tiên",
      image:
        "https://images2.thanhnien.vn/zoom/686_429/528068263637045248/2024/3/26/thuy-tien-dai-su-di-lich5-171144056271595905311-639-0-1889-2000-crop-1711441801100307788829.jpg",
      gender: "Nữ",
    },
    {
      key: 2,
      name: "Nguyễn Quang Linh",
      image:
        "https://i.ex-cdn.com/vietnamfinance.vn/files/f1/news/hoaithuong/2022/2/23/vnf-linh-vlogs-1.jpeg",
      gender: "Nam",
    },
    {
      key: 3,
      name: "Trần Lê Thu Giang",
      image:
        "https://vcdn1-giadinh.vnecdn.net/2022/12/21/Giang-Oi-1-6126-1671585495.jpg?w=680&h=0&q=100&dpr=1&fit=crop&s=IiPfo6IvfaYpk-u_fc14HA",
      gender: "Nữ",
    },
    {
      key: 4,
      name: "Sunhuyn",
      image:
        "https://static.wixstatic.com/media/63c1da_7e0ea530cc76418088010b69f0c0b04c~mv2.jpg/v1/crop/x_9,y_0,w_2983,h_3000/fill/w_488,h_484,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/sunhuyn.jpg",
      gender: "Nữ",
    },
    {
      key: 5,
      name: "The Present Writer",
      image:
        "https://i0.wp.com/thepresentwriter.com/wp-content/uploads/2020/07/Chi-Nguyen_The-Present-Writer.jpg?ssl=1",
      gender: "Nữ",
    },
    {
      key: 6,
      name: "Trinh Pham",
      image: "https://nguoinoitieng.tv/images/nnt/96/0/bbh8.jpg",
      gender: "Nữ",
    },
  ];
  const NextArrow = (props) => {
    const { className, onClick } = props;
    return (
      <div
        className={`${className} absolute right-[-25px] top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#8A55D4] font-bold text-white shadow-md hover:scale-110`}
        onClick={onClick}
      >
        ❯
      </div>
    );
  };

  const PrevArrow = (props) => {
    const { className, onClick } = props;
    return (
      <div
        className={`${className} absolute left-[-25px] top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#8A55D4] font-bold text-white shadow-md hover:scale-110`}
        onClick={onClick}
      >
        ❮
      </div>
    );
  };

  var settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };
  return (
    <main className="mb-10 flex flex-col items-center gap-12 overflow-hidden px-4 sm:px-6 md:px-8 lg:px-10">
      {/* Banner */}
      <div className="relative mt-4 flex w-full flex-col items-center justify-end rounded-lg shadow-md sm:mt-6 md:mt-8 lg:mt-10">
        <img
          src={Harmon_Banner}
          alt="Harmon_Banner"
          className="h-auto w-full rounded-lg object-cover"
        />
        <div className="absolute bottom-2 cursor-pointer rounded-md bg-[#F1E0FD] px-4 py-2 text-sm font-medium text-[#8A55D4] shadow-lg duration-300 hover:scale-105 sm:bottom-4 sm:px-6 md:bottom-6 md:px-8 lg:bottom-10 lg:px-10 lg:text-lg">
          Đặt Lịch Ngay
        </div>
      </div>

      <div className="flex max-w-7xl flex-col items-center gap-4">
        <img
          src={Harmon_Logo}
          alt="Harmon_Logo"
          className="w-24 sm:w-32 md:w-40"
        />
        <h1 className="text-4xl font-bold text-heading sm:text-5xl md:text-6xl lg:text-7xl">
          HARMON
        </h1>
      </div>

      <div className="my-5 flex max-w-4xl flex-col items-center gap-4 text-center">
        <h4 className="text-2xl font-bold text-heading sm:text-3xl">
          NƠI CẢM XÚC ĐƯỢC LẮNG NGHE
        </h4>
        <p className="text-base text-gray-600 sm:text-lg">
          Harmon là không gian an toàn để bạn chia sẻ cảm xúc mà không lo lắng
          về quyền riêng tư. Tại đây, bạn có thể trò chuyện với chuyên gia tâm
          lý, kết nối với những người bạn đồng trang lứa hoặc tìm lời khuyên sâu
          sắc từ các Tarot reader. Dù bạn đang cần sự thấu hiểu hay chỉ muốn ai
          đó lắng nghe, Harmon luôn là chốn dừng chân bình yên để bạn tìm lại
          cân bằng và sức mạnh nội tâm.
        </p>
      </div>

      <div className="my-5 flex max-w-4xl flex-col items-center gap-4 text-center">
        <h4 className="text-2xl font-bold text-heading sm:text-3xl">
          THẤU HIỂU CHÍNH MÌNH
        </h4>
        <p className="text-base text-gray-600 sm:text-lg">
          Bạn có bao giờ tự hỏi cảm xúc của mình đang ở trạng thái nào hay tâm
          lý của bạn đang chịu ảnh hưởng bởi điều gì? Bài test cảm xúc và tâm lý
          là công cụ giúp bạn hiểu rõ hơn về thế giới nội tâm của mình — từ mức
          độ căng thẳng, lo âu, đến sức khỏe tinh thần tổng quát. Thông qua
          những câu hỏi khoa học, bài test sẽ cung cấp cái nhìn sâu sắc về tâm
          trạng hiện tại, giúp bạn nhận diện cảm xúc và tìm ra hướng đi để chăm
          sóc bản thân tốt hơn. Hãy dành một chút thời gian để kết nối với chính
          mình!
        </p>
        <button className="mt-4 rounded-lg bg-[#C6ACFF]/80 px-4 py-2 text-heading shadow-md duration-300 hover:scale-105 sm:px-6 sm:py-2 md:hover:scale-110">
          Khám Phá Ngay
        </button>
      </div>

      <div className="my-5 flex max-w-7xl flex-col items-center gap-4 text-center">
        <h4 className="text-2xl font-bold text-heading sm:text-3xl">
          CHUYÊN GIA VỀ RỐI LOẠN LO ÂU
        </h4>
        <div className="relative w-full">
          <Slider {...settings}>
            {listeners.map((listener, index) => (
              <div key={index} className="p-10">
                <div className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 bg-gray-100 py-5 font-semibold text-heading hover:scale-110">
                  <img
                    src={listener.image}
                    alt={listener.name}
                    className="size-28 rounded-full object-cover"
                  />
                  <span className="text-xl">{listener.name}</span>
                  <span>{listener.gender}</span>
                  <span className="flex gap-2">
                    <GoStarFill />
                    <GoStarFill />
                    <GoStarFill />
                    <GoStarFill />
                    <GoStarFill />
                  </span>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>

      <div className="my-5 flex max-w-7xl flex-col items-center gap-4 text-center">
        <h4 className="text-2xl font-bold text-heading sm:text-3xl">
          THAM VẤN VIÊN
        </h4>
        <div className="relative w-full">
          <Slider {...settings}>
            {listeners.map((listener, index) => (
              <div key={index} className="p-10">
                <div className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 bg-gray-100 py-5 font-semibold text-heading hover:scale-110">
                  <img
                    src={listener.image}
                    alt={listener.name}
                    className="size-28 rounded-full object-cover"
                  />
                  <span className="text-xl">{listener.name}</span>
                  <span>{listener.gender}</span>
                  <span className="flex gap-2">
                    <GoStarFill />
                    <GoStarFill />
                    <GoStarFill />
                    <GoStarFill />
                    <GoStarFill />
                  </span>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>

      <div className="my-5 flex max-w-7xl flex-col items-center gap-4 text-center">
        <h4 className="text-2xl font-bold text-heading sm:text-3xl">
          TARROT READER
        </h4>
        <div className="relative w-full">
          <Slider {...settings}>
            {listeners.map((listener, index) => (
              <div key={index} className="p-10">
                <div className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 bg-gray-100 py-5 font-semibold text-heading hover:scale-110">
                  <img
                    src={listener.image}
                    alt={listener.name}
                    className="size-28 rounded-full object-cover"
                  />
                  <span className="text-xl">{listener.name}</span>
                  <span>{listener.gender}</span>
                  <span className="flex gap-2">
                    <GoStarFill />
                    <GoStarFill />
                    <GoStarFill />
                    <GoStarFill />
                    <GoStarFill />
                  </span>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </main>
  );
}

export default Home;
