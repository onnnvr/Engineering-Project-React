import React from 'react';
import ReactPaginate from 'react-paginate';

export default function PaginatedItems({ itemsPerPage, setPage, numberOfItems, currentPage }) {
    // 1. Math.ceil عشان نضمن إن لو فيه عنصر واحد زيادة يفتح صفحة جديدة
    const pageCount = Math.ceil(numberOfItems / itemsPerPage);

    return (
        <div className="pagination-container">
            <ReactPaginate
                breakLabel="..."
                nextLabel="Next"
                previousLabel="Prev"
                // 2. forcePage بيخلي الكومبوننت يسمع كلام الـ state اللي في الصفحة الأب
                forcePage={currentPage ? currentPage - 1 : undefined} 
                onPageChange={(e) => setPage(e.selected + 1)}
                pageRangeDisplayed={3} // قللت الرقم ده عشان الموبايل
                marginPagesDisplayed={1}
                pageCount={pageCount || 1}
                renderOnZeroPageCount={null}
                
                // 3. التنسيقات الجديدة (Clean & Modern)
                containerClassName='flex items-center justify-center md:justify-end gap-1 mt-2'
                
                // تنسيق الأرقام
                pageLinkClassName='w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all duration-200'
                
                // تنسيق الصفحة النشطة (حلينا مشكلة اللون هنا)
                activeLinkClassName='!bg-blue-600 !text-white shadow-lg shadow-blue-100'
                
                // تنسيق أزرار Next و Prev
                previousLinkClassName='px-3 py-2 text-xs md:text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-all'
                nextLinkClassName='px-3 py-2 text-xs md:text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-all'
                
                // تنسيق النقط (...)
                breakLinkClassName='text-gray-400'
                
                // تنسيق الأزرار المعطلة
                disabledLinkClassName='opacity-30 cursor-not-allowed hover:bg-transparent'
            />
        </div>
    );
}