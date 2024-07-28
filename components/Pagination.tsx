import { useNavigator } from "$islands/Navigator/navigator.tsx";

export const Pagination = (
  { page, pages, page_size, type = "stamp", data_length }: {
    page: number;
    pages: number;
    page_size: number;
    type: "cursed" | "stamp" | "src20" | "home" | "collection";
    data_length: number;
  },
) => {
  const maxPagesToShow = 4;
  const currentPage = page;
  const totalPages = pages;
  const startPage = Math.max(1, currentPage - maxPagesToShow);
  const endPage = Math.min(totalPages, currentPage + maxPagesToShow);
  const pageItems = [];
  const { filterOption, sortOption, typeOption } = useNavigator();

  for (let p = startPage; p <= endPage; p++) {
    pageItems.push(
      <li key={p}>
        <a
          href={`/${type}?page=${p}&limit=${page_size}&sortBy=${sortOption}&filterBy=${filterOption}&typeBy=${typeOption}`}
          f-partial={`/${type}?page=${p}&limit=${page_size}&sortBy=${sortOption}&filterBy=${filterOption}&typeBy=${typeOption}`}
          class={`flex items-center justify-center px-3 h-8 leading-tight font-semibold
            ${
            currentPage === p
              ? "bg-[#240048] text-white"
              : "bg-[#5E1BA1] text-[#EDEDED]"
          }`}
        >
          {p}
        </a>
      </li>,
    );
  }

  return (
    <>
      {(data_length != 0) &&
        (
          <nav
            aria-label="Page navigation"
            className="flex items-center justify-center"
          >
            <ul class="inline-flex items-center -space-x-px text-sm gap-2">
              <li>
                <a
                  href={`/${type}?page=1&limit=${page_size}&sortBy=${sortOption}&filterBy=${filterOption}&typeBy=${typeOption}`}
                  f-partial={`/${type}?page=1&limit=${page_size}&sortBy=${sortOption}&filterBy=${filterOption}&typeBy=${typeOption}`}
                  class="flex items-center justify-center px-3 h-8 leading-tight bg-[#5E1BA1] text-white"
                >
                  {"<<"}
                </a>
              </li>
              <li>
                <a
                  href={`/${type}?page=${
                    Math.max(1, currentPage - 1)
                  }&limit=${page_size}&sortBy=${sortOption}&filterBy=${filterOption}&typeBy=${typeOption}`}
                  f-partial={`/${type}?page=${
                    Math.max(1, currentPage - 1)
                  }&limit=${page_size}&sortBy=${sortOption}&filterBy=${filterOption}&typeBy=${typeOption}`}
                  class="flex items-center justify-center px-3 h-8 leading-tight bg-[#5E1BA1] text-white"
                >
                  {"<"}
                </a>
              </li>
              {pageItems}
              <li>
                <a
                  href={`/${type}?page=${
                    Math.min(totalPages, currentPage + 1)
                  }&limit=${page_size}&sortBy=${sortOption}&filterBy=${filterOption}&typeBy=${typeOption}`}
                  f-partial={`/${type}?page=${
                    Math.min(totalPages, currentPage + 1)
                  }&limit=${page_size}&sortBy=${sortOption}&filterBy=${filterOption}&typeBy=${typeOption}`}
                  class="flex items-center justify-center px-3 h-8 leading-tight bg-[#5E1BA1] text-white"
                >
                  {">"}
                </a>
              </li>
              <li>
                <a
                  href={`/${type}?page=${totalPages}&limit=${page_size}&sortBy=${sortOption}&filterBy=${filterOption}&typeBy=${typeOption}`}
                  f-partial={`/${type}?page=${totalPages}&limit=${page_size}&sortBy=${sortOption}&filterBy=${filterOption}&typeBy=${typeOption}`}
                  class="flex items-center justify-center px-3 h-8 leading-tight bg-[#5E1BA1] text-white"
                >
                  {">>"}
                </a>
              </li>
            </ul>
          </nav>
        )}
    </>
  );
};