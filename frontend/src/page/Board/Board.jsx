import React from "react";

const Board = () => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);

  const dummyPosts = [
    {
      _id: 1,
      number: 1,
      title: "첫 번째 게시물",
      createdAt: "2024-06-01T10:00:00",
      views: 120,
    },
    {
      _id: 2,
      number: 2,
      title: "두 번째 게시물",
      createdAt: "2024-06-02T11:00:00",
      views: 85,
    },
    {
      _id: 3,
      number: 3,
      title: "세 번째 게시물",
      createdAt: "2024-06-03T12:00:00",
      views: 60,
    },
    {
      _id: 4,
      number: 4,
      title: "네 번째 게시물",
      createdAt: "2024-06-04T13:00:00",
      views: 45,
    },
    {
      _id: 5,
      number: 5,
      title: "다섯 번째 게시물",
      createdAt: "2024-06-05T14:00:00",
      views: 30,
    },
  ];

  const indexOfLastPage = currentPage * itemsPerPage;
  const indexOfFirstPost = indexOfLastPage - itemsPerPage;
  const currentPosts = dummyPosts.slice(indexOfFirstPost, indexOfLastPage);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto py-32 md:py-32">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 md:mb-8 text-center">
        업무 게시판
      </h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-midium text-gray-500 uppercase tracking-wider w-[8%]">
                번호
              </th>
              <th className="px-6 py-3 text-left text-sm font-midium text-gray-500 uppercase tracking-wider w-auto">
                제목
              </th>
              <th className="px-6 py-3 text-left text-sm font-midium text-gray-500 uppercase tracking-wider w-[15%]">
                작성일
              </th>
              <th className="px-6 py-3 text-left text-sm font-midium text-gray-500 uppercase tracking-wider w-[8%]">
                조회수
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentPosts.map((post) => (
              <tr key={post._id} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-6 py-4 whitespace-nowrap">{post.number}</td>
                <td className="px-6 py-4 whitespace-nowrap">{post.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">{post.createdAt}</td>
                <td className="px-6 py-4 whitespace-nowrap">{post.views}</td>
              </tr>           
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Board;
