// در ابتدای فایل، پارامترهای سرچ را بگیرید
export default async function UserTripsPage({
  searchParams,
}: {
  searchParams: { payment?: string };
}) {
  const isSuccess = searchParams.payment === "success";
  const isFailed = searchParams.payment === "failed";

  return (
    <div className="max-w-4xl mx-auto p-4">
      {isSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center">✓</div>
          <div>
            <h4 className="font-bold">پرداخت موفقیت‌آمیز بود!</h4>
            <p className="text-sm">رزرو شما تایید شد و در لیست زیر قابل مشاهده است.</p>
          </div>
        </div>
      )}

      {isFailed && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center">✕</div>
          <div>
            <h4 className="font-bold">خطا در پرداخت</h4>
            <p className="text-sm">عملیات پرداخت ناموفق بود یا توسط شما لغو شد.</p>
          </div>
        </div>
      )}

      {/* لیست برنامه‌های رزرو شده کاربر اینجا قرار می‌گیرد */}
      <h1 className="text-2xl font-bold mb-6">برنامه‌های صعود من</h1>
      {/* ... بقیه کد لیست ... */}
    </div>
  );
}
