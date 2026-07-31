# 🚀 CreatorAI Hub — مرجع تخصصی ابزارهای هوش مصنوعی ویدیو و تولید محتوا

این پروژه یک وب‌سایت دایرکتوری تخصصی (Curated Niche Directory) آماده برای اجراست که با **Next.js 15 (App Router)**، **Tailwind CSS**، **TypeScript** و **Lucide Icons** ساخته شده و مخصوص یک کارآفرین تک‌نفره (Solo Founder) طراحی شده است.

---

## 🎨 هویت برند (Brand Identity)
* **نام برند:** **`CreatorAI Hub`** (`creatoraihub.com` یا `creatorai.io`)
* **شعار (Tagline):** *«بهترین ابزارهای تست‌شده هوش مصنوعی برای یوتیوبرها، ادیتورها و تولیدکنندگان محتوا»* (*The Curated AI Toolbox for YouTubers & Editors*)
* **مزیت رقابتی نیش (Niche Advantage):**
  1. یوتیوبرها و ادیتورها برای ابزارهای خوب پول پرداخت می‌کنند چون باعث افزایش درآمدشان می‌شود.
  2. ابزارهای جدید این حوزه بودجه تبلیغاتی بالایی دارند و مشتاق اسپانسرینگ هستند.
  3. با مدل **Founder Badge Flywheel (نشان تایید بنیان‌گذار)** صاحبان ابزارها خودشان شما را تبلیغ می‌کنند.

---

## 🛠️ ساختار فایل‌های پروژه

```
creator-ai-hub/
├── public/
│   ├── logo.svg              # لوگوی برداری برند
│   └── brand-cover.png       # تصویر کاور و برندینگ
├── src/
│   ├── app/
│   │   ├── globals.css       # استایل‌های Tailwind و افکت‌های Glow
│   │   ├── layout.tsx        # متادیتای سئو و ساختار Root
│   │   └── page.tsx          # صفحه اصلی (Hero + فیلتر دسته‌ها + ابزارها + مودال ثبت)
│   ├── components/
│   │   ├── Header.tsx        # هدر واکنش‌گرا به همراه جستجو و دکمه Submit
│   │   ├── ToolCard.tsx      # کارت نمایش ابزار با بج‌های قیمت، ریتینگ و لینک افیلیت
│   │   └── SubmitModal.tsx   # مودال تعاملی ثبت ابزار توسط بنیان‌گذاران
│   └── data/
│       └── tools.ts          # دیتابیس اولیه ۱۰ ابزار معتبر (OpusClip, ElevenLabs, Descript و...)
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🚀 راهنمای سریع: چطور روی گیت‌هاب (GitHub) آپلود کنیم؟

برای ارسال کدها به مخزن گیت‌هاب شخصی خودتان، مراحل زیر را در ترمینال اجرا کنید:

### ۱. مقداردهی اولیه گیت (Git Init)
```bash
cd creator-ai-hub
git init
git add .
git commit -m "feat: initial commit for CreatorAI Hub directory"
```

### ۲. اتصال به مخزن گیت‌هاب و پوش (Push)
یک مخزن جدید (Repository) خالی در GitHub بسازید و دستورات زیر را وارد کنید:
```bash
git branch -M main
git remote add origin https://github.com/{username}/creator-ai-hub.git
git push -u origin main
```

---

## 🌐 نحوه استقرار رایگان روی Vercel (در ۱ دقیقه)
1. وارد حساب [Vercel.com](https://vercel.com) شوید.
2. روی **"Add New Project"** کلیک کنید و مخزن `creator-ai-hub` را از GitHub انتخاب کنید.
3. دکمه **"Deploy"** را بزنید! سایت شما در کمتر از ۴۰ ثانیه روی یک دامنه `.vercel.app` (و دامنه اختصاصی شما) بالا می‌آید.

---

## 💰 چطور از روز اول از این سایت درآمدزایی کنیم؟

1. **لینک‌های افیلیت (Affiliate Marketing):**
   * در فایل `src/data/tools.ts`، فیلد `affiliateUrl` را برای ابزارهایی مثل *OpusClip*، *ElevenLabs* یا *VidIQ* با لینک افیلیت خودتان جایگزین کنید. کاربر روی **"Visit Website"** کلیک می‌کند و کمیسیون ارزی به حساب شما واریز می‌شود.
2. **آگهی‌های ویژه (Featured Listings):**
   * با تغییر فیلد `isFeatured: true`، ابزار مربوطه در بالاترین بخش سایت (Featured AI Tools) با افکت برجسته نمایش داده می‌شود. می‌توانید برای این جایگاه ماهیانه ۴۹ تا ۹۹ دلار از استارتاپ‌ها دریافت کنید.
3. **نشان تایید بنیان‌گذار (Founder Badge Flywheel):**
   * ابزارهایی که دارای `hasFounderBadge: true` هستند، بج اختصاصی **Verified** می‌گیرند و صاحبان آن‌ها در سایت یا توییترشان به شما بک‌لینک می‌دهند.

---

## 📦 نصب و اجرای آفلاین (Local Development)

```bash
npm install
npm run dev
```
سپس آدرس `http://localhost:3000` را در مرورگر باز کنید.
