# 🚀 CreatorAI Hub — مرجع تخصصی ابزارهای هوش مصنوعی ویدیو (Bold Studio Edition)

این پروژه یک وب‌سایت دایرکتوری تخصصی آماده با **Next.js 15 (App Router)**، **Tailwind CSS**، **TypeScript** و اتصال به دیتابیس **Supabase** است که مخصوص کارآفرینان تک‌نفره (Solo Founder) طراحی شده است.

---

## 🎨 ویژگی‌های نسخه Bold Studio 3D Edition
1. **تایپوگرافی غول‌پیکر سرمقاله‌ای (Inspired by MotionSites.ai Bold Studio):** عنوان اصلی با حروف بزرگ و افکت نئونی طراحی شده است.
2. **کلید تغییر تم شب و روز (Dark / Light Mode Toggle):** امکان تغییر ظاهر سایت از تم مشکی سایبری به تم نقره‌ای لوکس.
3. **نوار متحرک بی‌نهایت (Infinite Scroll Marquee):** نمایش لوگو و نام ابزارهای برتر در یک نوار لغزان.
4. **کارت‌های شیشه‌ای ۳ بعدی (3D Glassmorphism Showcase):** به همراه تصاویر ۱۶:۹ باکیفیت و زوم سینمایی.

---

## 🗄️ راهنمای اتصال به دیتابیس Supabase (در ۴ کلیک!)

برای اینکه فرم ارسال ابزار (`Submit Tool`) اطلاعات را به طور واقعی در دیتابیس ذخیره کند:

### مرحله ۱: ساخت پروژه رایگان در Supabase
1. وارد سایت [supabase.com](https://supabase.com) شوید و با اکانت گیت‌هاب ورود کنید.
2. روی دکمه **"New Project"** کلیک کنید و نامی مثل `creator-ai-hub` برای آن بگذارید.

### مرحله ۲: اجرای اسکریپت ساخت جدول‌ها (SQL Schema)
1. در پنل Supabase به منوی **SQL Editor** در ستون سمت چپ بروید.
2. کل متن موجود در فایل **`supabase-schema.sql`** (که در همین پوشه پروژه است) را کپی کنید و در کادر SQL Editor پیست کنید.
3. دکمه سبز رنگ **Run** را بزنید!
   * ✅ جدول‌های `tools` و `submissions` ساخته می‌شوند.
   * ✅ قوانین امنیتی (RLS Policies) فعال می‌شوند.
   * ✅ ۱۰ ابزار اولیه و تست‌شده به صورت اتوماتیک در دیتابیس وارد می‌شوند!

### مرحله ۳: اتصال کلیدها به Vercel
1. در پنل Supabase به مسیر **Project Settings ➔ API** بروید.
2. مقادیر `Project URL` و `anon / public key` را کپی کنید.
3. وارد پنل پروژه در [Vercel.com](https://vercel.com) شوید و به مسیر **Settings ➔ Environment Variables** بروید.
4. دو متغیر زیر را اضافه و دکمه Save را بزنید:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```
5. در Vercel روی دکمه **Redeploy** کلیک کنید تا سایت با اتصال کامل به دیتابیس آنلاین شود!

---

## 🤖 استفاده از ربات دستیار جمع‌آوری ابزارها (AI Auto-Curator)
برای اضافه کردن سریع ابزارهای جدید بدون تایپ دستی:
```bash
node scripts/auto-curate.mjs "https://elevenlabs.io"
```
این دستور اطلاعات متا و عکس سایت مقصد را اسکرپ می‌کند و کد SQL آماده را به شما می‌دهد تا با ۱ کلیک در Supabase اضافه کنید!
