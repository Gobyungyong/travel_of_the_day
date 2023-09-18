import {
  Bars3CenterLeftIcon,
  ChatBubbleLeftRightIcon,
  TagIcon,
} from "@heroicons/react/20/solid";

function Home() {
  return (
    <>
      <div className="overflow-hidden bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
            <div className="lg:pr-8 lg:pt-4">
              <div className="lg:max-w-lg">
                <h2 className="text-base font-semibold leading-7 text-indigo-600">
                  Go together
                </h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  함께할 친구를 찾아보세요!
                </p>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  홀로 떠난 여행에서 친구가 필요할 때, 함께 떠날 친구가 필요할
                  때, Travel Together에서 함께 할 친구를 찾아보세요!
                </p>
                <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
                  <div className="relative pl-9">
                    <dt className="inline font-semibold text-gray-900">
                      <Bars3CenterLeftIcon
                        className="absolute left-1 top-1 h-5 w-5 text-indigo-600"
                        aria-hidden="true"
                      />
                      게시글 작성하기
                    </dt>{" "}
                    <dd className="inline pl-5">
                      함께 하고 싶은 일에 대해 Travel Together 친구들에게
                      알려주세요!
                    </dd>
                  </div>

                  <div className="relative pl-9">
                    <dt className="inline font-semibold text-gray-900">
                      <TagIcon
                        className="absolute left-1 top-1 h-5 w-5 text-indigo-600"
                        aria-hidden="true"
                      />
                      댓글 작성하기
                    </dt>{" "}
                    <dd className="inline pl-5">
                      게시글 내용에 대해 더 알고싶다면 댓글을 달아보세요!
                    </dd>
                  </div>
                  <div className="relative pl-9">
                    <dt className="inline font-semibold text-gray-900">
                      <ChatBubbleLeftRightIcon
                        className="absolute left-1 top-1 h-5 w-5 text-indigo-600"
                        aria-hidden="true"
                      />
                      채팅하기
                    </dt>{" "}
                    <dd className="inline pl-5">
                      같이 하고 싶은 일이 있으신가요? 지금 바로 대화를
                      걸어보세요!
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            <img
              src="https://kr.object.ncloudstorage.com/travel-together/landing/landing.png"
              alt="Product screenshot"
              className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
              width={2432}
              height={1442}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
