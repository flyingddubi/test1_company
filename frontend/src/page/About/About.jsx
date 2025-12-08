import React from "react";
import companyImage from "../../assets/image_2.jpg";

const About = () => {
  return (
    <div className="container mx-auto px-4 py-32 max-w-7xl">
      <div className="relative rounded-2xl overflow-hidden shadow-2xl mb-24">
        <img src={companyImage} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent  via-transparent to-slate-900"></div>
        <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 text-white">
          <h3 className="text-2xl md:text-4xl font-bold mb-2 md:mb-3">
            DooDoo Company
          </h3>
          <p className="text-base md:text-xl font-light">
            혁신과 신뢰로 글로벌 시장을 선도합니다.
          </p>
        </div>
      </div>

      <div className="mb-24 max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold mb-8 text-slate-800 text-center">
          회사 소개
        </h2>
        <div className="text-lg leading-relaxed text-gray-600 space-y-6">
          <p>
            DooDoo Company는 2005년에 설립된 이래로 혁신적인 기술과 탁월한
            서비스로 글로벌 시장을 선도해왔습니다. 우리의 사명은 고객에게 최고의
            솔루션을 제공하여 그들의 성공을 돕는 것입니다.
          </p>
          <p>
            우리는 다양한 산업 분야에서 활동하며, 첨단 기술을 활용한 제품과
            서비스를 개발하고 있습니다. 고객의 요구에 맞춘 맞춤형 솔루션을
            제공함으로써, 그들의 비즈니스 성장을 지원합니다.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-24">
        {[
          {
            title: "혁신",
            desc: "끊임없는 도전과 혁신으로 미래를 선도합니다.",
          },
          { title: "신뢰", desc: "고객과의 신뢰를 최우선으로 생각합니다." },
          { title: "성장", desc: "함께 성장하는 파트너가 되겠습니다." },
        ].map((value, index) => (
          <div
            key={index}
            className="bg-white p-10 rounded-xl shadow-lg text-center hover:shadow-2xl transition-all duration-300 border border-gray-100"
          >
            <h3 className="text-2xl font-bold mb-4 text-indigo-600">
              {value.title}
            </h3>
            <p className="text-gray-600 text-lg">{value.desc}</p>
          </div>
        ))}
      </div>

      <div className="mb-24 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-8 text-slate-800">회사 비전</h2>
        <p className="text-lg leading-relaxed text-gray-600 font-light">
          DooDoo Company는 지속 가능한 성장을 목표로,
          <br />
          혁신적인 기술 개발과 사회적 책임을 다하는 기업이 되겠습니다.
          <br />
          우리는 고객과 함께 미래를 만들어가며,
          <br />더 나은 세상을 위한 가치를 창출할 것입니다.
        </p>
      </div>

      <div className="mb-24">
        <h2 className="text-4xl font-bold mb-12 text-slate-800 text-center">
          회사 연혁
        </h2>
        <div className="space-y-12 max-w-5xl mx-auto">
          {[
            { year: "2005", event: "DooDoo Company 설립" },
            { year: "2010", event: "첫 번째 해외 지사 설립" },
            { year: "2015", event: "글로벌 시장 진출 및 주요 수상 경력" },
          ].map((item, index) => (
            <div
              key={index}
              className={`flex items-center gap-8 ${
                index % 2 === 0 ? "flex-row" : "flex-row-reverse"
              }`}
            >
              <div className="w-1/2 text-center">
                <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100">
                  <h3 className="text-2xl font-bold mb-3 text-indigo-600">
                    {item.year}
                  </h3>
                  <p className="text-gray-700 text-lg">{item.event}</p>
                </div>
              </div>
              <div className="w-4 h-4 bg-indigo-600 rounded-full"></div>
              <div className="w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
